import { ArrowUpRightIcon, DownloadIcon, MapPinIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Aurora } from "@/components/effects/aurora";
import { AnimatedHeadline } from "@/components/effects/animated-headline";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { Reveal } from "@/components/effects/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localized } from "@/lib/i18n-fields";
import type { PublicSettings } from "@/server/queries";

export async function Hero({ settings, locale }: { settings: PublicSettings; locale: string }) {
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "hero" });
  const location = localized(settings, "location", locale);

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-28">
      <Aurora className="-z-20" />
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <CursorGlow className="-z-10" />

      <div className="container-page flex flex-1 flex-col justify-center pb-24">
        <div className="flex flex-wrap items-center gap-3">
          {settings.openToWork && (
            <Reveal>
              <Badge variant="outline" className="glass gap-2 py-1.5 pe-3.5 ps-2 text-foreground/80">
                <span className="size-2 animate-pulse-dot rounded-full bg-success" />
                {t("available")}
              </Badge>
            </Reveal>
          )}
          {location && (
            <Reveal delay={0.05}>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5" />
                {location}
              </span>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 font-mono text-sm text-muted-foreground">
            {t("greeting")} <span className="text-foreground">{localized(settings, "name", locale)}</span>
            <span className="text-brand-text"> — {localized(settings, "role", locale)}</span>
          </p>
        </Reveal>

        <AnimatedHeadline
          text={localized(settings, "tagline", locale)}
          delay={0.2}
          className="mt-4 max-w-5xl text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-display sm:text-7xl lg:text-[5.75rem]"
        />

        <Reveal delay={0.5}>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">{localized(settings, "intro", locale)}</p>
        </Reveal>

        <Reveal delay={0.6} className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <a href="#projects">
              {t("viewProjects")}
              <ArrowUpRightIcon className="transition-transform duration-300 group-hover:rotate-45 rtl:-scale-x-100" />
            </a>
          </Button>
          <Button size="lg" variant="glass" asChild>
            <a href="#contact">{t("contact")}</a>
          </Button>
          {settings.cvUrl && (
            <Button size="lg" variant="ghost" asChild>
              <a href={settings.cvUrl} target="_blank" rel="noopener noreferrer" download>
                <DownloadIcon />
                {t("downloadCv")}
              </a>
            </Button>
          )}
        </Reveal>
      </div>

      <a
        href="#about"
        aria-label={t("scroll")}
        className="absolute bottom-8 start-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground md:flex rtl:translate-x-1/2"
      >
        <span className="font-mono uppercase tracking-[0.2em]">{t("scroll")}</span>
        <span className="relative h-10 w-px overflow-hidden bg-border">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-line_2s_ease-in-out_infinite] bg-brand" />
        </span>
      </a>
    </section>
  );
}
