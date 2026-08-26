import { z } from "zod";

export const successStorySchema = z.object({
  playerName: z.string().trim().min(2, "Enter the player's name"),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a URL slug")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  ageGroup: z.string().trim().min(1, "Enter an age group"),
  quote: z.string().trim().min(4, "Enter a short quote"),
  body: z.string().trim().min(10, "Enter the full story"),
  published: z.boolean(),
});

export type SuccessStoryInput = z.infer<typeof successStorySchema>;
