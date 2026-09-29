import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { Roadmap } from "@/components/sections/roadmap";
import { Services } from "@/components/sections/services";
import { Skills } from "@/components/sections/skills";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { stripHighlight } from "@/components/highlight-text";
import { socialLinks } from "@/components/site/social-icons";
import { localized } from "@/lib/i18n-fields";
import { alternates, jsonLd, localeUrl } from "@/lib/seo";
import { getExperiences, getPublishedProjects, getPublishedServices, getSettings, getSkills } from "@/server/queries";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSettings();
  if (!settings) return {};
  const name = localized(settings, "name", locale);
  const title = `${name} — ${localized(settings, "role", locale)}`;
  const description = stripHighlight(localized(settings, "intro", locale));
  return {
    title: { absolute: title },
    description,
    alternates: alternates(locale),
    openGraph: { title, description, url: localeUrl(locale) },
    twitter: { title, description },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [settings, projects, skills, experiences, services] = await Promise.all([
    getSettings(),
    getPublishedProjects(),
    getSkills(),
    getExperiences(),
    getPublishedServices(),
  ]);
  if (!settings) return null;

  const hasPlanned = projects.some((p) => p.status === "PLANNED");
  const delivered = projects.filter((p) => p.status === "COMPLETED").length;

  // Section numbers follow what is actually shown, so hiding one never leaves a gap.
  const order = [
    settings.showAbout && "about",
    settings.showSkills && skills.length > 0 && "skills",
    settings.showProjects && "projects",
    settings.showRoadmap && hasPlanned && "roadmap",
    settings.showExperience && experiences.length > 0 && "experience",
    settings.showServices && services.length > 0 && "services",
    settings.showContact && "contact",
  ].filter(Boolean) as string[];
  const idx = (id: string) => String(order.indexOf(id) + 1).padStart(2, "0");

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${localeUrl("en")}#person`,
    name: settings.nameEn,
    alternateName: settings.nameAr,
    jobTitle: localized(settings, "role", locale),
    description: stripHighlight(localized(settings, "intro", locale)),
    url: localeUrl(locale),
    ...(settings.avatarUrl && { image: settings.avatarUrl }),
    ...(settings.email && { email: `mailto:${settings.email}` }),
    ...(localized(settings, "location", locale) && { address: { "@type": "PostalAddress", addressLocality: localized(settings, "location", locale) } }),
    sameAs: socialLinks(settings).map((l) => l.href),
    knowsAbout: skills.map((s) => s.name),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: localized(settings, "name", locale),
    url: localeUrl(locale),
    inLanguage: locale,
    author: { "@id": person["@id"] },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd([person, website])} />
      <Hero settings={settings} locale={locale} />
      {settings.showSkills && <TechMarquee skills={skills} />}
      {order.includes("about") && (
        <About settings={settings} locale={locale} projectCount={delivered} techCount={skills.length} index={idx("about")} />
      )}
      {order.includes("skills") && <Skills skills={skills} locale={locale} index={idx("skills")} />}
      {order.includes("projects") && <Projects projects={projects} locale={locale} index={idx("projects")} />}
      {order.includes("roadmap") && <Roadmap projects={projects} locale={locale} index={idx("roadmap")} />}
      {order.includes("experience") && <Experience items={experiences} locale={locale} index={idx("experience")} />}
      {order.includes("services") && <Services services={services} locale={locale} index={idx("services")} />}
      {order.includes("contact") && <Contact settings={settings} locale={locale} index={idx("contact")} />}
    </>
  );
}
