import { Reveal } from "@/components/effects/reveal";
import { HighlightText } from "@/components/highlight-text";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  className,
  align = "start",
}: {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <Reveal className={cn("mb-12 max-w-3xl md:mb-16", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-text", align === "center" && "justify-center")}>
        {index && <span className="text-muted-foreground">{index}</span>}
        <span className="h-px w-8 bg-brand/50" aria-hidden />
        {eyebrow}
      </p>
      <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-display sm:text-5xl md:text-6xl">
        <HighlightText text={title} />
      </h2>
      {description && <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">{description}</p>}
    </Reveal>
  );
}
