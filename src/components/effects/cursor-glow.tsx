"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Soft amber light that follows the pointer inside its (relatively positioned) parent,
 * with a lavender halo trailing slightly behind. Disabled on touch devices and for reduced motion.
 */
export function CursorGlow({ className, size = 560 }: { className?: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const visible = useMotionValue(0);

  const fastX = useSpring(x, { stiffness: 180, damping: 24, mass: 0.5 });
  const fastY = useSpring(y, { stiffness: 180, damping: 24, mass: 0.5 });
  const slowX = useSpring(x, { stiffness: 50, damping: 18, mass: 1 });
  const slowY = useSpring(y, { stiffness: 50, damping: 18, mass: 1 });
  const opacity = useSpring(visible, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
      visible.set(1);
    };
    const onLeave = () => visible.set(0);

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion, x, y, visible]);

  const brand = useMotionTemplate`radial-gradient(${size / 2}px circle at ${fastX}px ${fastY}px, var(--glow-brand), transparent 70%)`;
  const violet = useMotionTemplate`radial-gradient(${size}px circle at ${slowX}px ${slowY}px, var(--glow-violet), transparent 70%)`;

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div className="absolute inset-0" style={{ background: violet, opacity }} />
      <motion.div className="absolute inset-0 mix-blend-plus-lighter dark:mix-blend-screen" style={{ background: brand, opacity }} />
    </div>
  );
}
