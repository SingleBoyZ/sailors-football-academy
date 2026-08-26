import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";

/** SFA-O-20260826-4F2A1C — date-stamped with a random suffix; collisions are astronomically unlikely. */
export function generateOrderNo(date: Date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SFA-O-${stamp}-${suffix}`;
}

/**
 * SFA-R-202608-0001 — sequential within a calendar month. Must be called
 * inside the same transaction that creates the Payment carrying this
 * receiptNo, so the count-then-insert stays consistent; the column's
 * @unique constraint is the final backstop against a race.
 */
export async function generateReceiptNo(tx: Prisma.TransactionClient, date: Date = new Date()): Promise<string> {
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `SFA-R-${yyyymm}-`;
  const count = await tx.payment.count({ where: { receiptNo: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

/** SFA-2026-0042 — sequential within a calendar year. */
export async function generateMemberCode(tx: Prisma.TransactionClient, date: Date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const prefix = `SFA-${year}-`;
  const count = await tx.player.count({ where: { memberCode: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}
