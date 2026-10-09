import { db } from "@/lib/data";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@prisma/client";
import { PaymentsTable, type PaymentRow } from "./PaymentsTable";

export const dynamic = "force-dynamic";

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

  const payments = await db.getPayments(filter ? { status: filter } : undefined);

  const rows: PaymentRow[] = payments.map((p) => ({
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

      <PaymentsTable rows={rows} />
    </div>
  );
}
