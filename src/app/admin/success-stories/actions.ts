"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadMediaFile } from "@/lib/supabase";
import { successStorySchema, type SuccessStoryInput } from "@/lib/validations/success-story";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export async function createSuccessStory(input: SuccessStoryInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = successStorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const existing = await prisma.successStory.findUnique({ where: { slug: data.slug } });
  if (existing) return { ok: false, error: `A story with slug "${data.slug}" already exists.` };

  const story = await prisma.successStory.create({ data: { ...data, image: "/placeholders/success-story-1.svg" } });
  revalidatePath("/admin/success-stories");
  revalidatePath("/success-stories");
  return { ok: true, data: { id: story.id } };
}

export async function updateSuccessStory(id: string, input: SuccessStoryInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = successStorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.successStory.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/success-stories");
  revalidatePath("/success-stories");
  revalidatePath(`/success-stories/${parsed.data.slug}`);
  return { ok: true };
}

export async function uploadStoryImage(id: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file provided." };

  const result = await uploadMediaFile(file, `success-stories/${id}`);
  if ("error" in result) return { ok: false, error: result.error };

  await prisma.successStory.update({ where: { id }, data: { image: result.url } });
  revalidatePath(`/admin/success-stories/${id}`);
  return { ok: true, data: { url: result.url } };
}

export async function deleteSuccessStory(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.successStory.delete({ where: { id } });
  revalidatePath("/admin/success-stories");
  revalidatePath("/success-stories");
  return { ok: true };
}
