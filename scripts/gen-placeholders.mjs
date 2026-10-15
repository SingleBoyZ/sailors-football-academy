// Regenerates branded SVG placeholders under public/placeholders.
// Run with: node scripts/gen-placeholders.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "placeholders");
const storeDir = path.join(outDir, "store");
mkdirSync(storeDir, { recursive: true });

const RED = "#e8232a";
const INK = "#0f0f10";
const SAND = "#f7f5f2";

function photoPlaceholder(label, sublabel, w = 1200, h = 900) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label} placeholder photo">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INK}" />
      <stop offset="1" stop-color="#2a2a2c" />
    </linearGradient>
    <pattern id="stripes" width="80" height="80" patternTransform="rotate(115)" patternUnits="userSpaceOnUse">
      <rect width="80" height="80" fill="transparent" />
      <rect width="28" height="80" fill="${RED}" opacity="0.18" />
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <rect width="${w}" height="${h}" fill="url(#stripes)" />
  <text x="${w / 2}" y="${h / 2 - 10}" font-family="Arial, sans-serif" font-weight="800" font-size="${Math.round(w / 16)}" fill="${SAND}" text-anchor="middle" letter-spacing="2">${label}</text>
  <text x="${w / 2}" y="${h / 2 + Math.round(w / 22)}" font-family="Arial, sans-serif" font-weight="500" font-size="${Math.round(w / 40)}" fill="${RED}" text-anchor="middle" letter-spacing="4">${sublabel}</text>
</svg>`;
}

function productPlaceholder(label) {
  const w = 900;
  const h = 900;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label} product placeholder">
  <rect width="${w}" height="${h}" fill="${SAND}" />
  <rect x="40" y="40" width="${w - 80}" height="${h - 80}" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="10 8" />
  <circle cx="${w / 2}" cy="${h / 2 - 60}" r="110" fill="none" stroke="${RED}" stroke-width="6" />
  <text x="${w / 2}" y="${h / 2 - 50}" font-family="Arial, sans-serif" font-weight="800" font-size="34" fill="${INK}" text-anchor="middle">SFA</text>
  <text x="${w / 2}" y="${h / 2 + 140}" font-family="Arial, sans-serif" font-weight="700" font-size="40" fill="${INK}" text-anchor="middle">${label}</text>
  <text x="${w / 2}" y="${h / 2 + 190}" font-family="Arial, sans-serif" font-weight="500" font-size="22" fill="${RED}" text-anchor="middle" letter-spacing="3">PRODUCT PHOTO PLACEHOLDER</text>
</svg>`;
}

const photos = [
  ["hero-celebration", "SAILORS FA", "HERO — GOAL CELEBRATION PHOTO"],
  ["team-scl-2025", "SCL 2025", "FIRST TEAM SQUAD PHOTO"],
  ["pitch-rimbayu", "RIMBAYU", "FOOTBALLHUB RIMBAYU PITCH PHOTO"],
  ["training-session", "TRAINING", "ACADEMY TRAINING SESSION PHOTO"],
  ["academy-kids", "FOUNDATION", "U6–U14 FOUNDATION GROUP PHOTO"],
  ["u18-squad", "U18 SQUAD", "U18 PERFORMANCE SQUAD PHOTO"],
  ["match-action", "MATCH DAY", "IN-GAME ACTION PHOTO"],
  ["success-story-1", "SAILOR", "SUCCESS STORY PORTRAIT PHOTO"],
  ["success-story-2", "SAILOR", "SUCCESS STORY PORTRAIT PHOTO"],
  ["success-story-3", "SAILOR", "SUCCESS STORY PORTRAIT PHOTO"],
];

for (const [slug, label, sublabel] of photos) {
  writeFileSync(path.join(outDir, `${slug}.svg`), photoPlaceholder(label, sublabel));
}

const products = [
  ["home-kit", "HOME KIT"],
  ["away-kit", "AWAY KIT"],
  ["training-tee", "TRAINING TEE"],
  ["training-shorts", "TRAINING SHORTS"],
  ["training-socks", "TRAINING SOCKS"],
  ["cap", "CAP"],
  ["backpack", "BACKPACK"],
  ["bottle", "WATER BOTTLE"],
];

for (const [slug, label] of products) {
  writeFileSync(path.join(storeDir, `${slug}.svg`), productPlaceholder(label));
}

console.log(`Generated ${photos.length} photo placeholders and ${products.length} product placeholders.`);
