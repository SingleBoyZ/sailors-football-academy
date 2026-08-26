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
| `npm test` | Vitest unit tests (pricing helpers, Billplz signature verification) |
| `npm run test:e2e` | Playwright smoke tests — needs the dev server's DB reachable and seeded |

## Environment variables

See `.env.example` — every variable is documented there, including where to
find it (Billplz dashboard, Supabase project settings, Google Cloud Console).

## Deployment (Vercel + Supabase + Billplz)

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. **Database**: Settings → Database → Connection string (use the pooled
   "Transaction" connection string for `DATABASE_URL` on Vercel's serverless
   functions).
3. **Storage**: Storage → create a new **public** bucket named `media`. Admin
   product/success-story image uploads go here via `lib/supabase.ts`.
4. **API**: Settings → API → copy the Project URL and the `service_role`
   key into `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. The
   service-role key is server-only — never expose it with a `NEXT_PUBLIC_`
   prefix or send it to the client.

### 2. Billplz

1. Sign up at [billplz.com](https://www.billplz.com) (use
   [billplz-sandbox.com](https://www.billplz-sandbox.com) first for testing —
   keep `BILLPLZ_SANDBOX=true` until you're ready to take real payments).
2. API Keys page → copy the **Secret Key** (`BILLPLZ_API_KEY`) and **X
   Signature Key** (`BILLPLZ_X_SIGNATURE_KEY`).
3. Create **two** collections — one for academy fees, one for store orders —
   and paste their IDs into `BILLPLZ_COLLECTION_ID_FEES` /
   `BILLPLZ_COLLECTION_ID_STORE`.
4. No manual webhook setup needed — the app sets `callback_url` to
   `${NEXT_PUBLIC_APP_URL}/api/billplz/callback` on every bill it creates.
5. Billplz's merchant approval process checks for a visible refund/contact
   policy — `/refund-policy` and the WhatsApp number in the footer cover
   this; review the copy in `src/app/(site)/refund-policy/page.tsx` before
   going live and make sure it reflects your actual policy.

### 3. Resend

1. Sign up at [resend.com](https://resend.com), verify your sending domain.
2. Create an API key → `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on your verified domain.
4. Without this set, the app doesn't fail — `lib/email.ts` logs a warning
   and skips sending, so local dev works without an email provider.

### 4. Google OAuth (optional — "Sign in with Google")

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   create an OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI: `${NEXT_PUBLIC_APP_URL}/api/auth/callback/google`.
3. `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. If left blank, the Google button
   still renders but sign-in will fail — Credentials (email/password) login
   always works regardless.

### 5. Vercel

1. Import the repo, framework preset "Next.js".
2. Add every variable from `.env.example` in Project Settings → Environment
   Variables (`DATABASE_URL` from Supabase's **pooled** connection string,
   `NEXT_PUBLIC_APP_URL` = your production domain).
3. Generate `AUTH_SECRET` with `npx auth secret` and set it.
4. Deploy. Auth.js is configured with `trustHost: true` (`src/auth.config.ts`)
   specifically so it works correctly behind Vercel's proxy — no extra
   `AUTH_URL` setup needed as long as `NEXT_PUBLIC_APP_URL` is correct.
5. After the first deploy, run migrations against the production database
   (`npm run db:migrate` locally with production `DATABASE_URL`, or wire it
   into your deploy pipeline) and `npm run db:seed` once to create the real
   admin account — then immediately change that password via the admin
   panel or by re-running seed with new `ADMIN_SEED_EMAIL`/`_PASSWORD`.

### 6. Monthly invoice cron

`POST /api/cron/invoices` (protected by `Authorization: Bearer <CRON_SECRET>`)
generates the month's `MONTHLY_FEE` invoice for every active player. Wire it
to fire on the 1st of each month:

- **Vercel Cron**: add to `vercel.json`:
  ```json
  { "crons": [{ "path": "/api/cron/invoices", "schedule": "0 0 1 * *" }] }
  ```
  (Vercel Cron calls without a custom Authorization header by default — either
  use a [Vercel Cron secret](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs)
  or trigger the equivalent "Generate Invoices" button in Admin → Invoices
  manually each month instead.)
- Or any external scheduler (cron-job.org, GitHub Actions, etc.) that can
  send a Bearer-authenticated POST.

## Go-live checklist

- [ ] Replace `public/brand/crest.svg` with the real crest artwork.
- [ ] Replace every file under `public/placeholders/` with real photography
      — see `public/placeholders/README.md` for the exact shot list.
- [ ] Set every variable in `.env.example` to real production values.
- [ ] Flip `BILLPLZ_SANDBOX` to `false` once you've done a real end-to-end
      sandbox payment test (store order **and** fee payment).
- [ ] Change the seeded admin password (Admin → Settings has no
      password-change UI yet — either re-seed with new
      `ADMIN_SEED_EMAIL`/`_PASSWORD`, or add one via the parent
      set-password flow reused for an admin account).
- [ ] Review `/privacy`, `/terms`, `/refund-policy` — solid drafts, but have
      them checked against your actual policies (and ideally a lawyer)
      before publishing, especially the PDPA and refund-window specifics.
- [ ] Create the Supabase `media` storage bucket as **public**, or product/
      story image uploads will fail with a clear error message.
- [ ] Set up the monthly invoice cron (see above).
- [ ] Run `npm run test:e2e` against a seeded staging environment — the
      "add to cart" and "enrolment" tests need real DB-backed data
      (`prisma/seed.ts`'s `home-kit` product) to complete.

## Assumptions and scope notes

- **Money** is always an integer number of sen (`lib/money.ts`) — never a
  float — to avoid rounding bugs anywhere near payments.
- **Content** the client will want to edit without touching components lives
  as typed objects in `src/content/*.ts`. The core published fee schedule
  (registration/monthly/sibling rates) lives there too rather than in
  Admin → Settings, since it doubles as marketing copy across the public
  site; only the sponsored-player rate and shipping fee are admin-editable,
  matching the brief's "sponsorship toggle" framing.
- **Billplz** integration (`lib/billplz.ts`) creates bills, verifies callback
  and redirect signatures with a constant-time HMAC-SHA256 comparison, and
  re-confirms payment status with a `GET /bills/{id}` call before showing a
  success page — the redirect alone is never trusted.
- A fee **Payment** can settle more than one **Invoice** in one Billplz bill
  (e.g. registration + first month paid together). `PaymentAllocation` is an
  addition to the brief's schema sketch that records exactly how a payment's
  amount was split across invoices, oldest-first — needed to make partial
  payments and PDF receipt breakdowns correct. `Application.guardianIc` is
  a similar small addition — the sitemap section of the brief calls out
  IC/passport as a guardian-step field but the literal schema block omitted
  it.
- **Prisma** is pinned to the `6.19.3` stable line rather than an unqualified
  "latest" — `prisma@8.0.0` (npm's current `latest` tag as of this build) is
  a pre-release that moves the database connection out of `schema.prisma`
  into a separate driver-adapter config, a needless migration-in-progress
  for a from-scratch build. Same reasoning for `@tanstack/react-table`,
  pinned to `8.21.3` — the installed `^9` is a from-scratch API rewrite.
- **Supabase Storage** is used for admin image uploads (the brief allowed
  either Uploadthing or Supabase Storage — Supabase was already in the
  stack for Postgres, so one vendor instead of two).
- **PDF receipts are never stored** — `/api/receipts/[paymentId]` and the
  post-payment email both render the PDF on demand from the Payment +
  PaymentAllocation rows in the database, so there's no file storage or
  cleanup concern for receipts specifically (only product/story photos use
  Supabase Storage).
- No live database was reachable in the sandbox this was built in, so every
  data-backed route uses `export const dynamic = "force-dynamic"` and
  degrades gracefully (logs and omits its section, or shows a clear error)
  rather than crashing when Prisma can't connect — this is also just
  correct behavior for genuinely dynamic content, not a workaround to
  remove later. `npm run build` succeeds without a database connection as a
  result. Everything was verified against real tooling where possible
  (TypeScript, ESLint, Vitest, a production build, and a real Lighthouse
  mobile audit — 90 performance / 100 accessibility / 100 best practices /
  100 SEO) but the two DB-dependent Playwright tests and any admin-panel
  workflow need `docker compose up -d && npm run db:push && npm run
  db:seed` (or a real Supabase database) to actually exercise.

Build phases and status are tracked in `PLAN.md`.
