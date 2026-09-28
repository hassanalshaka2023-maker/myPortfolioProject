import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Experience, Project, Service, SiteSettings, Skill } from "@/generated/prisma/client";

/**
 * Read-side data access for the public site.
 * Results are cached under one tag; dashboard mutations call `revalidatePublic()` (server/revalidate.ts).
 * unstable_cache serializes to JSON, so dates are converted to ISO strings up front to keep the types honest.
 */
export const PUBLIC_TAG = "portfolio";

type Serialized<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K] };

export type PublicSettings = Serialized<SiteSettings>;
export type PublicProject = Serialized<Project>;
export type PublicSkill = Serialized<Skill>;
export type PublicExperience = Serialized<Experience>;
export type PublicService = Serialized<Service>;

function serialize<T extends object>(row: T): Serialized<T> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v]),
  ) as Serialized<T>;
}

const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) =>
  cache(unstable_cache(fn, [key], { tags: [PUBLIC_TAG], revalidate: 3600 }));

export const getSettings = cached(async () => {
  const row = await db.siteSettings.findUnique({ where: { id: 1 } });
  return row ? serialize(row) : null;
}, "settings");

export const getPublishedProjects = cached(async () => {
  const rows = await db.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(serialize);
}, "projects");

export const getProjectBySlug = cached(async (slug: string) => {
  const row = await db.project.findFirst({ where: { slug, published: true } });
  return row ? serialize(row) : null;
}, "project-by-slug");

export const getSkills = cached(async () => {
  const rows = await db.skill.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
  return rows.map(serialize);
}, "skills");

export const getExperiences = cached(async () => {
  const rows = await db.experience.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] });
  return rows.map(serialize);
}, "experiences");

export const getPublishedServices = cached(async () => {
  const rows = await db.service.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  return rows.map(serialize);
}, "services");
