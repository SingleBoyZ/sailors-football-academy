import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal";

  // Force the redirect to always use your real production domain
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://football.bermudaz.my").replace(/\/$/, "");

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const destination = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(`${appUrl}${destination}`);
    }
  }

  return NextResponse.redirect(`${appUrl}/login?error=oauth`);
}