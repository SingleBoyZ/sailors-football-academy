/**
 * Central registry of every editorial photo used across the site.
 * Every value here is a placeholder SVG under /public/placeholders — see
 * public/placeholders/README.md for the exact real-photo shot list.
 * Swap files in place (keep filenames) and nothing in the app needs to change.
 */
export const MEDIA = {
  heroCelebration: "/placeholders/hero-celebration.svg",
  teamSCL2025: "/placeholders/team-scl-2025.svg",
  pitchRimbayu: "/placeholders/pitch-rimbayu.svg",
  trainingSession: "/placeholders/training-session.svg",
  academyKids: "/placeholders/academy-kids.svg",
  u18Squad: "/placeholders/u18-squad.svg",
  matchAction: "/placeholders/match-action.svg",
  successStory1: "/placeholders/success-story-1.svg",
  successStory2: "/placeholders/success-story-2.svg",
  successStory3: "/placeholders/success-story-3.svg",
} as const;

export type MediaKey = keyof typeof MEDIA;
