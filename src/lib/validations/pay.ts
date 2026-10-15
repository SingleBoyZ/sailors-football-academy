import { z } from "zod";

export const lookupPlayerSchema = z.object({
  query: z.string().trim().min(3, "Enter a member code or email"),
});

export const createFeeBillSchema = z.object({
  playerId: z.string().min(1),
  amountSen: z.number().int().min(1_000, "Minimum payment is RM10"),
  payerName: z.string().trim().min(2, "Enter your name"),
  payerEmail: z.string().trim().email("Enter a valid email address"),
});

export type CreateFeeBillInput = z.infer<typeof createFeeBillSchema>;
