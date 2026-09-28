import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "lucide-react";
import { Aurora } from "@/components/effects/aurora";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations();
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 text-center">
      <Aurora className="-z-10 opacity-60" />
      <p className="text-gradient text-[8rem] font-semibold leading-none tracking-display sm:text-[12rem]">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-heading">{t("notFound.title")}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t("notFound.description")}</p>
      <Button asChild className="mt-8">
        <Link href="/">
          <ArrowLeftIcon className="rtl:-scale-x-100" />
          {t("common.backHome")}
        </Link>
      </Button>
    </main>
  );
}
