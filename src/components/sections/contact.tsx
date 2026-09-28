import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/effects/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { socialLinks } from "@/components/site/social-icons";
import type { PublicSettings } from "@/server/queries";
import { ContactForm } from "./contact-form";

export async function Contact({ settings, locale, index }: { settings: PublicSettings; locale: string; index: string }) {
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "contact" });
  const links = socialLinks(settings, { includeContact: true });

  return (
    <section id="contact" className="relative isolate overflow-hidden py-28 md:py-36">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,var(--glow-brand),transparent_70%)] opacity-60"
      />
      <div className="container-page">
        <SectionHeading index={index} eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <Reveal className="flex flex-col gap-3">
            {links.map(({ key, label, href, Icon }) => (
              <a
                key={key}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-4 rounded-2xl border bg-card/50 p-4 transition-all duration-300 hover:border-brand/40 hover:bg-card"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border bg-background text-muted-foreground transition-colors group-hover:text-brand-text">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 truncate font-medium" dir={key === "email" || key === "phone" ? "ltr" : undefined}>
                  {label}
                </span>
              </a>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="glass rounded-3xl p-6 sm:p-8">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
