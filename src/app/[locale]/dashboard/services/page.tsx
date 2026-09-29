import { getTranslations, setRequestLocale } from "next-intl/server";
import { EyeOffIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { ServicesManager } from "./services-manager";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.services" });
  const [services, settings] = await Promise.all([
    db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, titleEn: true, titleAr: true, descriptionEn: true, descriptionAr: true, icon: true, published: true } }),
    db.siteSettings.findUnique({ where: { id: 1 }, select: { showServices: true } }),
  ]);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {!settings?.showServices && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm">
          <span className="flex items-center gap-2">
            <EyeOffIcon className="size-4 text-brand-text" />
            {t("hiddenNotice")}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/settings#visibility">{t("enableInSettings")}</Link>
          </Button>
        </div>
      )}
      <ServicesManager services={services} />
    </>
  );
}
