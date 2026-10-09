# Rankr: Design and Front-End Plan

Source: Rankr PRD v1.0 (MVP, pre-build), plus `CLAUDE.md` and what is already built.
Scope: UI/UX and front-end only. Everything the back-end touches stays behind `lib/api/` mocks.

Priority tags follow the PRD: **P0** must ship in v1.0, **P1** v1.0 but cuttable, **P2** later (v1.1+).

---

## Decisions log

Answers to the open questions in this plan, as given by the product owner.

| Topic | Decision |
|---|---|
| Candidate portal | **In.** It is white-label per organisation (brand, colours, logo). Tokens must be runtime-overridable. |
| Pricing | Keep `CLAUDE.md` pricing as is. Business side will edit later. |
| Scope list conflict | The product owner's answers win over the PRD where they differ. |
| Candidate stages | `new / shortlisted / rejected / hired`. No interview or scheduling. |
| Mobile | Responsive web only, as is. |
| Monorepo | Keep as is (single repo). |
| UI language | English first, then Arabic with RTL. |
| Roles | Three roles: Rankr staff, company admin, recruiter. |
| Candidate messaging | Add it. |
| Fonts | **Urbanist** (UI) + **Space Grotesk** (headings, numbers). |
| Icons | **Solar** icon set. |
| Roadmap | Do all six phases. |
| Style direction | Tech-forward, Airbnb-like: friendly, lively micro-interactions, simple, nothing flashy. |

---

## 1. What Rankr is (my understanding)

Rankr is an AI CV-ranking assistant for HR generalists at Egyptian SMEs (10-200 employees). They handle
5-50 open roles a month using email, WhatsApp and Excel. They are **non-technical**, short on time, and
they get hundreds of unstructured CVs, many in Arabic or mixed Arabic/English.

The core promise is: **upload up to 500 CVs, get a ranked shortlist with reasons in minutes** (target: under 3 minutes for 50 CVs). It is not an ATS, it does not source or post jobs, and the human always makes the final call.

The loop the UI must make effortless:

`Create job → upload CVs → watch live processing → review ranked list → open a candidate → shortlist / reject / hire → export CSV`

A secondary user, the founder or ops lead, wants a fast answer rather than a dashboard. So every screen should lead with the answer ("here are your top matches") and keep the detail one click away.

### Design principles derived from the PRD

1. **Answer first.** The top of every results screen is the shortlist, not charts.
2. **Transparency builds trust.** Every score has a visible reason, and a disclaimer appears wherever a score does ("risk: low trust from non-technical HR").
3. **Human in the loop.** Humans reject, never the system. No auto-reject UI. Filtered-out candidates stay visible with a reason.
4. **Bilingual by default.** Arabic and English CVs, names and (likely) UI. RTL must work everywhere.
5. **Beginner-friendly.** Plain language, guided first run, no jargon like "Jaccard" or "parse confidence" in the UI.
6. **Excel is the destination.** CSV export must open cleanly in Excel with Arabic text.
7. **Privacy-visible.** Consent gate, no gender, age, religion, marital status or photo anywhere, and a clear data-deletion path.

---

## 2. Conflicts and gaps to resolve before building more

The PRD, `CLAUDE.md` and my earlier assumptions disagree in places. This is the most important section.
"My default" is what I will do unless you say otherwise.

| # | Topic | PRD says | CLAUDE.md / built | My default | Needs your call |
|---|---|---|---|---|---|
| 1 | **Pricing model** | Starter / Growth / Enterprise tiers, job-post and seat limits; per-CV vs per-seat vs flat is an **open question**; trial/freemium undecided | Solo / Enterprise, CV-capacity tiers 100/500/1000/1500, no seats, no trial | Follow `CLAUDE.md` (it says it wins) | Confirm the PRD pricing section is superseded |
| 2 | **Candidate portal** | **Not in the PRD.** "Job posting / sourcing" is explicitly **out of scope** | `CLAUDE.md` lists a full candidate portal (careers page, apply, magic link, My applications) | **Do not build** until confirmed | Is the candidate portal in or out? It conflicts with "Rankr ranks, does not source" |
| 3 | **MVP scope** | Section 5 marks Arabic, weight sliders, duplicate detection, skill normalization as v1.0; the roadmap on the last pages moves them to **v2.0** and puts only 8 features in MVP | n/a | Build everything tagged P0/P1 in section 5 | Which list is authoritative? |
| 4 | **Candidate stages** | Shortlist / Reject / Hire only. **Interview scheduling is out of scope** | I invented `applied / reviewing / shortlisted / interview / offer / closed` | Replace with `new / shortlisted / rejected / hired` | Confirm |
| 5 | **Mobile** | Stack lists React Native / Expo as P0, but "Mobile-native HR app" is **out of scope** v1.0 | Responsive web, single build | Responsive web only | Confirm no native app |
| 6 | **Monorepo / tooling** | Turborepo + pnpm, shared types and UI packages | Single repo, npm | Keep single repo; keep `types/` and `components/ui/` self-contained so they lift into packages | pnpm vs npm; do you want the monorepo now? |
| 7 | **UI language** | CVs are bilingual; "multi-language beyond Arabic + English" is out of scope, which implies Arabic and English are in | Board shows bilingual text; no i18n built | Plan English + Arabic UI with RTL | Is the **app UI** Arabic too, or only CV content? |
| 8 | **"Admin"** | An **internal** Rankr admin panel (sees all companies). HR roles are "HR admin" and "recruiter" | `CLAUDE.md`/session use one "Admin" role | Three roles: Rankr staff, company admin, recruiter | Confirm |
| 9 | **"Message candidates"** | Core flow says "shortlist, reject, or **message candidates**"; messaging section says HR **team** messaging (P2, v1.1) | Messages tab exists | Treat messaging as team-only, v1.1 | Do recruiters message candidates at all in v1? |
| 10 | **Team access** | Open question: do hiring managers need access in MVP? | Enterprise has unlimited members | Build roles and invite flow after the hero loop | Confirm priority |
| 11 | **Weight sliders** | P1 "UI prevents invalid saves"; open question: per-job overrides or default only | Built: auto-rebalance so the total is always 100 | Keep auto-rebalance; persist per job | Per-job vs global default |
| 12 | **Arabic edge cases** | Open: reject with a message, or attempt and flag? | n/a | Attempt and flag with the low-confidence indicator | Confirm |
| 13 | **Payments** | Paymob (Egypt) and Stripe (international) | Checkout stub, one provider | Hosted-redirect, with region-based provider choice | Currency (EGP / USD) and VAT |

---

## 3. Personas and jobs-to-be-done

| Persona | Needs | UI implication |
|---|---|---|
| **Recruiter** (primary) | Cut screening from days to minutes; consistent ranking; Excel output | Hero loop must need no training; big drag-and-drop; plain-language reasons |
| **Founder / Ops lead** (secondary) | Fast answers, often sole decision-maker | A "top matches" summary on first screen; minimal dashboards |
| **Company admin** | Manage team, billing, data | Settings, team, billing, data deletion |
| **Rankr staff** (internal) | Moderate, onboard pilots, handle abuse | Separate admin area, dense tables, audit-friendly |

---

## 4. Information architecture

### 4.1 Surfaces (PRD section 3)
1. **HR Web Dashboard**, P0: the recruiter app (all screens below).
2. **Internal Admin Panel**, P1: companies, users, moderation, abuse, pilot onboarding.
3. REST API and webhooks (v1.1) are back-end only. The only front-end piece is an **Integrations settings page** (API keys, webhook URL).

### 4.2 Route map (target)

```
(auth)        /sign-in  /sign-up  /verify-email  /forgot-password        P0
(onboarding)  /plans  /checkout  /workspace-setup  /invite-team  /welcome  P0 (hidden until ready)
(app)         /dashboard                                                 P0
              /jobs                      list                            P0
              /jobs/new                  creation wizard                 P0
              /jobs/[id]                 overview: runs, shortlist count P0
              /jobs/[id]/edit                                            P0
              /jobs/[id]/upload          batch upload                    P0   (built, needs fixes)
              /jobs/[id]/runs/[runId]    live processing                 P0   (built as /processing)
              /jobs/[id]/candidates      ranked list                     P0   (built, needs v2)
              /jobs/[id]/candidates/[c]  candidate detail                P0
              /messages                  team messaging                  P2 (v1.1)
              /analytics                 funnel and usage                P2 (v1.1)
              /billing  /settings/*                                      P0 / P1
(admin)       /admin/companies  /users  /moderation  /blocklist  /pilots P1
              /admin/bias-audit                                          P2 (v1.1)
(candidate)   ON HOLD, see conflict #2
```

Navigation: sidebar (Dashboard, Jobs, Messages, Analytics, Billing, Settings). Messages and Analytics stay hidden until v1.1. Admin has its own shell.

---

## 5. Screen specifications

Each screen lists the PRD source, key content and required states. All screens need **loading, error, empty** plus the screen-specific states.

### 5.1 Auth and onboarding (P0)
- **Sign in / Sign up**: email + password and **Continue with Google** (Supabase Auth). Company account creation on sign-up, role assigned (HR admin / recruiter).
- **Verify email, plans, checkout, workspace setup, invite team, welcome**: built or planned per `CLAUDE.md`. Realign copy with the PRD. Add **first-run onboarding checklist** on the dashboard (create a job, upload CVs, review results) to answer the low-trust risk.
- States: wrong password, email taken, unverified, Google failure, expired link.

### 5.2 HR Dashboard (P0, built, needs rework)
PRD: "active jobs, recent screening runs, shortlist counts, quick actions. Clean and beginner-friendly."
- Needs: **recent screening runs** and **shortlist counts**, which are missing today.
- Quick actions: New job, Upload CVs.
- Founder view: "top matches across jobs" strip.
- Empty state doubles as the onboarding checklist.

### 5.3 Job creation wizard (P0, not built)
PRD: required / preferred / nice-to-have skills, min experience, degree level, hard filters, scoring weights.
Steps: **Basics** (title, location) → **Requirements** (skills in three tiers, min experience, degree level) → **Hard filters** (required skills, min experience, min degree, location / work authorisation) → **Scoring weights** (default 40/25/15/20) → **Review**.
- Skill input: autocomplete over the ~300 canonical skills with English and Arabic aliases. Typing "ReactJS" resolves to "React". Unknown skills are **flagged for review**, not rejected.
- Hard filters carry a clear warning: "Candidates who fail are shown separately, never hidden."
- States: validation per step, unsaved-changes guard, draft saving.

### 5.4 CV batch upload (P0, built, needs fixes)
PRD: bulk PDF and DOCX, type and size validation, progress, **up to 500 CVs per run**, virus-scan stub, **20 uploads per hour per user**, SHA-256 duplicate detection, consent checkbox.
Fixes needed:
- Enforce the **500-per-run cap** (the current copy wrongly says "as many as you like").
- Show the **rate-limit state** ("you've used 20 of 20 uploads this hour, try again at 14:10").
- Show **duplicate** handling ("already processed, reusing result").
- Upload **progress per file** (currently instant) and a virus-scan "checking" step.
- Consent wording and format limits to be confirmed (`TODO(spec)`).

### 5.5 Live processing (P0, built, needs fixes)
PRD statuses: **pending / processing / done / failed**, retry logic, error tracking, "live status updates in browser".
Fixes: rename `queued` to `pending`; add **retry** per failed file and "retry all failed"; surface **scanned PDF (OCR used)** and **low-confidence** per file; show a time estimate (target under 3 min for 50); duplicate state; leave-and-return banner.

### 5.6 Ranked list (P0, built, needs v2)
PRD row content: **score %, confidence indicator, top matched skills, one-line AI rationale.**
Needs: match % as the headline number; matched-skills chips; the rationale line; **confidence-aware ranking** (final score multiplied by parse confidence, with a visible indicator on low-confidence rows); search, filter by status and confidence, sort; row selection with bulk **Shortlist / Reject**; link to detail; sticky disclaimer; weight sliders collapsed by default for non-technical users; **CSV export** button; filtered-out group (built).
Move the four sub-score columns into the detail view (keep as an optional "Show breakdown" toggle).

### 5.7 Candidate detail (P0, not built)
PRD: parsed CV, match breakdown, AI rationale, "human always makes the final call".
Layout: header (name in English and Arabic, match %, confidence), **AI rationale** card, **breakdown** (4 dimensions with the bars), **skills**: matched, missing required (flagged), extras; parsed profile (education, experience, languages); **original CV viewer** via signed URL with a 1-hour expiry, so the UI needs an "expired, refresh" state; actions **Shortlist / Reject / Hire** (human-triggered); report button; disclaimer.
Never show gender, age, religion, marital status or photo, even if the CV contains them.

### 5.8 CSV export (P1)
Export dialog: choose columns (including component scores), shortlist only vs all. Client-side CSV with a **UTF-8 BOM** so Arabic opens correctly in Excel. Filename includes the job and date.

### 5.9 Settings and data (P0 / P1)
Profile, company, notifications, **team and roles** (enterprise), **Delete account and data** flow (P1: explain that HR outcomes are anonymised, not deleted), **Integrations** (API keys, webhook, v1.1).

### 5.10 Billing (P0)
Plan, CV usage against capacity, billing cycle, invoices, change plan. Paymob and Stripe depending on region.

### 5.11 Messaging, analytics (P2, v1.1)
- Messaging: team threads, with a **Report** button on messages (routes to the admin queue).
- Analytics: CVs screened, shortlist rate, time-to-shortlist.

### 5.12 Admin panel (P1)
Companies and users; **job moderation queue** (flags MLM patterns, unpaid internships, prohibited content); **reports queue** (from the report button); **block list**; **pilot onboarding controls**; bias audit view (P2: quarterly, flags ratios below 0.8).

### 5.13 Transactional emails (P1)
Rankr uses React Email via Resend. Design the templates (verification, run complete, invite) as part of the front-end deliverable; the back-end sends them. English and Arabic.

---

## 6. Design system plan

**Done:** colour, spacing, radius and shadow tokens from your board (blue-600 primary); Button, Input, Textarea, Select, Checkbox, Card, Badge, Tabs, Dialog, Table, TierSlider, Toast, Segmented, ChoiceChips, state panels, Grid; inline icon set.

**To add:**

| Component | Used for |
|---|---|
| `ScoreBadge` / `MatchPercent` | Match % with the disclaimer tie-in |
| `ConfidenceIndicator` | Parse confidence (high / medium / low), with plain-language tooltip |
| `SkillChip` (tiered) | Required / preferred / nice-to-have, matched / missing / extra |
| `SkillPicker` | Autocomplete with aliases and unknown-skill flag |
| `RationaleCard` | AI explanation with "why this score" |
| `StatusPill` | pending / processing / done / failed, duplicate, scanned |
| `FileRow` with progress | Upload and processing lists |
| `Stepper` / wizard shell | Job creation, workspace setup |
| `ConfirmDialog` | Reject, delete, discard |
| `Tooltip` / `Popover` | Explanations (native popover API) |
| `DataTable` (sort, filter, select) | Ranked list, admin tables |
| `EmptyState` with illustration slot | Onboarding |
| `Disclaimer` | One reusable human-in-the-loop notice |
| `Avatar` (initials, never photos) | Candidates and users |
| `LanguageToggle` | English / Arabic |

**Foundations to settle:**
- **Typography:** the board's display font and an **Arabic-capable family** are still unconfirmed. This blocks final type tokens and RTL QA.
- **RTL:** logical properties are already used; add `dir` switching, mirrored icons (chevrons, arrows), and number formatting. Test every screen in Arabic.
- **i18n:** a lightweight dictionary approach with no heavy library (to fit the no-dependency rule), with keys from day one.
- **Accessibility:** WCAG 2.2 AA target, keyboard-complete tables and dialogs, reduced-motion respected, focus management, colour never the only signal (confidence and status need text or icon).
- **Motion:** short and purposeful; live-processing progress is the one place for delight.
- **Theming:** keep tokens overridable at runtime so v2.0 white-labelling (logo, colours, font, dashboard name) needs no component changes.
- **Dark mode:** not in the PRD; skip for now.

---

## 7. Front-end architecture changes

### 7.1 Contract (`types/`) changes needed
- `Job`: replace `hardFilters: {label}[]` with structured **skill requirements** (`skillId`, tier), `minExperienceYears`, `minDegree`, typed **hard filters** (kind, value), per-job weights.
- Add `ScreeningRun` (id, jobId, createdAt, counts, status) so dashboards can show "recent runs".
- `CandidateStage` becomes `new | shortlisted | rejected | hired`.
- `Candidate`: add `matchPercent`, `rationale`, `matchedSkills`, `missingRequiredSkills`, `extraSkills`, `names` (English and Arabic), `ocrUsed`, `duplicateOf`, `cvSignedUrl`.
- `UploadedCV.status`: `pending | processing | done | failed`, plus `isDuplicate`, `error`.
- `Skill` (canonical id, English name, Arabic name, aliases) and a skills catalogue API.
- `HrOutcome` events (shortlist / reject / message / hire) the UI emits.
- `Role`: `staff | company_admin | recruiter`.

### 7.2 API seam additions (`lib/api/`, all `TODO(backend)`)
`listSkills`, `createJob`, `updateJob`, `getRun`, `listRuns`, `retryFailed`, `setCandidateStage`, `getCandidateCvUrl`, `exportShortlist` (or client-side), `deleteAccountData`, admin endpoints, `getUploadQuota` (hourly limit).

### 7.3 Cross-cutting
- **Scenario toggles** (`?mock=loading|error|empty`) already exist; add `rate-limited`, `partial-failure`, `low-confidence-heavy`.
- **Analytics wrapper:** a thin `track(event, props)` stub (PostHog later) for time-to-rank, shortlist rate and the post-run **CSAT rating prompt** (target above 80% positive).
- **Feature flags:** a simple config for P2 surfaces (messaging, analytics, admin extras, entry flow).
- **Scoring in the browser:** client-side re-rank stays; add confidence multiplier and per-job persistence.

---

## 8. Gap analysis: what is built versus the PRD

| Built | Gap |
|---|---|
| Upload | 500 cap, hourly rate limit, duplicates, per-file progress, virus-scan step, correct copy |
| Processing | Status names, retry, OCR and low-confidence per file, time estimate |
| Ranked list | Match %, top skills, rationale, confidence-aware ranking, search and filter, shortlist/reject, detail link, CSV |
| Dashboard | Recent runs, shortlist counts, onboarding checklist |
| Job model | Skill tiers, hard-filter types, degree level, experience |
| Stages | Invented stages that include interview/offer (out of scope) |
| Entry flow | Hidden; sign-in, Google and forgot-password not built; pricing conflicts |
| i18n / RTL | Not started |
| Settings, admin, messaging, analytics | Not started |

---

## 9. Phased roadmap

**Status:** Phase 1 (contract and foundations) is done. See the checklist under Phase 1 below.

Sizes are relative: S (about a day), M (a few days), L (a week or more).

**Phase 0, align (now):** resolve the 13 conflicts in section 2, confirm fonts, confirm P0 scope. *S*

**Phase 1, contract and foundations (done):** *M-L*
- [x] Type refactor: skill tiers, structured hard filters, degree levels, `ScreeningRun`, richer `Candidate` (rationale, matched / missing / extra skills, OCR and duplicate flags, English and Arabic names), three roles, `OrgBranding`.
- [x] Skills catalogue mock and `listSkills()`.
- [x] Stage rename and confidence-aware match score.
- [x] i18n scaffold (`useLocale`, English messages, Arabic fallback), RTL direction, remembered language, dev language toggle.
- [x] White-label scope (`BrandScope`): runtime brand colour with derived hover and focus colours.
- [x] Analytics and feature-flag stubs.
- [x] Shared components: `Disclaimer`, `MatchScore`, `ConfidenceIndicator`, `SkillChip`, `StatusPill`, `ConfirmDialog`, `DataTable`, `Avatar`.
- Still to do as screens are rebuilt: move the remaining hardcoded English strings into `t()` keys.

**Phase 2, the hero loop (P0):** *this is the product*
1. Job creation wizard with skill picker (L)
2. Upload fixes: cap, rate limit, duplicates, progress (M)
3. Processing fixes: retry, OCR and confidence flags (M)
4. Ranked list v2: match %, chips, rationale, filters, bulk actions (L)
5. Candidate detail with CV viewer and Shortlist/Reject/Hire (L)
6. CSV export with Excel-safe Arabic (S)
7. Dashboard rework and onboarding checklist (M)

**Phase 3, accounts:** sign-in, Google, forgot password, realign entry funnel, team and roles, settings, data-deletion flow, billing. *L*

**Phase 4, admin panel (P1):** companies, users, moderation, reports, block list, pilots. *L*

**Phase 5, v1.1 (P2):** team messaging with Report button, analytics, integrations settings, bias-audit view, email templates. *L*

**Phase 6, hardening:** accessibility audit, Arabic and RTL QA on every screen, responsive pass, performance pass, empty/error coverage check, component gallery completion, hand-off docs for the back-end engineer (contract and endpoint list). *M*

**Explicitly not building:** interview scheduling, job posting and sourcing, video CV, native mobile app, AI learning and recalibration UI, white-label and custom domains, enterprise dedicated deployment, languages beyond Arabic and English.

---

## 10. Open questions, ranked by how much they block

1. **Candidate portal in or out?** (conflict #2) Affects roughly a quarter of the screen set.
2. **Pricing model and prices**, plus trial vs paid. Blocks Plans and Checkout copy.
3. **Which scope list wins**, section 5 or the final roadmap page? (conflict #3)
4. **Fonts**, including the Arabic family. Blocks the type tokens and RTL QA.
5. **Is the app UI bilingual, or only CV content?**
6. Skill tiers: confirm the three tiers and whether the weights are per job or global.
7. Exact **consent wording** and accepted file limits.
8. Can recruiters **message candidates** in v1? (conflict #9)
9. Payment currency and VAT; Paymob vs Stripe selection rule.
10. Company-admin vs recruiter permissions (who can see billing, delete data, invite people).

---

## 11. Back-end hand-off notes (not front-end work)

These are called out by the PRD and are **not** built in this repo: Claude API parsing, Tesseract OCR, skill and title normalization logic, Jaccard scoring and penalties, semantic similarity, rationale generation, SHA-256 hashing, queues (`cv_processing_queue`, `rescore_queue`), Supabase auth, RLS, private storage and signed URLs, rate limiting enforcement, Resend sending, PostHog, Paymob and Stripe, webhooks and REST API, bias audit job, feedback flywheel. The front-end only needs the typed contract in `types/` and the functions in `lib/api/`.
