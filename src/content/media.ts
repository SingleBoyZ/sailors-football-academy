/**
 * Central registry of every editorial photo used across the site.
 * Every value here is a placeholder SVG under /public/placeholders — see
 * public/placeholders/README.md for the exact real-photo shot list.
 * Swap files in place (keep filenames) and nothing in the app needs to change.
 */
export const MEDIA = {
  /** Real photos (not placeholders) — swap these files directly to update. */
  heroBackground: "/assets/hero-bg.jpg",
  trainingPhoto: "/assets/training-photo.jpg",
  academyBanner: "/assets/academy-banner.jpg",
  footballPitch: "/assets/football-pitch.png",
  u16Squad: "/assets/u16.jpg",
  programmesBanner: "/assets/programmes-banner.jpg",
  pathway1: "/assets/pathway-01.jpg",
  pathway2: "/assets/pathway-02.jpg",
  pathway3: "/assets/pathway-03.jpg",
  pathway4: "/assets/pathway-04.jpg",
  pathway5: "/assets/pathway-05.jpg",
  achievementsBanner: "/assets/achievements-banner.jpg",
  fivePlayerCelebration: "/assets/five-player.jpeg",
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
