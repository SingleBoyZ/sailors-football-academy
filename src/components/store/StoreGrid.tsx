"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ProductCard, type ProductCardData } from "@/components/store/ProductCard";
import { cn } from "@/lib/utils";

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export function StoreGrid({ products, categories }: { products: ProductCardData[]; categories: string[] }) {
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    let list = category === "All" ? products : products.filter((p) => p.category === category);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.priceSen - b.priceSen);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.priceSen - a.priceSen);
    return list;
  }, [products, category, sort]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "relative isolate px-4 py-2 text-sm tracking-wide uppercase transition-colors",
                category === c ? "text-brand-white" : "text-brand-muted hover:text-brand-ink",
              )}
            >
              {category === c && (
                <motion.span layoutId="store-category-pill" className="bg-brand-ink absolute inset-0 -z-10" />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>

        <label className="text-sm">
          <span className="text-brand-muted mr-2">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-brand-ink/15 bg-brand-white px-3 py-2"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-brand-muted">No products in this category yet.</p>
      ) : (
        // Keyed by category so switching filters remounts this container fresh — Stagger's
        // scroll-reveal only ever fires once per instance (viewport once: true), so without a
        // fresh instance, cards that get filtered out and later filtered back in would remount
        // after that one-time trigger already fired and stay stuck at their hidden opacity.
        <Stagger key={category} as="div" className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {filtered.map((product) => (
            <StaggerItem key={product.slug}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
