"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { springMagnetic } from "@/lib/motion";

const MAX_PULL = 14;

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
};

/** Desktop-only cursor-following pull on primary CTAs. Inert (no-op) on touch. */
export function MagneticButton({ children, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springMagnetic);
  const springY = useSpring(y, springMagnetic);

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const relX = event.clientX - (bounds.left + bounds.width / 2);
    const relY = event.clientY - (bounds.top + bounds.height / 2);
    x.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, relX * 0.35)));
    y.set(Math.max(-MAX_PULL, Math.min(MAX_PULL, relY * 0.35)));
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  );
}
