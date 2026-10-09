// src/app/(site)/portal/page.tsx

import { Download, Users, Wallet, CalendarClock, AlertTriangle } from "lucide-react";
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
import type { PlayerWithPayments, Application } from "@/lib/data";

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

  let players: PlayerWithPayments[] = [];
  let pendingApplications: Application[] = [];
  let outstandingMap = new Map<string, number>();
  let dbError = false;

  try {
    [players, pendingApplications] = await Promise.all([
      db.getPlayersForUser(session.user.id),
      db.getPendingApplicationsForGuardianEmail(session.user.email ?? ""),
    ]);

    if (players.length > 0) {
      outstandingMap = await db.getOutstandingForPlayers(players.map((p) => p.id));
    }
  } catch (error) {
    console.error("PortalPage database error:", error);
    dbError = true;
  }

  const totalOutstanding = [...outstandingMap.values()].reduce((sum, v) => sum + v, 0);

  const lastPaymentDate = players
    .flatMap((p) => p.payments)
    .filter((pay) => pay.status === "PAID" && pay.paidAt)
    .map((pay) => pay.paidAt as Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const firstName = session.user.name?.trim().split(/\s+/)[0] || "Sailor";

  return (
    <>
      <PageHeader eyebrow="Portal" title={`Welcome aboard, ${firstName}`} />
      <Container className="py-16 sm:py-24">
        {dbError && (
          <div className="mb-8 flex items-center gap-3 border border-brand-warning/30 bg-brand-warning/10 p-4 text-sm text-brand-ink">
            <AlertTriangle className="h-5 w-5 shrink-0 text-brand-warning" />
            <p>
              We are currently unable to reach the database. Your account is logged in, but please verify your <code>DATABASE_URL</code> and Supabase database connection.
            </p>
          </div>
        )}

        {notice === "admin-denied" && (
          <div className="mb-8 border border-brand-warning/30 bg-brand-warning/10 p-4 text-sm">
            You don&apos;t have admin access — here&apos;s your parent portal instead.
          </div>
        )}

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden border border-brand-ink/10 p-5">
            <CrestMark animate={false} className="absolute -right-4 -bottom-4 h-24 w-24 text-brand-ink/10" />
            <div className="relative mb-2 flex items-center gap-2 text-xs tracking-wide uppercase text-brand-muted">
              <Users className="h-4 w-4" /> Players Enrolled
            </div>
            <p className="font-display relative text-2xl">{players.length}</p>
          </div>
          <div className="border border-brand-ink/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs tracking-wide uppercase text-brand-muted">
              <Wallet className="h-4 w-4" /> Total Outstanding
            </div>
            <p className={`font-display text-2xl ${totalOutstanding > 0 ? "text-brand-red" : ""}`}>
              {formatSenCompact(totalOutstanding)}
            </p>
          </div>
          <div className="border border-brand-ink/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs tracking-wide uppercase text-brand-muted">
              <CalendarClock className="h-4 w-4" /> Last Payment
            </div>
            <p className="font-display text-2xl">{lastPaymentDate ? lastPaymentDate.toLocaleDateString("en-MY") : "—"}</p>
          </div>
        </div>

        {pendingApplications.length > 0 && (
          <div className="mb-10 border border-brand-warning/30 bg-brand-warning/10 p-5">
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
            <p className="mb-6 text-brand-muted">No players linked to this account yet.</p>
            <Button href="/enrol">Start an Enrolment</Button>
          </div>
        )}

        {players.length > 0 && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl">My Players</h2>
            <TransitionLink href="/portal/profile" className="text-sm text-brand-red-dark underline">
              Edit my profile
            </TransitionLink>
          </div>
        )}

        <div className="flex flex-col gap-10">
          {players.map((player) => (
            <section key={player.id} className="border border-brand-ink/10">
              <div className="flex flex-wrap items-start justify-between gap-4 bg-brand-sand p-6">
                <div>
                  <p className="text-xs tracking-wide uppercase text-brand-muted">{player.memberCode}</p>
                  <TransitionLink href={`/portal/players/${player.memberCode}`} className="font-display block text-2xl hover:underline">
                    {player.name}
                  </TransitionLink>
                  <p className="mt-1 text-sm text-brand-muted">
                    {player.ageGroup} &middot; {player.programme}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="bg-brand-ink px-2 py-0.5 text-xs tracking-wide uppercase text-brand-white">
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
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}