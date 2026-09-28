"use server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact";
import { notifyNewMessage } from "@/server/services/email";
import { clientIp, hit, isLimited } from "@/server/services/rate-limit";

export type ContactState =
  | { ok: true }
  | { ok: false; error: "validation" | "rateLimited" | "server"; fieldErrors?: Partial<Record<"name" | "email" | "message", string>> };

const LIMIT = 3;
const WINDOW_MS = 10 * 60 * 1000;

export async function sendContactMessage(input: unknown): Promise<ContactState> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<"name" | "email" | "message", string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "message") fieldErrors[field] = issue.message;
    }
    return { ok: false, error: "validation", fieldErrors };
  }

  const { company, ...data } = parsed.data;
  // Honeypot filled → pretend success so bots don't retry.
  if (company) return { ok: true };

  try {
    const ip = await clientIp();
    const key = `contact:${ip}`;
    if (await isLimited(key, LIMIT, WINDOW_MS)) return { ok: false, error: "rateLimited" };
    await hit(key);

    await db.message.create({
      data: { name: data.name, email: data.email, subject: data.subject || null, body: data.message, ip },
    });

    const settings = await db.siteSettings.findUnique({ where: { id: 1 }, select: { email: true } });
    await notifyNewMessage({ name: data.name, email: data.email, subject: data.subject, body: data.message }, settings?.email).catch((e) =>
      console.error("[contact] email notification failed", e),
    );

    return { ok: true };
  } catch (error) {
    console.error("[contact] failed to save message", error);
    return { ok: false, error: "server" };
  }
}
