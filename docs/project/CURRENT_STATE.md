# Current state

Last updated: 2026-08-07 (Phase 0 verification pass)

## Current milestone

Phase 1A (Daily Log hardening, settings, history, PWA polish) is active. Phase
0 implementation, automated verification, Security Rules verification, build
verification, and public production reachability are complete as of the Phase 0
verification pass in issue #32. Formal Phase 0 exit still needs owner-run
runtime QA for authenticated browser flows, cross-device sync, installed iOS PWA
behavior, production writes, and Sentry delivery because this agent workspace
does not have credentials, hosting configuration, or a physical installed PWA.

The Phase 1B workout-engine foundation is merged. The four previously open
foundation issues were implemented in PR #28, merged to `main`, and closed. The
remaining Phase 0 checks are operational verification, not open implementation
work.

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

## Operational follow-up

- Run the owner runtime QA checklist in
  `docs/project/PHASE_0_VERIFICATION.md`: Chrome auth, Safari auth, session
  restoration, sign-out/auth-loss behavior, cross-device sync, conflict handling,
  installed iOS PWA sign-in/session restoration, installed icon rendering,
  production Firestore write smoke test, and Sentry delivery.
- Rules are deployed to `project99-dev` and `project99live`; verify one normal
  production write path during the owner runtime QA pass.
- Configure `NEXT_PUBLIC_SENTRY_DSN` in the hosting provider, redeploy without
  reusing the previous build cache, and trigger a controlled test event before
  relying on production alerts.

## Known blockers

- `.env.local` is absent in *agent* workspaces, so authenticated runtime
  behavior cannot be exercised there; it is configured on the development
  machine against `project99-dev`. Agent workspaces that need it can supply the
  variables and run `npm run env:setup`.
- Chrome-control tooling, Vercel project linkage, Firebase environment values,
  and Sentry configuration were not available in the Conductor `seoul`
  workspace during issue #32, so authenticated runtime QA remains owner-run.
- `project99-f7e3c` (the previous production project) is superseded but not yet
  deleted. Nothing points at it; retire it only after production has run on
  `project99live` for a few days.

## Next steps

1. Run the remaining owner runtime QA checklist in
   `docs/project/PHASE_0_VERIFICATION.md` and then mark Phase 0 formally closed.
2. Delete the last stale remote branch, `chore/11-phase-0-5-setup-hardening`
   (fully merged as PR #18; deletion from a remote session was blocked by
   branch-scoped push credentials, so delete it from GitHub or a laptop).
3. Continue Phase 1A (settings area, history, PWA polish, remaining Daily Log
   hardening).
