import type { ColumnDef } from "@tanstack/react-table";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatSenCompact } from "@/lib/money";
import { PLAN_LABELS } from "@/lib/plan";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  memberCode: string;
  name: string;
  ageGroup: string;
  programme: string;
  plan: string;
  outstandingSen: number;
  active: boolean;
};

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "memberCode",
    header: "Member Code",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/players/${row.original.id}`} className="text-brand-red font-semibold underline">
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
      return <span className={value > 0 ? "text-brand-red font-semibold" : "text-brand-success"}>{formatSenCompact(value)}</span>;
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ getValue }) => (
      <span className={getValue() ? "text-brand-success" : "text-brand-muted"}>{getValue() ? "Active" : "Inactive"}</span>
    ),
  },
];

export default async function PlayersPage() {
  const [players, openInvoicesByPlayer] = await Promise.all([
    prisma.player.findMany({ orderBy: { joinedAt: "desc" } }),
    prisma.invoice.groupBy({
      by: ["playerId"],
      where: { status: { not: "SETTLED" } },
      _sum: { amountDue: true, amountPaid: true },
    }),
  ]);

  const outstandingMap = new Map<string, number>();
  for (const group of openInvoicesByPlayer) {
    outstandingMap.set(group.playerId, (group._sum.amountDue ?? 0) - (group._sum.amountPaid ?? 0));
  }

  const rows: Row[] = players.map((p) => ({
    id: p.id,
    memberCode: p.memberCode,
    name: p.name,
    ageGroup: p.ageGroup,
    programme: p.programme,
    plan: PLAN_LABELS[p.plan],
    outstandingSen: outstandingMap.get(p.id) ?? 0,
    active: p.active,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Players</h1>
      <DataTable columns={columns} data={rows} searchPlaceholder="Search players…" />
    </div>
  );
}
