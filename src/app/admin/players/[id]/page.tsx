import { notFound } from "next/navigation";
import { db } from "@/lib/data";
import { formatSenCompact } from "@/lib/money";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PlanSwitcher, ActiveToggle, NotesEditor, ResendReceiptButton } from "@/components/admin/PlayerControls";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;

  const player = await db.getPlayerById(id);
  if (!player) notFound();

  const outstanding = await db.getOutstandingForPlayer(player.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-brand-muted text-xs tracking-wide uppercase">{player.memberCode}</p>
          <h1 className="font-display text-3xl">{player.name}</h1>
          <p className="text-brand-muted mt-1 text-sm">
            {player.programme} &middot; {player.ageGroup} &middot; Joined {player.joinedAt.toLocaleDateString("en-MY")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-brand-muted text-xs tracking-wide uppercase">Outstanding</p>
          <p className={`font-display text-3xl ${outstanding > 0 ? "text-brand-red" : "text-brand-success"}`}>
            {formatSenCompact(outstanding)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bg-brand-white border border-brand-ink/10 p-5">
          <h2 className="font-display mb-3 text-lg">Guardian</h2>
          <p className="text-sm font-semibold">{player.guardian.name}</p>
          <p className="text-brand-muted text-sm">{player.guardian.email}</p>
          <p className="text-brand-muted text-sm">{player.guardian.phone}</p>
        </section>

        <section className="bg-brand-white border border-brand-ink/10 p-5">
          <h2 className="font-display mb-3 text-lg">Plan &amp; Status</h2>
          <div className="flex flex-col gap-3">
            <PlanSwitcher playerId={player.id} currentPlan={player.plan} />
            <ActiveToggle playerId={player.id} active={player.active} />
            <p className="text-brand-muted text-xs">Monthly fee: {formatSenCompact(player.monthlyFee)}</p>
          </div>
        </section>

        <section className="bg-brand-white border border-brand-ink/10 p-5">
          <h2 className="font-display mb-3 text-lg">Notes</h2>
          <NotesEditor playerId={player.id} initialNotes={player.notes ?? ""} />
        </section>
      </div>

      <section className="bg-brand-white border border-brand-ink/10 p-5">
        <h2 className="font-display mb-4 text-lg">Invoices</h2>
        {player.invoices.length === 0 ? (
          <p className="text-brand-muted text-sm">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-brand-muted border-b border-brand-ink/10 text-left">
                <th className="py-2 font-normal">Type</th>
                <th className="py-2 font-normal">Period</th>
                <th className="py-2 font-normal">Due</th>
                <th className="py-2 font-normal">Paid</th>
                <th className="py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {player.invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-brand-ink/5">
                  <td className="py-2">{inv.type.replace("_", " ")}</td>
                  <td className="py-2">{inv.periodMonth}/{inv.periodYear}</td>
                  <td className="py-2">{formatSenCompact(inv.amountDue)}</td>
                  <td className="py-2">{formatSenCompact(inv.amountPaid)}</td>
                  <td className="py-2"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-brand-white border border-brand-ink/10 p-5">
        <h2 className="font-display mb-4 text-lg">Payment History</h2>
        {player.payments.length === 0 ? (
          <p className="text-brand-muted text-sm">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-brand-muted border-b border-brand-ink/10 text-left">
                <th className="py-2 font-normal">Date</th>
                <th className="py-2 font-normal">Type</th>
                <th className="py-2 font-normal">Amount</th>
                <th className="py-2 font-normal">Status</th>
                <th className="py-2 font-normal">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {player.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-brand-ink/5">
                  <td className="py-2">{(payment.paidAt ?? payment.createdAt).toLocaleDateString("en-MY")}</td>
                  <td className="py-2">{payment.type.replace("_", " ")}</td>
                  <td className="py-2">{formatSenCompact(payment.amount)}</td>
                  <td className="py-2"><StatusBadge status={payment.status} /></td>
                  <td className="py-2">
                    {payment.status === "PAID" && payment.receiptNo ? (
                      <div className="flex items-center gap-3">
                        <a href={`/api/receipts/${payment.id}`} className="text-brand-red-dark underline">
                          {payment.receiptNo}
                        </a>
                        <ResendReceiptButton paymentId={payment.id} />
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
