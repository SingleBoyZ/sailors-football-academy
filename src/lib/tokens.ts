import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours

/** Issues a one-time token (stored in Auth.js's VerificationToken table) for a "set your password" link. */
export async function createSetPasswordToken(email: string): Promise<string> {
  const token = crypto.randomBytes(24).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: `set-password:${email}`, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  return token;
}

export async function consumeSetPasswordToken(email: string, token: string): Promise<boolean> {
  const identifier = `set-password:${email}`;
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!record || record.expires < new Date()) return false;

  await prisma.verificationToken.delete({ where: { identifier_token: { identifier, token } } });
  return true;
}
