"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const next = locale === "ar" ? "en" : "ar";

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label={t("switchLanguage")}
      lang={next}
      onClick={() => startTransition(() => router.replace(pathname, { locale: next, scroll: false }))}
      className="font-medium"
    >
      {next === "ar" ? <span className="font-[family-name:var(--font-arabic)] text-base">ع</span> : <span className="text-xs tracking-wide">EN</span>}
    </Button>
  );
}
