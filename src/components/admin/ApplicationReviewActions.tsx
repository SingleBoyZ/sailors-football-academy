"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AGE_GROUPS, type AgeGroup } from "@/content/schedule";
import { PLAN_LABELS } from "@/lib/plan";
import { approveApplication, rejectApplication } from "@/app/admin/applications/actions";
import type { Programme, PlanType } from "@prisma/client";

const PROGRAMMES: { value: Programme; label: string }[] = [
  { value: "FOUNDATION", label: "Foundation" },
  { value: "ADVANCE", label: "Advance" },
  { value: "PERFORMANCE", label: "Performance" },
];

type Props = {
  applicationId: string;
  suggestedAgeGroup: AgeGroup;
};

export function ApplicationReviewActions({ applicationId, suggestedAgeGroup }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "approve" | "reject">("none");
  const [programme, setProgramme] = useState<Programme>("FOUNDATION");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(suggestedAgeGroup);
  const [plan, setPlan] = useState<PlanType>("FULL");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    const result = await approveApplication({ applicationId, programme, ageGroup, plan });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleReject() {
    setSubmitting(true);
    setError(null);
    const result = await rejectApplication({ applicationId, reason });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (mode === "approve") {
    return (
      <div className="border-brand-success/30 bg-brand-success/5 flex flex-col gap-4 border p-5">
        <h3 className="font-display text-lg">Approve Application</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Programme</span>
            <select value={programme} onChange={(e) => setProgramme(e.target.value as Programme)} className="border border-brand-ink/15 px-3 py-2">
              {PROGRAMMES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Age Group</span>
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value as AgeGroup)} className="border border-brand-ink/15 px-3 py-2">
              {AGE_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Plan</span>
            <select value={plan} onChange={(e) => setPlan(e.target.value as PlanType)} className="border border-brand-ink/15 px-3 py-2">
              {Object.entries(PLAN_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="text-brand-red text-sm">{error}</p>}
        <div className="flex gap-3">
          <Button onClick={handleApprove} disabled={submitting}>
            {submitting ? "Approving…" : "Confirm Approval"}
          </Button>
          <button onClick={() => setMode("none")} className="text-brand-muted text-sm underline">Cancel</button>
        </div>
      </div>
    );
  }

  if (mode === "reject") {
    return (
      <div className="border-brand-red/30 bg-brand-red/5 flex flex-col gap-4 border p-5">
        <h3 className="font-display text-lg">Reject Application</h3>
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Reason (optional, included in the email to the guardian)</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="border border-brand-ink/15 px-3 py-2" />
        </label>
        {error && <p className="text-brand-red text-sm">{error}</p>}
        <div className="flex gap-3">
          <Button onClick={handleReject} disabled={submitting} variant="secondary">
            {submitting ? "Rejecting…" : "Confirm Rejection"}
          </Button>
          <button onClick={() => setMode("none")} className="text-brand-muted text-sm underline">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button onClick={() => setMode("approve")}>Approve</Button>
      <Button onClick={() => setMode("reject")} variant="secondary">Reject</Button>
    </div>
  );
}
