import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * OAuth callback — Supabase redirects here with a `code` after Google
 * sign-in/sign-up. Exchanging it sets the session cookies; the user is then
 * sent on to `next` (the page they originally wanted) or their portal.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal";

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/portal"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
