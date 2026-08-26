"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export type GenerateResult = { created: number; skipped: number };

/** Creates a MONTHLY_FEE invoice for every active player at their current monthlyFee — a no-op for players who already have one for that period. */
export async function generateMonthlyInvoices(month: number, year: number): Promise<GenerateResult> {
  await requireAdmin();

  const players = await prisma.player.findMany({ where: { active: true } });
  const dueDate = new Date(year, month - 1, 1);

  let created = 0;
  let skipped = 0;

  for (const player of players) {
    const existing = await prisma.invoice.findUnique({
      where: {
        playerId_type_periodMonth_periodYear: {
          playerId: player.id,
          type: "MONTHLY_FEE",
          periodMonth: month,
          periodYear: year,
        },
      },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.invoice.create({
      data: {
        playerId: player.id,
        type: "MONTHLY_FEE",
        periodMonth: month,
        periodYear: year,
        amountDue: player.monthlyFee,
        dueDate,
      },
    });
    created += 1;
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/players");
  return { created, skipped };
}
