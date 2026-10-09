import { db } from "@/lib/data";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ageGroupFromDob } from "@/lib/age";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@prisma/client";
import { ApplicationsTable, type ApplicationRow } from "./ApplicationsTable";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value: ApplicationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const filter = (status as ApplicationStatus | undefined) ?? undefined;

  const applications = await db.getApplications(filter ? { status: filter } : undefined);

  const rows: ApplicationRow[] = applications.map((app) => ({
    id: app.id,
    playerName: app.playerName,
    ageGroup: ageGroupFromDob(app.dob),
    guardianName: app.guardianName,
    guardianEmail: app.guardianEmail,
    submittedAt: app.submittedAt,
    status: app.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Applications</h1>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <TransitionLink
            key={f.value}
            href={f.value === "ALL" ? "/admin/applications" : `/admin/applications?status=${f.value}`}
            className={cn(
              "border px-3 py-1.5 text-sm",
              (filter ?? "ALL") === f.value
                ? "border-brand-ink bg-brand-ink text-brand-white"
                : "border-brand-ink/15 text-brand-muted",
            )}
          >
            {f.label}
          </TransitionLink>
        ))}
      </div>

      <ApplicationsTable rows={rows} />
    </div>
  );
}
