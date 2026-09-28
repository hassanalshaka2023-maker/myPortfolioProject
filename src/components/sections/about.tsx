import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CountUp } from "@/components/effects/count-up";
import { Reveal, RevealGroup, RevealItem } from "@/components/effects/reveal";
import { Markdown } from "@/components/site/markdown";
import { SectionHeading } from "@/components/site/section-heading";
import { localized } from "@/lib/i18n-fields";
import type { PublicSettings } from "@/server/queries";

export async function About({
  settings,
  locale,
  projectCount,
  techCount,
  index,
}: {
  settings: PublicSettings;
  locale: string;
  projectCount: number;
  techCount: number;
  index: string;
}) {
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "about" });
  const name = localized(settings, "name", locale);

  const stats = [
    settings.yearsOfExperience > 0 ? { label: t("stats.years"), value: settings.yearsOfExperience, suffix: "+" } : null,
    projectCount > 0 ? { label: t("stats.projects"), value: projectCount, suffix: "" } : null,
    techCount > 0 ? { label: t("stats.technologies"), value: techCount, suffix: "+" } : null,
  ].filter((s) => s !== null);

  return (
    <section id="about" className="container-page py-28 md:py-36">
      <SectionHeading index={index} eyebrow={t("eyebrow")} title={t("title")} />

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <Reveal className="flex flex-col gap-8">
          {settings.avatarUrl && (
            <div className="relative size-24 overflow-hidden rounded-2xl border">
              <Image src={settings.avatarUrl} alt={name} fill sizes="96px" className="object-cover" />
            </div>
          )}
          <Markdown className="text-lg md:text-xl md:leading-relaxed">{localized(settings, "about", locale)}</Markdown>
        </Reveal>

        {stats.length > 0 && (
          <RevealGroup className="grid content-start gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <RevealItem key={stat.label} className="flex flex-col gap-2 bg-background p-7">
                <span className="text-5xl font-semibold tracking-display text-foreground md:text-6xl">
                  <CountUp value={stat.value} suffix={stat.suffix} locale={locale} />
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
