import { ArrowUpIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { localized } from "@/lib/i18n-fields";
import type { PublicSettings } from "@/server/queries";
import { socialLinks } from "./social-icons";

export async function Footer({ settings, locale }: { settings: PublicSettings; locale: string }) {
  const t = await getTranslations({ locale: locale as "en" | "ar" });
  const name = localized(settings, "name", locale);
  const links = socialLinks(settings);

  return (
    <footer className="relative overflow-hidden border-t">
      <div className="container-page flex flex-col gap-10 py-14">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <p className="text-balance text-4xl font-semibold leading-none tracking-display text-foreground/90 sm:text-6xl">
            {name}
            <span className="text-brand">.</span>
          </p>
          <div className="flex items-center gap-2">
            {links.map(({ key, label, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-11 place-items-center rounded-full border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand-text"
              >
                <Icon className="size-4" />
              </a>
            ))}
            <a
              href="#top"
              aria-label={t("common.backToTop")}
              className="grid size-11 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 hover:-translate-y-1"
            >
              <ArrowUpIcon className="size-4" />
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {name}. {t("footer.rights")}
          </p>
          <p className="font-mono text-xs">
            {t("footer.built")} {name}
          </p>
        </div>
      </div>
    </footer>
  );
}
