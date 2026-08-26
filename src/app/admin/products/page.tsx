import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Button } from "@/components/ui/Button";
import { formatSenCompact } from "@/lib/money";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  category: string;
  priceSen: number;
  variantCount: number;
  active: boolean;
};

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/products/${row.original.id}`} className="flex items-center gap-3">
        <div className="bg-brand-sand relative h-10 w-10 shrink-0 overflow-hidden">
          {row.original.image && <Image src={row.original.image} alt="" fill className="object-cover" sizes="40px" />}
        </div>
        <span className="text-brand-red-dark font-semibold underline">{row.original.name}</span>
      </TransitionLink>
    ),
  },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "priceSen", header: "Price", cell: ({ getValue }) => formatSenCompact(getValue() as number) },
  { accessorKey: "variantCount", header: "Variants" },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ getValue }) => <span className={getValue() ? "text-brand-success-dark" : "text-brand-muted"}>{getValue() ? "Active" : "Inactive"}</span>,
  },
];

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { variants: true } } },
  });

  const rows: Row[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? null,
    category: p.category,
    priceSen: p.priceSen,
    variantCount: p._count.variants,
    active: p.active,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Button href="/admin/products/new">New Product</Button>
      </div>
      <DataTable columns={columns} data={rows} searchPlaceholder="Search products…" />
    </div>
  );
}
