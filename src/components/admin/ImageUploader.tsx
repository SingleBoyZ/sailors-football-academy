"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { uploadProductImage, removeProductImage } from "@/app/admin/products/actions";

export function ImageUploader({ productId, images }: { productId: string; images: string[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductImage(productId, formData);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleRemove(url: string) {
    await removeProductImage(productId, url);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="group relative h-24 w-24 border border-brand-ink/10">
            <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            <button
              onClick={() => handleRemove(url)}
              className="bg-brand-ink/70 absolute top-1 right-1 hidden p-1 text-white group-hover:block"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="text-brand-muted flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-brand-ink/20 text-xs">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Add photo"}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-brand-red-dark mt-2 text-xs">{error}</p>}
    </div>
  );
}
