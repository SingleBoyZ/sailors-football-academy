import { z } from "zod";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name"),
  slug: z
    .string()
    .trim()
    .transform((v) => (v ? slugify(v) : ""))
    .optional(),
  description: z.string().trim().min(1, "Enter a description"),
  category: z.string().trim().min(1, "Enter a category"),
  priceSen: z.number().int().min(0, "Price can't be negative"),
  active: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  label: z.string().trim().min(1, "Enter a variant label"),
  sku: z.string().trim().min(1, "Enter a SKU"),
  stock: z.number().int().min(0, "Stock can't be negative"),
  priceOverrideSen: z.number().int().min(0).nullable(),
});

export type VariantInput = z.infer<typeof variantSchema>;

export { slugify };
