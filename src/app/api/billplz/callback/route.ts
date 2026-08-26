import { prisma } from "@/lib/prisma";
import { verifyCallbackSignature } from "@/lib/billplz";
import { sendEmail } from "@/lib/email";
import OrderConfirmation from "@/emails/OrderConfirmation";

/**
 * Billplz server-to-server webhook, shared by both store-order and academy-fee
 * bills — the Payment row's `type` decides how it's handled. Billplz may
 * retry this callback, so processing only happens once per Payment (guarded
 * by only acting while status is still PENDING, inside a transaction).
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const payload: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    payload[key] = String(value);
  }

  if (!verifyCallbackSignature(payload)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const billId = payload.id;
  const paid = payload.paid === "true";

  if (!billId) {
    return new Response("Missing bill id", { status: 400 });
  }

  const outcome = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { billplzBillId: billId } });
    if (!payment || payment.status !== "PENDING") {
      return null;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: paid ? "PAID" : "FAILED",
        paidAt: paid ? new Date() : undefined,
        rawCallback: payload,
      },
    });

    if (!paid) return null;

    if (payment.type === "STORE_ORDER" && payment.orderId) {
      const order = await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID", paidAt: new Date() },
        include: { items: true },
      });

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.qty } },
        });
      }

      return { kind: "order" as const, order };
    }

    // Fee (REGISTRATION / MONTHLY_FEE) payments are allocated to invoices in
    // the parent-portal payment flow — see lib/fees.ts.
    return null;
  });

  if (outcome?.kind === "order") {
    await sendEmail({
      to: outcome.order.email,
      subject: `Order confirmed — ${outcome.order.orderNo}`,
      react: OrderConfirmation({
        orderNo: outcome.order.orderNo,
        customerName: outcome.order.customerName,
        items: outcome.order.items,
        subtotalSen: outcome.order.subtotalSen,
        shippingSen: outcome.order.shippingSen,
        totalSen: outcome.order.totalSen,
        deliveryMethod: outcome.order.deliveryMethod,
      }),
    });
  }

  return new Response("OK", { status: 200 });
}
