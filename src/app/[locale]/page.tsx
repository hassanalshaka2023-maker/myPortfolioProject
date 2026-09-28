import type { Locale } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

// Temporary placeholder — replaced by the full public site in phase 3.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center gap-6 text-center">
      <p className="font-mono text-sm text-muted-foreground">Phase 2 — foundation ready</p>
      <h1 className="text-4xl font-semibold tracking-display">Hassan Alsheikha</h1>
      <Button asChild>
        <Link href="/styleguide">Open design system</Link>
      </Button>
    </main>
  );
}
