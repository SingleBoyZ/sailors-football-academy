"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

export async function markOrderFulfilled(orderId: string): Promise<{ ok: true }> {
  await requireAdmin();
  await db.markOrderFulfilled(orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
