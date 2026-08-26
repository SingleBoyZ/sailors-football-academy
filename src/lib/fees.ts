import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateReceiptNo } from "@/lib/codes";
import { renderReceiptPdf } from "@/lib/pdf/receipt";
import { sendEmail } from "@/lib/email";
import FeeReceipt from "@/emails/FeeReceipt";

type TxClient = Prisma.TransactionClient | PrismaClient;

/** Outstanding balance (sen) across every not-yet-settled invoice for a player. */
export async function getOutstandingForPlayer(playerId: string, client: TxClient = prisma): Promise<number> {
  const invoices = await client.invoice.findMany({
    where: { playerId, status: { not: "SETTLED" } },
    select: { amountDue: true, amountPaid: true },
  });
  return invoices.reduce((sum, inv) => sum + (inv.amountDue - inv.amountPaid), 0);
}

/**
 * Applies a payment's amount across a player's open invoices oldest-first
 * (registration before monthly fees, then earliest period first), recording
 * a PaymentAllocation per invoice touched. Must run inside the same
 * transaction as the Payment status update that triggers it.
 */
export async function allocatePaymentToInvoices(
  tx: Prisma.TransactionClient,
  paymentId: string,
  playerId: string,
  amountSen: number,
): Promise<void> {
  const invoices = await tx.invoice.findMany({
    where: { playerId, status: { not: "SETTLED" } },
    orderBy: [{ periodYear: "asc" }, { periodMonth: "asc" }, { createdAt: "asc" }],
  });

  // Registration invoices are always settled before monthly fees, regardless of date.
  invoices.sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === "REGISTRATION" ? -1 : b.type === "REGISTRATION" ? 1 : 0;
  });

  let remaining = amountSen;

  for (const invoice of invoices) {
    if (remaining <= 0) break;
    const owed = invoice.amountDue - invoice.amountPaid;
    if (owed <= 0) continue;

    const applied = Math.min(owed, remaining);
    remaining -= applied;

    await tx.paymentAllocation.create({
      data: { paymentId, invoiceId: invoice.id, amountSen: applied },
    });

    const newAmountPaid = invoice.amountPaid + applied;
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid,
        status: newAmountPaid >= invoice.amountDue ? "SETTLED" : "PARTIAL",
      },
    });
  }
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function invoiceDescription(type: string, periodMonth: number, periodYear: number): string {
  if (type === "REGISTRATION") return "Registration Fee";
  return `Monthly Fee — ${MONTH_NAMES[periodMonth - 1]} ${periodYear}`;
}

/**
 * Renders and emails a PDF receipt for an already-PAID, already-allocated
 * Payment. Shared by settleFeePayment (first send) and the admin "Resend
 * receipt" action. Best-effort — logs and returns rather than throwing.
 */
export async function emailReceipt(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { player: { include: { guardian: true } }, allocations: { include: { invoice: true } } },
  });

  if (!payment || !payment.player || payment.status !== "PAID" || !payment.receiptNo) {
    console.error(`emailReceipt: payment ${paymentId} is not a settled fee payment`);
    return;
  }

  try {
    const pendingBalance = await getOutstandingForPlayer(payment.player.id);
    const pdf = await renderReceiptPdf({
      receiptNo: payment.receiptNo,
      paidAt: payment.paidAt ?? payment.createdAt,
      memberName: payment.player.name,
      memberCode: payment.player.memberCode,
      guardianName: payment.player.guardian.name ?? "",
      guardianEmail: payment.player.guardian.email,
      allocations: payment.allocations.map((a) => ({
        description: invoiceDescription(a.invoice.type, a.invoice.periodMonth, a.invoice.periodYear),
        amountSen: a.amountSen,
      })),
      amountPaidSen: payment.amount,
      pendingBalanceSen: pendingBalance,
      billplzBillId: payment.billplzBillId,
    });

    await sendEmail({
      to: payment.player.guardian.email,
      subject: `Receipt ${payment.receiptNo} — payment received`,
      react: FeeReceipt({
        guardianName: payment.player.guardian.name ?? "",
        memberName: payment.player.name,
        amountPaidSen: payment.amount,
        pendingBalanceSen: pendingBalance,
        receiptNo: payment.receiptNo,
      }),
      attachments: [{ filename: `${payment.receiptNo}.pdf`, content: pdf }],
    });

    await prisma.payment.update({ where: { id: payment.id }, data: { receiptSentAt: new Date() } });
  } catch (error) {
    console.error(`emailReceipt: failed for payment ${payment.id}`, error);
  }
}

/**
 * Runs the full post-payment settlement for a fee Payment that has just
 * been marked PAID: allocates it across the player's open invoices
 * oldest-first, issues a sequential receipt number, then (outside the DB
 * transaction) renders and emails the PDF receipt. Best-effort — logs and
 * returns rather than throwing, since this runs from a webhook that must
 * still return 200 to Billplz even if email delivery has a hiccup.
 */
export async function settleFeePayment(paymentId: string): Promise<void> {
  const committed = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    if (!payment.playerId) return null;

    await allocatePaymentToInvoices(tx, payment.id, payment.playerId, payment.amount);

    const receiptNo = await generateReceiptNo(tx, payment.paidAt ?? new Date());
    await tx.payment.update({ where: { id: payment.id }, data: { receiptNo } });

    return true;
  });

  if (!committed) return;
  await emailReceipt(paymentId);
}
