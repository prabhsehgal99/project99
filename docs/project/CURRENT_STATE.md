# Current state

Last updated: 2026-08-06 (Firestore Security Rules test suite)

## Current milestone

Phase 0 (roadmap) runtime verification remains outstanding, and Phase 1A
(Daily Log hardening, settings, history, PWA polish) has started with the
app-navigation unsaved-changes guard. Phase 1B workout-engine foundation is now
in progress by explicit owner direction. Phase 0.5 setup hardening is merged.

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
  field validation for `dailyMetrics/{date}` documents.
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

## App-navigation unsaved-changes guard (this branch)

- Sidebar and bottom-nav links now route through a navigation-guard context
  (`src/components/navigation-guard.tsx`); the Daily Log registers a guard so
  dirty edits get the existing save/discard/cancel prompt instead of being
  silently lost on app-shell navigation (issue #12). Modified clicks that open
  a new tab are not intercepted.
- Not covered (unchanged behavior): browser back/forward through client-side
  history and sign-out with dirty edits.

## Dependency currency and security pass (this branch)

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

## Firebase environment split (this branch)

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

## Workout engine foundation (this branch)

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

## Firestore Security Rules test suite (this branch)

- Issue #16 adds emulator-backed tests for authenticated ownership, cross-user
  and unauthenticated denial, Daily Log schemas, date/path consistency,
  timestamp types and immutability, and workout-session schemas and status
  transitions.
- `npm run test:rules` starts only the local Firestore emulator against a demo
  project ID and runs the dedicated Vitest rules suite. It never deploys rules
  or connects to the dev or production Firebase projects.
- The Quality workflow provisions Java 21 and runs the rules suite alongside
  lint, typecheck, unit tests, and the production build.

## Known issues and deferred work (tracked as GitHub issues)

- `signInWithPopup` may be unreliable in installed iOS standalone PWA mode;
  evaluate redirect flow.
- Firestore rules gaps: `users/{uid}` profile and settings documents have no
  field validation; future-dated `dailyMetrics` are only blocked client-side;
  date regex accepts impossible calendar dates; concurrent first-save of the
  same day can fail with a raw permission error.
- No error monitoring/reporting yet (Phase 1 release item).

## Known blockers

- `.env.local` is absent in *agent* workspaces, so authenticated runtime
  behavior cannot be exercised there; it is configured on the development
  machine against `project99-dev`. Agent workspaces that need it can supply the
  variables and run `npm run env:setup`.
- `project99-f7e3c` (the previous production project) is superseded but not yet
  deleted. Nothing points at it; retire it only after production has run on
  `project99live` for a few days.

## Next steps

1. Review and merge the workout engine foundation (issue #21), then extend it
   with custom exercises, templates, timer, history, and PR workflows in small
   vertical slices.
2. Delete the last stale remote branch, `chore/11-phase-0-5-setup-hardening`
   (fully merged as PR #18; deletion from a remote session was blocked by
   branch-scoped push credentials, so delete it from GitHub or a laptop).
3. Complete Phase 0 runtime verification (real sign-in QA in Chrome/Safari,
   cross-device sync, conflict testing) per `docs/project/ROADMAP.md`.
4. Review and merge the emulator-backed Firestore rules suite for issue #16.
5. Continue Phase 1A (settings area, history, PWA polish, remaining Daily Log
   hardening).
