import type { ColumnDef } from "@tanstack/react-table";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { GenerateInvoicesButton } from "@/components/admin/GenerateInvoicesButton";
import { formatSenCompact } from "@/lib/money";
import type { InvoiceStatus, PaymentType } from "@prisma/client";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  player: string;
  type: PaymentType;
  period: string;
  amountDueSen: number;
  amountPaidSen: number;
  status: InvoiceStatus;
};

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "player", header: "Player" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "period", header: "Period" },
  { accessorKey: "amountDueSen", header: "Due", cell: ({ getValue }) => formatSenCompact(getValue() as number) },
  { accessorKey: "amountPaidSen", header: "Paid", cell: ({ getValue }) => formatSenCompact(getValue() as number) },
  { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
];

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    include: { player: true },
    take: 500,
  });

  const rows: Row[] = invoices.map((inv) => ({
    id: inv.id,
    player: inv.player.name,
    type: inv.type,
    period: `${inv.periodMonth}/${inv.periodYear}`,
    amountDueSen: inv.amountDue,
    amountPaidSen: inv.amountPaid,
    status: inv.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Invoices</h1>

      <div className="bg-brand-white border border-brand-ink/10 p-5">
        <h2 className="font-display mb-3 text-lg">Monthly Generation</h2>
        <p className="text-brand-muted mb-4 text-sm">
          Creates a monthly fee invoice for every active player at their current rate. Safe to run more
          than once — players who already have an invoice for the period are skipped. Also runs
          automatically on the 1st of each month via <code>/api/cron/invoices</code>.
        </p>
        <GenerateInvoicesButton />
      </div>

      <DataTable columns={columns} data={rows} searchPlaceholder="Search invoices…" />
    </div>
  );
}
