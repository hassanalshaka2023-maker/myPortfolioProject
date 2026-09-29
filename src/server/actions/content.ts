"use server";

import { db } from "@/lib/db";
import { emptyToNull, reorderSchema, toDate } from "@/lib/validations/common";
import { experienceSchema, serviceSchema, skillSchema } from "@/lib/validations/content";
import { requireAdmin } from "@/server/auth-guard";
import { revalidatePublic } from "@/server/revalidate";
import { fail, fieldErrors, ok, type ActionResult } from "./types";

// Skills, experience and services share the same shape of CRUD + reorder, so they live together.

async function nextOrder(model: "skill" | "experience" | "service") {
  const agg =
    model === "skill"
      ? await db.skill.aggregate({ _max: { order: true } })
      : model === "experience"
        ? await db.experience.aggregate({ _max: { order: true } })
        : await db.service.aggregate({ _max: { order: true } });
  return (agg._max.order ?? -1) + 1;
}

// ─── Skills ────────────────────────────────────────────────────────────

export async function saveSkill(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));
  const data = { ...parsed.data, icon: emptyToNull(parsed.data.icon) };
  const row = id
    ? await db.skill.update({ where: { id }, data })
    : await db.skill.create({ data: { ...data, order: await nextOrder("skill") } });
  revalidatePublic();
  return ok({ id: row.id });
}

export async function deleteSkill(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  await db.skill.delete({ where: { id } });
  revalidatePublic();
  return ok(null);
}

export async function reorderSkills(ids: string[]): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return fail("invalid");
  await db.$transaction(parsed.data.map((id, order) => db.skill.update({ where: { id }, data: { order } })));
  revalidatePublic();
  return ok(null);
}

// ─── Experience ────────────────────────────────────────────────────────

export async function saveExperience(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));
  const v = parsed.data;
  const data = {
    ...v,
    locationEn: emptyToNull(v.locationEn),
    locationAr: emptyToNull(v.locationAr),
    startDate: toDate(v.startDate)!,
    endDate: toDate(v.endDate),
  };
  const row = id
    ? await db.experience.update({ where: { id }, data })
    : await db.experience.create({ data: { ...data, order: await nextOrder("experience") } });
  revalidatePublic();
  return ok({ id: row.id });
}

export async function deleteExperience(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  await db.experience.delete({ where: { id } });
  revalidatePublic();
  return ok(null);
}

export async function reorderExperience(ids: string[]): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return fail("invalid");
  await db.$transaction(parsed.data.map((id, order) => db.experience.update({ where: { id }, data: { order } })));
  revalidatePublic();
  return ok(null);
}

// ─── Services ──────────────────────────────────────────────────────────

export async function saveService(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));
  const row = id
    ? await db.service.update({ where: { id }, data: parsed.data })
    : await db.service.create({ data: { ...parsed.data, order: await nextOrder("service") } });
  revalidatePublic();
  return ok({ id: row.id });
}

export async function deleteService(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  await db.service.delete({ where: { id } });
  revalidatePublic();
  return ok(null);
}

export async function reorderServices(ids: string[]): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return fail("invalid");
  await db.$transaction(parsed.data.map((id, order) => db.service.update({ where: { id }, data: { order } })));
  revalidatePublic();
  return ok(null);
}
