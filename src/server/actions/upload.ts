"use server";

import { z } from "zod";
import { requireAdmin } from "@/server/auth-guard";
import { ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, storage } from "@/server/services/storage";
import { fail, ok, type ActionResult } from "./types";

const schema = z.object({
  folder: z.enum(["projects", "avatar", "cv", "misc"]),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive(),
});

/** Returns a one-time signed URL the browser uploads to directly. */
export async function createUpload(input: z.infer<typeof schema>): Promise<ActionResult<{ uploadUrl: string; publicUrl: string }>> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("invalid");

  const { folder, filename, contentType, size } = parsed.data;
  const allowed = folder === "cv" ? [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES] : ALLOWED_IMAGE_TYPES;
  if (!allowed.includes(contentType)) return fail("unsupportedType");
  if (size > MAX_UPLOAD_BYTES) return fail("tooLarge");

  try {
    return ok(await storage().createSignedUpload(folder, filename, contentType));
  } catch (error) {
    console.error("[upload]", error);
    return fail("storage");
  }
}
