/**
 * Single source of truth for animation timing across Framer Motion + GSAP.
 * Keep every duration/easing import from here so the site's motion language
 * stays consistent instead of hand-tuned per component.
 */

export const EASE_REVEAL = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  instant: 0.15,
  fast: 0.3,
  base: 0.5,
  reveal: 0.7,
  slow: 0.9,
  curtainPanel: 0.6,
  curtainHold: 0.25,
  preloaderLetters: 0.8,
} as const;

export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

export const SESSION_PRELOADER_KEY = "sfa-preloader-shown";

export const revealTransition = {
  duration: DURATION.reveal,
  ease: EASE_REVEAL,
} as const;

export const springDrawer = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 1,
};

export const springMagnetic = {
  type: "spring" as const,
  stiffness: 150,
  damping: 15,
  mass: 0.2,
};
