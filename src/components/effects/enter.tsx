import { cn } from "@/lib/utils";

/**
 * CSS-only entrance for above-the-fold content. Unlike <Reveal>, it needs no JavaScript, so it starts
 * on first paint instead of after hydration — keeps LCP fast on slow phones.
 */
export function Enter({
  as: Comp = "div",
  delay = 0,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "p" | "span"; delay?: number }) {
  return <Comp className={cn("animate-enter", className)} style={{ animationDelay: `${delay}s`, ...style }} {...props} />;
}
