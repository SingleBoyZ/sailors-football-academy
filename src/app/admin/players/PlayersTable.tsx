"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatSenCompact } from "@/lib/money";

export type PlayerRow = {
  id: string;
  memberCode: string;
  name: string;
  ageGroup: string;
  programme: string;
  plan: string;
  outstandingSen: number;
  active: boolean;
};

const columns: ColumnDef<PlayerRow, unknown>[] = [
  {
    accessorKey: "memberCode",
    header: "Member Code",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/players/${row.original.id}`} className="text-brand-red-dark font-semibold underline">
        {row.original.memberCode}
      </TransitionLink>
    ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "ageGroup", header: "Age Group" },
  { accessorKey: "programme", header: "Programme" },
  { accessorKey: "plan", header: "Plan" },
  {
    accessorKey: "outstandingSen",
    header: "Outstanding",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span className={value > 0 ? "text-brand-red-dark font-semibold" : "text-brand-success"}>{formatSenCompact(value)}</span>;
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ getValue }) => (
      <span className={getValue() ? "text-brand-success-dark" : "text-brand-muted"}>{getValue() ? "Active" : "Inactive"}</span>
    ),
  },
];

export function PlayersTable({ rows }: { rows: PlayerRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search players…" />;
}
