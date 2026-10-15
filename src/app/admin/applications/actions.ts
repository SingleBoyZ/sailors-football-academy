"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";
import { AGE_GROUPS } from "@/content/schedule";
import { sendEmail } from "@/lib/email/send";
import ApplicationApproved from "@/emails/ApplicationApproved";
import ApplicationRejected from "@/emails/ApplicationRejected";
import SetPassword from "@/emails/SetPassword";

const approveSchema = z.object({
  applicationId: z.string().min(1),
  programme: z.enum(["FOUNDATION", "ADVANCE", "PERFORMANCE"]),
  ageGroup: z.enum(AGE_GROUPS),
  plan: z.enum(["FULL", "SIBLING_2", "SIBLING_3", "SPONSORED"]),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function approveApplication(input: z.infer<typeof approveSchema>): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = approveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await db.approveApplication({ ...parsed.data, adminUserId: admin.user.id });
  if (!result.ok) return { ok: false, error: result.error };

  await sendEmail({
    to: result.guardianEmail,
    subject: "All aboard — your application is approved",
    react: ApplicationApproved({
      guardianName: result.guardianName,
      playerName: result.playerName,
      memberCode: result.player.memberCode,
      registrationFeeSen: result.registrationFeeSen,
    }),
  });

  if (result.isNewGuardian) {
    const token = await db.createSetPasswordToken(result.guardianEmail);
    await sendEmail({
      to: result.guardianEmail,
      subject: "Set your Sailors Football Academy portal password",
      react: SetPassword({ guardianName: result.guardianName, email: result.guardianEmail, token }),
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin/players");
  return { ok: true };
}

const rejectSchema = z.object({
  applicationId: z.string().min(1),
  reason: z.string().trim().max(500).optional(),
});

export async function rejectApplication(input: z.infer<typeof rejectSchema>): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = rejectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const result = await db.rejectApplication({ applicationId: data.applicationId, reason: data.reason, adminUserId: admin.user.id });
  if (!result.ok) return { ok: false, error: result.error };

  await sendEmail({
    to: result.guardianEmail,
    subject: "An update on your Sailors Football Academy application",
    react: ApplicationRejected({
      guardianName: result.guardianName,
      playerName: result.playerName,
      reason: data.reason,
    }),
  });

  revalidatePath("/admin/applications");
  return { ok: true };
}
