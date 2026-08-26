"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeSetPasswordToken } from "@/lib/tokens";

const schema = z.object({
  email: z.string().trim().email(),
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SetPasswordResult = { ok: true } | { ok: false; error: string };

export async function setPassword(input: {
  email: string;
  token: string;
  password: string;
}): Promise<SetPasswordResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, token, password } = parsed.data;

  const valid = await consumeSetPasswordToken(email, token);
  if (!valid) {
    return { ok: false, error: "This link is invalid or has expired. Ask the academy to resend it." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "No account found for this email." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { ok: true };
}
