"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="overflow-hidden"
    >
      {/* Icons are switched with CSS so there is no hydration flash */}
      <SunIcon className="rotate-0 scale-100 transition-transform duration-500 ease-out-expo dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute rotate-90 scale-0 transition-transform duration-500 ease-out-expo dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
