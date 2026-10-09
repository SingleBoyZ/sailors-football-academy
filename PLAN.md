# Sailors Football Academy — Build Plan

Project root: `c:\tyre-guardian-pro-main\sailors-football-academy` (isolated from the
unrelated tyre-warranty app one level up — never touch that folder).

Stack per brief: Next.js 15 (App Router/Server Actions/TS strict), Tailwind v4,
Framer Motion, GSAP + ScrollTrigger, Lenis, Prisma + PostgreSQL (Supabase),
Auth.js v5, Zustand, Zod, Billplz v3, Resend + React Email, @react-pdf/renderer,
Supabase Storage for uploads, Lucide, Bebas Neue/Anton + Inter/Plus Jakarta Sans,
Vitest + Playwright.

## Phase order (commit after each, type-check + build must pass before moving on)

1. **Scaffold** — create-next-app (TS, Tailwind v4, App Router, src dir), strict
   tsconfig, eslint, folder skeleton, `.env.example`, README stub, git init +
   first commit.
2. **Data & infra** — Prisma schema (full model from brief), `docker-compose.yml`
   (Postgres 16), `lib/money.ts` (sen formatting), seed script (admin user, 8
   products/variants, 3 success stories, settings), brand tokens in
   `globals.css` (@theme), self-hosted fonts via `next/font`.
3. **Motion + shell** — `lib/motion.ts` config, `components/motion/` (Reveal,
   Stagger, SplitText, Marquee, PageTransition via `template.tsx`, Preloader),
   Nav + Footer, Cart drawer shell (Zustand store, persisted).
4. **Content layer** — `content/` typed TS objects for all copy in the brief
   (history, timeline, programmes, phases, schedule, fees, contact).
5. **Public pages** — Home, Academy, Programmes (horizontal pathway +
   phase tabs), Training (schedule/fees/FAQ), Achievements, Success Stories
   (list + `[slug]`), legal pages (privacy/terms/refund-policy).
6. **Store + cart + checkout** — product grid/filter, product page w/ variants,
   checkout form + server action (server-side price/stock revalidation),
   `lib/billplz.ts` (bill creation, signature verify w/ constant-time compare),
   callback + redirect routes, success/failed pages, Vitest tests for money +
   signature logic.
7. **Enrolment** — multi-step animated form + Zod schema + server action
   creating `Application`, React Email templates + Resend send (parent +
   admin notification).
8. **Auth + portal + fees** — Auth.js (Credentials + Google), roles/middleware,
   `/pay` public fee lookup, `/portal` parent dashboard, invoice allocation
   logic (oldest-first), PDF receipt generation + email.
9. **Admin panel** — sidebar shell, dashboard (counts + chart), Applications
   (approve/reject flow creating Player+User+Invoices), Players (plan
   switcher, notes, payment history), Payments, Invoices (+ cron route),
   Orders, Products (CRUD), Success Stories (CRUD), Settings.
10. **Polish** — SEO metadata/OG/sitemap/robots, accessibility pass, Lighthouse
    check, Playwright smoke tests (home, add-to-cart→checkout, enrol submit),
    final README (deploy + go-live checklist) and closing summary.

## Status: all phases complete

1. Scaffold — done.
2. Data & infra — done.
3. Motion + shell — done.
4. Content layer — done (folded into phases 1-2).
5. Public pages — done (Home, Academy, Programmes, Training, Achievements,
   Success Stories, legal pages).
6. Store + cart + checkout + Billplz — done, with Vitest coverage for
   pricing and signature verification.
7. Enrolment — done.
8. Auth + portal + fees — done, including PDF receipts.
9. Admin panel — done (all nine sections from the brief).
10. Polish — done: sitemap/robots/OG image, an accessibility contrast pass
    verified with a real Lighthouse audit (90/100/100/100 mobile), and 3
    Playwright smoke tests (1 passes standalone; 2 need a live seeded DB).
11. **Mock-data mode** — done (historical): `src/lib/data` repository
    abstraction with a Prisma-backed implementation and an in-memory mock
    one, switched by `USE_MOCK_DATA`. See phase 12.
12. **Supabase migration** — done: replaced Auth.js (NextAuth v5) with
    Supabase Auth (`@supabase/ssr`, email/password + Google OAuth), moved
    the database to Supabase Postgres with the canonical schema in
    `supabase/migrations/0001_init.sql` (enums, tables, FKs, indexes,
    `on_auth_user_created` → `profiles` trigger, RLS with per-user
    `cart_items` policies), removed the mock data layer entirely
    (`mock.ts`/`fixtures.ts`/`USE_MOCK_DATA` gone, next-auth/bcrypt
    uninstalled), and added a persisted per-user cart (`cart_items` table,
    server-side merge of the guest cart on login, debounced sync via
    `<CartSync />`). Admin approval of enrolments provisions guardians via
    the Supabase Admin API; the emailed set-password flow writes the
    password to Supabase Auth while keeping the existing
    `verification_tokens` mechanics. The mock payment gateways remain as a
    dev-only fallback behind `ENABLE_MOCK_GATEWAY`. Auth.js `Account` /
    `Session` models were dropped from the Prisma schema (sessions live in
    Supabase auth); `User` is now mapped to `profiles` with the Supabase
    UUID as its id.

See README.md for the full go-live checklist and deployment guide, its
"Running in mock mode" section, and its "Assumptions and scope notes"
section for every deliberate deviation from the brief's literal spec and
why.

## Notes / assumptions carried into the build
- No real photos/crest exist yet — placeholders + README manifest telling the
  client exactly what to drop in.
- No live Billplz/Resend/Supabase/Google OAuth credentials — code is written
  against the real v3 API contract and is sandbox-ready; `.env.example` is the
  source of truth for what the client must supply before go-live.
- Money always stored/passed as integer sen.
- Given the scope, later phases favor working core mechanics over exhaustive
  admin CRUD polish; anything stubbed is called out explicitly in the final
  summary rather than silently left incomplete.
