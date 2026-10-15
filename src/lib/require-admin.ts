import { auth } from "@/lib/auth";

/**
 * Defense-in-depth for admin Server Actions — middleware already blocks
 * unauthenticated navigation to /admin/**, but actions are worth guarding
 * directly too since they're invoked as RPCs, not page loads.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Forbidden — admin access required");
  }
  return session;
}
