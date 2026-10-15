"use server";

import { redirect } from "next/navigation";
import { db, type PlayerPaymentSummary } from "@/lib/data";
import { lookupPlayerSchema, createFeeBillSchema, type CreateFeeBillInput } from "@/lib/validations/pay";

export type { PlayerPaymentSummary };
export type LookupResult = { ok: true; player: PlayerPaymentSummary } | { ok: false; error: string };

const NOT_FOUND_MESSAGE = "We couldn't find a player matching that member code or email.";

export async function lookupPlayer(rawQuery: string): Promise<LookupResult> {
  const parsed = lookupPlayerSchema.safeParse({ query: rawQuery });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a member code or email" };
  }

  const player = await db.findPlayerForPayment(parsed.data.query).catch((error: unknown) => {
    console.error("lookupPlayer: query failed", error);
    return null;
  });

  if (!player) {
    return { ok: false, error: NOT_FOUND_MESSAGE };
  }

  return { ok: true, player };
}

export type CreateFeeBillResult = { error: string };

export async function createFeeBill(input: CreateFeeBillInput): Promise<CreateFeeBillResult> {
  const parsed = createFeeBillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payment details" };
  }

  const result = await db.createFeePayment(parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(result.billUrl);
}
