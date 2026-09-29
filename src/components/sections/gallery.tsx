"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const t = useTranslations("common");
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const step = useCallback((dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (!open) return;
    const rtl = document.documentElement.dir === "rtl";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {images.map((src, i) => (
          <li key={src} className={i === 0 && images.length % 2 === 1 ? "sm:col-span-2" : undefined}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted"
              aria-label={`${title} — ${i + 1} / ${images.length}`}
            >
              {/* Screenshots come in any shape (wide desktop, tall phone): show the whole image over a blurred fill of itself. */}
              <Image src={src} alt="" aria-hidden fill sizes="64px" className="scale-110 object-cover opacity-40 blur-2xl" />
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-contain p-3 drop-shadow-xl transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent className="max-w-6xl border-none bg-transparent p-0 shadow-none" showCloseButton>
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {index !== null && (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black">
              <Image src={images[index]!} alt="" fill sizes="90vw" className="object-contain" />
            </div>
          )}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="glass" size="icon" onClick={() => step(-1)} aria-label={t("previous")}>
                <ChevronLeftIcon className="rtl:-scale-x-100" />
              </Button>
              <span className="font-mono text-sm text-white/80">
                {(index ?? 0) + 1} / {images.length}
              </span>
              <Button variant="glass" size="icon" onClick={() => step(1)} aria-label={t("next")}>
                <ChevronRightIcon className="rtl:-scale-x-100" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
