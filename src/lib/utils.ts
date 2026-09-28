import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "My Project — v2!" → "my-project-v2". Keeps Arabic letters so Arabic-only titles still produce a slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

export function formatDate(date: Date | string, locale: string, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-US", opts).format(new Date(date));
}
