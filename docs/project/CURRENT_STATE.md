# Current state

Last updated: 2026-07-31 (Phase 0.5 setup hardening, issue #11)

## Current milestone

Phase 0 (roadmap): verify the authenticated foundation against real Firebase
data, then finish Phase 0.5 setup hardening before starting Phase 1A.

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

## Phase 0.5 hardening (this branch)

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
- WORKFLOW documents that GitHub branch protection is unavailable on the
  current plan (private repo, Free tier); merge discipline is convention-only
  until that changes.

## Known issues and deferred work (tracked as GitHub issues)

- Unsaved Daily Log edits are silently lost when navigating via the app
  sidebar/bottom nav (date navigation is guarded; app navigation is not).
- No PNG `apple-touch-icon`; iOS home-screen installs get a degraded icon.
- `signInWithPopup` may be unreliable in installed iOS standalone PWA mode;
  evaluate redirect flow.
- Firestore rules gaps: `users/{uid}` profile and settings documents have no
  field validation; future-dated `dailyMetrics` are only blocked client-side;
  date regex accepts impossible calendar dates; concurrent first-save of the
  same day can fail with a raw permission error.
- Emulator-backed rules tests still blocked locally (no Java runtime).
- No error monitoring/reporting yet (Phase 1 release item).

## Known blockers

- `.env.local` is absent in this workspace, so authenticated runtime behavior
  (sign-in, real Firestore reads/writes) cannot be exercised here. Production
  smoke tests run against `https://project99-ten.vercel.app`.
- Firestore emulator verification requires a Java runtime, which is not
  installed in this workspace.

## Next steps

1. Merge Phase 0.5 hardening (issue #11) after review.
2. Delete the stale, already-merged remote branches.
3. Complete Phase 0 runtime verification (real sign-in QA in Chrome/Safari,
   cross-device sync, conflict testing) per `docs/project/ROADMAP.md`.
4. Add emulator-backed Firestore rules tests once Java tooling is available.
5. Begin Phase 1A (settings area, history, PWA polish, Daily Log hardening).
