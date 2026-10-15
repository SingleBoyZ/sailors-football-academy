"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

export type GenerateResult = { created: number; skipped: number };

/** Creates a MONTHLY_FEE invoice for every active player at their current monthlyFee — a no-op for players who already have one for that period. */
export async function generateMonthlyInvoices(month: number, year: number): Promise<GenerateResult> {
  await requireAdmin();

  const result = await db.generateMonthlyInvoices(month, year);

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/players");
  return result;
}
