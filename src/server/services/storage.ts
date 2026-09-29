import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Storage abstraction. The app only talks to `storage` — to move to Cloudinary / S3 / UploadThing,
 * add another `StorageProvider` implementation and switch it in `createStorage()`.
 */
export interface UploadResult {
  url: string;
  key: string;
}

export interface SignedUpload {
  /** PUT the raw file body here from the browser */
  uploadUrl: string;
  /** Public URL the file will be served from once uploaded */
  publicUrl: string;
}

export interface StorageProvider {
  upload(file: File, folder: string): Promise<UploadResult>;
  /** Browser → storage direct upload (avoids serverless request-size limits). */
  createSignedUpload(folder: string, filename: string, contentType: string): Promise<SignedUpload>;
  remove(urlOrKey: string): Promise<void>;
  /** True when the URL points at a file this provider manages. */
  owns(url: string): boolean;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function extensionOf(file: { name: string; type: string }) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  return file.type.split("/")[1]?.replace("svg+xml", "svg") ?? "bin";
}

const newKey = (folder: string, file: { name: string; type: string }) =>
  `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extensionOf(file)}`;

class SupabaseStorage implements StorageProvider {
  constructor(
    private client: SupabaseClient,
    private bucket: string,
    private publicBase: string,
  ) {}

  async upload(file: File, folder: string): Promise<UploadResult> {
    const key = newKey(folder, file);
    const { error } = await this.client.storage.from(this.bucket).upload(key, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return { key, url: `${this.publicBase}/${key}` };
  }

  async createSignedUpload(folder: string, filename: string, contentType: string): Promise<SignedUpload> {
    const key = newKey(folder, { name: filename, type: contentType });
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUploadUrl(key);
    if (error || !data) throw new Error(`Could not create upload URL: ${error?.message}`);
    return { uploadUrl: data.signedUrl, publicUrl: `${this.publicBase}/${key}` };
  }

  owns(url: string) {
    return url.startsWith(`${this.publicBase}/`);
  }

  async remove(urlOrKey: string): Promise<void> {
    // Only delete files that live in our bucket; external URLs are left alone.
    const key = urlOrKey.startsWith(this.publicBase) ? urlOrKey.slice(this.publicBase.length + 1) : urlOrKey;
    if (/^https?:\/\//.test(key)) return;
    const { error } = await this.client.storage.from(this.bucket).remove([key]);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  }
}

let instance: StorageProvider | undefined;

function createStorage(): StorageProvider {
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, SUPABASE_STORAGE_BUCKET: bucket } = env();
  if (!url || !key) throw new Error("Storage is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const client = createClient(url, key, { auth: { persistSession: false } });
  return new SupabaseStorage(client, bucket, `${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}`);
}

export function storage(): StorageProvider {
  instance ??= createStorage();
  return instance;
}

/** Best-effort delete of files that were referenced before but not anymore. Never throws. */
export async function removeUnreferenced(before: (string | null | undefined)[], after: (string | null | undefined)[]) {
  const keep = new Set(after.filter(Boolean));
  const stale = before.filter((u): u is string => !!u && !keep.has(u));
  if (stale.length === 0) return;
  try {
    const s = storage();
    await Promise.all(stale.filter((u) => s.owns(u)).map((u) => s.remove(u).catch(() => {})));
  } catch {
    // storage not configured — nothing to clean up
  }
}

export function validateUpload(file: File, allowed: string[] = ALLOWED_IMAGE_TYPES): string | null {
  if (!allowed.includes(file.type)) return "Unsupported file type";
  if (file.size > MAX_UPLOAD_BYTES) return "File is larger than 8 MB";
  return null;
}
