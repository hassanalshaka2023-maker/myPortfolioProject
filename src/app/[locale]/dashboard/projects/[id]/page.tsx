import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { toDateInput } from "@/lib/validations/common";
import type { ProjectInput } from "@/lib/validations/project";
import { BackLink, techSuggestions } from "../shared";
import { ProjectForm } from "../project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard" });

  const p = await db.project.findUnique({ where: { id } });
  if (!p) notFound();

  const defaults: ProjectInput = {
    titleEn: p.titleEn,
    titleAr: p.titleAr,
    slug: p.slug,
    summaryEn: p.summaryEn,
    summaryAr: p.summaryAr,
    contentEn: p.contentEn,
    contentAr: p.contentAr,
    roleEn: p.roleEn ?? "",
    roleAr: p.roleAr ?? "",
    problemEn: p.problemEn ?? "",
    problemAr: p.problemAr ?? "",
    solutionEn: p.solutionEn ?? "",
    solutionAr: p.solutionAr ?? "",
    resultEn: p.resultEn ?? "",
    resultAr: p.resultAr ?? "",
    coverImage: p.coverImage ?? "",
    gallery: p.gallery,
    techStack: p.techStack,
    category: p.category,
    status: p.status,
    startDate: toDateInput(p.startDate),
    endDate: toDateInput(p.endDate),
    liveUrl: p.liveUrl ?? "",
    githubUrl: p.githubUrl ?? "",
    clientName: p.clientName ?? "",
    featured: p.featured,
    published: p.published,
  };

  return (
    <>
      <BackLink label={t("nav.projects")} />
      <PageHeader title={locale === "ar" ? p.titleAr : p.titleEn} description={t("projects.edit")} />
      <ProjectForm id={p.id} defaults={defaults} techSuggestions={await techSuggestions()} publicSlug={p.published ? p.slug : undefined} />
    </>
  );
}
