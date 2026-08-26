import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl">New Product</h1>
      <div className="bg-brand-white border border-brand-ink/10 p-6">
        <ProductForm />
      </div>
      <p className="text-brand-muted text-sm">Save the product first, then add photos and variants on its detail page.</p>
    </div>
  );
}
