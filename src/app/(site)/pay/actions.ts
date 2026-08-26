"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createBill } from "@/lib/billplz";
import { getOutstandingForPlayer } from "@/lib/fees";
import { lookupPlayerSchema, createFeeBillSchema, type CreateFeeBillInput } from "@/lib/validations/pay";
import { SITE } from "@/content/site";

export type PlayerPaymentSummary = {
  playerId: string;
  name: string;
  memberCode: string;
  programme: string;
  ageGroup: string;
  monthlyFeeSen: number;
  outstandingSen: number;
  guardianEmail: string;
};

export type LookupResult = { ok: true; player: PlayerPaymentSummary } | { ok: false; error: string };

const NOT_FOUND_MESSAGE = "We couldn't find a player matching that member code or email.";

export async function lookupPlayer(rawQuery: string): Promise<LookupResult> {
  const parsed = lookupPlayerSchema.safeParse({ query: rawQuery });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a member code or email" };
  }

  const query = parsed.data.query;
  const player = await prisma.player
    .findFirst({
      where: {
        active: true,
        OR: [{ memberCode: { equals: query, mode: "insensitive" } }, { guardian: { email: { equals: query, mode: "insensitive" } } }],
      },
      include: { guardian: true },
    })
    .catch((error: unknown) => {
      console.error("lookupPlayer: query failed", error);
      return null;
    });

  if (!player) {
    return { ok: false, error: NOT_FOUND_MESSAGE };
  }

  const outstandingSen = await getOutstandingForPlayer(player.id);

  return {
    ok: true,
    player: {
      playerId: player.id,
      name: player.name,
      memberCode: player.memberCode,
      programme: player.programme,
      ageGroup: player.ageGroup,
      monthlyFeeSen: player.monthlyFee,
      outstandingSen,
      guardianEmail: player.guardian.email,
    },
  };
}

export type CreateFeeBillResult = { error: string };

export async function createFeeBill(input: CreateFeeBillInput): Promise<CreateFeeBillResult> {
  const parsed = createFeeBillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payment details" };
  }
  const data = parsed.data;

  const player = await prisma.player.findUnique({ where: { id: data.playerId } });
  if (!player || !player.active) {
    return { error: "This player could not be found." };
  }

  const outstanding = await getOutstandingForPlayer(player.id);
  if (outstanding <= 0) {
    return { error: "This account has no outstanding balance." };
  }
  const amountSen = Math.min(data.amountSen, outstanding);

  const collectionId = process.env.BILLPLZ_COLLECTION_ID_FEES;
  if (!collectionId) {
    return { error: "Fee payments are not configured yet. Please contact the academy directly." };
  }

  // The fee type only matters for the receipt breakdown — actual allocation
  // (registration before monthly, oldest period first) happens in
  // lib/fees.ts once the payment is confirmed, so a mixed payment covering
  // both is recorded correctly either way.
  const hasUnpaidRegistration = !player.registrationPaid;

  let bill;
  try {
    bill = await createBill({
      collectionId,
      email: data.payerEmail,
      name: data.payerName,
      amountSen,
      description: `Sailors FA fees — ${player.name} (${player.memberCode})`,
      callbackUrl: `${SITE.url}/api/billplz/callback`,
      redirectUrl: `${SITE.url}/pay/result`,
      referenceLabel: "Member Code",
      referenceValue: player.memberCode,
    });
  } catch (error) {
    console.error("createFeeBill: Billplz bill creation failed", error);
    return { error: "Could not start payment. Please try again in a moment." };
  }

  await prisma.payment.create({
    data: {
      playerId: player.id,
      type: hasUnpaidRegistration ? "REGISTRATION" : "MONTHLY_FEE",
      amount: amountSen,
      status: "PENDING",
      billplzBillId: bill.id,
      billplzUrl: bill.url,
      payerName: data.payerName,
      payerEmail: data.payerEmail,
    },
  });

  redirect(bill.url);
}
