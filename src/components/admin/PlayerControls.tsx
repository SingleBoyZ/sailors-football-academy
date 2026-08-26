"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PLAN_LABELS } from "@/lib/plan";
import { updatePlayerPlan, updatePlayerNotes, togglePlayerActive, resendReceipt } from "@/app/admin/players/actions";
import type { PlanType } from "@prisma/client";

export function PlanSwitcher({ playerId, currentPlan }: { playerId: string; currentPlan: PlanType }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(plan: PlanType) {
    setSaving(true);
    await updatePlayerPlan(playerId, plan);
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={currentPlan}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as PlanType)}
      className="border border-brand-ink/15 px-3 py-2 text-sm"
    >
      {Object.entries(PLAN_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}

export function ActiveToggle({ playerId, active }: { playerId: string; active: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);
    await togglePlayerActive(playerId, !active);
    setSaving(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      className={`px-3 py-2 text-sm font-semibold ${active ? "bg-brand-success/10 text-brand-success" : "bg-brand-red/10 text-brand-red"}`}
    >
      {active ? "Active — click to deactivate" : "Inactive — click to reactivate"}
    </button>
  );
}

export function NotesEditor({ playerId, initialNotes }: { playerId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updatePlayerNotes(playerId, notes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="border border-brand-ink/15 px-3 py-2 text-sm"
        placeholder="Internal notes — medical, behavioural, anything staff should know."
      />
      <Button size="md" variant="secondary" onClick={handleSave} disabled={saving} className="w-fit">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Notes"}
      </Button>
    </div>
  );
}

export function ResendReceiptButton({ paymentId }: { paymentId: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleClick() {
    setSending(true);
    await resendReceipt(paymentId);
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  return (
    <button onClick={handleClick} disabled={sending} className="text-brand-red inline-flex items-center gap-1 text-xs underline">
      <Mail className="h-3 w-3" /> {sending ? "Sending…" : sent ? "Sent ✓" : "Email Receipt"}
    </button>
  );
}
