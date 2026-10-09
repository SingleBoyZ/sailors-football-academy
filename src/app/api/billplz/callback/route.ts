import { db } from "@/lib/data";
import { verifyCallbackSignature } from "@/lib/billplz";

/**
 * Billplz server-to-server webhook, shared by both store-order and academy-fee
 * bills — the Payment row's `type` decides how it's handled (see
 * `db.confirmPaymentByBillId`). Billplz may retry this callback, so
 * processing only happens once per Payment (guarded by only acting while
 * status is still PENDING).
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

  await db.confirmPaymentByBillId(billId, paid, payload);

  return new Response("OK", { status: 200 });
}
