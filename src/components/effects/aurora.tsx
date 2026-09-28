import { cn } from "@/lib/utils";

/** Slow-drifting blurred color fields. Pure CSS — frozen automatically under prefers-reduced-motion. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -top-[20%] start-[10%] h-[55vmax] w-[55vmax] animate-float rounded-full bg-[radial-gradient(circle,var(--glow-violet),transparent_65%)] blur-3xl" />
      <div
        className="absolute -top-[10%] end-[-10%] h-[45vmax] w-[45vmax] animate-float rounded-full bg-[radial-gradient(circle,var(--glow-brand),transparent_65%)] blur-3xl"
        style={{ animationDelay: "-6s", animationDirection: "reverse" }}
      />
      <div
        className="absolute bottom-[-30%] start-[35%] h-[40vmax] w-[40vmax] animate-float rounded-full bg-[radial-gradient(circle,var(--glow-violet),transparent_70%)] opacity-60 blur-3xl"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
