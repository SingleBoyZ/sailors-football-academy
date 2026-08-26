# Sailors Football Academy

Production website, member portal and admin panel for Sailors Football
Academy — the youth development arm of Royal Klang Sailors (RKS), Klang,
Selangor.

Stack: Next.js 15 (App Router) · Tailwind CSS v4 · Framer Motion · GSAP +
ScrollTrigger · Lenis · Prisma + PostgreSQL · Auth.js v5 · Zustand · Zod ·
Billplz v3 · Resend + React Email · @react-pdf/renderer · Supabase Storage.

## Getting started

```bash
npm install
cp .env.example .env      # fill in real values before anything payment/email related will work
docker compose up -d      # local Postgres 16
npm run db:push           # create tables from prisma/schema.prisma
npm run db:seed           # admin user, sample products, sample success stories, settings
npm run dev
```

Local dev admin login defaults to `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`
from `.env` (or `admin@sailorsfootballacademy.com` / `ChangeMe123!` if unset —
**change this before going live**).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | Push `schema.prisma` to the database (no migration history — good for local dev) |
| `npm run db:migrate` | Create a tracked migration (use this once schema is stable / in team dev) |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Prisma Studio |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright smoke tests |

## Environment variables

See `.env.example` — every variable is documented there, including where to
find it (Billplz dashboard, Supabase project settings, Google Cloud Console).

## Assets that still need to come from the client

- `public/brand/crest.svg` — currently a hand-drawn placeholder of the
  ship's-wheel/HKS badge. Replace with the real crest.
- `public/placeholders/**` — every editorial and product photo is a
  generated SVG placeholder. See `public/placeholders/README.md` for the
  exact shot list and how to swap each one in.

## Architecture notes

- **Money** is always an integer number of sen (`lib/money.ts`) — never a
  float — to avoid rounding bugs anywhere near payments.
- **Content** the client will want to edit without touching components lives
  as typed objects in `src/content/*.ts`.
- **Billplz** integration (`lib/billplz.ts`) creates bills, verifies callback
  and redirect signatures with a constant-time HMAC-SHA256 comparison, and
  re-confirms payment status with a `GET /bills/{id}` call before showing a
  success page — the redirect alone is never trusted.
- A fee **Payment** can settle more than one **Invoice** in one Billplz bill
  (e.g. registration + first month paid together). `PaymentAllocation` is an
  addition to the brief's schema sketch that records exactly how a payment's
  amount was split across invoices, oldest-first — needed to make partial
  payments and PDF receipt breakdowns correct.
- Prisma is pinned to the `6.19.3` stable line rather than an unqualified
  "latest" — `prisma@8.0.0` (npm's current `latest` tag) is a pre-release
  that moves the database URL out of `schema.prisma` into a separate driver
  adapter config, which would be a needless migration-in-progress for a
  from-scratch build.
- Supabase Storage is used for admin image uploads (the brief allowed either
  Uploadthing or Supabase Storage — Supabase was already in the stack for
  Postgres, so one vendor instead of two).

Build phases and current status are tracked in `PLAN.md`.
