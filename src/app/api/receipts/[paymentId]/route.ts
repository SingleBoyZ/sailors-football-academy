import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderReceiptPdf } from "@/lib/pdf/receipt";
import { getOutstandingForPlayer } from "@/lib/fees";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function invoiceDescription(type: string, periodMonth: number, periodYear: number): string {
  if (type === "REGISTRATION") return "Registration Fee";
  return `Monthly Fee — ${MONTH_NAMES[periodMonth - 1]} ${periodYear}`;
}

type RouteParams = { params: Promise<{ paymentId: string }> };

/** Regenerates a fee payment's PDF receipt on demand from DB data — the PDF is never stored. */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { paymentId } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { player: { include: { guardian: true } }, allocations: { include: { invoice: true } } },
  });

  if (!payment || !payment.player || payment.status !== "PAID" || !payment.receiptNo) {
    return new NextResponse("Receipt not found", { status: 404 });
  }

  const isOwner = payment.player.guardianId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

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

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${payment.receiptNo}.pdf"`,
    },
  });
}
