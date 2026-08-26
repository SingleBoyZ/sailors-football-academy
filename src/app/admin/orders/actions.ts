"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function markOrderFulfilled(orderId: string): Promise<{ ok: true }> {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status: "FULFILLED" } });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
