import type { ColumnDef } from "@tanstack/react-table";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatSenCompact } from "@/lib/money";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  orderNo: string;
  customerName: string;
  date: string;
  totalSen: number;
  deliveryMethod: string;
  status: OrderStatus;
};

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "orderNo",
    header: "Order No.",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/orders/${row.original.id}`} className="text-brand-red font-semibold underline">
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

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  const rows: Row[] = orders.map((o) => ({
    id: o.id,
    orderNo: o.orderNo,
    customerName: o.customerName,
    date: o.createdAt.toLocaleDateString("en-MY"),
    totalSen: o.totalSen,
    deliveryMethod: o.deliveryMethod,
    status: o.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Orders</h1>
      <DataTable columns={columns} data={rows} searchPlaceholder="Search orders…" />
    </div>
  );
}
