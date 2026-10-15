# Placeholder photo manifest

Every file in this folder (and `store/`) is a generated SVG stand-in — branded,
labelled, and safe to ship, but not a real photo. Regenerate them at any time
with `node scripts/gen-placeholders.mjs`.

To go live, shoot/collect real photography and either:

1. **Replace in place** — export the real photo as an `.svg`-named file? No:
   rename your real photo to match, e.g. `hero-celebration.jpg`, then update
   the single path in `src/content/media.ts` (and the matching product image
   array in `prisma/seed.ts` or the admin Products screen) to point at it.
   This is the recommended path — one file, one line changed.
2. Or re-upload via **Admin → Products / Success Stories** once Supabase
   Storage is configured — those records store their own image URLs and don't
   go through this folder at all.

## Editorial photos (`content/media.ts`)

| File | Used on | Real photo needed |
|---|---|---|
| `hero-celebration.svg` | Home hero | Wide celebration/action shot, players in kit, landscape |
| `team-scl-2025.svg` | Academy / Achievements | First Team squad photo, SCL 2025 |
| `pitch-rimbayu.svg` | Academy / Training / footer map card | FootballHub Rimbayu pitch, wide daylight shot |
| `training-session.svg` | Home / Training | Academy age-group training session in progress |
| `academy-kids.svg` | Programmes (Foundation) | U6–U14 Foundation group, training or match |
| `u18-squad.svg` | Achievements (youth feature) | U18 Performance squad photo |
| `match-action.svg` | Achievements / Home marquee break | In-game action shot, any age group |
| `success-story-1/2/3.svg` | Success Stories | Portrait of the specific player each story is about |

## Store product photos (`store/`)

8 product placeholders matching `prisma/seed.ts` — `home-kit`, `away-kit`,
`training-tee`, `training-shorts`, `training-socks`, `cap`, `backpack`,
`bottle`. Product photography should be square (1:1), plain background, one
item per shot; additional angles can be added to a product's `images` array
in the admin panel.

## Crest

`public/brand/crest.svg` is a hand-drawn placeholder of the ship's-wheel/HKS
badge described in the club guide. Replace with the real crest artwork
(ideally SVG or a high-resolution transparent PNG) at the same path — every
component references `/brand/crest.svg` directly.
