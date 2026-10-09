"use server";

import { revalidatePath } from "next/cache";
import { db, type ActionResult } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";
import { uploadMediaFile } from "@/lib/supabase";
import { productSchema, variantSchema, type ProductInput, type VariantInput } from "@/lib/validations/product";

export type { ActionResult };

export async function createProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await db.createProduct(parsed.data);
  revalidatePath("/admin/products");
  return result;
}

export async function updateProduct(productId: string, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await db.updateProduct(productId, parsed.data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return result;
}

export async function uploadProductImage(productId: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file provided." };

  const result = await uploadMediaFile(file, `products/${productId}`);
  if ("error" in result) return { ok: false, error: result.error };

  await db.addProductImage(productId, result.url);
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, data: { url: result.url } };
}

export async function removeProductImage(productId: string, imageUrl: string): Promise<ActionResult> {
  await requireAdmin();
  await db.removeProductImage(productId, imageUrl);
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

export async function addVariant(productId: string, input: VariantInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await db.addVariant(productId, parsed.data);
  revalidatePath(`/admin/products/${productId}`);
  return result;
}

export async function updateVariant(variantId: string, input: VariantInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await db.updateVariant(variantId, parsed.data);
  if (!result.ok) return result;
  revalidatePath(`/admin/products/${result.data!.productId}`);
  return { ok: true };
}

export async function deleteVariant(variantId: string): Promise<ActionResult> {
  await requireAdmin();
  const result = await db.deleteVariant(variantId);
  if (!result.ok) return result;
  revalidatePath(`/admin/products/${result.data!.productId}`);
  return { ok: true };
}
