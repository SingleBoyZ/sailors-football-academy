"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/data";
import { isDevGatewayEnabled } from "@/lib/payments/dev-gateway";

/** Stands in for the Billplz hosted payment page — only reachable when ENABLE_MOCK_GATEWAY=true (dev only). */
export async function confirmMockFeePayment(billId: string, paid: boolean) {
  if (!isDevGatewayEnabled()) throw new Error("The mock payment gateway is only available when ENABLE_MOCK_GATEWAY=true.");

  await db.confirmPaymentByBillId(billId, paid);
  redirect(`/pay/result?status=${paid ? "paid" : "failed"}&id=${encodeURIComponent(billId)}`);
}
