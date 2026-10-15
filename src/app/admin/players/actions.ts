"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";
import { monthlyFeeForPlan } from "@/lib/plan";
import { FEES } from "@/content/schedule";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updatePlayerPlan(playerId: string, plan: "FULL" | "SIBLING_2" | "SIBLING_3" | "SPONSORED"): Promise<ActionResult> {
  await requireAdmin();
  const sponsoredFeeSen = await db.getSetting("sponsoredMonthlyFeeSen", FEES.sponsoredSen);
  const monthlyFee = monthlyFeeForPlan(plan, sponsoredFeeSen);

  await db.updatePlayerPlan(playerId, plan, monthlyFee);
  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/admin/players");
  return { ok: true };
}

export async function updatePlayerNotes(playerId: string, notes: string): Promise<ActionResult> {
  await requireAdmin();
  await db.updatePlayerNotes(playerId, notes || null);
  revalidatePath(`/admin/players/${playerId}`);
  return { ok: true };
}

export async function togglePlayerActive(playerId: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.togglePlayerActive(playerId, active);
  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/admin/players");
  return { ok: true };
}

const resendSchema = z.object({ paymentId: z.string().min(1) });

export async function resendReceipt(paymentId: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = resendSchema.safeParse({ paymentId });
  if (!parsed.success) return { ok: false, error: "Invalid payment" };

  await db.resendReceipt(parsed.data.paymentId);
  return { ok: true };
}
