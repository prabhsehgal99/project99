# Current state

Last updated: 2026-08-08 (calm visual-system pass in progress)

## Current milestone

Phase 1A (Daily operating system) is active. Phase 0 is formally closed as of
2026-08-07. Implementation, automated verification, Security Rules verification,
build verification, public production reachability, owner runtime QA, installed
iOS PWA behavior, production Firestore writes, and Sentry delivery have all
passed.

The current Phase 1 component branch adds the first owner-scoped workout
template/custom-exercise and first-party nutrition foundations. Meal entries
are summarized with the existing Daily Log macro values as an explicit manual
adjustment, preserving historical records without a destructive migration.

The Phase 1B workout-engine foundation is merged. The four previously open
foundation issues were implemented in PR #28, merged to `main`, and closed.

Issue #37 implements the approved calm daily experience redesign on branch
`feature/37-calm-daily-experience` in draft PR #38. The branch is implemented,
locally verified, pushed, and awaiting review plus authenticated dev/preview
runtime QA before merge.

Issue #39 extends the approved visual direction across authenticated screens on
the `calm-visual-redesign` branch. It adds the Sora/divider-led visual system
and a session-only dismissible Today Up next surface without changing persisted
data or authorization behavior.

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

- Status: implemented on branch `feature/37-calm-daily-experience`, opened as
  draft PR #38, awaiting review and authenticated runtime QA before merge.
- The redesign was delivered as one coordinated implementation effort under
  umbrella issue #37. The original three slices remain internal milestones only:
  shell/Today/Quick Log foundation, complete daily experience with Progress and
  More, and workout experience refinement.
- `/dashboard` remains the stable route, but the visible destination is Today.
  Today shows local date context, one data-driven Up next action, compact
  calorie/protein/water progress, and concise truthful logged signals.
- The authenticated shell uses Today, Train, Log, Progress, and More. Log opens
  the global Quick Log experience above the current route and is not an inactive
  navigation destination.
- Persistent account identity and sign out were removed from phone and desktop
  chrome. Account identity and sign out now live under More -> Account.
- The Daily Log remains the canonical dated record at
  `users/{uid}/dailyMetrics/{yyyy-mm-dd}`. Complete dated editing remains
  available through `/log` and `/log/[date]`.
- A narrow Today data provider shares today's Daily Log, settings, loading/error
  state, and active workout state between Today and Quick Log without moving
  route-specific history, charts, or past-day editors into global state.
- Quick Log uses focused native-dialog editors and transaction-safe Daily Log
  mutations that read the latest document, normalize it, apply one typed
  mutation, validate the complete result, preserve `createdAt`, and update
  `updatedAt`. These mutations preserve unrelated fields and concurrent
  server-backed updates.
- Existing Firestore collection paths, Daily Log schema, settings schema,
  workout-session model, workout calculations, owner-scoped authorization, and
  Security Rules remain intact.
- `/progress` owns the weekly weight trend and goal progress that previously
  lived on the dashboard. Empty Progress states explain which logging action
  creates the trend.
- `/more` owns Daily Log history, goals/preferences, and account actions.
- `/log/[date]` uses progressive disclosure with Body, Nutrition, Activity,
  Recovery, and Notes category summaries and focused editors while preserving
  the existing draft, validation, field-level errors, save recovery, cached-data
  warning, remote-conflict handling, and unsaved-navigation behavior.
- `/workouts` prioritizes active exercise and set entry. Workout name and notes
  live behind Options, previous values stay near set entry, manual save/status
  is secondary, Finish workout remains primary, and Daily Log linkage is
  unchanged.
- Loading, empty, error, and recovery behavior implemented or preserved:
  authentication loading and Firebase configuration errors remain visible;
  Today data shows loading/error state from the shared provider; Progress
  handles empty trend data; Quick Log write failures keep attempted values and
  expose Retry; detailed Daily Log cached/offline and remote-conflict behavior
  remains in place; authentication loss continues through the protected-route
  shell.
- Accessibility behavior implemented or preserved: labeled phone and desktop
  primary navigation; 44px+ controls; native Quick Log dialog with labeled title,
  close control, Escape dismissal, focus restoration, and live success/failure
  announcements; visible focus styling from existing controls; reduced-motion
  and reduced-transparency/contrast fallbacks in global CSS.
- D-019 records the durable Today/Quick Log interaction model. The architecture
  event ledger and generated observatory data were updated for the new shared
  data boundary and mutation path.
- Verification in the `chennai` agent workspace: `npm run lint`,
  `npm run typecheck`, `npm test`, `npm run test:rules`, `npm run build`, and
  `npm run architecture:check` pass. Draft PR #38 has passing GitHub Quality and
  Vercel checks.
- Local Playwright CLI screenshots were captured for the
  unauthenticated/configuration-required render at 320px and desktop. Because
  `.env.local` is absent in agent workspaces, authenticated Today, Quick Log,
  Progress, More, Daily Log, workout completion, and live Firestore runtime QA
  still need verification in a dev-configured environment or Vercel preview
  before merge.

## Known blockers

- `.env.local` is absent in *agent* workspaces, so authenticated runtime
  behavior cannot be exercised there; it is configured on the development
  machine against `project99-dev`. Agent workspaces that need it can supply the
  variables and run `npm run env:setup`.
- `project99-f7e3c` (the previous production project) is superseded but not yet
  deleted. Nothing points at it; retire it only after production has run on
  `project99live` for a few days.

## Next steps

1. Review draft PR #38 and complete authenticated dev/preview runtime QA for
   Today, Quick Log, Progress, More, detailed Daily Log editing, and workout
   completion/linkage.
2. After the redesign is reviewed and merged, continue remaining Phase 1A polish
   that is not closed by the redesign or Phase 0 verification.
