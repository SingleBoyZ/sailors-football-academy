"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { parseRinggitToSen, senToRinggit } from "@/lib/money";
import { updateSettings } from "@/app/admin/settings/actions";

type Props = {
  initial: { sponsoredMonthlyFeeSen: number; shippingSen: number; whatsappNumber: string; bannerText: string };
};

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const sponsoredFeeSen = parseRinggitToSen(String(formData.get("sponsoredFee") ?? ""));
    const shippingSen = parseRinggitToSen(String(formData.get("shipping") ?? ""));

    if (sponsoredFeeSen === null || shippingSen === null) {
      setError("Enter valid amounts.");
      setSubmitting(false);
      return;
    }

    const result = await updateSettings({
      sponsoredMonthlyFeeSen: sponsoredFeeSen,
      shippingSen,
      whatsappNumber: String(formData.get("whatsapp") ?? ""),
      bannerText: String(formData.get("banner") ?? ""),
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Sponsored Monthly Fee (RM)</span>
          <input name="sponsoredFee" defaultValue={senToRinggit(initial.sponsoredMonthlyFeeSen).toFixed(2)} className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Store Shipping Fee (RM)</span>
          <input name="shipping" defaultValue={senToRinggit(initial.shippingSen).toFixed(2)} className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>WhatsApp Number (with country code, no symbols — e.g. 60175681830)</span>
        <input name="whatsapp" defaultValue={initial.whatsappNumber} className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Home Page Banner Text</span>
        <input name="banner" defaultValue={initial.bannerText} maxLength={200} className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      {error && <p className="text-brand-red-dark text-sm">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
      </Button>
    </form>
  );
}
