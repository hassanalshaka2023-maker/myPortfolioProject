"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Translates a validation key ("required", "invalidUrl", …) into the current language. */
export function useValidationMessage() {
  const t = useTranslations("dashboard.validation");
  return (key?: string) => {
    if (!key) return undefined;
    const k = key as Parameters<typeof t>[0];
    return t.has(k) ? t(k) : key;
  };
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  lang,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Shows a small EN / ع marker next to the label for bilingual pairs */
  lang?: "en" | "ar";
  children: React.ReactNode;
  className?: string;
}) {
  const msg = useValidationMessage();
  const tc = useTranslations("dashboard.common");
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={htmlFor} className="justify-between">
        <span className="flex items-center gap-2">
          {label}
          {optional && <span className="text-xs font-normal text-muted-foreground">({tc("optional")})</span>}
        </span>
        {lang && (
          <span className="rounded border px-1.5 py-px font-mono text-[0.65rem] font-normal text-muted-foreground">{lang === "en" ? "EN" : "ع"}</span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-xs text-destructive" role="alert">
          {msg(error)}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Two fields side by side: English (LTR) and Arabic (RTL). */
export function BilingualRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

/** Props that make an input match its language regardless of the dashboard's own direction. */
export const langProps = (lang: "en" | "ar") => ({ dir: lang === "ar" ? "rtl" : "ltr", lang }) as const;
