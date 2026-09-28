"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GithubIcon } from "@/components/site/social-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProjectCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: string | null;
  techStack: string[];
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
  category: string;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  year: string | null;
};

export type ProjectCardLabels = {
  status: Record<ProjectCardData["status"], string>;
  category: Record<string, string>;
  live: string;
  code: string;
  featured: string;
};

export const STATUS_BADGE = { COMPLETED: "success", IN_PROGRESS: "brand", PLANNED: "violet" } as const;

/** Card with a pointer-following spotlight. The whole card links to the case study; external links sit above it. */
export function ProjectCard({ project, labels, priority, className }: { project: ProjectCardData; labels: ProjectCardLabels; priority?: boolean; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <article
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card/70 transition-[transform,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-foreground/15",
        project.featured && "border-gradient",
        className,
      )}
    >
      {/* spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), color-mix(in oklch, var(--brand) 9%, transparent), transparent 60%)" }}
      />

      <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
          />
        ) : (
          <CoverPlaceholder title={project.title} tech={project.techStack} />
        )}
        <div className="absolute start-3 top-3 z-10 flex gap-1.5">
          <Badge variant={STATUS_BADGE[project.status]} className="glass">
            {labels.status[project.status]}
          </Badge>
          {project.featured && (
            <Badge variant="outline" className="glass text-foreground/80">
              ★ {labels.featured}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
          <span>{labels.category[project.category] ?? project.category}</span>
          {project.year && <span>{project.year}</span>}
        </div>
        <h3 className="text-xl font-semibold tracking-heading">
          <Link href={`/projects/${project.slug}`} className="outline-none after:absolute after:inset-0 after:z-0 after:content-['']">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 5).map((tech) => (
            <Badge key={tech} variant="tech" dir="ltr">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 5 && <Badge variant="tech">+{project.techStack.length - 5}</Badge>}
        </div>

        <div className="relative z-20 mt-auto flex items-center gap-1 pt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand/10"
            >
              {labels.live}
              <ArrowUpRightIcon className="size-3.5 rtl:-scale-x-100" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <GithubIcon className="size-3.5" />
              {labels.code}
            </a>
          )}
          <ArrowUpRightIcon
            aria-hidden
            className="ms-auto size-5 text-muted-foreground transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:text-brand-text rtl:-scale-x-100"
          />
        </div>
      </div>
    </article>
  );
}

/** Generated cover for projects without an image: gradient field + monogram + faint tech list. */
export function CoverPlaceholder({ title, tech, className }: { title: string; tech: string[]; className?: string }) {
  const initials = title
    .split(/[\s—-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--glow-brand),transparent_55%),radial-gradient(circle_at_85%_90%,var(--glow-violet),transparent_55%)] transition-transform duration-700 ease-out-expo group-hover:scale-110" />
      <div className="bg-grid absolute inset-0 opacity-60" />
      <span className="absolute inset-0 grid place-items-center text-7xl font-semibold tracking-display text-foreground/15 transition-transform duration-700 ease-out-expo group-hover:scale-105">
        {initials}
      </span>
      <span className="absolute bottom-3 end-4 font-mono text-[0.65rem] text-foreground/35" dir="ltr">
        {tech.slice(0, 3).join(" · ")}
      </span>
    </div>
  );
}
