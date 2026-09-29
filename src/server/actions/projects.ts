"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { emptyToNull, reorderSchema, toDate } from "@/lib/validations/common";
import { PROJECT_STATUSES, projectSchema, type ProjectInput } from "@/lib/validations/project";
import { requireAdmin } from "@/server/auth-guard";
import { revalidatePublic } from "@/server/revalidate";
import { removeUnreferenced } from "@/server/services/storage";
import { fail, fieldErrors, ok, type ActionResult } from "./types";

function toData(v: ProjectInput) {
  return {
    titleEn: v.titleEn,
    titleAr: v.titleAr,
    summaryEn: v.summaryEn,
    summaryAr: v.summaryAr,
    contentEn: v.contentEn,
    contentAr: v.contentAr,
    roleEn: emptyToNull(v.roleEn),
    roleAr: emptyToNull(v.roleAr),
    problemEn: emptyToNull(v.problemEn),
    problemAr: emptyToNull(v.problemAr),
    solutionEn: emptyToNull(v.solutionEn),
    solutionAr: emptyToNull(v.solutionAr),
    resultEn: emptyToNull(v.resultEn),
    resultAr: emptyToNull(v.resultAr),
    coverImage: emptyToNull(v.coverImage),
    gallery: v.gallery,
    techStack: [...new Set(v.techStack.map((t) => t.trim()).filter(Boolean))],
    category: v.category,
    status: v.status,
    startDate: toDate(v.startDate),
    endDate: toDate(v.endDate),
    liveUrl: emptyToNull(v.liveUrl),
    githubUrl: emptyToNull(v.githubUrl),
    clientName: emptyToNull(v.clientName),
    featured: v.featured,
    published: v.published,
  };
}

/** Explicit slug, else from the English title; suffixed -2, -3… when taken. */
async function uniqueSlug(input: ProjectInput, excludeId?: string) {
  const base = input.slug || slugify(input.titleEn).replace(/[^a-z0-9-]/g, "") || "project";
  let slug = base;
  for (let n = 2; ; n++) {
    const taken = await db.project.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } });
    if (!taken) return slug;
    if (input.slug) return null; // an explicit slug that is taken is a user error
    slug = `${base}-${n}`;
  }
}

export async function createProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));

  const slug = await uniqueSlug(parsed.data);
  if (!slug) return fail("validation", { slug: "slugTaken" });

  const last = await db.project.aggregate({ _max: { order: true } });
  const project = await db.project.create({ data: { ...toData(parsed.data), slug, order: (last._max.order ?? -1) + 1 } });
  revalidatePublic();
  return ok({ id: project.id });
}

export async function updateProject(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return fail("validation", fieldErrors(parsed.error));

  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return fail("notFound");

  const slug = await uniqueSlug(parsed.data, id);
  if (!slug) return fail("validation", { slug: "slugTaken" });

  const data = toData(parsed.data);
  await db.project.update({ where: { id }, data: { ...data, slug } });
  await removeUnreferenced([existing.coverImage, ...existing.gallery], [data.coverImage, ...data.gallery]);
  revalidatePublic();
  return ok({ id });
}

export async function deleteProject(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return fail("notFound");
  await db.project.delete({ where: { id } });
  await removeUnreferenced([existing.coverImage, ...existing.gallery], []);
  revalidatePublic();
  return ok(null);
}

export async function duplicateProject(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const p = await db.project.findUnique({ where: { id } });
  if (!p) return fail("notFound");
  const { id: _id, createdAt: _c, updatedAt: _u, slug, ...rest } = p;
  let copySlug = `${slug}-copy`;
  for (let n = 2; await db.project.findUnique({ where: { slug: copySlug }, select: { id: true } }); n++) copySlug = `${slug}-copy-${n}`;
  const copy = await db.project.create({
    // Images are shared with the original, so the copy starts without them to keep storage cleanup safe.
    data: { ...rest, slug: copySlug, titleEn: `${p.titleEn} (copy)`, titleAr: `${p.titleAr} (نسخة)`, coverImage: null, gallery: [], published: false, order: p.order + 1 },
  });
  revalidatePublic();
  return ok({ id: copy.id });
}

const patchSchema = z.object({ featured: z.boolean().optional(), published: z.boolean().optional(), status: z.enum(PROJECT_STATUSES).optional() });

export async function patchProject(id: string, patch: z.infer<typeof patchSchema>): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = patchSchema.safeParse(patch);
  if (!parsed.success) return fail("invalid");
  await db.project.update({ where: { id }, data: parsed.data });
  revalidatePublic();
  return ok(null);
}

export async function reorderProjects(ids: string[]): Promise<ActionResult<null>> {
  await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return fail("invalid");
  await db.$transaction(parsed.data.map((id, order) => db.project.update({ where: { id }, data: { order } })));
  revalidatePublic();
  return ok(null);
}
