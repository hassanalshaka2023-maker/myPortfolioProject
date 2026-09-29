import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { toDateInput } from "@/lib/validations/common";
import { ExperienceManager } from "./experience-manager";

export default async function ExperiencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.experience" });
  const rows = await db.experience.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] });

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ExperienceManager
        items={rows.map((r) => ({
          id: r.id,
          type: r.type,
          roleEn: r.roleEn,
          roleAr: r.roleAr,
          organizationEn: r.organizationEn,
          organizationAr: r.organizationAr,
          locationEn: r.locationEn ?? "",
          locationAr: r.locationAr ?? "",
          descriptionEn: r.descriptionEn,
          descriptionAr: r.descriptionAr,
          startDate: toDateInput(r.startDate),
          endDate: toDateInput(r.endDate),
        }))}
      />
    </>
  );
}
