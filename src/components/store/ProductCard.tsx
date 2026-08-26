"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatSenCompact } from "@/lib/money";

export type ProductCardData = {
  slug: string;
  name: string;
  category: string;
  priceSen: number;
  images: string[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const [primary, secondary] = product.images;

  return (
    <TransitionLink href={`/store/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-brand-sand">
        <motion.div layoutId={`product-image-${product.slug}`} className="absolute inset-0">
          <Image
            src={primary}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
          <Image
            src={secondary ?? primary}
            alt=""
            aria-hidden="true"
            fill
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </motion.div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-2 transition-transform duration-300 group-hover:-translate-y-0.5">
        <div>
          <p className="text-brand-muted text-xs tracking-wide uppercase">{product.category}</p>
          <h3 className="font-display text-lg leading-tight">{product.name}</h3>
        </div>
        <span className="font-display text-brand-red text-lg whitespace-nowrap">
          {formatSenCompact(product.priceSen)}
        </span>
      </div>
    </TransitionLink>
  );
}
