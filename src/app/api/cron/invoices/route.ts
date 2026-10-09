import { NextResponse } from "next/server";
import { db } from "@/lib/data";

/**
 * Scheduled monthly invoice generation — call on the 1st of each month with
 * `Authorization: Bearer <CRON_SECRET>` (e.g. from Vercel Cron or any
 * external scheduler). Runs without a signed-in admin session, so it calls
 * `db.generateMonthlyInvoices` directly rather than the admin Server Action
 * (which requires auth()).
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

  const { created, skipped } = await db.generateMonthlyInvoices(month, year);

  return NextResponse.json({ month, year, created, skipped });
}
