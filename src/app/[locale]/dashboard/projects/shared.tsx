import "server-only";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";

/** Known technologies (skills + tags already used) offered as tag suggestions in the project form. */
export async function techSuggestions() {
  const [projects, skills] = await Promise.all([db.project.findMany({ select: { techStack: true } }), db.skill.findMany({ select: { name: true } })]);
  return [...new Set([...skills.map((s) => s.name), ...projects.flatMap((p) => p.techStack)])].sort((a, b) => a.localeCompare(b));
}

export function BackLink({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="sm" className="-ms-3 mb-3 text-muted-foreground" asChild>
      <Link href="/dashboard/projects">
        <ArrowLeftIcon className="rtl:-scale-x-100" />
        {label}
      </Link>
    </Button>
  );
}
