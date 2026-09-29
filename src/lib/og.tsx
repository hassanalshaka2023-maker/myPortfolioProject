import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "src/assets/og", file));

const C = {
  bg: "#0e0d12",
  fg: "#f6f3ee",
  muted: "#a3a1ad",
  border: "rgba(255,255,255,0.09)",
  amber: "#f5b544",
  violet: "#c4a7f5",
};

/**
 * Branded 1200×630 share card. Text is Latin-only on purpose: the OG renderer (Satori) has no Arabic
 * shaping, so Arabic pages share the English card rather than showing disconnected letters.
 * `*word*` in the title is rendered as the italic amber accent, matching the site headline.
 */
export async function renderOgCard({ eyebrow, title, subtitle, tags = [], footer }: { eyebrow: string; title: string; subtitle?: string; tags?: string[]; footer: string }) {
  const [semibold, regular, serif, mono] = await Promise.all([
    font("Geist-SemiBold.woff"),
    font("Geist-Regular.woff"),
    font("InstrumentSerif-Italic.woff"),
    font("GeistMono-Regular.woff"),
  ]);

  // One span per word so Satori can wrap the title; *highlighted* phrases stay together.
  const words: { text: string; accent: boolean }[] = [];
  for (const part of title.split(/(\*[^*]+\*)/g).filter(Boolean)) {
    if (part.startsWith("*") && part.endsWith("*")) words.push({ text: part.slice(1, -1), accent: true });
    else for (const w of part.split(/\s+/).filter(Boolean)) words.push({ text: w, accent: false });
  }
  const length = title.replace(/\*/g, "").length;
  const fontSize = length > 48 ? 60 : length > 30 ? 70 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          color: C.fg,
          fontFamily: "Geist",
          backgroundColor: C.bg,
          // Glows as full-size gradients: Satori has no blur, and clipped glow boxes show hard edges.
          backgroundImage:
            "radial-gradient(circle at 88% 8%, rgba(245,181,68,0.30) 0%, rgba(245,181,68,0) 42%), radial-gradient(circle at 8% 105%, rgba(170,130,245,0.30) 0%, rgba(170,130,245,0) 48%)",
        }}
      >
        {/* hairline grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            opacity: 0.55,
          }}
        />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "64px 72px" }}>
          {/* top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 9999, background: C.amber, color: "#241a08", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600 }}>H</div>
              <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 22, color: C.muted }}>
                hassan<span style={{ color: C.amber }}>.dev</span>
              </div>
            </div>
            <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 18, color: C.amber, letterSpacing: 3, textTransform: "uppercase" }}>{eyebrow}</div>
          </div>

          {/* title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", fontSize, fontWeight: 600, lineHeight: 1.08, letterSpacing: -2.5, maxWidth: 1040 }}>
              {words.map((w, i) => (
                <span
                  key={i}
                  style={
                    w.accent
                      ? { fontFamily: "Instrument Serif", fontWeight: 400, color: C.amber, letterSpacing: -1, marginRight: fontSize * 0.28 }
                      : { marginRight: fontSize * 0.24 }
                  }
                >
                  {w.text}
                </span>
              ))}
            </div>
            {subtitle && <div style={{ display: "flex", fontSize: 28, lineHeight: 1.4, color: C.muted, maxWidth: 940 }}>{subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}</div>}
          </div>

          {/* footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {tags.slice(0, 5).map((tag) => (
                <div key={tag} style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 18, color: C.fg, padding: "8px 16px", borderRadius: 9999, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)" }}>
                  {tag}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 22, color: C.muted }}>{footer}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Instrument Serif", data: serif, weight: 400, style: "italic" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
