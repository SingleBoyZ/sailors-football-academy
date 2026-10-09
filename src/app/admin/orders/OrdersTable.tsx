"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatSenCompact } from "@/lib/money";
import type { OrderStatus } from "@prisma/client";

export type OrderRow = {
  id: string;
  orderNo: string;
  customerName: string;
  date: string;
  totalSen: number;
  deliveryMethod: string;
  status: OrderStatus;
};

const columns: ColumnDef<OrderRow, unknown>[] = [
  {
    accessorKey: "orderNo",
    header: "Order No.",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/orders/${row.original.id}`} className="text-brand-red-dark font-semibold underline">
        {row.original.orderNo}
      </TransitionLink>
    ),
  },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "totalSen", header: "Total", cell: ({ getValue }) => formatSenCompact(getValue() as number) },
  { accessorKey: "deliveryMethod", header: "Delivery" },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
];

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search orders…" />;
}
