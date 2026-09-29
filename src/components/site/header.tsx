"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavItem = { id: string; label: string };

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header({ brand, items }: { brand: string; items: NavItem[] }) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollY } = useScroll();

  // Compact on scroll; hide when scrolling down fast, reveal on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 400 && y > prev + 4 && !open);
    if (y < prev - 4) setHidden(false);
  });

  // Highlight the section currently in view.
  useEffect(() => {
    if (!isHome) return;
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome, items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="fixed start-4 top-4 z-[70] -translate-y-20 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0"
      >
        {t("skipToContent")}
      </a>

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          aria-label={t("mainNav")}
          className={cn(
            "flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-transparent py-2 pe-2 ps-5 transition-all duration-500 ease-out-expo",
            (scrolled || open) && "glass shadow-[0_8px_40px_-12px_rgb(0_0_0/0.35)]",
          )}
        >
          <Link href="/" className="group flex items-center gap-2 font-mono text-sm font-medium" onClick={() => setOpen(false)}>
            <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-transform duration-500 ease-out-expo group-hover:rotate-[360deg]">
              {brand.charAt(0)}
            </span>
            <span className="hidden sm:inline">
              {brand.split(" ")[0]?.toLowerCase()}
              <span className="text-brand-text">.dev</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/#${item.id}`}
                  className={cn(
                    "relative isolate rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    active === item.id && "text-foreground",
                  )}
                >
                  {active === item.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-foreground/[0.07]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-0.5">
            <LocaleSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <XIcon /> : <MenuIcon />}
            </Button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex h-full flex-col justify-center gap-2 px-8">
              {items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={`/#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-2 text-4xl font-semibold tracking-display"
                  >
                    <span className="font-mono text-xs text-brand-text">{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
