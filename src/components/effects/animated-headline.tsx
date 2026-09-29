import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Headline that rises in word by word from behind a mask (pure CSS — no hydration needed).
 * Supports the `*highlight*` syntax; a highlighted phrase stays one unit so its gradient spans it.
 * Splits on words only (never letters), so Arabic shaping stays intact.
 */
export function AnimatedHeadline({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words: { word: string; accent: boolean }[] = [];
  for (const part of text.split(/(\*[^*]+\*)/g).filter(Boolean)) {
    if (part.startsWith("*") && part.endsWith("*")) words.push({ word: part.slice(1, -1), accent: true });
    else for (const word of part.split(/\s+/).filter(Boolean)) words.push({ word, accent: false });
  }

  return (
    <h1 className={className} aria-label={text.replace(/\*/g, "")}>
      {words.map(({ word, accent }, i) => (
        <Fragment key={i}>
          <span aria-hidden className="inline-flex overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <span className={cn("animate-rise inline-block", accent && "accent-word text-gradient")} style={{ animationDelay: `${delay + i * 0.06}s` }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </h1>
  );
}
