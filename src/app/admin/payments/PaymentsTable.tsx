"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatSenCompact } from "@/lib/money";
import type { PaymentStatus, PaymentType } from "@prisma/client";

export type PaymentRow = {
  id: string;
  date: string;
  for: string;
  type: PaymentType;
  amountSen: number;
  status: PaymentStatus;
  billplzBillId: string;
};

const columns: ColumnDef<PaymentRow, unknown>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "for", header: "For" },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "amountSen",
    header: "Amount",
    cell: ({ getValue }) => formatSenCompact(getValue() as number),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  { accessorKey: "billplzBillId", header: "Billplz ID" },
];

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search payments…" />;
}
