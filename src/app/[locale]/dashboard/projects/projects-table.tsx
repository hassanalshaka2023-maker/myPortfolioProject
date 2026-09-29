"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import {
  CopyIcon,
  EyeIcon,
  FolderKanbanIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { EmptyState } from "@/components/dashboard/page-header";
import { SortableList } from "@/components/dashboard/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { deleteProject, duplicateProject, patchProject, reorderProjects } from "@/server/actions/projects";

type Row = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  coverImage: string | null;
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
  featured: boolean;
  published: boolean;
  updatedAt: string;
  techStack: string[];
};

const STATUS_VARIANT = { COMPLETED: "success", IN_PROGRESS: "brand", PLANNED: "violet" } as const;
const PAGE_SIZE = 12;

export function ProjectsTable({ projects }: { projects: Row[] }) {
  const t = useTranslations("dashboard");
  const ts = useTranslations("projects.status");
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | Row["status"]>("ALL");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const title = (p: Row) => (locale === "ar" ? p.titleAr || p.titleEn : p.titleEn || p.titleAr);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "ALL" || p.status === status) &&
        (!q || [p.titleEn, p.titleAr, p.slug, ...p.techStack].some((s) => s.toLowerCase().includes(q))),
    );
  }, [projects, query, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  // Memoized: SortableList re-syncs when it receives a new array identity.
  const visible = useMemo(() => filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), [filtered, current]);
  const canReorder = !query && status === "ALL" && pages === 1;

  const run = (fn: () => Promise<{ ok: boolean }>, success?: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        if (success) toast.success(success);
        router.refresh();
      } else toast.error(t("common.error"));
    });

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanbanIcon}
        title={t("projects.empty")}
        description={t("projects.emptyDescription")}
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <PlusIcon />
              {t("projects.new")}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t("projects.search")}
            className="h-10 ps-9"
            aria-label={t("projects.search")}
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group">
          {(["ALL", "COMPLETED", "IN_PROGRESS", "PLANNED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                status === s ? "border-transparent bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "ALL" ? t("common.all") : ts(s)}
              <span className="ms-1.5 opacity-60">{s === "ALL" ? projects.length : projects.filter((p) => p.status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      {!canReorder && filtered.length > 1 && <p className="text-xs text-muted-foreground">{t("projects.reorderDisabled")}</p>}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">{t("common.noResults")}</p>
      ) : (
        <SortableList
          items={visible}
          disabled={!canReorder}
          onReorder={(ids) => run(() => reorderProjects(ids), t("common.reordered"))}
          renderItem={(p, handle) => (
            <div className="flex items-center gap-3 rounded-xl border bg-card/60 p-2.5 pe-3 transition-colors hover:bg-card">
              {handle}
              <div className="relative hidden aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:block">
                {p.coverImage ? (
                  <Image src={p.coverImage} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--glow-brand),transparent_60%),radial-gradient(circle_at_80%_80%,var(--glow-violet),transparent_60%)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/projects/${p.id}`} className="flex items-center gap-2 font-medium hover:underline">
                  <span className="truncate">{title(p)}</span>
                  {p.featured && <StarIcon className="size-3.5 shrink-0 fill-brand text-brand" aria-label={t("common.featured")} />}
                </Link>
                <p className="truncate font-mono text-xs text-muted-foreground" dir="ltr">
                  /projects/{p.slug}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[p.status]} className="hidden md:inline-flex">
                {ts(p.status)}
              </Badge>
              <label className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
                <Switch
                  checked={p.published}
                  onCheckedChange={(published) => run(() => patchProject(p.id, { published }), published ? t("common.published") : t("common.draft"))}
                  aria-label={t("common.published")}
                />
                <span className="w-14">{p.published ? t("common.published") : t("common.draft")}</span>
              </label>
              <time className="hidden w-24 text-end text-xs text-muted-foreground xl:block" dateTime={p.updatedAt}>
                {new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", { dateStyle: "medium" }).format(new Date(p.updatedAt))}
              </time>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={t("common.actions")}>
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/projects/${p.id}`}>
                      <PencilIcon />
                      {t("common.edit")}
                    </Link>
                  </DropdownMenuItem>
                  {p.published && (
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${p.slug}`} target="_blank">
                        <EyeIcon />
                        {t("common.view")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => run(() => patchProject(p.id, { featured: !p.featured }))}>
                    <StarIcon />
                    {t("common.featured")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="lg:hidden" onSelect={() => run(() => patchProject(p.id, { published: !p.published }))}>
                    <EyeIcon />
                    {p.published ? t("common.draft") : t("common.published")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => run(() => duplicateProject(p.id), t("projects.duplicated"))}>
                    <CopyIcon />
                    {t("projects.duplicate")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(p)}>
                    <Trash2Icon />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        />
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
            {t("common.previous")}
          </Button>
          <span className="text-muted-foreground">{t("common.pageOf", { page: current, total: pages })}</span>
          <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
            {t("common.next")}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        description={t("common.confirmDelete", { name: toDelete ? title(toDelete) : "" })}
        onConfirm={async () => {
          if (!toDelete) return;
          const res = await deleteProject(toDelete.id);
          if (res.ok) {
            toast.success(t("projects.deleted"));
            router.refresh();
          } else toast.error(t("common.error"));
        }}
      />
    </div>
  );
}
