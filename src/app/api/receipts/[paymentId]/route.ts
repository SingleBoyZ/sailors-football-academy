import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/data";
import { invoiceDescription } from "@/lib/payments/allocate";

// pdfkit needs the full Node.js runtime and a fresh render per request.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ paymentId: string }> };

/** Regenerates a fee payment's PDF receipt on demand from data-layer data — the PDF is never stored. */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { paymentId } = await params;
  const payment = await db.getPaymentById(paymentId);

  if (!payment || !payment.player || payment.status !== "PAID" || !payment.receiptNo) {
    return new NextResponse("Receipt not found", { status: 404 });
  }

  const isOwner = payment.player.guardianId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const pendingBalance = await db.getOutstandingForPlayer(payment.player.id);

  try {
    // Loaded lazily so the PDF library is only pulled in when a receipt is
    // actually requested, never at module load.
    const { renderReceiptPdf } = await import("@/lib/pdf/receipt");

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
  } catch (error) {
    console.error(`receipts: failed to render PDF for payment ${paymentId}`, error);
    return new NextResponse("Could not generate the receipt right now. Please try again later.", { status: 500 });
  }
}