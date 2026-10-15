# Sailors Football Academy

Production website, member portal and admin panel for Sailors Football
Academy — the youth development arm of Royal Klang Sailors (RKS), Klang,
Selangor.

Stack: Next.js 15 (App Router) · Tailwind CSS v4 · Framer Motion · GSAP +
ScrollTrigger · Lenis · Supabase (Postgres + Auth + Storage) · Prisma ·
Zustand · Zod · Billplz v3 · Resend + React Email · @react-pdf/renderer.

## Architecture

- **Database — Supabase Postgres.** All application data lives in a Supabase
  project. The canonical schema is `supabase/migrations/0001_init.sql`
  (tables, enums, foreign keys, indexes, triggers, Row Level Security).
  Prisma (`prisma/schema.prisma`) mirrors that schema and is the app's
  data-access layer via the repository in `src/lib/data` — pages and Server
  Actions never touch `@/lib/prisma` directly.
- **Auth — Supabase Auth.** Email/password and Google OAuth are handled by
  Supabase Auth (`@supabase/ssr` for cookie-based sessions). Every auth user
  gets a row in the public `profiles` table via the `on_auth_user_created`
  trigger; `profiles.id` is always the Supabase auth UUID. Roles
  (`PARENT`/`ADMIN`), phone and address live on `profiles`.
- **Cart.** Signed-in users' carts persist in the `cart_items` table and
  survive logout/login. Guests shop from a localStorage cart
  (`src/store/cart.ts); on sign-in the two are merged server-side
  (`mergeGuestCartAction`) and every subsequent change syncs to the database
  (debounced) via `<CartSync />`.

## Getting started

```bash
npm install
cp .env.example .env      # fill in Supabase + Billplz + Resend values
npm run db:seed           # products, success stories, settings, admin account
npm run dev
```

Admin login comes from `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in `.env`
(or `admin@sailorsfootballacademy.com` / `ChangeMe123!` if unset — **change
this before going live**). You can also create/promote an admin at any time:

```bash
ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='...' npx tsx scripts/create-admin.ts
```

### Supabase setup (first time)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste the full contents of
   `supabase/migrations/0001_init.sql` → Run. This creates every table, the
   `profiles` trigger and RLS policies.
3. **Storage** → create a new **public** bucket named `media` (admin
   product/success-story image uploads).
4. **Authentication → Providers**: enable **Email** (recommended: disable
   "Confirm email" for the portal's instant sign-up UX — if you keep it on,
   `/register` shows a "check your inbox" state) and **Google** (paste a
   Google OAuth client id/secret; see "Google sign-in" below).
5. **Authentication → URL Configuration**: add
   `http://localhost:3000/auth/callback` (and your production
   `https://<domain>/auth/callback`) to **Redirect URLs**.
6. **Project settings → API / Database**: copy URL + keys into `.env`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`) and the **Database → Connection string** into
   `DATABASE_URL`. Use the pooled connection (port 6543) on serverless hosts;
   the direct string (port 5432) also works for local `prisma` CLI usage.

The `profiles` row is created automatically for every signup (email or
Google) by the trigger — no manual provisioning for self-registered parents.

### Dev-only mock payment gateway

With `ENABLE_MOCK_GATEWAY=true`, Billplz bill creation is faked and checkout
/ fee payment redirect to local `/checkout/mock-gateway` and
`/pay/mock-gateway` pages with **Pay** / **Simulate Failed Payment** buttons.
Both run the exact same allocation logic as the real Billplz webhook
(`src/lib/payments/allocate.ts`, unit-tested). Never enable outside
development — without it (or with it), real Billplz keys make everything go
through the hosted payment pages.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate the Prisma Client from `schema.prisma` |
| `npm run db:seed` | Run `prisma/seed.ts` (products, stories, settings, admin via Supabase Auth) |
| `npm run db:studio` | Prisma Studio |
| `npm test` | Vitest unit tests (pricing helpers, Billplz signature verification, payment allocation) |
| `npm run test:e2e` | Playwright — `tests/e2e/smoke.spec.ts` needs a reachable seeded database |

## Environment variables

See `.env.example` — every variable is documented there, including where to
find it (Supabase project settings, Billplz dashboard, Google Cloud Console).

## Deployment (Vercel + Supabase + Billplz)

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. **Database**: run `supabase/migrations/0001_init.sql` in the SQL Editor.
   Settings → Database → copy the pooled "Transaction" connection string into
   `DATABASE_URL` for Vercel's serverless functions.
3. **Storage**: Storage → create a new **public** bucket named `media`. Admin
   product/success-story image uploads go here via `lib/supabase.ts`.
4. **API**: Settings → API → Project URL + anon key into
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the
   `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (server-only — never
   expose it with a `NEXT_PUBLIC_` prefix).
5. **Auth**: enable Email + Google providers, and add
   `https://<your-domain>/auth/callback` to Redirect URLs. Row Level Security
   is already part of the schema migration: all tables deny direct
   anon/authenticated access by default, with per-user policies on
   `cart_items` only, because the app reads/writes through Prisma with the
   Postgres connection string.

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
4. Without this set, the app doesn't fail — `lib/email/send.ts` logs a warning
   and skips sending, so local dev works without an email provider.

### 4. Google sign-in

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   create an OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI: `https://<your-domain>/auth/callback` (and
   `http://localhost:3000/auth/callback` for local dev).
3. Paste the client id/secret into Supabase → Authentication → Providers →
   Google. First Google sign-in creates the account (and its `profiles` row)
   automatically; the button on `/login` covers both sign-in and sign-up.

### 5. Vercel

1. Import the repo, framework preset "Next.js".
2. Add every variable from `.env.example` in Project Settings → Environment
   Variables (`DATABASE_URL` from Supabase's **pooled** connection string,
   `NEXT_PUBLIC_APP_URL` = your production domain).
3. Deploy, then run `npm run db:seed` once (with production env) to create
   the real admin account + starter catalog — and immediately change that
   password.

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

- [ ] Run `supabase/migrations/0001_init.sql` on the production project and
      create the public `media` storage bucket.
- [ ] Replace `public/brand/crest.svg` with the real crest artwork.
- [ ] Replace every file under `public/placeholders/` with real photography
      — see `public/placeholders/README.md` for the exact shot list.
- [ ] Set every variable in `.env.example` to real production values.
- [ ] Configure Google OAuth in Supabase + Google Cloud Console (redirect
      URIs for both localhost and production).
- [ ] Flip `BILLPLZ_SANDBOX` to `false` once you've done a real end-to-end
      sandbox payment test (store order **and** fee payment).
- [ ] Change the seeded admin password (re-seed with new
      `ADMIN_SEED_EMAIL`/`_PASSWORD`, or use `scripts/create-admin.ts`).
- [ ] Review `/privacy`, `/terms`, `/refund-policy` — solid drafts, but have
      them checked against your actual policies (and ideally a lawyer)
      before publishing, especially the PDPA and refund-window specifics.
- [ ] Set up the monthly invoice cron (see above).
- [ ] Run `npm run test:e2e` against a seeded staging environment — the
      "add to cart" and "enrolment" tests need real DB-backed data
      (`prisma/seed.ts`'s `home-kit` product) to complete.

## Assumptions and scope notes

- **The data layer is abstracted behind `src/lib/data`** (`DataRepository` in
  `src/lib/data/repository.ts`) — no page or Server Action imports
  `@/lib/prisma` directly. `src/lib/prisma.ts` is a lazy `getPrisma()` getter
  so importing the module can never throw on a missing `DATABASE_URL`; only
  actually calling a repository method touches the database.
- **Auth is Supabase Auth, not a session table.** There are no `Session` or
  `Account` tables — sessions live in Supabase's auth schema. The app's own
  `profiles` table holds role/phone/address and is kept in sync with
  `auth.users` by the `on_auth_user_created` trigger. Admin-side user
  creation (approving an enrolment for a guardian with no account) goes
  through the Supabase Admin API (`src/lib/auth/provision.ts`); the emailed
  set-password flow redeems a `verification_tokens` row and writes the new
  password to Supabase Auth, never to Prisma.
- **Cart display data is derived, not stored.** `cart_items` rows are only
  `(userId, variantId, qty)`; names/prices/images are joined from the product
  tables on read (`getCartDisplayItems`), so carts always show current
  pricing and drop unavailable variants automatically.
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
  (e.g. registration + first month paid together). `PaymentAllocation` records
  exactly how a payment's amount was split across invoices, oldest-first —
  needed to make partial payments and PDF receipt breakdowns correct.
- **Prisma** is pinned to the `6.19.3` stable line rather than an unqualified
  "latest"; the database schema itself is created by the Supabase SQL
  migration, not by `prisma migrate` (Prisma is used as the typed client
  only).
- **Supabase Storage** is used for admin image uploads (one vendor for
  database + auth + storage).
- **PDF receipts are never stored** — `/api/receipts/[paymentId]` and the
  post-payment email both render the PDF on demand from the Payment +
  PaymentAllocation rows in the database.
- Every data-backed route uses `export const dynamic = "force-dynamic"` and
  degrades gracefully (logs and omits its section, or shows a clear error)
  rather than crashing when the database can't connect. Everything was
  verified with TypeScript, ESLint, Vitest and a production build; the
  DB-dependent Playwright tests need a reachable seeded Supabase database to
  exercise.

Build phases and status are tracked in `PLAN.md`.
