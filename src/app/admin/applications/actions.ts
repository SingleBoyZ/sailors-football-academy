"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateMemberCode } from "@/lib/codes";
import { monthlyFeeForPlan } from "@/lib/plan";
import { getSetting } from "@/lib/settings";
import { FEES, AGE_GROUPS } from "@/content/schedule";
import { createSetPasswordToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
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
  const data = parsed.data;

  const application = await prisma.application.findUnique({ where: { id: data.applicationId } });
  if (!application) return { ok: false, error: "Application not found." };
  if (application.status !== "PENDING") return { ok: false, error: "This application has already been reviewed." };

  const sponsoredFeeSen = await getSetting("sponsoredMonthlyFeeSen", FEES.sponsoredSen);
  const monthlyFee = monthlyFeeForPlan(data.plan, sponsoredFeeSen);

  let guardian = await prisma.user.findUnique({ where: { email: application.guardianEmail } });
  const isNewGuardian = !guardian;
  if (!guardian) {
    guardian = await prisma.user.create({
      data: { name: application.guardianName, email: application.guardianEmail, phone: application.guardianPhone, role: "PARENT" },
    });
  }

  const now = new Date();

  const player = await prisma.$transaction(async (tx) => {
    const memberCode = await generateMemberCode(tx, now);
    const newPlayer = await tx.player.create({
      data: {
        memberCode,
        name: application.playerName,
        dob: application.dob,
        ageGroup: data.ageGroup,
        programme: data.programme,
        plan: data.plan,
        monthlyFee,
        guardianId: guardian!.id,
        notes: application.medicalNotes,
      },
    });

    await tx.application.update({
      where: { id: application.id },
      data: { status: "APPROVED", reviewedAt: now, reviewedById: admin.user.id, playerId: newPlayer.id },
    });

    await tx.invoice.create({
      data: {
        playerId: newPlayer.id,
        type: "REGISTRATION",
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
        amountDue: FEES.registrationSen,
        dueDate: now,
      },
    });
    await tx.invoice.create({
      data: {
        playerId: newPlayer.id,
        type: "MONTHLY_FEE",
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
        amountDue: monthlyFee,
        dueDate: now,
      },
    });

    return newPlayer;
  });

  await sendEmail({
    to: application.guardianEmail,
    subject: "All aboard — your application is approved",
    react: ApplicationApproved({
      guardianName: application.guardianName,
      playerName: application.playerName,
      memberCode: player.memberCode,
      registrationFeeSen: FEES.registrationSen,
    }),
  });

  if (isNewGuardian) {
    const token = await createSetPasswordToken(application.guardianEmail);
    await sendEmail({
      to: application.guardianEmail,
      subject: "Set your Sailors Football Academy portal password",
      react: SetPassword({ guardianName: application.guardianName, email: application.guardianEmail, token }),
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

  const application = await prisma.application.findUnique({ where: { id: data.applicationId } });
  if (!application) return { ok: false, error: "Application not found." };
  if (application.status !== "PENDING") return { ok: false, error: "This application has already been reviewed." };

  await prisma.application.update({
    where: { id: application.id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: admin.user.id,
      rejectionReason: data.reason || null,
    },
  });

  await sendEmail({
    to: application.guardianEmail,
    subject: "An update on your Sailors Football Academy application",
    react: ApplicationRejected({
      guardianName: application.guardianName,
      playerName: application.playerName,
      reason: data.reason,
    }),
  });

  revalidatePath("/admin/applications");
  return { ok: true };
}
