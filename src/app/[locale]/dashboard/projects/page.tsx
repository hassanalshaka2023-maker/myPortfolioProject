import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { ProjectsTable } from "./projects-table";

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.projects" });

  const projects = await db.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, titleEn: true, titleAr: true, coverImage: true, status: true, featured: true, published: true, updatedAt: true, techStack: true },
  });

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <PlusIcon />
              {t("new")}
            </Link>
          </Button>
        }
      />
      <ProjectsTable projects={projects.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }))} />
    </>
  );
}
