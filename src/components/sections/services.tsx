import { getTranslations } from "next-intl/server";
import { RevealGroup, RevealItem } from "@/components/effects/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { localized } from "@/lib/i18n-fields";
import { serviceIcon } from "@/lib/service-icons";
import type { PublicService } from "@/server/queries";

export async function Services({ services, locale, index }: { services: PublicService[]; locale: string; index: string }) {
  if (services.length === 0) return null;
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "services" });

  return (
    <section id="services" className="container-page py-28 md:py-36">
      <SectionHeading index={index} eyebrow={t("eyebrow")} title={t("title")} />
      <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const Icon = serviceIcon(service.icon);
          return (
            <RevealItem key={service.id} className="group relative bg-background p-8 transition-colors duration-500 hover:bg-card">
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-6 grid size-12 place-items-center rounded-2xl border bg-card text-brand-text transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:rotate-[-6deg]">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-heading">{localized(service, "title", locale)}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{localized(service, "description", locale)}</p>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
