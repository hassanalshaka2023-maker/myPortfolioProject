"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth-guard";
import { fail, ok, type ActionResult } from "./types";

const ids = z.array(z.string().min(1)).min(1).max(200);

const refresh = () => revalidatePath("/[locale]/dashboard", "layout"); // unread badge lives in the layout

export async function setMessagesRead(messageIds: string[], read: boolean): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = ids.safeParse(messageIds);
  if (!parsed.success) return fail("invalid");
  await db.message.updateMany({ where: { id: { in: parsed.data } }, data: { read } });
  refresh();
  return ok(null);
}

export async function deleteMessages(messageIds: string[]): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = ids.safeParse(messageIds);
  if (!parsed.success) return fail("invalid");
  await db.message.deleteMany({ where: { id: { in: parsed.data } } });
  refresh();
  return ok(null);
}
