"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatSenCompact } from "@/lib/money";
import type { InvoiceStatus, PaymentType } from "@prisma/client";

export type InvoiceRow = {
  id: string;
  player: string;
  type: PaymentType;
  period: string;
  amountDueSen: number;
  amountPaidSen: number;
  status: InvoiceStatus;
};

const columns: ColumnDef<InvoiceRow, unknown>[] = [
  { accessorKey: "player", header: "Player" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "period", header: "Period" },
  { accessorKey: "amountDueSen", header: "Due", cell: ({ getValue }) => formatSenCompact(getValue() as number) },
  { accessorKey: "amountPaidSen", header: "Paid", cell: ({ getValue }) => formatSenCompact(getValue() as number) },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
];

export function InvoicesTable({ rows }: { rows: InvoiceRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search invoices…" />;
}
