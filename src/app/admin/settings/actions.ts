"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const settingsSchema = z.object({
  sponsoredMonthlyFeeSen: z.number().int().min(0),
  shippingSen: z.number().int().min(0),
  whatsappNumber: z.string().trim().min(6),
  bannerText: z.string().trim().max(200),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateSettings(input: SettingsInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  await prisma.$transaction(
    Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );

  revalidatePath("/admin/settings");
  return { ok: true };
}
