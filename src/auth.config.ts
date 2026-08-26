import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { Role } from "@prisma/client";

/**
 * Edge-safe subset of the full Auth.js config — no Prisma adapter, no
 * bcrypt Credentials provider (both need the Node.js runtime). Used
 * directly by middleware.ts (which runs on the Edge runtime) and spread
 * into the full config in auth.ts (which runs in Node for route handlers,
 * Server Components and Server Actions).
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [Google],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as Role) ?? "PARENT";
      }
      return session;
    },
  },
};
