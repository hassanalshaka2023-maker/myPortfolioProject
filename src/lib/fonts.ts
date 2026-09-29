import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic, Instrument_Serif } from "next/font/google";

// Only fonts needed for the first paint of the (English) hero are preloaded; the rest load normally
// with font-display: swap, so they don't compete for bandwidth with the LCP on slow connections.

export const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false });

/** Editorial italic accent for English headlines ("I build *scalable* …"). */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic", // only the italic accent is used
  variable: "--font-instrument",
  display: "swap",
});

/** 500 isn't loaded: `font-medium` falls back to 400, which reads well in Arabic. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

export const fontVariables = [geist.variable, geistMono.variable, instrumentSerif.variable, plexArabic.variable].join(" ");
