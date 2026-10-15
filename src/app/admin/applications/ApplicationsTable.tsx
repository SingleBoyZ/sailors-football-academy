"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TransitionLink } from "@/components/motion/TransitionLink";
import type { ApplicationStatus } from "@prisma/client";

export type ApplicationRow = {
  id: string;
  playerName: string;
  ageGroup: string;
  guardianName: string;
  guardianEmail: string;
  submittedAt: Date;
  status: ApplicationStatus;
};

const columns: ColumnDef<ApplicationRow, unknown>[] = [
  {
    accessorKey: "playerName",
    header: "Player",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/applications/${row.original.id}`} className="text-brand-red-dark font-semibold underline">
        {row.original.playerName}
      </TransitionLink>
    ),
  },
  { accessorKey: "ageGroup", header: "Age Group" },
  { accessorKey: "guardianName", header: "Guardian" },
  { accessorKey: "guardianEmail", header: "Email" },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ getValue }) => (getValue() as Date).toLocaleDateString("en-MY"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export function ApplicationsTable({ rows }: { rows: ApplicationRow[] }) {
  return <DataTable columns={columns} data={rows} searchPlaceholder="Search applications…" />;
}
