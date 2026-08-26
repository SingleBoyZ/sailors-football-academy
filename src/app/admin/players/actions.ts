"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { monthlyFeeForPlan } from "@/lib/plan";
import { getSetting } from "@/lib/settings";
import { emailReceipt } from "@/lib/fees";
import { FEES } from "@/content/schedule";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updatePlayerPlan(playerId: string, plan: "FULL" | "SIBLING_2" | "SIBLING_3" | "SPONSORED"): Promise<ActionResult> {
  await requireAdmin();
  const sponsoredFeeSen = await getSetting("sponsoredMonthlyFeeSen", FEES.sponsoredSen);
  const monthlyFee = monthlyFeeForPlan(plan, sponsoredFeeSen);

  await prisma.player.update({ where: { id: playerId }, data: { plan, monthlyFee } });
  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/admin/players");
  return { ok: true };
}

export async function updatePlayerNotes(playerId: string, notes: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.player.update({ where: { id: playerId }, data: { notes: notes || null } });
  revalidatePath(`/admin/players/${playerId}`);
  return { ok: true };
}

export async function togglePlayerActive(playerId: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.player.update({ where: { id: playerId }, data: { active } });
  revalidatePath(`/admin/players/${playerId}`);
  revalidatePath("/admin/players");
  return { ok: true };
}

const resendSchema = z.object({ paymentId: z.string().min(1) });

export async function resendReceipt(paymentId: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = resendSchema.safeParse({ paymentId });
  if (!parsed.success) return { ok: false, error: "Invalid payment" };

  await emailReceipt(parsed.data.paymentId);
  return { ok: true };
}
