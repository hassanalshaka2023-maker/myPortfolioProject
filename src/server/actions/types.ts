import type { z } from "zod";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Maps Zod issues to `{ field: messageKey }` (first issue per top-level field). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string, errors?: Record<string, string>): ActionResult<never> => ({ ok: false, error, fieldErrors: errors });
