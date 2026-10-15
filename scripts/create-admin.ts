/**
 * Creates (or promotes) an admin account: the user is created in Supabase
 * Auth (profiles row materialises via the on_auth_user_created trigger) and
 * then marked ADMIN in the database.
 *
 * Usage:
 *   ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='...' npx tsx scripts/create-admin.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";
import { getSupabaseAdmin } from "../src/lib/supabase/admin";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Set ${name}, e.g.:`);
    console.error(`  ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='S3cure!Pass' npx tsx scripts/create-admin.ts`);
    process.exit(1);
  }
  return value;
}

const email = requireEnv("ADMIN_EMAIL");
const password = requireEnv("ADMIN_PASSWORD");

const prisma = new PrismaClient();

async function main() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Academy Admin" },
  });

  if (error && !/already been registered/i.test(error.message)) {
    throw new Error(error.message);
  }

  const authId = data.user?.id;
  if (!authId) {
    // Already exists in Auth — look up the profiles row by email instead.
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) throw new Error(`No auth user or profile found for ${email}`);
    await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    console.log(`Promoted existing account ${email} to ADMIN.`);
    return;
  }

  await prisma.user.upsert({
    where: { id: authId },
    update: { role: "ADMIN" },
    create: { id: authId, email, name: "Academy Admin", role: "ADMIN" },
  });

  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
