"use server";

import { z } from "zod";
import { db } from "@/lib/data";
import { setAuthUserPassword } from "@/lib/auth/provision";

const schema = z.object({
  email: z.string().trim().email(),
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SetPasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Redeems an emailed set-password token: the password itself is written to
 * Supabase Auth (the identity store) via the admin API, never to Prisma.
 */
export async function setPassword(input: {
  email: string;
  token: string;
  password: string;
}): Promise<SetPasswordResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, token, password } = parsed.data;

  const valid = await db.consumeSetPasswordToken(email, token);
  if (!valid) {
    return { ok: false, error: "This link is invalid or has expired. Ask the academy to resend it." };
  }

  const user = await db.getUserByEmail(email);
  if (!user) {
    return { ok: false, error: "No account found for this email." };
  }

  try {
    await setAuthUserPassword(user.id, password);
  } catch {
    return { ok: false, error: "Couldn't set your password — please try again in a moment." };
  }

  return { ok: true };
}
