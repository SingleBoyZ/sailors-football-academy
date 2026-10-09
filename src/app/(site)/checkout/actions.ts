"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/data";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";

export type CheckoutResult = { error: string };

export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid checkout details" };
  }

  const session = await auth();
  const result = await db.createOrder({ ...parsed.data, userId: session?.user.id });
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(result.billUrl);
}
