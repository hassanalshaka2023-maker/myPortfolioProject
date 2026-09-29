"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { changePasswordSchema, loginSchema } from "@/lib/validations/auth";
import { requireAdmin } from "@/server/auth-guard";
import { clientIp, hit, isLimited } from "@/server/services/rate-limit";
import { fail, fieldErrors, ok, type ActionResult } from "./types";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function login(input: unknown): Promise<ActionResult<null>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));

  const ipKey = `login:ip:${await clientIp()}`;
  const emailKey = `login:email:${parsed.data.email}`;
  if ((await isLimited(ipKey, MAX_ATTEMPTS, WINDOW_MS)) || (await isLimited(emailKey, MAX_ATTEMPTS, WINDOW_MS))) {
    return fail("rateLimited");
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return ok(null);
  } catch (error) {
    if (error instanceof AuthError) {
      await Promise.all([hit(ipKey), hit(emailKey)]);
      return fail("invalidCredentials");
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirect: false });
}

export async function changePassword(input: unknown): Promise<ActionResult<null>> {
  const user = await requireAdmin();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));

  const record = await db.user.findUnique({ where: { id: user.id } });
  if (!record || !(await bcrypt.compare(parsed.data.current, record.passwordHash))) {
    return fail("validation", { current: "wrongPassword" });
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) } });
  return ok(null);
}
