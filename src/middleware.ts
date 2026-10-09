import { type NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

/**
 * Refreshes the Supabase session cookie and gates the protected areas.
 * Authenticated but non-admin users reaching /admin are bounced to their
 * portal (the admin layout re-checks the role server-side too).
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);
  const { pathname } = request.nextUrl;

  // Gate /admin and /portal behind a signed-in session. The admin role check
  // itself needs a DB read, which Edge middleware can't do — it's enforced
  // in src/app/admin/layout.tsx (plus requireAdmin on every admin action).
  if ((pathname.startsWith("/admin") || pathname.startsWith("/portal")) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
