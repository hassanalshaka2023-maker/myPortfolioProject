import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Footer } from "@/components/site/footer";
import { Header, type NavItem } from "@/components/site/header";
import { localized } from "@/lib/i18n-fields";
import { getExperiences, getPublishedServices, getSettings } from "@/server/queries";

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [settings, experiences, services, t] = await Promise.all([
    getSettings(),
    getExperiences(),
    getPublishedServices(),
    getTranslations({ locale: locale as Locale, namespace: "nav" }),
  ]);
  if (!settings) throw new Error("Site settings are missing — run `npm run db:seed`.");

  const nav: (NavItem | false)[] = [
    settings.showAbout && { id: "about", label: t("about") },
    settings.showSkills && { id: "skills", label: t("skills") },
    settings.showProjects && { id: "projects", label: t("projects") },
    settings.showExperience && experiences.length > 0 && { id: "experience", label: t("experience") },
    settings.showServices && services.length > 0 && { id: "services", label: t("services") },
    settings.showContact && { id: "contact", label: t("contact") },
  ];

  return (
    <>
      <Header brand={localized(settings, "name", "en")} items={nav.filter((i): i is NavItem => !!i)} />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer settings={settings} locale={locale} />
    </>
  );
}
