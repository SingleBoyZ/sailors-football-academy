import { getSupabaseAdmin } from "./supabase/admin";

const MEDIA_BUCKET = "media";

export type UploadResult = { url: string } | { error: string };

/** Uploads a single admin-supplied image (product photo, success story portrait) to the public "media" bucket. */
export async function uploadMediaFile(file: File, folder: string): Promise<UploadResult> {
  let client;
  try {
    client = getSupabaseAdmin();
  } catch {
    return { error: "Supabase Storage is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) return { error: error.message };

  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
