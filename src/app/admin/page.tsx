import { ClipboardList, Users, Wallet, AlertTriangle } from "lucide-react";
import { db, type DashboardStats } from "@/lib/data";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CollectionsChart } from "@/components/admin/CollectionsChart";
import { formatSenCompact } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let data: DashboardStats | null = null;
  let loadError = false;

  try {
    data = await db.getDashboardStats();
  } catch (error) {
    console.error("AdminDashboardPage: failed to load", error);
    loadError = true;
  }

  if (loadError || !data) {
    return (
      <div className="flex items-center gap-3 border border-brand-warning/30 bg-brand-warning/10 p-6">
        <AlertTriangle className="text-brand-warning h-5 w-5 shrink-0" />
        <p className="text-sm">
          Couldn&apos;t load dashboard data — the database may be unreachable. Check <code>DATABASE_URL</code>{" "}
          and try again.
        </p>
      </div>
    );
  }

  const { pendingApplications, activePlayers, thisMonthCollectedSen, outstandingTotalSen, recentPayments, chartData } =
    data;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Applications" value={String(pendingApplications)} icon={ClipboardList} />
        <StatCard label="Active Players" value={String(activePlayers)} icon={Users} />
        <StatCard label="Collected This Month" value={formatSenCompact(thisMonthCollectedSen)} icon={Wallet} accent="success" />
        <StatCard label="Outstanding Total" value={formatSenCompact(outstandingTotalSen)} icon={AlertTriangle} accent="warning" />
      </div>

      <div className="bg-brand-white border border-brand-ink/10 p-5">
        <h2 className="font-display mb-4 text-lg">Collections — Last 6 Months</h2>
        <CollectionsChart data={chartData} />
      </div>

      <div className="bg-brand-white border border-brand-ink/10 p-5">
        <h2 className="font-display mb-4 text-lg">Recent Payments</h2>
        {recentPayments.length === 0 ? (
          <p className="text-brand-muted text-sm">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-brand-muted border-b border-brand-ink/10 text-left">
                  <th className="py-2 font-normal">Date</th>
                  <th className="py-2 font-normal">For</th>
                  <th className="py-2 font-normal">Type</th>
                  <th className="py-2 font-normal">Amount</th>
                  <th className="py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-brand-ink/5">
                    <td className="py-2">{payment.createdAt.toLocaleDateString("en-MY")}</td>
                    <td className="py-2">{payment.player?.name ?? payment.order?.customerName ?? "—"}</td>
                    <td className="py-2">{payment.type.replace("_", " ")}</td>
                    <td className="py-2">{formatSenCompact(payment.amount)}</td>
                    <td className="py-2">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
