"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createSuccessStory, updateSuccessStory } from "@/app/admin/success-stories/actions";
import type { SuccessStoryInput } from "@/lib/validations/success-story";

type Props = {
  storyId?: string;
  initial?: SuccessStoryInput;
};

export function SuccessStoryForm({ storyId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const input: SuccessStoryInput = {
      playerName: String(formData.get("playerName") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      ageGroup: String(formData.get("ageGroup") ?? ""),
      quote: String(formData.get("quote") ?? ""),
      body: String(formData.get("body") ?? ""),
      published: formData.get("published") === "on",
    };

    const result = storyId ? await updateSuccessStory(storyId, input) : await createSuccessStory(input);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!storyId && "data" in result && result.data) {
      router.push(`/admin/success-stories/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Player Name</span>
          <input name="playerName" defaultValue={initial?.playerName} required className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Slug</span>
          <input name="slug" defaultValue={initial?.slug} required disabled={!!storyId} className="border border-brand-ink/15 px-3 py-2.5 disabled:bg-brand-sand" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Age Group</span>
        <input name="ageGroup" defaultValue={initial?.ageGroup} required placeholder="e.g. U12, U16 Performance" className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Quote</span>
        <input name="quote" defaultValue={initial?.quote} required className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>Full Story</span>
        <textarea name="body" defaultValue={initial?.body} rows={6} required className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={initial?.published ?? false} className="accent-brand-red h-4 w-4" />
        Published (visible on the site)
      </label>
      {error && <p className="text-brand-red text-sm">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Saving…" : storyId ? "Save Changes" : "Create Story"}
      </Button>
    </form>
  );
}
