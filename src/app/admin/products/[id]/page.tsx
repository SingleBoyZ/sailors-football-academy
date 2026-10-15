import { notFound } from "next/navigation";
import { db } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { VariantManager } from "@/components/admin/VariantManager";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await db.getProductById(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl">{product.name}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-brand-white border border-brand-ink/10 p-6">
          <h2 className="font-display mb-4 text-lg">Details</h2>
          <ProductForm
            productId={product.id}
            initial={{ name: product.name, description: product.description, category: product.category, priceSen: product.priceSen, active: product.active }}
          />
        </section>

        <section className="bg-brand-white border border-brand-ink/10 p-6">
          <h2 className="font-display mb-4 text-lg">Photos</h2>
          <ImageUploader productId={product.id} images={product.images} />
        </section>
      </div>

      <section className="bg-brand-white border border-brand-ink/10 p-6">
        <h2 className="font-display mb-4 text-lg">Variants &amp; Stock</h2>
        <VariantManager productId={product.id} variants={product.variants} />
      </section>
    </div>
  );
}
