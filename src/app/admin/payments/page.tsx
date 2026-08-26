import type { ColumnDef } from "@tanstack/react-table";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatSenCompact } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { PaymentStatus, PaymentType } from "@prisma/client";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  date: string;
  for: string;
  type: PaymentType;
  amountSen: number;
  status: PaymentStatus;
  billplzBillId: string;
};

const columns: ColumnDef<Row, unknown>[] = [
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

const STATUS_FILTERS: { label: string; value: PaymentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
];

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function PaymentsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const filter = (status as PaymentStatus | undefined) ?? undefined;

  const payments = await prisma.payment.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { player: true, order: true },
    take: 500,
  });

  const rows: Row[] = payments.map((p) => ({
    id: p.id,
    date: p.createdAt.toLocaleDateString("en-MY"),
    for: p.player?.name ?? p.order?.customerName ?? p.payerName,
    type: p.type,
    amountSen: p.amount,
    status: p.status,
    billplzBillId: p.billplzBillId,
  }));

  const csvRows = rows.map((r) => ({
    Date: r.date,
    For: r.for,
    Type: r.type,
    "Amount (RM)": (r.amountSen / 100).toFixed(2),
    Status: r.status,
    "Billplz ID": r.billplzBillId,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Payments</h1>
        <ExportCsvButton rows={csvRows} filename="sfa-payments.csv" />
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <TransitionLink
            key={f.value}
            href={f.value === "ALL" ? "/admin/payments" : `/admin/payments?status=${f.value}`}
            className={cn(
              "border px-3 py-1.5 text-sm",
              (filter ?? "ALL") === f.value ? "border-brand-ink bg-brand-ink text-brand-white" : "border-brand-ink/15 text-brand-muted",
            )}
          >
            {f.label}
          </TransitionLink>
        ))}
      </div>

      <DataTable columns={columns} data={rows} searchPlaceholder="Search payments…" />
    </div>
  );
}
