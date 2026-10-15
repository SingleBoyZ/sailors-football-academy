"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { DataTable } from "@/components/admin/DataTable";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatSenCompact } from "@/lib/money";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  category: string;
  priceSen: number;
  variantCount: number;
  active: boolean;
};

const columns: ColumnDef<ProductRow, unknown>[] = [
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

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search products…" />;
}
