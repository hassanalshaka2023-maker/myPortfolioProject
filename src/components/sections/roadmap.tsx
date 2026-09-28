import { ArrowUpRightIcon, CalendarClockIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealGroup, RevealItem } from "@/components/effects/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n-fields";
import { formatDate } from "@/lib/utils";
import type { PublicProject } from "@/server/queries";

export async function Roadmap({ projects, locale, index }: { projects: PublicProject[]; locale: string; index: string }) {
  const planned = projects.filter((p) => p.status === "PLANNED");
  if (planned.length === 0) return null;
  const t = await getTranslations({ locale: locale as "en" | "ar" });

  return (
    <section id="roadmap" className="container-page py-28 md:py-36">
      <SectionHeading index={index} eyebrow={t("roadmap.eyebrow")} title={t("roadmap.title")} description={t("roadmap.description")} />

      <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {planned.map((p) => (
          <RevealItem key={p.id}>
            <article className="group relative flex h-full flex-col rounded-2xl border border-dashed border-violet/30 bg-violet/[0.03] p-6 transition-colors duration-500 hover:border-violet/60 hover:bg-violet/[0.06]">
              <div className="mb-5 flex items-center justify-between">
                <Badge variant="violet">
                  <span className="size-1.5 animate-pulse rounded-full bg-violet" />
                  {t("projects.status.PLANNED")}
                </Badge>
                {p.startDate && (
                  <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                    <CalendarClockIcon className="size-3.5" />
                    {formatDate(p.startDate, locale)}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold tracking-heading">
                <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
                  {localized(p, "title", locale)}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{localized(p, "summary", locale)}</p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {p.techStack.slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="tech" dir="ltr">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-500 group-hover:rotate-45 group-hover:text-violet-text rtl:-scale-x-100" />
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
