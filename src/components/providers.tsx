"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Direction } from "radix-ui";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// next-themes renders an inline <script> to set the theme before paint. React 19 warns when a
// script element is rendered on the client, so it is only typed as JS in the server HTML.
const themeScriptProps = { type: typeof window === "undefined" ? "text/javascript" : "text/plain" } as const;

export function Providers({ children, dir }: { children: React.ReactNode; dir: "ltr" | "rtl" }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange scriptProps={themeScriptProps}>
      <Direction.Provider dir={dir}>
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            {children}
            <Toaster position={dir === "rtl" ? "bottom-left" : "bottom-right"} dir={dir} />
          </TooltipProvider>
        </MotionConfig>
      </Direction.Provider>
    </ThemeProvider>
  );
}
