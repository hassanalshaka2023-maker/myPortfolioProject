import { OG_SIZE, renderOgCard } from "@/lib/og";
import { getProjectBySlug, getSettings } from "@/server/queries";

export const alt = "Project case study";
export const size = OG_SIZE;
export const contentType = "image/png";

const STATUS = { COMPLETED: "Case study", IN_PROGRESS: "In progress", PLANNED: "Coming soon" } as const;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSettings()]);
  const name = settings?.nameEn ?? "Hassan Alsheikha";

  if (!project) return renderOgCard({ eyebrow: "Project", title: "Not found", footer: name });

  return renderOgCard({
    eyebrow: STATUS[project.status],
    title: project.titleEn,
    subtitle: project.summaryEn,
    tags: project.techStack,
    footer: name,
  });
}
