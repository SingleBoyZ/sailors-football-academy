import { db } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export async function FeaturedProducts() {
  const products = await db.getFeaturedProducts(4).catch((error: unknown) => {
    console.error("FeaturedProducts: failed to load products", error);
    return [];
  });

  if (products.length === 0) return null;

  return (
    <section className="bg-brand-white py-20 sm:py-28">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">The Store</p>
            <h2 className="font-display max-w-xl text-4xl leading-[0.95] sm:text-5xl">
              Kit Up Like a Sailor
            </h2>
          </Reveal>
          <Button href="/store" variant="secondary">
            Shop All
          </Button>
        </div>

        <Stagger as="div" className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {products.map((product) => (
            <StaggerItem key={product.slug}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
