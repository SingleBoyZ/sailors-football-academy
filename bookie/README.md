# Exhibition Lead Capture & Landing Page

A frontend prototype for capturing visitor contact information at a trade
show / exhibition booth before granting access to downloadable resources
(product catalog, exclusive offers, case studies). Built as a standalone
**Phase 1** deliverable: no backend, no database, no external integrations.

## Purpose

Visitors scan a QR code or land on this page at the booth, fill in a short
qualification form, and — on submission — get a professionally formatted
PDF summary of their submission downloaded straight to their device. In a
later phase this same submission will also sync to a backend, Google
Sheets, and a CRM (see [What's Next](#whats-next-phase-2) below).

## Tech Stack

- **Vite** — build tooling and dev server
- **React 19 + TypeScript** — UI, strict typing throughout (no `any`)
- **Tailwind CSS v4** — styling, via the `@tailwindcss/vite` plugin
- **Lucide React** — icons
- **jsPDF** — client-side PDF generation (loaded on demand, not in the
  main bundle)

No state management library, router, or backend framework — none of that
is needed for a single-page lead form.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server (defaults to `http://localhost:5173`).

## Production Build

```bash
npm run build
```

Type-checks with `tsc -b` and bundles with Vite into `dist/`. Preview the
production build locally with:

```bash
npm run preview
```

## Current Functionality

- Full lead capture form (10 fields per the RFQ appendix): name, company,
  job title, business email, phone, industry, multi-select areas of
  interest, purchasing timeframe, follow-up preference, and optional notes.
- Inline validation as fields are touched/blurred, plus a full validation
  pass on submit — no silent failures, no "validate only after submit."
- Simulated submission (`idle → submitting → success` state machine in
  [`src/App.tsx`](src/App.tsx)) with a short artificial delay standing in
  for a real network call.
- On successful "submission," a polished multi-page-safe PDF is generated
  entirely in the browser and downloaded automatically — see
  [PDF Generation](#pdf-generation).
- A success screen with three resource cards (currently disabled /
  "Resource Coming Soon") and a "Submit Another Response" reset action.
- Responsive, accessible, keyboard-navigable UI with a restrained
  navy/gold professional color palette. Animations respect
  `prefers-reduced-motion`.

## What Is Intentionally NOT Implemented Yet

Per the RFQ, this is a same-day frontend-only prototype. The following are
deliberately out of scope for this phase:

- No backend, API, or database of any kind.
- No real submission — nothing is sent over the network. The lead data
  lives only in React state and is discarded on refresh (not persisted to
  `localStorage`, by design — see [Local Data Handling](#local-data-handling)).
- No Google Sheets sync, no CRM integration, no email sending.
- No authentication, no email/OTP verification.
- No real resource files — the three resource buttons on the success
  screen are disabled placeholders (`url: null` in
  [`src/config/resources.ts`](src/config/resources.ts)).
- No real access-control / anti-URL-sharing protection. That kind of
  protection cannot be done credibly on the frontend alone — see the
  `TODO` comments in `resources.ts`.

## How to Replace Company Branding

All placeholder branding lives in one file:
[`src/config/siteConfig.ts`](src/config/siteConfig.ts).

```ts
export const siteConfig = {
  companyName: "YOUR COMPANY",
  eventTitle: "Exhibition 2026",
  tagline: "Exclusive Event Resources",
  supportEmail: "info@yourcompany.com",
  year: new Date().getFullYear(),
};
```

Update `companyName` and `eventTitle` and it propagates to the header,
hero badge, footer, and the generated PDF header/footer automatically.
The logo is currently a simple icon glyph in
[`src/components/Header.tsx`](src/components/Header.tsx) — swap the
`Sparkles` icon (or the whole `<span>` block) for an `<img>` tag once a
real logo file is supplied.

The color palette (navy primary / gold accent) is defined as design
tokens in [`src/index.css`](src/index.css) under the `@theme` block —
adjust the `--color-navy-*` and `--color-gold-*` scales there to rebrand
the whole site consistently.

## How to Connect Real Resource Files Later

Resource metadata lives in
[`src/config/resources.ts`](src/config/resources.ts):

```ts
export const resources: ResourceItem[] = [
  {
    title: "Product Catalog & Technical Specs",
    description: "...",
    icon: FileText,
    url: null, // ← set this once a real, access-controlled URL exists
  },
  // ...
];
```

Once real files (and a backend to gate them) exist, set `url` to the
resource's link. The success screen already reads this array — when a
`url` is non-`null`, wire the button in
[`src/components/SuccessScreen.tsx`](src/components/SuccessScreen.tsx)
to link/download instead of showing "Resource Coming Soon."

**Important:** the RFQ eventually wants protection against direct-link
sharing of resources. That cannot be done credibly on the frontend —
anyone can copy a URL out of the browser's network tab regardless of
what JavaScript does. Real protection (e.g., signed/expiring URLs,
session-gated downloads) needs to be implemented server-side in Phase 2.

## What's Next (Phase 2)

Marked with `TODO` comments in the code so they're easy to find:

- **Backend + Google Sheets sync** — [`src/App.tsx`](src/App.tsx)'s
  `handleSubmit` has a `TODO` marking exactly where a real API call
  should replace the simulated delay. The plan: POST the `LeadFormData`
  object to a backend endpoint, which appends a row to Google Sheets in
  real time (e.g., via the Sheets API or a middleware like a serverless
  function).
- **CRM / CSV export** — `LeadFormData` (in
  [`src/types/lead.ts`](src/types/lead.ts)) is already a flat, clean
  object, so once submissions are persisted server-side, exporting them
  to CSV/Excel for CRM import is a straightforward transform — no
  frontend changes needed.
- **Real resource delivery** — see the section above.
- **Auth / verification** — explicitly out of scope per the RFQ; visitors
  get on-screen access immediately, no OTP or email confirmation.

## Local Data Handling

No lead data is sent anywhere — not to an API, not to `localStorage`, not
to any third party. It lives only in React component state for the
duration of the page session and generates a PDF entirely client-side. No
API keys or secrets are used anywhere in this project.
