import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import { Aurora } from "@/components/effects/aurora";
import { AnimatedHeadline } from "@/components/effects/animated-headline";
import { Enter } from "@/components/effects/enter";
import { Reveal, RevealGroup, RevealItem } from "@/components/effects/reveal";
import { CoverPlaceholder, STATUS_BADGE } from "@/components/sections/project-card";
import { Gallery } from "@/components/sections/gallery";
import { Markdown } from "@/components/site/markdown";
import { GithubIcon } from "@/components/site/social-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { localized } from "@/lib/i18n-fields";
import { alternates, jsonLd, localeUrl } from "@/lib/seo";
import { cn, formatDate } from "@/lib/utils";
import { getProjectBySlug, getPublishedProjects } from "@/server/queries";

type Props = { params: Promise<{ locale: string; slug: string }> };

// The tech-stack cell fills whatever is left of the 4-column meta row.
const STACK_SPAN: Record<number, string> = { 0: "lg:col-span-4", 1: "lg:col-span-3", 2: "lg:col-span-2", 3: "lg:col-span-1", 4: "lg:col-span-4" };

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
  } catch {
    return []; // no DB at build time → render on demand
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const title = localized(project, "title", locale);
  const description = localized(project, "summary", locale);
  const path = `/projects/${project.slug}`;
  // og:image comes from ./opengraph-image.tsx (branded card, or the cover when there is one)
  return {
    title,
    description,
    keywords: project.techStack,
    alternates: alternates(locale, path),
    openGraph: { title, description, type: "article", url: localeUrl(locale, path), modifiedTime: project.updatedAt },
    twitter: { title, description },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const [project, all] = await Promise.all([getProjectBySlug(slug), getPublishedProjects()]);
  if (!project) notFound();

  const t = await getTranslations({ locale: locale as Locale, namespace: "projects" });
  const title = localized(project, "title", locale);

  const current = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(current + 1) % all.length] : null;

  const timeline = project.startDate
    ? `${formatDate(project.startDate, locale)} — ${project.endDate ? formatDate(project.endDate, locale) : project.status === "PLANNED" ? "…" : t("status.IN_PROGRESS")}`
    : null;

  const meta = [
    { label: t("detail.role"), value: localized(project, "role", locale) },
    { label: t("detail.timeline"), value: timeline },
    { label: t("detail.client"), value: project.clientName },
    { label: t("detail.category"), value: t(`categories.${project.category}`) },
  ].filter((m) => m.value);

  const story = [
    { key: "problem", label: t("detail.problem"), text: localized(project, "problem", locale) },
    { key: "solution", label: t("detail.solution"), text: localized(project, "solution", locale) },
    { key: "result", label: t("detail.result"), text: localized(project, "result", locale) },
  ].filter((s) => s.text);

  const structured = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: localized(project, "summary", locale),
    url: localeUrl(locale, `/projects/${project.slug}`),
    inLanguage: locale,
    keywords: project.techStack.join(", "),
    ...(project.coverImage && { image: project.coverImage }),
    ...(project.startDate && { dateCreated: project.startDate }),
    dateModified: project.updatedAt,
    creator: { "@id": `${localeUrl("en")}#person` },
    ...(project.liveUrl && { sameAs: project.liveUrl }),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      {/* ─── Header ─── */}
      <header className="relative isolate overflow-hidden pb-16 pt-36 md:pt-44">
        <Aurora className="-z-20 opacity-70" />
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="container-page">
          <Enter>
            <Link href="/#projects" className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-1 rtl:-scale-x-100 rtl:group-hover:translate-x-1" />
              {t("detail.back")}
            </Link>
          </Enter>
          <Enter delay={0.05} className="mt-8 flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_BADGE[project.status]}>{t(`status.${project.status}`)}</Badge>
            {project.featured && <Badge variant="outline">★ {t("featured")}</Badge>}
          </Enter>
          <AnimatedHeadline text={title} delay={0.1} className="mt-5 max-w-5xl text-balance text-4xl font-semibold leading-[1.05] tracking-display sm:text-6xl lg:text-7xl" />
          <Enter delay={0.3}>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">{localized(project, "summary", locale)}</p>
          </Enter>
          {(project.liveUrl || project.githubUrl) && (
            <Enter delay={0.4} className="mt-9 flex flex-wrap gap-3">
              {project.liveUrl && (
                <Button size="lg" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    {t("live")}
                    <ArrowUpRightIcon className="transition-transform duration-300 group-hover:rotate-45 rtl:-scale-x-100" />
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button size="lg" variant="glass" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <GithubIcon className="size-4" />
                    {t("code")}
                  </a>
                </Button>
              )}
            </Enter>
          )}
        </div>
      </header>

      <div className="container-page space-y-20 pb-28 md:space-y-28">
        {/* ─── Meta strip ─── */}
        <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {meta.map((m) => (
            <RevealItem key={m.label} className="bg-background p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">{m.label}</p>
              <p className="mt-2 font-medium">{m.value}</p>
            </RevealItem>
          ))}
          <RevealItem className={cn("bg-background p-6", meta.length % 2 === 1 ? "sm:col-span-1" : "sm:col-span-2", STACK_SPAN[meta.length])}>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">{t("detail.stack")}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="tech" dir="ltr">
                  {tech}
                </Badge>
              ))}
            </div>
          </RevealItem>
        </RevealGroup>

        {/* ─── Cover ─── */}
        <Reveal className="relative aspect-[16/9] overflow-hidden rounded-3xl border bg-muted">
          {project.coverImage ? (
            <Image src={project.coverImage} alt={title} fill preload sizes="(min-width: 1216px) 1152px, 100vw" className="object-cover" />
          ) : (
            <CoverPlaceholder title={title} tech={project.techStack} className="[&>span:first-of-type]:text-9xl" />
          )}
        </Reveal>

        {/* ─── Problem → Solution → Result ─── */}
        {story.length > 0 && (
          <RevealGroup className="grid gap-4 md:grid-cols-3">
            {story.map((s, i) => (
              <RevealItem key={s.key} className="relative rounded-2xl border bg-card/60 p-7">
                <span className="font-mono text-xs text-brand-text">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-3 text-xl font-semibold tracking-heading">{s.label}</h2>
                <Markdown className="mt-3 text-sm">{s.text}</Markdown>
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {/* ─── Full write-up ─── */}
        {localized(project, "content", locale).trim() && (
          <Reveal className="mx-auto max-w-3xl">
            <Markdown className="text-lg">{localized(project, "content", locale)}</Markdown>
          </Reveal>
        )}

        {/* ─── Gallery ─── */}
        {project.gallery.length > 0 && (
          <section>
            <h2 className="mb-8 text-2xl font-semibold tracking-heading">{t("detail.gallery")}</h2>
            <Gallery images={project.gallery} title={title} />
          </section>
        )}

        {/* ─── Next project ─── */}
        {next && (
          <Link
            href={`/projects/${next.slug}`}
            className="group relative block overflow-hidden rounded-3xl border p-8 transition-colors duration-500 hover:border-brand/40 md:p-12"
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--glow-brand),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("detail.next")}</p>
            <div className="mt-4 flex items-end justify-between gap-6">
              <p className="text-balance text-3xl font-semibold tracking-display md:text-5xl">{localized(next, "title", locale)}</p>
              <ArrowUpRightIcon className="size-8 shrink-0 text-muted-foreground transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:text-brand-text rtl:-scale-x-100" />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
