import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeftIcon } from "lucide-react";
import { Aurora } from "@/components/effects/aurora";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const { callbackUrl } = await searchParams;
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.login" });

  // Only allow same-site relative redirects.
  const safeCallback = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : null;

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <Aurora className="-z-20" />
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <CursorGlow className="-z-10" />

      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/" className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:translate-x-0.5" />
          {t("back")}
        </Link>
        <div className="glass flex items-center rounded-full p-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-20">
        <div className="glass w-full max-w-sm rounded-3xl p-7 shadow-2xl sm:p-8">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-[0_8px_30px_-8px_var(--glow-brand)]">
            H
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-heading">{t("title")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("subtitle")}</p>
          <LoginForm callbackUrl={safeCallback} />
        </div>
      </div>
    </main>
  );
}
