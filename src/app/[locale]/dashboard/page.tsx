import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  ExternalLinkIcon,
  FolderKanbanIcon,
  InboxIcon,
  LoaderIcon,
  MailIcon,
  PlusIcon,
  SettingsIcon,
  WrenchIcon,
} from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function OverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.overview" });

  const [session, byStatus, unread, recent, settings] = await Promise.all([
    auth(),
    db.project.groupBy({ by: ["status"], _count: { _all: true } }),
    db.message.count({ where: { read: false } }),
    db.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.siteSettings.findUnique({ where: { id: 1 }, select: { nameEn: true, nameAr: true } }),
  ]);

  const count = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
  const total = byStatus.reduce((n, r) => n + r._count._all, 0);
  const name = (locale === "ar" ? settings?.nameAr : settings?.nameEn)?.split(" ")[0] ?? session?.user?.name ?? "";

  const stats = [
    { label: t("stats.projects"), value: total, icon: FolderKanbanIcon, href: "/dashboard/projects", tone: "text-foreground" },
    { label: t("stats.completed"), value: count("COMPLETED"), icon: CheckCircle2Icon, href: "/dashboard/projects", tone: "text-success" },
    { label: t("stats.inProgress"), value: count("IN_PROGRESS"), icon: LoaderIcon, href: "/dashboard/projects", tone: "text-brand-text" },
    { label: t("stats.planned"), value: count("PLANNED"), icon: CircleDashedIcon, href: "/dashboard/projects", tone: "text-violet-text" },
    { label: t("stats.unread"), value: unread, icon: InboxIcon, href: "/dashboard/messages", tone: unread ? "text-brand-text" : "text-foreground" },
  ];

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", { dateStyle: "medium" });

  return (
    <>
      <PageHeader title={t("greeting", { name })} description={t("subtitle")} />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, href, tone }) => (
          <li key={label}>
            <Link href={href} className="group block rounded-2xl border bg-card/50 p-5 transition-colors hover:border-foreground/15 hover:bg-card">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs">{label}</span>
                <Icon className={cn("size-4", tone)} />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-heading">{value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border bg-card/50">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">{t("recentMessages")}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/messages">
                {t("viewAll")}
                <ArrowUpRightIcon className="rtl:-scale-x-100" />
              </Link>
            </Button>
          </header>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">{t("noMessages")}</p>
          ) : (
            <ul className="divide-y">
              {recent.map((m) => (
                <li key={m.id}>
                  <Link href={`/dashboard/messages?open=${m.id}`} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-foreground/[0.03]">
                    <span className={cn("mt-2 size-2 shrink-0 rounded-full", m.read ? "bg-transparent" : "bg-primary")} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={cn("truncate text-sm", !m.read && "font-semibold")}>{m.name}</p>
                        <time className="shrink-0 text-xs text-muted-foreground" dateTime={m.createdAt.toISOString()}>
                          {dateFmt.format(m.createdAt)}
                        </time>
                      </div>
                      <p className="truncate text-sm text-muted-foreground" dir="auto">
                        {m.subject ? `${m.subject} — ` : ""}
                        {m.body}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card/50 p-5">
          <h2 className="mb-4 font-semibold">{t("quickActions")}</h2>
          <div className="grid gap-2">
            {[
              { href: "/dashboard/projects/new", label: t("newProject"), icon: PlusIcon, primary: true },
              { href: "/dashboard/settings", label: t("editSettings"), icon: SettingsIcon },
              { href: "/dashboard/skills", label: t("manageSkills"), icon: WrenchIcon },
              { href: "/dashboard/messages", label: t("recentMessages"), icon: MailIcon },
            ].map(({ href, label, icon: Icon, primary }) => (
              <Button key={href} variant={primary ? "default" : "outline"} className="justify-start rounded-xl" asChild>
                <Link href={href}>
                  <Icon />
                  {label}
                </Link>
              </Button>
            ))}
            <Button variant="ghost" className="justify-start rounded-xl" asChild>
              <Link href="/" target="_blank">
                <ExternalLinkIcon />
                {t("viewSite")}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
