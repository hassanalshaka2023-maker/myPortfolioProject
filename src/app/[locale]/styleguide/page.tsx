import type { Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowUpRightIcon, DownloadIcon, SendIcon } from "lucide-react";
import { Aurora } from "@/components/effects/aurora";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { Reveal } from "@/components/effects/reveal";
import { HighlightText } from "@/components/highlight-text";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Internal design-system reference. Not available in production builds.
export const metadata = { title: "Design system", robots: { index: false } };

const SWATCHES = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["muted", "bg-muted"],
  ["foreground", "bg-foreground"],
  ["brand (amber)", "bg-brand"],
  ["violet", "bg-violet"],
  ["success", "bg-success"],
  ["info", "bg-info"],
  ["destructive", "bg-destructive"],
] as const;

export default async function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const isAr = locale === "ar";

  return (
    <main className="pb-32">
      {/* ─── Hero preview ─────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[92dvh] flex-col overflow-hidden">
        <Aurora className="-z-20" />
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <CursorGlow className="-z-10" />

        <header className="container-page flex items-center justify-between py-6">
          <span className="font-mono text-sm text-muted-foreground">
            hassan<span className="text-brand-text">.</span>dev
          </span>
          <div className="glass flex items-center gap-1 rounded-full p-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className="container-page flex flex-1 flex-col justify-center py-16">
          <Reveal>
            <Badge variant="outline" className="glass gap-2 py-1.5 ps-2 pe-3.5 text-foreground/80">
              <span className="size-2 animate-pulse-dot rounded-full bg-success" />
              {t("hero.available")}
            </Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 font-mono text-sm text-muted-foreground">
              {t("hero.greeting")} <span className="text-foreground">{isAr ? "حسان الشيخه" : "Hassan Alsheikha"}</span>
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold leading-[1.02] tracking-display sm:text-7xl lg:text-[5.75rem]">
              <HighlightText text={isAr ? "أبني حلولاً برمجية متكاملة *قابلة للتوسّع*." : "I build *scalable* Full-Stack solutions."} />
            </h1>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              {isAr
                ? "مطوّر MERN Stack وخرّيج هندسة البرمجيات من جامعة دمشق. متخصص في تصميم قواعد بيانات متينة، وواجهات برمجية (APIs) آمنة، وتجارب مستخدم فعّالة."
                : "MERN Stack Developer and Software Engineering graduate from Damascus University. I specialize in designing robust database architectures, secure backend APIs, and efficient user experiences."}
            </p>
          </Reveal>
          <Reveal delay={0.32} className="mt-10 flex flex-wrap gap-3">
            <Button size="lg">
              {t("hero.viewProjects")}
              <ArrowUpRightIcon className="rtl:-scale-x-100" />
            </Button>
            <Button size="lg" variant="glass">
              {t("hero.contact")}
            </Button>
            <Button size="lg" variant="ghost">
              <DownloadIcon />
              {t("hero.downloadCv")}
            </Button>
          </Reveal>
        </div>
      </section>

      <div className="container-page space-y-24">
        {/* ─── Colors ─────────────────────────────────────────── */}
        <Block title="Color tokens" note="Semantic tokens in globals.css — both themes, change --brand / --violet to re-skin.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SWATCHES.map(([name, cls]) => (
              <div key={name} className="overflow-hidden rounded-xl border">
                <div className={`h-20 ${cls}`} />
                <p className="px-3 py-2 font-mono text-xs text-muted-foreground">{name}</p>
              </div>
            ))}
          </div>
        </Block>

        {/* ─── Typography ─────────────────────────────────────── */}
        <Block title="Typography" note="Geist + Instrument Serif (accent) for English · IBM Plex Sans Arabic for Arabic · Geist Mono for labels.">
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-text">{t("projects.eyebrow")} — eyebrow</p>
            <p className="text-6xl font-semibold tracking-display">
              <HighlightText text={isAr ? "عنوان *عرض*" : "Display *heading*"} />
            </p>
            <p className="text-4xl font-semibold tracking-heading">{t("projects.title")} — H2</p>
            <p className="text-2xl font-medium tracking-heading">{t("about.title")} — H3</p>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("contact.description")} — body large, muted.
            </p>
            <p className="font-mono text-sm text-muted-foreground">const stack = [&quot;Node.js&quot;, &quot;NestJS&quot;, &quot;MongoDB&quot;]</p>
          </div>
        </Block>

        {/* ─── Buttons & badges ───────────────────────────────── */}
        <Block title="Buttons & badges">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Delete</Button>
            <Button size="sm">Small</Button>
            <Button disabled>Disabled</Button>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">{t("projects.status.COMPLETED")}</Badge>
            <Badge variant="brand">{t("projects.status.IN_PROGRESS")}</Badge>
            <Badge variant="violet">{t("projects.status.PLANNED")}</Badge>
            <Badge variant="outline">{t("projects.featured")}</Badge>
            {["Node.js", "NestJS", "React", "MongoDB", "TypeScript"].map((tech) => (
              <Badge key={tech} variant="tech">
                {tech}
              </Badge>
            ))}
          </div>
        </Block>

        {/* ─── Cards ──────────────────────────────────────────── */}
        <Block title="Surfaces" note="Plain card · glass panel · featured project card with gradient hairline border.">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6">
              <p className="font-medium">Card</p>
              <p className="mt-2 text-sm text-muted-foreground">Default surface for dashboard panels and lists.</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="font-medium">Glass</p>
              <p className="mt-2 text-sm text-muted-foreground">Floating nav, hero chips, overlays on imagery.</p>
            </div>
            <article className="group border-gradient relative overflow-hidden rounded-2xl bg-card transition-transform duration-500 ease-out-expo hover:-translate-y-1">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--glow-brand),transparent_60%),radial-gradient(circle_at_80%_80%,var(--glow-violet),transparent_60%)] transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                <Badge variant="success" className="glass absolute start-3 top-3">
                  {t("projects.status.COMPLETED")}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-semibold tracking-heading">ExpoPlan — Exhibition Management</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  An integrated monorepo platform for managing and organizing exhibitions.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Node.js", "Express.js", "React", "MongoDB"].map((tech) => (
                    <Badge key={tech} variant="tech">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </Block>

        {/* ─── Forms ──────────────────────────────────────────── */}
        <Block title="Form controls">
          <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sg-name">{t("contact.form.name")}</Label>
              <Input id="sg-name" placeholder={t("contact.form.namePlaceholder")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sg-email">{t("contact.form.email")}</Label>
              <Input id="sg-email" type="email" aria-invalid placeholder={t("contact.form.emailPlaceholder")} />
              <p className="text-xs text-destructive">{t("contact.validation.email")}</p>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="sg-msg">{t("contact.form.message")}</Label>
              <Textarea id="sg-msg" placeholder={t("contact.form.messagePlaceholder")} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select defaultValue="COMPLETED">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["COMPLETED", "IN_PROGRESS", "PLANNED"] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`projects.status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 self-end pb-2.5">
              <Switch id="sg-featured" defaultChecked />
              <Label htmlFor="sg-featured">{t("projects.featured")}</Label>
            </div>
            <Button className="w-fit">
              {t("contact.form.submit")}
              <SendIcon className="rtl:-scale-x-100" />
            </Button>
          </div>
        </Block>

        {/* ─── Loading ────────────────────────────────────────── */}
        <Block title="Loading skeletons">
          <div className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border">
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </Block>
      </div>
    </main>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="pt-24">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-xl font-semibold tracking-heading">{title}</h2>
        {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}
