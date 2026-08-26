"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload } from "lucide-react";
import { uploadStoryImage } from "@/app/admin/success-stories/actions";

export function StoryImageUploader({ storyId, image }: { storyId: string; image: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadStoryImage(storyId, formData);
    setUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 overflow-hidden border border-brand-ink/10">
        <Image src={image} alt="" fill className="object-cover" sizes="96px" />
      </div>
      <label className="text-brand-muted flex cursor-pointer items-center gap-2 border border-dashed border-brand-ink/20 px-3 py-2 text-xs">
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading…" : "Replace photo"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>
      {error && <p className="text-brand-red text-xs">{error}</p>}
    </div>
  );
}
