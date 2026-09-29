import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Locale } from "@/i18n/routing";
import { emptyProject } from "@/lib/validations/project";
import { ProjectForm } from "../project-form";
import { BackLink, techSuggestions } from "../shared";

export default async function NewProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard" });

  return (
    <>
      <BackLink label={t("nav.projects")} />
      <PageHeader title={t("projects.new")} />
      <ProjectForm defaults={emptyProject} techSuggestions={await techSuggestions()} />
    </>
  );
}
