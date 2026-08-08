# Current state

Last updated: 2026-08-07 (Phase 0 closed)

## Current milestone

Phase 1A (Daily Log hardening, settings, history, PWA polish) is active. Phase
0 is formally closed as of 2026-08-07. Implementation, automated verification,
Security Rules verification, build verification, public production reachability,
owner runtime QA, installed iOS PWA behavior, production Firestore writes, and
Sentry delivery have all passed.

The Phase 1B workout-engine foundation is merged. The four previously open
foundation issues were implemented in PR #28, merged to `main`, and closed.

## What is on `main`

- Next.js App Router PWA with strict TypeScript, Tailwind CSS, Firebase Auth
  (Google popup sign-in, Safari-safe persistence), Cloud Firestore, Recharts,
  and Lucide.
- Authenticated shell with dashboard and Daily Log navigation (mobile bottom
  nav, desktop sidebar).
- Date-addressed Daily Log editor at `/log/{yyyy-mm-dd}` with validation,
  unsaved-change prompts on date navigation, remote-conflict banner, and
  cached-data warning.
- Dashboard summarizing today's log, 7-day weight chart, goals, and settings.
- Firestore Security Rules: owner-only access to `users/{uid}` trees with full
  field validation for profiles, settings, Daily Logs, and workout sessions.
- GitHub issue/PR templates and a Quality workflow (lint, typecheck, test,
  build) on Node 22.
- All previous feature/fix branches (PRs #1–#10) are squash-merged; remaining
  remote branches are stale leftovers scheduled for deletion.

## Phase 0.5 hardening (merged 2026-08-01 as PR #18)

- Product roadmap committed as `docs/project/ROADMAP.md` and added to required
  reading.
- Dependencies pinned to caret ranges (were all `"latest"`); see D-008.
- Service worker rewritten: network-first for navigations so deploys are picked
  up, cache-first only for immutable `/_next/static` assets, versioned cache
  name, only successful responses cached.
- Vitest unit-test harness added for `src/lib` (28 tests); `npm test` wired
  into CI; see D-009.
- Fixed: pinch-zoom no longer disabled (`maximumScale` removed), dashboard no
  longer resubscribes all Firestore listeners when settings are edited,
  duplicate `ensureUserDocuments` call removed and profile writes skipped when
  unchanged, habit streak no longer shows 0 before today's habit is logged.
- PROJECT_CONTEXT stack list corrected to installed reality (shadcn/ui,
  TanStack Query, React Hook Form, Zod, Framer Motion are approved-but-not-yet-
  installed; Firebase Storage is planned, not configured).
- Repository made public on 2026-07-31 after a clean full-history secret scan;
  branch protection is now enabled on `main` (PR required, quality check
  required, conversation resolution required, force pushes and deletion
  blocked). See WORKFLOW for details.

## App-navigation unsaved-changes guard (merged)

- Sidebar and bottom-nav links now route through a navigation-guard context
  (`src/components/navigation-guard.tsx`); the Daily Log registers a guard so
  dirty edits get the existing save/discard/cancel prompt instead of being
  silently lost on app-shell navigation (issue #12). Modified clicks that open
  a new tab are not intercepted.
- Not covered (unchanged behavior): browser back/forward through client-side
  history and sign-out with dirty edits.

## Dependency currency and security pass (merged)

- `npm audit` went from 3 high-severity advisories to 0. The vulnerable
  `postcss` and `sharp` copies were nested under `next` and are now pinned
  forward with `overrides`; Next.js stays on the newest stable release. See
  D-011.
- Tailwind CSS upgraded 3.4 -> 4.3 with CSS-first configuration; see D-010.
  `tailwind.config.ts` and `autoprefixer` are gone.
- App icons: generated PNG `apple-touch-icon` (180x180), 192 and 512 icons
  from `icon.svg`, declared them in root metadata, and added them to the
  manifest. This clears the `/favicon.ico` 404 and the missing iOS
  home-screen icon.
- Deliberately **not** upgraded, both blocked by `eslint-config-next@16.2.12`:
  - ESLint 10 — its bundled `eslint-plugin-react` calls the ESLint 9 context
    API that v10 removed, so `npm run lint` crashes.
  - TypeScript 7 — bundled `typescript-eslint` refuses TS 7.0 outright, so
    `npm run lint` crashes. `tsc --noEmit` itself passes on TS 7.
  Both are ready to revisit when `eslint-config-next` supports them; the
  caret ranges stay on ESLint 9 and TypeScript 6 until then.
- Verified by building the previous commit side by side and comparing renders:
  mobile geometry is unchanged, and the one desktop difference is the landing
  `h1` line-height, where v4 now correctly honours the `leading-tight` that v3
  silently overrode above 640px.
- Authenticated runtime verified on 2026-08-01 against `project99-dev`: Google
  sign-in, a Daily Log write reaching `users/{uid}/dailyMetrics/{date}`, and the
  Tailwind v4 form controls (inputs, selects, habit checkbox, sticky save bar,
  focus rings) on narrow and wide layouts. This closes the one gap the v4
  upgrade could not be checked against from an unauthenticated workspace.

## Firebase environment split (merged 2026-08-04 as PR #20)

- Two projects replace the single shared one: `project99-dev` for local
  development, agent sessions, and Vercel preview builds; `project99live` for
  production. See D-013.
- Firestore rules deployed to both from the repository via
  `npm run rules:deploy:dev` and `npm run rules:deploy:prod`.
- Vercel production repointed to `project99live` and verified: sign-in works on
  `project99-ten.vercel.app`, which is registered in that project's authorised
  domains. Preview and Development scopes use `project99-dev`.
- Two gotchas worth remembering, both hit during the cutover. Vercel's
  "Use existing Build Cache" can reuse compiled output with the previous
  `NEXT_PUBLIC_*` values still inlined, so untick it whenever configuration
  changes. And Firebase authorised domains must list the assigned production
  domain; per-deployment Vercel URLs are different hosts and are regenerated on
  every build, so always test on the assigned domain.

## Firebase environment identity enforcement (merged PR #24)

- Issue #23 tracks the fail-closed environment guard discovered during the Firebase cutover audit.
- Every configured app now requires `NEXT_PUBLIC_APP_ENV=dev|prod`.
- Runtime validation maps `dev` to `project99-dev` and `prod` to `project99live`, and rejects mixed auth-domain, storage-bucket, messaging-sender, and app-ID values.
- `next.config.ts` fails Vercel Production builds unless they use prod, and fails Preview/Development builds unless they use dev. Unconfigured non-Vercel quality CI remains supported.
- `npm run env:setup` rejects production configuration so local and agent sessions cannot generate a production-backed environment file.
- The production bundle was redeployed without the stale build cache and verified against `project99live`; Google sign-in and a persisted Firestore Daily Log write both passed on the assigned production domain.

## Workout engine foundation (merged 2026-08-05 as PR #22)

- Issue #21 and `docs/features/workout-engine/brief.md` define the first Phase
  1B vertical slice.
- `/workouts` provides a phone-first active workout logger: start/resume, a
  built-in initial exercise catalogue, warm-up and working sets, pounds, reps,
  optional RPE, notes, save protection, prior completed-set context, working
  volume, and Epley estimated 1RM.
- Completed sessions live at `users/{uid}/workoutSessions/{sessionId}` and are
  linked atomically to the session date's Daily Log. The Daily Log now retains a
  nullable `workoutSessionId` so later edits cannot break that link.
- Workout-session ownership and document shape are validated in Firestore Rules;
  nested set integrity is also validated in tested client domain logic.

## Firestore Security Rules test suite (merged PR #27)

- Issue #16 adds emulator-backed tests for authenticated ownership, true
  cross-user and unauthenticated create/update/read/delete denial across
  profiles, settings, Daily Logs, and workout sessions, plus Daily Log schemas,
  date/path consistency, timestamp types and immutability, and workout-session
  schemas and status transitions.
- `npm run test:rules` starts only the local Firestore emulator against a demo
  project ID and runs the dedicated Vitest rules suite. It never deploys rules
  or connects to the dev or production Firebase projects.
- The Quality workflow provisions Java 21 and runs the rules suite alongside
  lint, typecheck, unit tests, and the production build.

## Issue closure work (merged PR #28)

- Issue #15: profile and settings documents now have exact field, type, and
  size validation; Daily Logs reject impossible and future dates in Rules; and
  concurrent first-save updates may use only the server-generated request time
  for `createdAt`. The emulator suite covers all of these cases.
- Issue #14: installed standalone PWAs use Firebase redirect authentication;
  regular browser tabs retain popup authentication. Redirect-result failures are
  surfaced and the existing local persistence configuration is unchanged.
- Issue #13: the manifest and root metadata publish explicit 180px Apple,
  192px, and 512px PNG assets, including separate maskable entries.
- Issue #17: optional Sentry monitoring captures uncaught client failures,
  error-boundary failures, authentication failures, and Firestore operation
  failures without sending default PII or health-record payloads.

## Phase 0 verification pass (issue #32)

- Verification record: `docs/project/PHASE_0_VERIFICATION.md`.
- `npm ci` completed successfully and reported 0 vulnerabilities.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:rules`, and
  `npm run build` passed from the Conductor `seoul` workspace on 2026-08-07.
- The production site at `https://project99-ten.vercel.app` responded with HTTP
  200.
- Production `/manifest.webmanifest`, `/sw.js`, `/icon-192.png`, and
  `/apple-touch-icon.png` responded with HTTP 200.
- The production manifest declares standalone display mode and any/maskable icon
  assets.
- `next.config.ts` now sets an explicit Turbopack root so builds do not infer a
  parent workspace root when multiple lockfiles exist on the development
  machine.
- The stale merged remote branch `chore/11-phase-0-5-setup-hardening` was
  deleted from GitHub.
- Owner runtime QA passed on 2026-08-07: Chrome and Safari auth, session
  restoration, sign-out/auth-loss behavior, cross-device sync, remote-conflict
  handling, failed-save behavior, phone and desktop acceptance, installed iOS PWA
  sign-in/session restoration/icon rendering, Sentry delivery, and a production
  Firestore write smoke test.

## Installed iOS PWA Google sign-in loop fix

- On 2026-08-08, installed iOS PWA Google sign-in was reported to complete the
  Google account step but return to the login screen. The failing path was the
  standalone PWA redirect flow introduced for issue #14.
- The app now keeps redirect auth for installed PWAs but initializes production
  Firebase Auth with the first-party HTTPS app host and proxies `/__/auth/*` plus
  `/__/firebase/init.json` through Next.js to the configured Firebase project.
  This follows Firebase's redirect-auth guidance for Safari/storage-partitioned
  browsers while preserving popup auth for regular browser tabs.
- Production Firebase/Google configuration must keep the assigned app domain
  authorized, including the Google OAuth redirect URI
  `https://project99-ten.vercel.app/__/auth/handler`.

## Architecture Observatory (issue #35, draft PR #36)

- Branch `feature/35-architecture-observatory` adds an internal unlinked
  `/architecture` route that visualizes Project99 as an evidence-backed building
  with timeline controls, filters, a selectable SVG building view, element
  inspector, change summary, and non-visual architecture list.
- The observatory is driven by `src/data/architecture-events.ts`, validated by
  strict TypeScript logic and Vitest tests in
  `src/lib/architecture-observatory.ts`, and generated deterministically into
  `src/generated/architecture-observatory-data.ts`.
- `npm run architecture:generate` regenerates the route data, and
  `npm run architecture:check` verifies generated freshness plus watched-path
  coverage or documented exceptions.
- D-018 records the durable decision to keep architecture history in a versioned
  event ledger and to keep the route out of customer-facing navigation unless
  explicitly approved.

## Calm daily experience redesign (issue #37)

- Branch `feature/37-calm-daily-experience` implements the Phase 1A/1B daily
  experience redesign in one coordinated pull request.
- `/dashboard` is now presented as Today, with local date context, a single
  data-driven Up next action, compact calorie/protein/water progress, and
  truthful logged signals.
- The authenticated shell now uses Today, Train, Log, Progress, and More. Log is
  a global Quick Log action, not a route; persistent user identity and sign out
  moved to More > Account.
- A narrow Today data provider shares today's Daily Log, settings, and active
  workout state between Today and Quick Log without moving route-specific
  history into global state.
- Quick Log uses focused native-dialog editors and transaction-safe Daily Log
  mutations that read the latest document, normalize it, validate the complete
  result, preserve `createdAt`, and update `updatedAt`.
- `/progress` now owns the weekly weight trend and goal progress that previously
  lived on the dashboard. `/more` owns Daily Log history, goals/preferences, and
  account sign out.
- `/log/[date]` now uses category summaries and focused editors while preserving
  the existing draft, validation, save recovery, cached-data warning, conflict,
  and unsaved-navigation behavior.
- `/workouts` was visually refocused around active exercise and set entry, with
  workout name/notes under Options and Finish workout as the primary sticky
  action; the persisted workout-session model is unchanged.
- D-019 records the durable Today/Quick Log interaction model. The architecture
  event ledger and generated observatory data were updated for the new shared
  data boundary and mutation path.
- Verification in the `chennai` agent workspace: `npm run lint`,
  `npm run typecheck`, `npm test`, `npm run test:rules`, `npm run build`, and
  `npm run architecture:check` pass. Local Playwright screenshots were captured
  for the unauthenticated/configuration-required render at 320px and desktop.
  Authenticated runtime verification still requires Firebase dev environment
  values, which are absent in agent workspaces.

## Known blockers

- `.env.local` is absent in *agent* workspaces, so authenticated runtime
  behavior cannot be exercised there; it is configured on the development
  machine against `project99-dev`. Agent workspaces that need it can supply the
  variables and run `npm run env:setup`.
- `project99-f7e3c` (the previous production project) is superseded but not yet
  deleted. Nothing points at it; retire it only after production has run on
  `project99live` for a few days.

## Next steps

1. Continue Phase 1A (settings area, history, PWA polish, remaining Daily Log
   hardening).
