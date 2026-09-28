"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Counts from 0 to `value` the first time it scrolls into view. */
export function CountUp({ value, suffix = "", locale }: { value: number; suffix?: string; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const format = (n: number) => new Intl.NumberFormat(locale === "ar" ? "ar-SY" : "en-US").format(Math.round(n)) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduceMotion) {
      el.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => (el.textContent = format(n)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(reduceMotion ? value : 0)}
    </span>
  );
}
