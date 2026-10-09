"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/data";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Enter a valid Malaysian phone number"),
  address: z.string().trim().max(500).optional(),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: { name: string; phone: string; address: string }): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Not signed in." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  await db.updateUserProfile(session.user.id, { name: parsed.data.name, phone: parsed.data.phone, address: parsed.data.address ?? "" });

  revalidatePath("/portal/profile");
  revalidatePath("/portal");
  return { ok: true };
}
