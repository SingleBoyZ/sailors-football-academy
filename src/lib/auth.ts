import type { Role } from "@prisma/client";
import { db } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

export function isAdminRole(role: Role | null | undefined) {
  return role === "ADMIN";
}

export function isCoachRole(role: Role | null | undefined) {
  return role === "COACH";
}

/**
 * Returns the signed-in user (Supabase Auth identity joined with their
 * `profiles` row for role/name), or null. Drop-in replacement for the old
 * Auth.js `auth()` at every existing call site.
 */
export async function auth(): Promise<{ user: SessionUser } | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email ?? "";
  const profile = await db.getUserById(user.id).catch(() => null);

  return {
    user: {
      id: user.id,
      email,
      name: profile?.name ?? (typeof user.user_metadata.name === "string" ? user.user_metadata.name : null),
      role: profile?.role ?? "PARENT",
    },
  };
}
