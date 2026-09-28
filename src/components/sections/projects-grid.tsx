"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ProjectCard, type ProjectCardData, type ProjectCardLabels } from "./project-card";

type StatusFilter = "ALL" | "COMPLETED" | "IN_PROGRESS";

export function ProjectsGrid({
  projects,
  labels,
  filterLabels,
}: {
  projects: ProjectCardData[];
  labels: ProjectCardLabels;
  filterLabels: { all: string; byStatus: string; byTech: string; empty: string };
}) {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [tech, setTech] = useState<string | null>(null);

  // Only offer filters that would actually narrow the list.
  const statuses = useMemo(() => {
    const present = new Set(projects.map((p) => p.status));
    return (["COMPLETED", "IN_PROGRESS"] as const).filter((s) => present.has(s));
  }, [projects]);

  const techs = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.techStack.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 10);
  }, [projects]);

  const visible = projects.filter((p) => (status === "ALL" || p.status === status) && (!tech || p.techStack.includes(tech)));

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4">
        {statuses.length > 1 && (
          <FilterRow label={filterLabels.byStatus}>
            <Chip active={status === "ALL"} onClick={() => setStatus("ALL")}>
              {filterLabels.all}
            </Chip>
            {statuses.map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                {labels.status[s]}
              </Chip>
            ))}
          </FilterRow>
        )}
        {techs.length > 1 && (
          <FilterRow label={filterLabels.byTech}>
            <Chip active={tech === null} onClick={() => setTech(null)}>
              {filterLabels.all}
            </Chip>
            {techs.map((t) => (
              <Chip key={t} active={tech === t} onClick={() => setTech(tech === t ? null : t)} mono>
                {t}
              </Chip>
            ))}
          </FilterRow>
        )}
      </div>

      <motion.ul layout className="grid gap-5 md:grid-cols-2 lg:gap-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => (
            <motion.li
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex"
            >
              <ProjectCard project={project} labels={labels} priority={i < 2} className="w-full" />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && <p className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">{filterLabels.empty}</p>}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
      {children}
    </div>
  );
}

function Chip({ active, onClick, children, mono }: { active: boolean; onClick: () => void; children: React.ReactNode; mono?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "relative isolate shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors duration-300",
        mono && "font-mono text-xs",
        active ? "border-transparent text-primary-foreground" : "text-muted-foreground hover:border-foreground/25 hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId={mono ? "chip-tech" : "chip-status"}
          className="absolute inset-0 -z-10 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
        />
      )}
      <span className="relative" dir={mono ? "ltr" : undefined}>
        {children}
      </span>
    </button>
  );
}
