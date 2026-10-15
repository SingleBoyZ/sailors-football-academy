"use server";

import { db } from "@/lib/data";
import { applicationSchema, type ApplicationInput } from "@/lib/validations/enrol";
import { ageGroupFromDob } from "@/lib/age";
import { sendEmail } from "@/lib/email/send";
import ApplicationReceived from "@/emails/ApplicationReceived";
import NewApplicationAdmin from "@/emails/NewApplicationAdmin";

export type SubmitApplicationResult = { ok: true } | { ok: false; error: string };

export async function submitApplication(input: ApplicationInput): Promise<SubmitApplicationResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const data = parsed.data;
  const ageGroup = ageGroupFromDob(new Date(data.dob));

  let applicationId: string;
  try {
    const application = await db.createApplication({
      playerName: data.playerName,
      dob: new Date(data.dob),
      gender: data.gender,
      school: data.school || null,
      position: data.position || null,
      experience: data.experience || null,
      guardianName: data.guardianName,
      guardianIc: data.guardianIc || null,
      guardianPhone: data.guardianPhone,
      guardianEmail: data.guardianEmail,
      address: data.address,
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
      medicalNotes: data.medicalNotes || null,
      photoConsent: data.photoConsent,
    });
    applicationId = application.id;
  } catch (error) {
    console.error("submitApplication: failed to create application", error);
    return { ok: false, error: "Something went wrong saving your application. Please try again." };
  }

  await sendEmail({
    to: data.guardianEmail,
    subject: "We've received your enrolment application",
    react: ApplicationReceived({ guardianName: data.guardianName, playerName: data.playerName, ageGroup }),
  });

  const adminEmails = await db.getAdminEmails();

  for (const email of adminEmails) {
    await sendEmail({
      to: email as string,
      subject: `New enrolment application — ${data.playerName}`,
      react: NewApplicationAdmin({
        playerName: data.playerName,
        ageGroup,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
        applicationId,
      }),
    });
  }

  return { ok: true };
}
