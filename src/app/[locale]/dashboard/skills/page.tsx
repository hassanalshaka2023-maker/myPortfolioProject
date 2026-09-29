import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { SkillsManager } from "./skills-manager";

export default async function SkillsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.skills" });
  const skills = await db.skill.findMany({ orderBy: [{ order: "asc" }], select: { id: true, name: true, category: true, icon: true } });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <SkillsManager skills={skills} />
    </>
  );
}
