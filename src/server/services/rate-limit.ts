import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/**
 * Sliding-window rate limiter backed by Postgres (works across serverless instances without Redis).
 * Each call to `hit()` records one attempt for `key`; `isLimited()` checks the count inside the window.
 * Rows are stored in the LoginAttempt table, which doubles as a generic attempts log.
 */
export async function isLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  const count = await db.loginAttempt.count({ where: { key, createdAt: { gte: since } } });
  return count >= limit;
}

export async function hit(key: string): Promise<void> {
  await db.loginAttempt.create({ data: { key } });
  // Opportunistic cleanup of anything older than a day (~1% of calls).
  if (Math.random() < 0.01) {
    await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } } });
  }
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
