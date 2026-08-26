import type { ColumnDef } from "@tanstack/react-table";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ageGroupFromDob } from "@/lib/age";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  playerName: string;
  ageGroup: string;
  guardianName: string;
  guardianEmail: string;
  submittedAt: Date;
  status: ApplicationStatus;
};

const FILTERS: { label: string; value: ApplicationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const columns: ColumnDef<Row, unknown>[] = [
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

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const filter = (status as ApplicationStatus | undefined) ?? undefined;

  const applications = await prisma.application.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { submittedAt: "desc" },
  });

  const rows: Row[] = applications.map((app) => ({
    id: app.id,
    playerName: app.playerName,
    ageGroup: ageGroupFromDob(app.dob),
    guardianName: app.guardianName,
    guardianEmail: app.guardianEmail,
    submittedAt: app.submittedAt,
    status: app.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Applications</h1>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <TransitionLink
            key={f.value}
            href={f.value === "ALL" ? "/admin/applications" : `/admin/applications?status=${f.value}`}
            className={cn(
              "border px-3 py-1.5 text-sm",
              (filter ?? "ALL") === f.value
                ? "border-brand-ink bg-brand-ink text-brand-white"
                : "border-brand-ink/15 text-brand-muted",
            )}
          >
            {f.label}
          </TransitionLink>
        ))}
      </div>

      <DataTable columns={columns} data={rows} searchPlaceholder="Search applications…" />
    </div>
  );
}
