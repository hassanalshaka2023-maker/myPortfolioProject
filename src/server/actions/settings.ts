"use server";

import { db } from "@/lib/db";
import { emptyToNull } from "@/lib/validations/common";
import { settingsSchema } from "@/lib/validations/settings";
import { requireAdmin } from "@/server/auth-guard";
import { revalidatePublic } from "@/server/revalidate";
import { removeUnreferenced } from "@/server/services/storage";
import { fail, fieldErrors, ok, type ActionResult } from "./types";

const NULLABLE = [
  "email",
  "phone",
  "locationEn",
  "locationAr",
  "avatarUrl",
  "cvUrl",
  "githubUrl",
  "linkedinUrl",
  "xUrl",
  "telegramUrl",
  "whatsappUrl",
] as const;

export async function updateSettings(input: unknown): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));

  const data = { ...parsed.data } as Record<string, unknown>;
  for (const key of NULLABLE) data[key] = emptyToNull(parsed.data[key]);

  const before = await db.siteSettings.findUnique({ where: { id: 1 }, select: { avatarUrl: true, cvUrl: true } });
  await db.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...(data as typeof parsed.data) } });
  await removeUnreferenced([before?.avatarUrl, before?.cvUrl], [data.avatarUrl as string | null, data.cvUrl as string | null]);
  revalidatePublic();
  return ok(null);
}
