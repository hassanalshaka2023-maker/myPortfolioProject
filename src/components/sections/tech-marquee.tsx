import { TechIcon } from "@/components/site/tech-icon";
import type { PublicSkill } from "@/server/queries";

/** Infinite, edge-faded strip of the tech stack. Pauses on hover; static under reduced motion. */
export function TechMarquee({ skills }: { skills: PublicSkill[] }) {
  if (skills.length === 0) return null;
  const row = [...skills, ...skills];

  return (
    <div
      className="group relative flex overflow-hidden border-y py-6 [--marquee-gap:3rem] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
      aria-hidden
      dir="ltr"
    >
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          className="flex shrink-0 animate-marquee items-center gap-[var(--marquee-gap)] pe-[var(--marquee-gap)] group-hover:[animation-play-state:paused]"
        >
          {row.map((skill, i) => (
            <li key={`${skill.id}-${i}`} className="flex items-center gap-2.5 text-muted-foreground">
              <TechIcon slug={skill.icon} name={skill.name} className="size-5" />
              <span className="whitespace-nowrap font-mono text-sm">{skill.name}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
