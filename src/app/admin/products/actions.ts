"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadMediaFile } from "@/lib/supabase";
import { productSchema, variantSchema, slugify, type ProductInput, type VariantInput } from "@/lib/validations/product";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export async function createProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const slug = data.slug || slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: `A product with slug "${slug}" already exists.` };

  const product = await prisma.product.create({
    data: { name: data.name, slug, description: data.description, category: data.category, priceSen: data.priceSen, active: data.active, images: [] },
  });

  revalidatePath("/admin/products");
  return { ok: true, data: { id: product.id } };
}

export async function updateProduct(productId: string, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  await prisma.product.update({
    where: { id: productId },
    data: { name: data.name, description: data.description, category: data.category, priceSen: data.priceSen, active: data.active },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

export async function uploadProductImage(productId: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file provided." };

  const result = await uploadMediaFile(file, `products/${productId}`);
  if ("error" in result) return { ok: false, error: result.error };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { images: true } });
  await prisma.product.update({ where: { id: productId }, data: { images: [...(product?.images ?? []), result.url] } });

  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, data: { url: result.url } };
}

export async function removeProductImage(productId: string, imageUrl: string): Promise<ActionResult> {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { images: true } });
  await prisma.product.update({
    where: { id: productId },
    data: { images: (product?.images ?? []).filter((i) => i !== imageUrl) },
  });
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

export async function addVariant(productId: string, input: VariantInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const existingSku = await prisma.productVariant.findUnique({ where: { sku: data.sku } });
  if (existingSku) return { ok: false, error: `SKU "${data.sku}" is already in use.` };

  await prisma.productVariant.create({ data: { ...data, productId } });
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

export async function updateVariant(variantId: string, input: VariantInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const variant = await prisma.productVariant.update({ where: { id: variantId }, data: parsed.data });
  revalidatePath(`/admin/products/${variant.productId}`);
  return { ok: true };
}

export async function deleteVariant(variantId: string): Promise<ActionResult> {
  await requireAdmin();
  const orderItemCount = await prisma.orderItem.count({ where: { variantId } });
  if (orderItemCount > 0) {
    return { ok: false, error: "This variant has order history and can't be deleted — deactivate the product instead." };
  }

  const variant = await prisma.productVariant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/products/${variant.productId}`);
  return { ok: true };
}
