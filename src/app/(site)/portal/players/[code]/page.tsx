import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/data";
import { formatSenCompact } from "@/lib/money";
import { PLAN_LABELS } from "@/lib/plan";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ code: string }> };

function statusLabel(status: string): string {
  if (status === "OPEN") return "Open";
  if (status === "PARTIAL") return "Partial";
  return "Settled";
}

export default async function PortalPlayerDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session) return null; // middleware already guards this route

  const { code } = await params;

  let player: Awaited<ReturnType<typeof db.getPlayerByCode>> = null;
  let dataLoadError = false;

  try {
    player = await db.getPlayerByCode(code);
  } catch (error) {
    console.error("PortalPlayerDetailPage: failed to load player", error);
    dataLoadError = true;
  }

  if (dataLoadError) {
    return (
      <>
        <PageHeader eyebrow="Portal" title="Player Details" />
        <Container className="py-16 sm:py-24">
          <div className="rounded border border-brand-warning/30 bg-brand-warning/10 p-6 text-sm">
            We couldn&apos;t load this player right now. Please refresh the page or try again in a few minutes.
          </div>
        </Container>
      </>
    );
  }

  if (!player) notFound();

  const isOwner = player.guardianId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) notFound();

  const outstanding = await db.getOutstandingForPlayer(player.id);

  return (
    <>
      <PageHeader eyebrow={player.memberCode} title={player.name} />
      <Container className="py-16 sm:py-24">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="bg-brand-ink text-brand-white px-3 py-1 text-xs tracking-wide uppercase">{PLAN_LABELS[player.plan]}</span>
            <span className="border border-brand-ink/15 px-3 py-1 text-xs tracking-wide uppercase">{player.programme}</span>
            <span className="border border-brand-ink/15 px-3 py-1 text-xs tracking-wide uppercase">{player.ageGroup}</span>
            <span
              className={`px-3 py-1 text-xs tracking-wide uppercase ${
                player.active ? "bg-brand-success/15 text-brand-success-dark" : "bg-brand-red/15 text-brand-red-dark"
              }`}
            >
              {player.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-brand-muted text-xs tracking-wide uppercase">Outstanding</p>
            <p className={`font-display text-3xl ${outstanding > 0 ? "text-brand-red" : "text-brand-success"}`}>
              {formatSenCompact(outstanding)}
            </p>
            {outstanding > 0 && (
              <Button href={`/pay?query=${player.memberCode}`} size="md" className="mt-2">
                Pay Now
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="border-brand-ink/10 border p-5">
            <h2 className="font-display mb-3 text-lg">Player</h2>
            <p className="text-sm font-semibold">{player.name}</p>
            <p className="text-brand-muted text-sm">Born {player.dob.toLocaleDateString("en-MY")}</p>
            <p className="text-brand-muted text-sm">Joined {player.joinedAt.toLocaleDateString("en-MY")}</p>
          </section>
          <section className="border-brand-ink/10 border p-5">
            <h2 className="font-display mb-3 text-lg">Guardian</h2>
            <p className="text-sm font-semibold">{player.guardian.name}</p>
            <p className="text-brand-muted text-sm">{player.guardian.email}</p>
            <p className="text-brand-muted text-sm">{player.guardian.phone}</p>
          </section>
          <section className="border-brand-ink/10 border p-5">
            <h2 className="font-display mb-3 text-lg">Fee</h2>
            <p className="text-sm">Monthly: {formatSenCompact(player.monthlyFee)}</p>
            {player.notes && <p className="text-brand-muted mt-2 text-sm">{player.notes}</p>}
          </section>
        </div>

        <section className="mt-10">
          <h2 className="font-display mb-4 text-xl">Invoices</h2>
          {player.invoices.length === 0 ? (
            <p className="text-brand-muted text-sm">No invoices yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {player.invoices.map((inv) => {
                const progress = inv.amountDue > 0 ? Math.min(100, Math.round((inv.amountPaid / inv.amountDue) * 100)) : 100;
                return (
                  <div key={inv.id} className="border-brand-ink/10 border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-semibold">
                        {inv.type.replace("_", " ")} — {inv.periodMonth}/{inv.periodYear}
                      </span>
                      <span
                        className={
                          inv.status === "SETTLED"
                            ? "text-brand-success-dark"
                            : inv.status === "PARTIAL"
                              ? "text-brand-warning-dark"
                              : "text-brand-red-dark"
                        }
                      >
                        {statusLabel(inv.status)}
                      </span>
                    </div>
                    <div className="bg-brand-sand mt-3 h-2 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${inv.status === "SETTLED" ? "bg-brand-success" : "bg-brand-red"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-brand-muted mt-2 flex justify-between text-xs">
                      <span>{formatSenCompact(inv.amountPaid)} paid</span>
                      <span>{formatSenCompact(inv.amountDue)} due</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-display mb-4 text-xl">Payment History &amp; Receipts</h2>
          {player.payments.length === 0 ? (
            <p className="text-brand-muted text-sm">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-125 text-sm">
                <thead>
                  <tr className="text-brand-muted border-b border-brand-ink/10 text-left">
                    <th className="py-2 font-normal">Date</th>
                    <th className="py-2 font-normal">Receipt No.</th>
                    <th className="py-2 font-normal">Type</th>
                    <th className="py-2 font-normal">Amount</th>
                    <th className="py-2 font-normal">Status</th>
                    <th className="py-2 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {player.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-brand-ink/5">
                      <td className="py-2">{(payment.paidAt ?? payment.createdAt).toLocaleDateString("en-MY")}</td>
                      <td className="py-2">{payment.receiptNo ?? "—"}</td>
                      <td className="py-2">{payment.type.replace("_", " ")}</td>
                      <td className="py-2">{formatSenCompact(payment.amount)}</td>
                      <td className="py-2">
                        <span
                          className={
                            payment.status === "PAID"
                              ? "text-brand-success-dark"
                              : payment.status === "FAILED"
                                ? "text-brand-red"
                                : "text-brand-warning-dark"
                          }
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {payment.status === "PAID" && payment.receiptNo ? (
                          <a href={`/api/receipts/${payment.id}`} className="text-brand-red inline-flex items-center gap-1 underline">
                            <Download className="h-3.5 w-3.5" /> Download
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Container>
    </>
  );
}
