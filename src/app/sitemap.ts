import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localeUrl } from "@/lib/seo";
import { getPublishedProjects, getSettings } from "@/server/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, settings] = await Promise.all([getPublishedProjects().catch(() => []), getSettings().catch(() => null)]);

  const entry = (path: string, lastModified: string | undefined, priority: number): MetadataRoute.Sitemap[number] => ({
    url: localeUrl(routing.defaultLocale, path),
    lastModified,
    changeFrequency: "monthly",
    priority,
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, localeUrl(l, path)])) },
  });

  return [
    entry("", settings?.updatedAt, 1),
    ...projects.map((p) => entry(`/projects/${p.slug}`, p.updatedAt, p.featured ? 0.8 : 0.6)),
  ];
}
