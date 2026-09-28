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
import { getExperiences, getPublishedProjects, getPublishedServices, getSettings, getSkills } from "@/server/queries";

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

  return (
    <>
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
