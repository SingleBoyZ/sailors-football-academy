import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Creates a Supabase Auth user for a guardian whose child's application was
 * approved. The `on_auth_user_created` trigger materialises their
 * `public.profiles` row from user_metadata. No password is set here — the
 * guardian sets one through the emailed set-password link.
 *
 * Returns the new auth user's UUID (i.e. the profiles id).
 */
export async function provisionGuardian(input: { name: string; email: string; phone?: string | null }): Promise<string> {
  const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: { name: input.name, phone: input.phone ?? "" },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Could not create the guardian's auth account.");
  }
  return data.user.id;
}

/** Sets (or replaces) a user's password — used when a set-password token link is redeemed. */
export async function setAuthUserPassword(userId: string, password: string): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(userId, { password });
  if (error) throw new Error(error.message);
}
