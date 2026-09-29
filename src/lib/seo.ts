import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/utils";

/** Public URL of `path` in `locale` ("as-needed" prefix: English has none). */
export function localeUrl(locale: string, path = "") {
  const clean = path === "/" ? "" : path;
  return siteUrl(`${locale === routing.defaultLocale ? "" : `/${locale}`}${clean}`) || siteUrl("/");
}

/** canonical + hreflang alternates for a page that exists in every locale. */
export function alternates(locale: string, path = ""): Metadata["alternates"] {
  return {
    canonical: localeUrl(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localeUrl(l, path)])),
      "x-default": localeUrl(routing.defaultLocale, path),
    },
  };
}

export const ogLocale = (locale: string) => (locale === "ar" ? "ar_SY" : "en_US");

/** JSON-LD must not break out of its <script> tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
