import { db } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { ProductsTable, type ProductRow } from "./ProductsTable";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await db.getAllProductsForAdmin();

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? null,
    category: p.category,
    priceSen: p.priceSen,
    variantCount: p.variantCount,
    active: p.active,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Button href="/admin/products/new">New Product</Button>
      </div>
      <ProductsTable rows={rows} />
    </div>
  );
}
