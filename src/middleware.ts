import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// A separate, Edge-safe NextAuth instance (no Prisma adapter, no bcrypt
// Credentials provider) — see auth.config.ts for why. Only JWT verification
// happens here, which is all middleware needs to gate routes by role.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL(isLoggedIn ? "/portal" : "/login", req.url));
  }

  if (pathname.startsWith("/portal") && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
