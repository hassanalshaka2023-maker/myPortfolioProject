import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends the "new contact message" notification. No-op (returns false) when Resend isn't configured —
 * the message is already stored in the database either way.
 */
export async function notifyNewMessage(msg: { name: string; email: string; subject?: string | null; body: string }, fallbackTo?: string | null) {
  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, NEXT_PUBLIC_SITE_URL } = env();
  const to = CONTACT_TO_EMAIL || fallbackTo;
  if (!RESEND_API_KEY || !to) return false;

  const resend = new Resend(RESEND_API_KEY);
  const subject = `New message from ${msg.name}${msg.subject ? ` — ${msg.subject}` : ""}`;
  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
    to,
    replyTo: msg.email,
    subject,
    text: `${msg.name} <${msg.email}>\n\n${msg.body}\n\n— ${NEXT_PUBLIC_SITE_URL}/dashboard/messages`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;color:#18181b">
        <p style="margin:0 0 4px;font-size:13px;color:#71717a">New message via your portfolio</p>
        <h2 style="margin:0 0 16px;font-size:20px">${escape(msg.subject || "No subject")}</h2>
        <p style="margin:0 0 16px"><strong>${escape(msg.name)}</strong> &lt;${escape(msg.email)}&gt;</p>
        <div style="white-space:pre-wrap;line-height:1.6;padding:16px;border-radius:12px;background:#f4f4f5" dir="auto">${escape(msg.body)}</div>
        <p style="margin:24px 0 0;font-size:13px"><a href="${NEXT_PUBLIC_SITE_URL}/dashboard/messages" style="color:#b45309">Open inbox →</a></p>
      </div>`,
  });
  if (error) {
    console.error("[email] notifyNewMessage failed:", error.message);
    return false;
  }
  return true;
}
