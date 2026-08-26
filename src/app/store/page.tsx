import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { StoreGrid } from "@/components/store/StoreGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Store",
  description: "Official Sailors Football Academy kits, training wear and accessories.",
};

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const products = await prisma.product
    .findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: { slug: true, name: true, category: true, priceSen: true, images: true },
    })
    .catch((error: unknown) => {
      console.error("StorePage: failed to load products", error);
      return [];
    });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      <PageHeader
        eyebrow="Store"
        title="Kit Up"
        description="Official academy kits, training wear and accessories — pay securely with Billplz."
      />
      <section className="bg-brand-white py-16 sm:py-24">
        <Container>
          {products.length === 0 ? (
            <p className="text-brand-muted">
              The store is empty right now — check back soon, or see this in Admin → Products.
            </p>
          ) : (
            <StoreGrid products={products} categories={categories} />
          )}
        </Container>
      </section>
    </>
  );
}
