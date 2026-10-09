import type { Role } from "@prisma/client";
import { db } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

/**
 * Returns the signed-in user (Supabase Auth identity joined with their
 * `profiles` row for role/name), or null.
 */
export async function auth(): Promise<{ user: SessionUser } | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email ?? "";
  const profile = await db.getUserById(user.id).catch(() => null);

  const rawMetadataName =
    user.user_metadata?.full_name || user.user_metadata?.name || null;

  return {
    user: {
      id: user.id,
      email,
      name: profile?.name ?? (typeof rawMetadataName === "string" ? rawMetadataName : null),
      role: profile?.role ?? "PARENT",
    },
  };
}