"use client";

import { motion, type Transition } from "framer-motion";

/**
 * A jagged "crack" seam splitting the screen into two puzzle-fit panels —
 * shared by Preloader (page load) and RouteTransitionOverlay (in-app nav to
 * home) so both play the same dramatic split: the right panel always exits
 * upward, the left panel always exits downward.
 */
const LEFT_CRACK_CLIP =
  "polygon(0% 0%, 54% 0%, 46% 12%, 58% 24%, 44% 38%, 60% 52%, 47% 66%, 56% 80%, 50% 100%, 0% 100%)";
const RIGHT_CRACK_CLIP =
  "polygon(54% 0%, 100% 0%, 100% 100%, 50% 100%, 56% 80%, 47% 66%, 60% 52%, 44% 38%, 58% 24%, 46% 12%)";

export type CrackY = "0%" | "-100%" | "100%";

type CrackPanelsProps = {
  /** "0%" = fully covering. Right panel exits toward "-100%" (up), left toward "100%" (down). */
  rightY: CrackY;
  leftY: CrackY;
  transition: Transition;
  leftDelay?: number;
  rightClassName?: string;
  leftClassName?: string;
  /** Fires once, timed off the right panel (no extra delay), for driving a shared phase machine. */
  onRightAnimationComplete?: () => void;
};

export function CrackPanels({
  rightY,
  leftY,
  transition,
  leftDelay = 0.08,
  rightClassName = "bg-brand-red",
  leftClassName = "bg-brand-ink",
  onRightAnimationComplete,
}: CrackPanelsProps) {
  return (
    <>
      <motion.div
        className={`absolute inset-0 ${rightClassName}`}
        style={{ clipPath: RIGHT_CRACK_CLIP }}
        animate={{ y: rightY }}
        transition={transition}
        onAnimationComplete={onRightAnimationComplete}
      />
      <motion.div
        className={`absolute inset-0 ${leftClassName}`}
        style={{ clipPath: LEFT_CRACK_CLIP }}
        animate={{ y: leftY }}
        transition={{ ...transition, delay: (transition.delay ?? 0) + leftDelay }}
      />
    </>
  );
}
