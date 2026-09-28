import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders `*word*` segments as the brand accent (italic serif in English, bold gradient in Arabic).
 * Lets headlines edited from the dashboard keep the signature style: "I build *scalable* solutions."
 */
export function HighlightText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className={cn("accent-word text-gradient", className)}>
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function stripHighlight(text: string) {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
