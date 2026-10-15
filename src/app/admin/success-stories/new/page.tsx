import { SuccessStoryForm } from "@/components/admin/SuccessStoryForm";

export default function NewSuccessStoryPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl">New Success Story</h1>
      <div className="bg-brand-white border border-brand-ink/10 p-6">
        <SuccessStoryForm />
      </div>
      <p className="text-brand-muted text-sm">Save first, then upload a photo on the story&apos;s detail page.</p>
    </div>
  );
}
