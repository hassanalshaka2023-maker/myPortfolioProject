"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Markdown } from "@/components/site/markdown";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Markdown textarea with a Write / Preview toggle. */
export function MarkdownEditor({
  id,
  value,
  onChange,
  onBlur,
  lang,
  rows = 10,
  invalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  lang: "en" | "ar";
  rows?: number;
  invalid?: boolean;
}) {
  const t = useTranslations("dashboard.common");
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="overflow-hidden rounded-lg border border-input focus-within:border-brand/60 focus-within:ring-[3px] focus-within:ring-brand/20">
      <div className="flex border-b bg-foreground/[0.02] px-1.5 pt-1.5" role="tablist">
        {(["write", "preview"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px rounded-t-md border border-transparent px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
              tab === key && "border-border border-b-background bg-background text-foreground",
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>
      {tab === "write" ? (
        <Textarea
          id={id}
          value={value}
          rows={rows}
          dir={lang === "ar" ? "rtl" : "ltr"}
          lang={lang}
          aria-invalid={invalid}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="rounded-none border-0 font-mono text-[0.8125rem] shadow-none focus-visible:ring-0"
        />
      ) : (
        <div className="min-h-40 p-4" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
          {value.trim() ? <Markdown className="text-sm">{value}</Markdown> : <p className="text-sm text-muted-foreground">{t("nothingToPreview")}</p>}
        </div>
      )}
    </div>
  );
}
