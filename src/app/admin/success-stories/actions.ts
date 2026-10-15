"use server";

import { revalidatePath } from "next/cache";
import { db, type ActionResult } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";
import { uploadMediaFile } from "@/lib/supabase";
import { successStorySchema, type SuccessStoryInput } from "@/lib/validations/success-story";

export type { ActionResult };

export async function createSuccessStory(input: SuccessStoryInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = successStorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await db.createSuccessStory(parsed.data);
  revalidatePath("/admin/success-stories");
  revalidatePath("/success-stories");
  return result;
}

export async function updateSuccessStory(id: string, input: SuccessStoryInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = successStorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await db.updateSuccessStory(id, parsed.data);
  revalidatePath("/admin/success-stories");
  revalidatePath("/success-stories");
  revalidatePath(`/success-stories/${parsed.data.slug}`);
  return result;
}

export async function uploadStoryImage(id: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file provided." };

  const result = await uploadMediaFile(file, `success-stories/${id}`);
  if ("error" in result) return { ok: false, error: result.error };

  await db.setSuccessStoryImage(id, result.url);
  revalidatePath(`/admin/success-stories/${id}`);
  return { ok: true, data: { url: result.url } };
}

export async function deleteSuccessStory(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.deleteSuccessStory(id);
  revalidatePath("/admin/success-stories");
  revalidatePath("/success-stories");
  return { ok: true };
}
