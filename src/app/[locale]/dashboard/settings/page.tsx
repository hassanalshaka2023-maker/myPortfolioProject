import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import type { SettingsInput } from "@/lib/validations/settings";
import { PasswordForm } from "./password-form";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.settings" });
  const s = await db.siteSettings.findUnique({ where: { id: 1 } });

  const defaults: SettingsInput = {
    nameEn: s?.nameEn ?? "",
    nameAr: s?.nameAr ?? "",
    roleEn: s?.roleEn ?? "",
    roleAr: s?.roleAr ?? "",
    taglineEn: s?.taglineEn ?? "",
    taglineAr: s?.taglineAr ?? "",
    introEn: s?.introEn ?? "",
    introAr: s?.introAr ?? "",
    aboutEn: s?.aboutEn ?? "",
    aboutAr: s?.aboutAr ?? "",
    email: s?.email ?? "",
    phone: s?.phone ?? "",
    locationEn: s?.locationEn ?? "",
    locationAr: s?.locationAr ?? "",
    avatarUrl: s?.avatarUrl ?? "",
    cvUrl: s?.cvUrl ?? "",
    githubUrl: s?.githubUrl ?? "",
    linkedinUrl: s?.linkedinUrl ?? "",
    xUrl: s?.xUrl ?? "",
    telegramUrl: s?.telegramUrl ?? "",
    whatsappUrl: s?.whatsappUrl ?? "",
    yearsOfExperience: s?.yearsOfExperience ?? 0,
    openToWork: s?.openToWork ?? true,
    showAbout: s?.showAbout ?? true,
    showSkills: s?.showSkills ?? true,
    showProjects: s?.showProjects ?? true,
    showRoadmap: s?.showRoadmap ?? true,
    showExperience: s?.showExperience ?? true,
    showServices: s?.showServices ?? false,
    showContact: s?.showContact ?? true,
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <SettingsForm defaults={defaults} />
      <div className="mt-6">
        <PasswordForm />
      </div>
    </>
  );
}
