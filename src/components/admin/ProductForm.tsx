"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { parseRinggitToSen, senToRinggit } from "@/lib/money";
import { createProduct, updateProduct } from "@/app/admin/products/actions";
import type { ProductInput } from "@/lib/validations/product";

type ProductFormProps = {
  productId?: string;
  initial?: { name: string; description: string; category: string; priceSen: number; active: boolean };
};

export function ProductForm({ productId, initial }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const priceSen = parseRinggitToSen(String(formData.get("price") ?? ""));
    if (priceSen === null) {
      setError("Enter a valid price.");
      setSubmitting(false);
      return;
    }

    const input: ProductInput = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      description: String(formData.get("description") ?? ""),
      category: String(formData.get("category") ?? ""),
      priceSen,
      active: formData.get("active") === "on",
    };

    const result = productId ? await updateProduct(productId, input) : await createProduct(input);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!productId && "data" in result && result.data) {
      router.push(`/admin/products/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Name</span>
        <input name="name" defaultValue={initial?.name} required className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      {!productId && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Slug (optional — generated from name if left blank)</span>
          <input name="slug" className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
      )}
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Description</span>
        <textarea name="description" defaultValue={initial?.description} rows={3} required className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Category</span>
          <input name="category" defaultValue={initial?.category} required placeholder="Kits, Training Wear, Accessories" className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Price (RM)</span>
          <input name="price" defaultValue={initial ? senToRinggit(initial.priceSen).toFixed(2) : ""} required className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="accent-brand-red h-4 w-4" />
        Active (visible in store)
      </label>
      {error && <p className="text-brand-red-dark text-sm">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Saving…" : productId ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
