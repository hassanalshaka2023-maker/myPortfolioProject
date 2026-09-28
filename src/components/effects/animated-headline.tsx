"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Headline that rises in word by word from behind a mask. Supports the `*highlight*` syntax.
 * Splits on words only (never letters), so Arabic shaping stays intact.
 */
export function AnimatedHeadline({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words: { word: string; accent: boolean }[] = [];
  for (const part of text.split(/(\*[^*]+\*)/g).filter(Boolean)) {
    // A highlighted phrase stays one unit so its gradient spans the whole phrase.
    if (part.startsWith("*") && part.endsWith("*")) words.push({ word: part.slice(1, -1), accent: true });
    else for (const word of part.split(/\s+/).filter(Boolean)) words.push({ word, accent: false });
  }

  return (
    <h1 className={className} aria-label={text.replace(/\*/g, "")}>
      {words.map(({ word, accent }, i) => (
        <Fragment key={i}>
        <span aria-hidden className="inline-flex overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className={cn("inline-block", accent && "accent-word text-gradient")}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.06 }}
          >
            {word}
          </motion.span>
        </span>
        {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </h1>
  );
}
