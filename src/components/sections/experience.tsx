import { BriefcaseIcon, GraduationCapIcon, LaptopIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/effects/reveal";
import { Markdown } from "@/components/site/markdown";
import { SectionHeading } from "@/components/site/section-heading";
import { localized } from "@/lib/i18n-fields";
import { formatDate } from "@/lib/utils";
import type { PublicExperience } from "@/server/queries";

const TYPE_ICON = { WORK: BriefcaseIcon, FREELANCE: LaptopIcon, EDUCATION: GraduationCapIcon } as const;

export async function Experience({ items, locale, index }: { items: PublicExperience[]; locale: string; index: string }) {
  if (items.length === 0) return null;
  const t = await getTranslations({ locale: locale as "en" | "ar" });

  return (
    <section id="experience" className="container-page py-28 md:py-36">
      <SectionHeading index={index} eyebrow={t("experience.eyebrow")} title={t("experience.title")} />

      <ol className="relative ms-4 border-s md:ms-0 md:border-s-0">
        {/* center rail on desktop */}
        <span aria-hidden className="absolute inset-y-0 start-[11.5rem] hidden w-px bg-gradient-to-b from-brand/60 via-border to-transparent md:block" />
        {items.map((item) => {
          const Icon = TYPE_ICON[item.type];
          const range = `${formatDate(item.startDate, locale)} — ${item.endDate ? formatDate(item.endDate, locale) : t("common.present")}`;
          return (
            <Reveal as="li" key={item.id} className="group relative grid gap-3 pb-14 ps-8 last:pb-0 md:grid-cols-[11.5rem_1fr] md:gap-12 md:ps-0">
              <div className="font-mono text-xs leading-7 text-muted-foreground md:pe-8 md:text-end">{range}</div>

              <span className="absolute -start-[1.0625rem] top-0 grid size-8 place-items-center rounded-full border bg-background text-brand-text shadow-[0_0_0_4px_var(--background)] transition-colors duration-500 group-hover:border-brand/50 md:start-[calc(11.5rem-1rem)]">
                <Icon className="size-3.5" />
              </span>

              <div className="md:ps-8">
                <p className="text-xs text-brand-text">{t(`experience.types.${item.type}`)}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-heading">{localized(item, "role", locale)}</h3>
                <p className="mt-1 text-muted-foreground">
                  {localized(item, "organization", locale)}
                  {localized(item, "location", locale) && <span className="text-muted-foreground/70"> · {localized(item, "location", locale)}</span>}
                </p>
                <Markdown className="mt-4 text-sm">{localized(item, "description", locale)}</Markdown>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
