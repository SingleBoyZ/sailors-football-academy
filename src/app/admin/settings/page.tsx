import { getSetting } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { FEES } from "@/content/schedule";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [sponsoredMonthlyFeeSen, shippingSen, whatsappNumber, bannerText] = await Promise.all([
    getSetting("sponsoredMonthlyFeeSen", FEES.sponsoredSen),
    getSetting("shippingSen", 800),
    getSetting("whatsappNumber", "60175681830"),
    getSetting("bannerText", ""),
  ]);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl">Settings</h1>
      <div className="bg-brand-white border border-brand-ink/10 p-6">
        <SettingsForm initial={{ sponsoredMonthlyFeeSen, shippingSen, whatsappNumber, bannerText }} />
      </div>
      <p className="text-brand-muted text-sm">
        The core published fee schedule (registration, monthly, sibling rates) lives in{" "}
        <code>src/content/schedule.ts</code> since it doubles as marketing copy across the public site —
        edit it there if those change. The sponsored rate is the one fee meant to flex per-season, so it
        lives here instead.
      </p>
    </div>
  );
}
