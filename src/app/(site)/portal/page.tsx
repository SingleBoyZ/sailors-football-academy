import { Download } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOutstandingForPlayer } from "@/lib/fees";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatSenCompact } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await auth();
  if (!session) return null; // middleware already guards this route

  const [players, pendingApplications] = await Promise.all([
    prisma.player.findMany({
      where: { guardianId: session.user.id },
      include: { payments: { orderBy: { createdAt: "desc" } } },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.application.findMany({
      where: { guardianEmail: session.user.email ?? "", status: "PENDING" },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const outstandingByPlayer = new Map<string, number>();
  for (const player of players) {
    outstandingByPlayer.set(player.id, await getOutstandingForPlayer(player.id));
  }

  return (
    <>
      <PageHeader eyebrow="Portal" title={`Welcome, ${session.user.name?.split(" ")[0] ?? "Sailor"}`} />
      <Container className="py-16 sm:py-24">
        {pendingApplications.length > 0 && (
          <div className="border-brand-warning/30 bg-brand-warning/10 mb-10 border p-5">
            {pendingApplications.map((app) => (
              <p key={app.id} className="text-sm">
                <strong>{app.playerName}</strong>&apos;s application is under review — we&apos;ll email you
                once it&apos;s approved.
              </p>
            ))}
          </div>
        )}

        {players.length === 0 && pendingApplications.length === 0 && (
          <div className="text-center">
            <p className="text-brand-muted mb-6">No players linked to this account yet.</p>
            <Button href="/enrol">Start an Enrolment</Button>
          </div>
        )}

        <div className="flex flex-col gap-12">
          {players.map((player) => {
            const outstanding = outstandingByPlayer.get(player.id) ?? 0;
            return (
              <section key={player.id} className="border border-brand-ink/10">
                <div className="bg-brand-sand flex flex-wrap items-center justify-between gap-4 p-6">
                  <div>
                    <p className="text-brand-muted text-xs tracking-wide uppercase">{player.memberCode}</p>
                    <h2 className="font-display text-2xl">{player.name}</h2>
                    <p className="text-brand-muted mt-1 text-sm">
                      {player.programme} &middot; {player.ageGroup}
                      {!player.active && <span className="text-brand-red"> &middot; Inactive</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-muted text-xs tracking-wide uppercase">Outstanding</p>
                    <p className={`font-display text-2xl ${outstanding > 0 ? "text-brand-red" : "text-brand-success"}`}>
                      {formatSenCompact(outstanding)}
                    </p>
                    {outstanding > 0 && (
                      <Button href={`/pay?query=${player.memberCode}`} size="md" className="mt-2">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-display mb-3 text-lg">Payment History</h3>
                  {player.payments.length === 0 ? (
                    <p className="text-brand-muted text-sm">No payments yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-100 text-sm">
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
                              <td className="py-2">
                                {(payment.paidAt ?? payment.createdAt).toLocaleDateString("en-MY")}
                              </td>
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
                                  <a
                                    href={`/api/receipts/${payment.id}`}
                                    className="text-brand-red inline-flex items-center gap-1 underline"
                                  >
                                    <Download className="h-3.5 w-3.5" /> {payment.receiptNo}
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
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}
