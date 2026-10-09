import { db } from "@/lib/data";
import { GenerateInvoicesButton } from "@/components/admin/GenerateInvoicesButton";
import { InvoicesTable, type InvoiceRow } from "./InvoicesTable";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await db.getAllInvoices();

  const rows: InvoiceRow[] = invoices.map((inv) => ({
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

      <InvoicesTable rows={rows} />
    </div>
  );
}
