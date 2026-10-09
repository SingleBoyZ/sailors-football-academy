"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "./actions";

type Props = { initial: { name: string; phone: string; address: string }; email: string };

export function ProfileForm({ initial, email }: Props) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateProfile({ name, phone, address });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Email</span>
        <input value={email} disabled className="border-brand-ink/15 bg-brand-sand text-brand-muted border px-3 py-2.5" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Full Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Phone</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="012-3456789"
          className="border border-brand-ink/15 px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Address</span>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      {error && <p className="text-brand-red-dark text-sm">{error}</p>}
      <Button type="submit" size="lg" disabled={saving} className="mt-2">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
      </Button>
    </form>
  );
}
