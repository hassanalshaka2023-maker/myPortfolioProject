import { OG_SIZE, renderOgCard } from "@/lib/og";
import { getSettings, getSkills } from "@/server/queries";

export const alt = "Hassan Alsheikha — Full-Stack Developer";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [settings, skills] = await Promise.all([getSettings().catch(() => null), getSkills().catch(() => [])]);
  return renderOgCard({
    eyebrow: settings?.roleEn ?? "Full-Stack Developer",
    title: settings?.taglineEn ?? "I build *scalable* Full-Stack solutions.",
    tags: skills.slice(0, 5).map((s) => s.name),
    footer: settings?.nameEn ?? "Hassan Alsheikha",
  });
}
