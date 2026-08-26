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
