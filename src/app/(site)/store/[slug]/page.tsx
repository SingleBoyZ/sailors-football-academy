import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProductDetail } from "@/components/store/ProductDetail";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return db.getProduct(slug).catch((error: unknown) => {
    console.error("ProductPage: failed to load product", error);
    return null;
  });
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: PageParams) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.active) notFound();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <ProductDetail
          product={{
            slug: product.slug,
            name: product.name,
            description: product.description,
            category: product.category,
            priceSen: product.priceSen,
            images: product.images,
            variants: product.variants.map((v) => ({
              id: v.id,
              label: v.label,
              stock: v.stock,
              priceOverrideSen: v.priceOverrideSen,
            })),
          }}
        />
      </Container>
    </section>
  );
}
