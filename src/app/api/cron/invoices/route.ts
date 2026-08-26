import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Scheduled monthly invoice generation — call on the 1st of each month with
 * `Authorization: Bearer <CRON_SECRET>` (e.g. from Vercel Cron or any
 * external scheduler). Mirrors admin/invoices/actions.ts but runs without a
 * signed-in admin session, so it re-implements the create-if-missing loop
 * directly rather than calling the Server Action (which requires auth()).
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new NextResponse("CRON_SECRET not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

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
      data: { playerId: player.id, type: "MONTHLY_FEE", periodMonth: month, periodYear: year, amountDue: player.monthlyFee, dueDate },
    });
    created += 1;
  }

  return NextResponse.json({ month, year, created, skipped });
}
