import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeDir } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { ogLocale } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";
import { Providers } from "@/components/providers";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const name = locale === "ar" ? "حسان الشيخه" : "Hassan Alsheikha";

  // Page-specific canonical/alternates are set by each page, not here, so child pages never inherit the home canonical.
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${name} — ${t("titleSuffix")}`, template: `%s · ${name}` },
    description: t("description"),
    applicationName: name,
    authors: [{ name: "Hassan Alsheikha", url: siteUrl() }],
    creator: "Hassan Alsheikha",
    openGraph: { type: "website", siteName: name, locale: ogLocale(locale), alternateLocale: routing.locales.filter((l) => l !== locale).map(ogLocale) },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0d12" },
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
  ],
  colorScheme: "dark light",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const dir = localeDir(locale);

  return (
    <html lang={locale} dir={dir} className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Tech logos are served from jsDelivr */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
      </head>
      <body className="grain min-h-dvh">
        <NextIntlClientProvider>
          <Providers dir={dir}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
