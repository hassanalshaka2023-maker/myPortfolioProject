import { CodeXmlIcon, DatabaseIcon, LayoutTemplateIcon, ServerIcon, SmartphoneIcon, WrenchIcon, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealGroup, RevealItem } from "@/components/effects/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { TechIcon } from "@/components/site/tech-icon";
import type { SkillCategory } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { PublicSkill } from "@/server/queries";

const CATEGORY_ORDER: SkillCategory[] = ["BACKEND", "FRONTEND", "DATABASES", "MOBILE", "DEVOPS", "TOOLS"];
const CATEGORY_ICON: Record<SkillCategory, LucideIcon> = {
  BACKEND: ServerIcon,
  FRONTEND: LayoutTemplateIcon,
  DATABASES: DatabaseIcon,
  MOBILE: SmartphoneIcon,
  DEVOPS: CodeXmlIcon,
  TOOLS: WrenchIcon,
};

export async function Skills({ skills, locale, index }: { skills: PublicSkill[]; locale: string; index: string }) {
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "skills" });
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="skills" className="container-page py-28 md:py-36">
      <SectionHeading index={index} eyebrow={t("eyebrow")} title={t("title")} />

      <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {groups.map(({ category, items }, i) => {
          const Icon = CATEGORY_ICON[category];
          // Bento rhythm: the first two groups are wide, the rest share the row.
          const span = groups.length >= 3 && i < 2 ? "lg:col-span-3" : "lg:col-span-2";
          return (
            <RevealItem
              key={category}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card/60 p-6 transition-colors duration-500 hover:border-brand/30 md:p-7",
                span,
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--glow-brand),transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-3 text-lg font-semibold tracking-heading">
                  <span className="grid size-9 place-items-center rounded-xl border bg-background text-brand-text">
                    <Icon className="size-4" />
                  </span>
                  {t(`categories.${category}`)}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">{String(items.length).padStart(2, "0")}</span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex items-center gap-2 rounded-full border bg-background/60 py-1.5 pe-3.5 ps-2.5 text-sm transition-colors duration-300 hover:border-brand/40 hover:text-brand-text"
                  >
                    <TechIcon slug={skill.icon} name={skill.name} className="size-4" />
                    <span dir="ltr">{skill.name}</span>
                  </li>
                ))}
              </ul>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
