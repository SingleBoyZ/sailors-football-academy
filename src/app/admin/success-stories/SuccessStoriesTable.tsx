"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { TransitionLink } from "@/components/motion/TransitionLink";

export type SuccessStoryRow = { id: string; playerName: string; ageGroup: string; published: boolean };

const columns: ColumnDef<SuccessStoryRow, unknown>[] = [
  {
    accessorKey: "playerName",
    header: "Player",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/success-stories/${row.original.id}`} className="text-brand-red-dark font-semibold underline">
        {row.original.playerName}
      </TransitionLink>
    ),
  },
  { accessorKey: "ageGroup", header: "Age Group" },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ getValue }) => <span className={getValue() ? "text-brand-success-dark" : "text-brand-muted"}>{getValue() ? "Published" : "Draft"}</span>,
  },
];

export function SuccessStoriesTable({ rows }: { rows: SuccessStoryRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search stories…" />;
}
