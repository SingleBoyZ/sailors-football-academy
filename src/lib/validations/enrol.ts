import { z } from "zod";

const PHONE_REGEX = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;

export const playerDetailsSchema = z.object({
  playerName: z.string().trim().min(2, "Enter the player's full name"),
  dob: z
    .string()
    .min(1, "Enter a date of birth")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
    .refine((v) => new Date(v) < new Date(), "Date of birth must be in the past"),
  gender: z.enum(["Male", "Female"], { error: "Select a gender" }),
  school: z.string().trim().optional(),
  position: z.string().trim().optional(),
  experience: z.string().trim().max(1000).optional(),
});

export const guardianSchema = z.object({
  guardianName: z.string().trim().min(2, "Enter the guardian's full name"),
  guardianIc: z.string().trim().optional(),
  guardianPhone: z.string().trim().regex(PHONE_REGEX, "Enter a valid Malaysian phone number"),
  guardianEmail: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(10, "Enter the full home address"),
  emergencyName: z.string().trim().min(2, "Enter an emergency contact name"),
  emergencyPhone: z.string().trim().regex(PHONE_REGEX, "Enter a valid Malaysian phone number"),
});

export const medicalConsentSchema = z.object({
  medicalNotes: z.string().trim().max(1000).optional(),
  photoConsent: z.boolean(),
  termsAccepted: z.literal(true, { error: "You must accept the terms to continue" }),
});

export const applicationSchema = playerDetailsSchema.and(guardianSchema).and(medicalConsentSchema);

export type PlayerDetailsInput = z.infer<typeof playerDetailsSchema>;
export type GuardianInput = z.infer<typeof guardianSchema>;
export type MedicalConsentInput = z.infer<typeof medicalConsentSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
