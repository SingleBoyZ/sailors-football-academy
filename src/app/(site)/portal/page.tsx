import { Download, Users, Wallet, CalendarClock } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/data";
import { formatSenCompact } from "@/lib/money";
import { PLAN_LABELS } from "@/lib/plan";
import { TRAINING_SCHEDULE } from "@/content/schedule";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { CrestMark } from "@/components/motion/CrestMark";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ notice?: string }> };

function upcomingSessionsFor(ageGroup: string) {
  return TRAINING_SCHEDULE.flatMap((block) =>
    block.rows
      .filter((row) => row.ageGroups.split(",").map((s) => s.trim()).includes(ageGroup))
      .map((row) => ({ heading: block.heading, ...row })),
  );
}

export default async function PortalPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) return null; // middleware already guards this route
  const { notice } = await searchParams;

  const [players, pendingApplications] = await Promise.all([
    db.getPlayersForUser(session.user.id),
    db.getPendingApplicationsForGuardianEmail(session.user.email ?? ""),
  ]);

  const outstandingMap = await db.getOutstandingForPlayers(players.map((p) => p.id));
  const totalOutstanding = [...outstandingMap.values()].reduce((sum, v) => sum + v, 0);

  const lastPaymentDate = players
    .flatMap((p) => p.payments)
    .filter((pay) => pay.status === "PAID" && pay.paidAt)
    .map((pay) => pay.paidAt as Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const firstName = session.user.name?.split(" ")[0] ?? "Sailor";

  return (
    <>
      <PageHeader eyebrow="Portal" title={`Welcome aboard, ${firstName}`} />
      <Container className="py-16 sm:py-24">
        {notice === "admin-denied" && (
          <div className="border-brand-warning/30 bg-brand-warning/10 mb-8 border p-4 text-sm">
            You don&apos;t have admin access — here&apos;s your parent portal instead.
          </div>
        )}

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-brand-ink/10 relative overflow-hidden border p-5">
            <CrestMark animate={false} className="text-brand-ink/10 absolute -right-4 -bottom-4 h-24 w-24" />
            <div className="text-brand-muted relative mb-2 flex items-center gap-2 text-xs tracking-wide uppercase">
              <Users className="h-4 w-4" /> Players Enrolled
            </div>
            <p className="font-display relative text-2xl">{players.length}</p>
          </div>
          <div className="border-brand-ink/10 border p-5">
            <div className="text-brand-muted mb-2 flex items-center gap-2 text-xs tracking-wide uppercase">
              <Wallet className="h-4 w-4" /> Total Outstanding
            </div>
            <p className={`font-display text-2xl ${totalOutstanding > 0 ? "text-brand-red" : ""}`}>
              {formatSenCompact(totalOutstanding)}
            </p>
          </div>
          <div className="border-brand-ink/10 border p-5">
            <div className="text-brand-muted mb-2 flex items-center gap-2 text-xs tracking-wide uppercase">
              <CalendarClock className="h-4 w-4" /> Last Payment
            </div>
            <p className="font-display text-2xl">{lastPaymentDate ? lastPaymentDate.toLocaleDateString("en-MY") : "—"}</p>
          </div>
        </div>

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

        {players.length === 0 && (
          <div className="border-brand-ink/10 bg-brand-sand mb-10 border p-6 sm:p-8">
            <h2 className="font-display text-2xl sm:text-3xl">Welcome to Sailors FA!</h2>
            {pendingApplications.length === 0 ? (
              <>
                <p className="text-brand-muted mt-3 max-w-xl text-sm leading-relaxed">
                  If you haven&apos;t enrolled your child yet, it only takes a few minutes. Your player, fees and
                  schedule will appear here once they&apos;re approved.
                </p>
                <Button href="/enrol" className="mt-5">
                  Start Enrolment Form &rarr;
                </Button>
              </>
            ) : (
              <p className="text-brand-muted mt-3 max-w-xl text-sm leading-relaxed">
                Thanks for applying! Our staff are reviewing your application. You&apos;ll receive an email as soon
                as it&apos;s approved, and your player will show up here.
              </p>
            )}
            {pendingApplications.length > 0 && (
              <p className="text-brand-muted mt-4 text-sm">
                Enrolling a sibling too?{" "}
                <TransitionLink href="/enrol" className="text-brand-red-dark underline">
                  Start another enrolment
                </TransitionLink>
              </p>
            )}
          </div>
        )}

        {players.length > 0 && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl">My Players</h2>
            <TransitionLink href="/portal/profile" className="text-brand-red-dark text-sm underline">
              Edit my profile
            </TransitionLink>
          </div>
        )}

        <div className="flex flex-col gap-10">
          {players.map((player) => {
            const outstanding = outstandingMap.get(player.id) ?? 0;
            const upcoming = upcomingSessionsFor(player.ageGroup);

            return (
              <section key={player.id} className="border border-brand-ink/10">
                <div className="bg-brand-sand flex flex-wrap items-start justify-between gap-4 p-6">
                  <div>
                    <p className="text-brand-muted text-xs tracking-wide uppercase">{player.memberCode}</p>
                    <TransitionLink href={`/portal/players/${player.memberCode}`} className="font-display block text-2xl hover:underline">
                      {player.name}
                    </TransitionLink>
                    <p className="text-brand-muted mt-1 text-sm">
                      {player.ageGroup} &middot; {player.programme}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="bg-brand-ink text-brand-white px-2 py-0.5 text-xs tracking-wide uppercase">
                        {PLAN_LABELS[player.plan]}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs tracking-wide uppercase ${
                          player.active ? "bg-brand-success/15 text-brand-success-dark" : "bg-brand-red/15 text-brand-red-dark"
                        }`}
                      >
                        {player.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-muted text-xs tracking-wide uppercase">Monthly Fee</p>
                    <p className="font-display text-lg">{formatSenCompact(player.monthlyFee)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-ink/10 p-6">
                  <div>
                    <p className="text-brand-muted text-xs tracking-wide uppercase">Outstanding Balance</p>
                    <p className={`font-display text-2xl ${outstanding > 0 ? "text-brand-red" : "text-brand-success"}`}>
                      {formatSenCompact(outstanding)}
                    </p>
                  </div>
                  {outstanding > 0 && (
                    <Button href={`/pay?query=${player.memberCode}`} size="md">
                      Pay Now
                    </Button>
                  )}
                </div>

                <div className="border-b border-brand-ink/10 p-6">
                  <h3 className="font-display mb-3 text-lg">Payment History</h3>
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
                          {player.payments.slice(0, 6).map((payment) => (
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
                                  <a
                                    href={`/api/receipts/${payment.id}`}
                                    className="text-brand-red inline-flex items-center gap-1 underline"
                                  >
                                    <Download className="h-3.5 w-3.5" /> Receipt
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
                  {player.payments.length > 0 && (
                    <TransitionLink href={`/portal/players/${player.memberCode}`} className="text-brand-red-dark mt-3 inline-block text-sm underline">
                      View full history &rarr;
                    </TransitionLink>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-display mb-3 text-lg">Upcoming Schedule — {player.ageGroup}</h3>
                  {upcoming.length === 0 ? (
                    <p className="text-brand-muted text-sm">No sessions scheduled for this age group yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5 text-sm">
                      {upcoming.map((row, i) => (
                        <li key={`${row.heading}-${i}`} className="flex flex-wrap justify-between gap-2 border-b border-brand-ink/5 py-1.5">
                          <span>{row.days}</span>
                          <span className="text-brand-muted">{row.time}</span>
                        </li>
                      ))}
                    </ul>
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
