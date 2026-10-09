"use server";

import { db } from "@/lib/data";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

export type RegisterResult = { ok: true; confirmed: boolean } | { ok: false; error: string };

/**
 * Creates the parent account in Supabase Auth (the on_auth_user_created
 * trigger materialises their profiles row from user_metadata). When the
 * project has email confirmation enabled there is no session yet — the UI
 * then asks the user to check their inbox instead of proceeding.
 */
export async function registerParent(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const data = parsed.data;

  const existing = await db.getUserByEmail(data.email);
  if (existing) {
    return { ok: false, error: "An account with this email already exists. Try signing in instead." };
  }

  const supabase = await createSupabaseServer();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { name: data.name, phone: data.phone } },
  });

  if (error) {
    if (/already registered/i.test(error.message)) {
      return { ok: false, error: "An account with this email already exists. Try signing in instead." };
    }
    return { ok: false, error: "Couldn't create your account — please try again in a moment." };
  }

  return { ok: true, confirmed: !!signUpData.session };
}
