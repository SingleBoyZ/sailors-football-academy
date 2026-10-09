import { prismaRepo } from "./prisma";
import type { DataRepository } from "./repository";

/**
 * Every page and Server Action reads/writes through this single repository
 * — never `@/lib/prisma` directly. The implementation is backed by Prisma
 * on the Supabase Postgres database; authentication is handled by Supabase
 * Auth (see src/lib/supabase and src/lib/auth).
 */
export const db: DataRepository = prismaRepo;

export type { DataRepository, ActionResult } from "./repository";
export * from "./types";
