import { createClient } from "@supabase/supabase-js";

const MEDIA_BUCKET = "media";

/** Service-role client for server-side admin uploads only — never expose this key to the browser. */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type UploadResult = { url: string } | { error: string };

/** Uploads a single admin-supplied image (product photo, success story portrait) to the public "media" bucket. */
export async function uploadMediaFile(file: File, folder: string): Promise<UploadResult> {
  const client = getServiceClient();
  if (!client) {
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
