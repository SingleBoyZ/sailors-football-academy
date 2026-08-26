"use client";

import { motion } from "framer-motion";

const spokes = [
  [100, 52, 100, 148],
  [52, 100, 148, 100],
  [66, 66, 134, 134],
  [134, 66, 66, 134],
];

type CrestMarkProps = {
  className?: string;
  animate?: boolean;
};

/** Inline, animatable rendition of the ship's-wheel/HKS crest — used by the preloader for a stroke-draw intro. */
export function CrestMark({ className, animate = true }: CrestMarkProps) {
  const draw = (delay: number) => ({
    initial: animate ? { pathLength: 0, opacity: 0 } : undefined,
    animate: animate ? { pathLength: 1, opacity: 1 } : undefined,
    transition: { duration: 0.6, delay, ease: [0.65, 0, 0.35, 1] as const },
  });

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Sailors Football Academy crest">
      <motion.circle
        cx="100"
        cy="100"
        r="94"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        {...draw(0)}
      />
      {spokes.map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#e8232a"
          strokeWidth="5"
          strokeLinecap="round"
          {...draw(0.3 + i * 0.08)}
        />
      ))}
      <motion.circle
        cx="100"
        cy="100"
        r="44"
        fill="none"
        stroke="#e8232a"
        strokeWidth="5"
        {...draw(0.55)}
      />
      <motion.circle
        cx="100"
        cy="100"
        r="30"
        fill="var(--color-brand-red-dark)"
        initial={animate ? { scale: 0, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.4, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "100px 100px" }}
      />
      <motion.text
        x="100"
        y="107"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="var(--color-brand-sand)"
        textAnchor="middle"
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: 0.3, delay: 0.95 }}
      >
        HKS
      </motion.text>
    </svg>
  );
}
