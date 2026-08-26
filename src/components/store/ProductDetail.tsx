"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatSenCompact } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export type ProductDetailData = {
  slug: string;
  name: string;
  description: string;
  category: string;
  priceSen: number;
  images: string[];
  variants: { id: string; label: string; stock: number; priceOverrideSen: number | null }[];
};

export function ProductDetail({ product }: { product: ProductDetailData }) {
  const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const variant = product.variants.find((v) => v.id === variantId);
  const priceSen = variant?.priceOverrideSen ?? product.priceSen;
  const outOfStock = !variant || variant.stock <= 0;
  const image = product.images[0] ?? "/placeholders/store/home-kit.svg";

  const maxQty = useMemo(() => Math.min(10, variant?.stock ?? 1), [variant]);

  function handleAddToCart() {
    if (!variant || outOfStock) return;
    addItem(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: variant.label,
        priceSen,
        image,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-6">
        <motion.div layoutId={`product-image-${product.slug}`} className="relative aspect-square bg-brand-sand">
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(min-width: 1024px) 45vw, 90vw" priority />
        </motion.div>
      </div>

      <Reveal className="lg:col-span-6">
        <p className="text-brand-muted text-xs tracking-wide uppercase">{product.category}</p>
        <h1 className="font-display mt-1 text-4xl leading-[0.95] sm:text-5xl">{product.name}</h1>
        <p className="font-display text-brand-red mt-4 text-2xl">{formatSenCompact(priceSen)}</p>
        <p className="text-brand-muted mt-6 max-w-md text-sm leading-relaxed">{product.description}</p>

        <div className="mt-8">
          <span className="text-brand-muted mb-3 block text-xs tracking-wide uppercase">Size / Variant</span>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock <= 0}
                onClick={() => {
                  setVariantId(v.id);
                  setQty(1);
                }}
                className={cn(
                  "border px-4 py-2 text-sm transition-colors",
                  v.id === variantId
                    ? "border-brand-ink bg-brand-ink text-brand-white"
                    : "border-brand-ink/20 hover:border-brand-ink",
                  v.stock <= 0 && "cursor-not-allowed opacity-40",
                )}
              >
                {v.label}
                {v.stock <= 0 && " — Out of stock"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center border border-brand-ink/15">
            <button
              aria-label="Decrease quantity"
              className="p-3 hover:bg-brand-sand"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center">{qty}</span>
            <button
              aria-label="Increase quantity"
              className="p-3 hover:bg-brand-sand"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button size="lg" onClick={handleAddToCart} disabled={outOfStock} className="flex-1">
            {outOfStock ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
