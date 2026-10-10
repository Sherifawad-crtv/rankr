# CLAUDE.md — Rankr Front-End

Guidance for Claude Code working in this repo. Read this fully before writing code.

---

## What this repo is
The **front-end only** for Rankr — an AI CV-ranking tool for SME recruiters (Egypt/MENA). A responsive web app. This repo builds the **UI/UX layer**: every screen, fully interactive against **mock data**, clean and typed for hand-off to a back-end engineer.

## What this repo is NOT
A back-end engineer owns all of this — **do not build it, stub it only**:
- No real APIs, no server routes with business logic, no database, no Supabase client.
- No AI / CV parsing / OCR / scoring logic. Scores and parsed CVs are **mock data**.
- No auth provider, no payment integration (Paymob/Stripe), no email sending.
- No schema, no migrations, no webhooks.

Everything the back-end touches is reached through a **typed service layer** (`lib/api/`) that currently returns mocks. Your job is to make that seam clean, not to fill it.

---

## Golden rules (do not violate)
1. **Stop and ask — never invent product decisions.** Where a value is marked OPEN below, do not hardcode a guess. Leave a `TODO(spec):` and ask.
2. **No hardcoded styling.** All colour, type, spacing, radius via design tokens (see Design tokens). Never put hex values or pixel spacing in components. The real token values are provided separately — until then, use the placeholder token layer.
3. **Every back-end call goes through `lib/api/`** and is marked `// TODO(backend): wire to real endpoint`. Components never fetch directly.
4. **Respect the product non-negotiables** (below) — they are UI constraints, not suggestions.
5. **Screens are specified, not improvised.** Build from `/docs/screens/` (below). If a screen detail is missing, ask rather than invent flows.
6. **Clean hand-off > clever.** Readable, conventional, typed. No dead code, no commented-out blocks, no secrets, no `any`.

---

## Stack *(my call — flag if you disagree, Sherif)*
- **Next.js (App Router) + React + TypeScript** — strict mode on.
- **Tailwind CSS** with a token-driven theme (CSS variables → Tailwind config). No inline styles.
- **Deploy target: Vercel.**
- **Fonts (locked):** Urbanist for UI text, Space Grotesk for headings, numbers and scores (self-hosted via Fontsource). Arabic pairing comes with the Arabic phase.
- **Icons (locked):** Solar icon set (480 Design, CC BY 4.0), copied into source by `scripts/generate-icons.mjs`. Add an icon by adding a line there and re-running it. Icons inside buttons and links use the default linear style; bold is only for the active nav item and for status or illustration icons (badges, empty and success states).
- **Language:** English first, Arabic (RTL) next. Every user-facing string in new or rebuilt screens goes through `t("key")` from `useLocale()` (keys live in `lib/i18n/messages/en.ts`; Arabic falls back to English until translated). Use logical CSS properties (`ms-`, `ps-`, `text-start`, `start-`), mirror directional icons with `mirrorRtl`, and test both directions.
- **White-label:** wrap an organisation's pages in `<BrandScope branding={...}>` to swap the primary colour at runtime. Never hardcode the brand blue; use `bg-primary`, `text-primary`, `text-primary-contrast`.
- **Feature flags:** `lib/flags.ts`. **Analytics:** `track()` in `lib/analytics.ts` (stub).
- **Motion:** restrained, in the spirit of Material 3 and Apple HIG. Hover and pressed states only on things you can click (links, buttons, inputs, selectable rows or cards): a colour or background change, never a lift, scale, shadow growth or icon zoom. Durations 100–200 ms (progress bars 300 ms), one standard easing, no overshoot or bounce, no stagger, no shake, no count-up numbers. Entrances are a short fade. Looping animation is only for work in progress (loading skeletons, the processing screen). Always respect `prefers-reduced-motion` (handled globally in `app/globals.css`).
- State: React state + context for app-level concerns (mock session, plan mode). No heavy state lib unless a screen genuinely needs it — ask first.
- Forms: a single lightweight form approach, consistent across the app.

## Repo structure
```
app/                 # routes (App Router)
  (marketing)/       # entry: plans → checkout flow
  (app)/             # authed recruiter app (shell + screens)
  (candidate)/       # recruit/candidate portal
  (admin)/           # internal admin
components/          # reusable UI, token-driven, no business logic
lib/
  api/               # typed service layer — MOCK impl now, back-end seam
  mocks/             # fixture data + state fixtures (empty/loading/error)
  session/           # mock auth: role + plan mode (solo/enterprise) switch
types/               # shared TS types = the contract for the back-end
docs/
  screens/           # the screen specs (source of truth — see below)
styles/              # token layer (CSS variables)
```

## Commands
```
# scaffold if empty, then:
npm run dev          # local dev
npm run build        # production build (must pass before hand-off)
npm run lint         # must pass, zero warnings
npm run typecheck    # tsc --noEmit, must pass
```
Build, lint, and typecheck all green is the bar for "done".

---

## The data seam (how hand-off stays clean)
- `types/` holds every entity the UI renders — `Job`, `Candidate`, `ParsedCV`, `ScoreBreakdown`, `Plan`, `Member`, `Application`, etc. These are **the contract** the back-end engineer implements against. Derive them from the screen specs; keep them honest and minimal.
- `lib/api/` exposes async, typed functions (`listCandidates(jobId)`, `getJob(id)`, `createJob(input)` …). Current implementation reads `lib/mocks/` with simulated latency. Each is marked `// TODO(backend)`.
- Components call `lib/api/` only. Swapping mocks for real endpoints must require **zero component changes**.
- Every screen must render all its **states** from mock toggles: empty, loading, error, processing, populated, low-confidence. The specs name the states per screen.
- `lib/session/` provides a mock current user with a **role** (Admin / Recruiter) and a **plan mode** (Solo / Enterprise), both switchable in dev, since the UI branches on them.

## Design tokens
- A placeholder token layer (CSS variables in `styles/`, mapped into Tailwind) covers colour, type scale, spacing, radius, shadow. Components reference **tokens only**.
- The real locked values (brand colours, type) are supplied separately and dropped into the token layer — components must not need changing when they land.
- **OPEN:** the locked token values. Until provided, use neutral placeholders and do not improvise a brand palette.

---

## Screens = source of truth
Build every screen from the specs in **`/docs/screens/`**:
- `Rankr_Full_App_Screens.md` — master: entry funnel, recruiter app, candidate portal, admin.
- `Rankr_Solo_Entry_Flow.md` — the Solo-mode entry variant.

Each spec entry gives layout, components, content, states, and flow. They are intentionally **styling-free** (tokens handle that). If a spec and this file conflict, this file wins; if either is silent on a detail, ask.

**Screen set (build order):**
- **Entry funnel:** Plans → Create account → Verify email → Checkout → Workspace setup → Invite team (Enterprise only) → Welcome. (Solo path drops the tier slider + invite.)
- **Recruiter app:** App shell · Dashboard · Job creation · CV upload · Processing · Ranked list · Candidate detail · CSV export · Analytics · Billing · Settings.
- **Candidate portal (white-label per organisation: brand, colours and logo are customisable):** Careers · Job detail · Application form · Submitted · Magic-link auth · My applications · Status detail · Messaging · Parsed-profile review · Privacy & data rights.
- **Admin:** Companies & users · Job moderation · Reports & block list · Bias audit · Pilot onboarding.

---

## Product facts the UI must encode
- **Responsive web, single build.** Every screen works desktop → mobile.
- **Two modes set at purchase:** `solo` (single user; team surfaces hidden) and `enterprise` (unlimited members; roles, team messaging, admin). The UI reads plan mode from `lib/session/`.
- **Pricing = CV capacity, not seats.** Enterprise picks a CV tier via a draggable 4-stop control: **100 / 500 / 1000 / 1500 CVs per cycle**, shared across unlimited members. Solo = single user, fixed capacity. No seat concepts anywhere.
- **Billing cycles (Figma/Claude-style):** Monthly + Yearly on every plan; Yearly billed upfront at a discount; price shown per-month with a "billed monthly/annually" note + savings badge; cycle independent of capacity.
- **Entry order:** verify email **before** checkout; checkout **before** workspace setup (paid product, no trial).
- **Scoring display:** four dimensions, default weights **Skills 40 · Experience 25 · Education 15 · Profile quality 20**; weight sliders must total 100% and re-rank the list **client-side, instantly** (this logic lives in the front-end — it's presentation, not back-end).

## Non-negotiables (UI constraints)
- **Human-in-the-loop:** every score surface shows the disclaimer; no auto-rejection UI anywhere.
- **Data minimization:** never render or collect gender, age, religion, marital status, or photo — not in forms, not in parsed profiles.
- **Consent gate:** no CV submission/processing path without an explicit, unticked-by-default consent checkbox.
- **Confidence-aware:** low parse-confidence candidates carry a visible flag wherever they appear.
- **No interview scheduling.** Candidate stages are `new / shortlisted / rejected / hired`. A person moves a candidate; the system never auto-rejects.
- **Candidate visibility:** candidates see application **stage only** — never scores or rankings.
- **Hard-filter transparency:** knocked-out candidates appear in a visible "filtered-out" group with the reason — never silently dropped.

---

## OPEN items — do not hardcode, leave `TODO(spec):` and ask
1. **Solo CV capacity** (placeholder 100/cycle; collides with Enterprise floor — number + monthly vs cycle unset).
2. **Prices** — Solo price, the four Enterprise tier prices, Yearly discount %.
3. ~~Design token values~~ — colours, fonts and icons are now locked; only per-organisation white-label theming remains to be designed.

## Definition of done (hand-off bar)
- All screens + states build from mocks; `build`, `lint`, `typecheck` green.
- No component touches the network directly; all seams in `lib/api/` marked `TODO(backend)`.
- `types/` is complete and is a usable contract for the back-end engineer.
- No hardcoded styling; tokens only. No secrets, no `any`, no dead code.
