"use client";

import { motion, type Variants } from "framer-motion";
import { DURATION, EASE_REVEAL, STAGGER } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.05 } },
};

const word: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: DURATION.slow, ease: EASE_REVEAL } },
};

const reducedWord: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  span: motion.span,
  p: motion.p,
} as const;

type SplitTextProps = {
  text: string;
  as?: keyof typeof TAGS;
  className?: string;
  wordClassName?: string;
  triggerOnMount?: boolean;
};

/** Per-word masked rise, used for the site's big display headings. */
export function SplitText({
  text,
  as = "h2",
  className,
  wordClassName,
  triggerOnMount = false,
}: SplitTextProps) {
  const reducedMotion = useReducedMotion();
  const Component = TAGS[as];
  const words = text.split(" ");

  return (
    <Component
      className={className}
      initial="hidden"
      {...(triggerOnMount
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, margin: "-10% 0px" } })}
      variants={container}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden align-bottom pb-[0.08em]"
        >
          <motion.span
            className={cn("inline-block", wordClassName)}
            variants={reducedMotion ? reducedWord : word}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
