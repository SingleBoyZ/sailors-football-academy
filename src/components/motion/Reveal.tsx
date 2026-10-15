"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE_REVEAL } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const variants: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)", y: 24 },
  visible: (delay: number) => ({
    clipPath: "inset(0% 0% 0% 0%)",
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_REVEAL, delay },
  }),
};

const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.2, delay },
  }),
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span";
};

/** Scroll-triggered clip-path reveal from the bottom — the site's default entrance. */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      custom={delay}
      variants={reducedMotion ? reducedVariants : variants}
    >
      {children}
    </Component>
  );
}
