import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/site/section-heading";
import { localized } from "@/lib/i18n-fields";
import type { PublicProject } from "@/server/queries";
import type { ProjectCardData, ProjectCardLabels } from "./project-card";
import { ProjectsGrid } from "./projects-grid";

export function toCardData(p: PublicProject, locale: string): ProjectCardData {
  const date = p.endDate ?? p.startDate;
  return {
    id: p.id,
    slug: p.slug,
    title: localized(p, "title", locale),
    summary: localized(p, "summary", locale),
    coverImage: p.coverImage,
    techStack: p.techStack,
    status: p.status,
    category: p.category,
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    featured: p.featured,
    year: date ? String(new Date(date).getFullYear()) : null,
  };
}

export async function cardLabels(locale: string): Promise<ProjectCardLabels> {
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "projects" });
  return {
    status: { COMPLETED: t("status.COMPLETED"), IN_PROGRESS: t("status.IN_PROGRESS"), PLANNED: t("status.PLANNED") },
    category: {
      FULL_STACK: t("categories.FULL_STACK"),
      BACKEND: t("categories.BACKEND"),
      FRONTEND: t("categories.FRONTEND"),
      MOBILE: t("categories.MOBILE"),
      OTHER: t("categories.OTHER"),
    },
    live: t("live"),
    code: t("code"),
    featured: t("featured"),
  };
}

export async function Projects({ projects, locale, index }: { projects: PublicProject[]; locale: string; index: string }) {
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "projects" });
  const cards = projects.filter((p) => p.status !== "PLANNED").map((p) => toCardData(p, locale));
  if (cards.length === 0) return null;

  return (
    <section id="projects" className="container-page py-28 md:py-36">
      <SectionHeading index={index} eyebrow={t("eyebrow")} title={t("title")} />
      <ProjectsGrid
        projects={cards}
        labels={await cardLabels(locale)}
        filterLabels={{ all: t("all"), byStatus: t("filterByStatus"), byTech: t("filterByTech"), empty: t("empty") }}
      />
    </section>
  );
}
