"use client";

import { useState, useTransition } from "react";
import {
  BriefcaseIcon,
  ExternalLinkIcon,
  FolderKanbanIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  SparklesIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { logout } from "@/server/actions/auth";

type Item = { href: string; key: "overview" | "projects" | "skills" | "experience" | "services" | "messages" | "settings"; icon: LucideIcon };

const ITEMS: Item[] = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboardIcon },
  { href: "/dashboard/projects", key: "projects", icon: FolderKanbanIcon },
  { href: "/dashboard/skills", key: "skills", icon: WrenchIcon },
  { href: "/dashboard/experience", key: "experience", icon: BriefcaseIcon },
  { href: "/dashboard/services", key: "services", icon: SparklesIcon },
  { href: "/dashboard/messages", key: "messages", icon: InboxIcon },
  { href: "/dashboard/settings", key: "settings", icon: SettingsIcon },
];

export function DashboardSidebar({ email, unread }: { email: string; unread: number }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("dashboard.nav");

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e bg-card/40 lg:flex">
        <SidebarBody email={email} unread={unread} />
      </aside>

      {/* Mobile top bar */}
      <div className="glass sticky top-0 z-40 flex items-center justify-between border-x-0 border-t-0 px-4 py-2.5 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("menu")}>
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
            <SidebarBody email={email} unread={unread} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Brand />
        <ThemeToggle />
      </div>
    </>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-mono text-sm font-medium">
      <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">H</span>
      <span>
        hassan<span className="text-brand-text">.dev</span>
      </span>
    </Link>
  );
}

function SidebarBody({ email, unread, onNavigate }: { email: string; unread: number; onNavigate?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Brand />
      </div>

      <nav className="flex-1 overflow-y-auto px-3" aria-label={t("menu")}>
        <ul className="space-y-0.5">
          {ITEMS.map(({ href, key, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={key}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground",
                    active && "bg-foreground/[0.07] font-medium text-foreground",
                  )}
                >
                  <Icon className={cn("size-4 transition-colors", active && "text-brand-text")} />
                  {t(key)}
                  {key === "messages" && unread > 0 && (
                    <span className="ms-auto grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[0.7rem] font-semibold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <ExternalLinkIcon className="size-4" />
          {t("viewSite")}
        </Link>
        <div className="flex items-center justify-between gap-2 px-1 pt-2">
          <p className="min-w-0 truncate text-xs text-muted-foreground" title={email}>
            {email}
          </p>
          <div className="flex shrink-0 items-center">
            <LocaleSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("signOut")}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await logout();
                  router.replace("/login");
                  router.refresh();
                })
              }
            >
              <LogOutIcon className="rtl:-scale-x-100" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
