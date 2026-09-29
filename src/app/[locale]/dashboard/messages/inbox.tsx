"use client";

import { useEffect, useState, useTransition } from "react";
import { InboxIcon, MailIcon, MailOpenIcon, ReplyIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { EmptyState } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { deleteMessages, setMessagesRead } from "@/server/actions/messages";

type Message = { id: string; name: string; email: string; subject: string | null; body: string; read: boolean; createdAt: string };

export function Inbox({
  messages,
  opened,
  total,
  page,
  pages,
  query,
  filter,
  isEmpty,
}: {
  messages: Message[];
  opened: Message | null;
  total: number;
  page: number;
  pages: number;
  query: string;
  filter: "all" | "unread" | "read";
  isEmpty: boolean;
}) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<Message | null>(opened);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const [search, setSearch] = useState(query);

  const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", { dateStyle: "medium", timeStyle: "short" });

  const navigate = (next: { q?: string; filter?: string; page?: number }) => {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const f = next.filter ?? filter;
    const p = next.page ?? 1;
    if (q) params.set("q", q);
    if (f !== "all") params.set("filter", f);
    if (p > 1) params.set("page", String(p));
    setSelected(new Set());
    startTransition(() => router.push(`${pathname}${params.size ? `?${params}` : ""}`));
  };

  // Opened via ?open=<id> (e.g. from the overview) → mark it read once.
  useEffect(() => {
    if (opened && !opened.read) void setMessagesRead([opened.id], true).then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    if (search === query) return;
    const id = setTimeout(() => navigate({ q: search }), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const mutate = (fn: () => Promise<{ ok: boolean }>, success?: string) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return void toast.error(t("common.error"));
      if (success) toast.success(success);
      setSelected(new Set());
      router.refresh();
    });

  const openMessage = (m: Message) => {
    setActive(m);
    if (!m.read) mutate(() => setMessagesRead([m.id], true));
  };

  const allSelected = messages.length > 0 && messages.every((m) => selected.has(m.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (isEmpty) return <EmptyState icon={InboxIcon} title={t("messages.empty")} description={t("messages.emptyDescription")} />;

  return (
    <div className="grid gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("messages.search")} aria-label={t("messages.search")} className="h-10 ps-9" />
        </div>
        <div className="flex gap-1.5" role="group">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => navigate({ filter: f })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                filter === f ? "border-transparent bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`messages.filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-xl border bg-card/40 px-3 py-1.5">
        <Checkbox
          checked={allSelected ? true : selected.size > 0 ? "indeterminate" : false}
          onCheckedChange={() => setSelected(allSelected ? new Set() : new Set(messages.map((m) => m.id)))}
          aria-label="Select all"
        />
        {selected.size > 0 ? (
          <>
            <span className="text-xs text-muted-foreground">{t("messages.selected", { count: selected.size })}</span>
            <div className="ms-auto flex gap-1">
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => mutate(() => setMessagesRead([...selected], true))}>
                <MailOpenIcon />
                <span className="hidden sm:inline">{t("messages.markRead")}</span>
              </Button>
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => mutate(() => setMessagesRead([...selected], false))}>
                <MailIcon />
                <span className="hidden sm:inline">{t("messages.markUnread")}</span>
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" disabled={pending} onClick={() => setConfirm([...selected])}>
                <Trash2Icon />
                <span className="hidden sm:inline">{t("common.delete")}</span>
              </Button>
            </div>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">{total}</span>
        )}
      </div>

      {messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">{t("common.noResults")}</p>
      ) : (
        <ul className={cn("divide-y overflow-hidden rounded-xl border transition-opacity", pending && "opacity-60")}>
          {messages.map((m) => (
            <li key={m.id} className={cn("flex items-start gap-3 bg-card/40 px-3 py-3 transition-colors hover:bg-card", !m.read && "bg-brand/[0.04]")}>
              <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggle(m.id)} aria-label={m.name} className="mt-1" />
              <button type="button" onClick={() => openMessage(m)} className="min-w-0 flex-1 text-start">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("flex min-w-0 items-center gap-2 text-sm", !m.read && "font-semibold")}>
                    {!m.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />}
                    <span className="truncate">{m.name}</span>
                    <span className="hidden truncate text-xs font-normal text-muted-foreground sm:inline" dir="ltr">
                      {m.email}
                    </span>
                  </p>
                  <time className="shrink-0 text-xs text-muted-foreground" dateTime={m.createdAt}>
                    {fmt.format(new Date(m.createdAt))}
                  </time>
                </div>
                <p className={cn("mt-0.5 truncate text-sm", m.read ? "text-muted-foreground" : "text-foreground")} dir="auto">
                  <span className="font-medium">{m.subject || t("messages.noSubject")}</span>
                  <span className="text-muted-foreground"> — {m.body}</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1 || pending} onClick={() => navigate({ page: page - 1 })}>
            {t("common.previous")}
          </Button>
          <span className="text-muted-foreground">{t("common.pageOf", { page, total: pages })}</span>
          <Button variant="outline" size="sm" disabled={page >= pages || pending} onClick={() => navigate({ page: page + 1 })}>
            {t("common.next")}
          </Button>
        </div>
      )}

      {/* Reading pane */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle dir="auto">{active.subject || t("messages.noSubject")}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-x-2">
                  <span className="font-medium text-foreground">{active.name}</span>
                  <a href={`mailto:${active.email}`} className="hover:underline" dir="ltr">
                    &lt;{active.email}&gt;
                  </a>
                  <span>· {fmt.format(new Date(active.createdAt))}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50dvh] overflow-y-auto whitespace-pre-wrap rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed" dir="auto">
                {active.body}
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setConfirm([active.id]);
                  }}
                >
                  <Trash2Icon />
                  {t("common.delete")}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      mutate(() => setMessagesRead([active.id], false));
                      setActive(null);
                    }}
                  >
                    <MailIcon />
                    {t("messages.markUnread")}
                  </Button>
                  <Button asChild>
                    <a href={`mailto:${active.email}?subject=${encodeURIComponent(`Re: ${active.subject ?? ""}`)}`}>
                      <ReplyIcon className="rtl:-scale-x-100" />
                      {t("messages.reply")}
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        description={t("common.confirmDelete", { name: confirm && confirm.length > 1 ? String(confirm.length) : (active?.name ?? messages.find((m) => m.id === confirm?.[0])?.name ?? "") })}
        onConfirm={async () => {
          if (!confirm) return;
          const res = await deleteMessages(confirm);
          if (!res.ok) return void toast.error(t("common.error"));
          toast.success(t("messages.deleted", { count: confirm.length }));
          setActive(null);
          setSelected(new Set());
          router.refresh();
        }}
      />
    </div>
  );
}
