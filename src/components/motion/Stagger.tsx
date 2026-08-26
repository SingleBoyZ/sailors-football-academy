"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE_REVEAL, STAGGER } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const container: Variants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: { staggerChildren: staggerDelay },
  }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_REVEAL },
  },
};

const reducedItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  gap?: keyof typeof STAGGER;
  as?: "div" | "ul";
};

/** Container: wraps a list of <StaggerItem> and fires them in sequence on scroll into view. */
export function Stagger({ children, className, gap = "base", as = "div" }: StaggerProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      custom={STAGGER[gap]}
      variants={container}
    >
      {children}
    </Component>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];
  return (
    <Component className={className} variants={reducedMotion ? reducedItem : item}>
      {children}
    </Component>
  );
}
