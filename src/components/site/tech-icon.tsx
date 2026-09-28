import { cn } from "@/lib/utils";

/**
 * Monochrome simple-icons logo tinted with currentColor (CSS mask), so it adapts to both themes.
 * `slug` is the simple-icons slug, e.g. "nodedotjs". Falls back to the first letter.
 */
export function TechIcon({ slug, name, className }: { slug: string | null; name: string; className?: string }) {
  if (!slug) {
    return (
      <span aria-hidden className={cn("inline-grid size-5 shrink-0 place-items-center rounded font-mono text-[0.65rem] font-bold", className)}>
        {name.slice(0, 2)}
      </span>
    );
  }
  const url = `url(https://cdn.jsdelivr.net/npm/simple-icons@15/icons/${slug}.svg)`;
  return (
    <span
      aria-hidden
      className={cn("inline-block size-5 shrink-0 bg-current", className)}
      style={{ maskImage: url, WebkitMaskImage: url, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
    />
  );
}
