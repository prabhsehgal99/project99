# Current state

Last updated: 2026-07-31

## Current milestone

Finish Firebase integration and complete the first authenticated end-to-end user
flow.

## Verified in this workspace

- Project99 application repository is present in this workspace.
- Next.js app builds with App Router, TypeScript, Tailwind CSS, Firebase,
  Recharts, and Lucide.
- Firebase client initialization is guarded by required
  `NEXT_PUBLIC_FIREBASE_*` values and fails with user-facing configuration
  messaging when missing.
- Google sign-in, sign-out, auth-state loading, protected dashboard routing, and
  user-owned Firestore profile/settings/daily metric paths are implemented.
- Firestore Security Rules restrict `users/{uid}` document trees to the signed-in
  owner.
- Cross-device workflow docs, GitHub issue templates, pull request template, and
  GitHub Actions quality workflow are being added on branch
  `chore/cross-device-workflow-clean`.
- Node.js 22 is pinned in repository configuration and `npm ci` was verified with
  Node 22. The production build currently completes without Firebase environment
  variables.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- Local no-env rendering returns `200` for `/` and `/dashboard` and shows the
  expected Firebase configuration messaging.
- Safari Firebase Authentication persistence fix is implemented on branch
  `fix/firebase-safari-auth-persistence`: Auth now initializes with
  `initializeAuth`, `browserLocalPersistence`, and
  `browserPopupRedirectResolver` only in the browser while keeping Google popup
  sign-in and persistent sessions.
- For the Safari auth persistence fix, the no-env path passes `npm run lint`,
  `npm run typecheck`, and `npm run build` in this workspace after `npm ci`.
  The no-env build prerenders `/`, `/dashboard`, and `/_not-found`.
- The configured-env build path also passes with safe placeholder
  `NEXT_PUBLIC_FIREBASE_*` values, confirming `firebaseReady === true` during
  server prerendering does not initialize browser-only Auth persistence. The
  configured-env build prerenders `/`, `/dashboard`, and `/_not-found`.
- Static Firestore Security Rules review confirms cross-user reads and writes are
  denied: all `users/{userId}` document access, including nested documents, is
  allowed only when `request.auth.uid == userId`; unmatched paths default to
  denial. Application Firestore helpers use the signed-in `user.uid` for profile,
  settings, and daily metric paths.
- Daily Log vertical slice is implemented on branch
  `feature/daily-log-vertical-slice`: `/log` resolves to today's local date,
  `/log/{yyyy-mm-dd}` opens a date-addressed editor, the dashboard summarizes
  today's normalized Daily Log instead of duplicating the full editor, settings
  save independently, and the authenticated app shell exposes Dashboard and Daily
  Log navigation on mobile and desktop.
- Daily Log data continues to use
  `users/{uid}/dailyMetrics/{yyyy-mm-dd}` while application code uses the
  `DailyLog` domain name. Legacy daily metric documents are normalized in the
  Firestore boundary and are additively upgraded on the next editor save.
- Firestore rules now use a specific `dailyMetrics/{date}` match for Daily Log
  owner-scoped read/write access and field validation, with the prior recursive
  nested owner catch-all removed so the specific validator cannot be bypassed.
- For the Daily Log branch, `npm run lint`, `npm run typecheck`, and
  `npm run build` pass locally after `npm ci`. The local Node runtime is
  `v26.3.1`, so npm reports the repository's `node: 22.x` engine warning during
  install; CI/Vercel remain pinned to Node.js 22.

## Reported complete

- Private Git repository and Next.js application setup
- TypeScript, Tailwind CSS, and shadcn/ui
- Firebase project and Cloud Firestore database
- Google Authentication enabled in Firebase
- Vercel configuration
- Build, lint, typecheck, and local development scripts
- `.env.local` created from `.env.example`

These items were reported from prior context. In this workspace, `.env.local` is
not present, so authenticated Firebase runtime behavior has not been verified
with real project values.

## Next vertical slice

1. Add local Firebase public web app values to `.env.local` without committing
   them.
2. Run the app locally and complete Google sign-in.
3. Verify an authenticated user can create or update
   `users/{uid}/dailyMetrics/{yyyy-mm-dd}` through the dashboard.
4. Confirm the same user can read the saved dashboard state after refresh.
5. Add emulator-backed Firestore Security Rules tests for same-user allow and
   cross-user deny cases once Java and rules-test tooling are available.
6. Validate mobile and desktop UX against the authenticated dashboard, then run
   lint, typecheck, and build again.

## Handoff

### Last completed

- Project master context added to repository memory files.
- Cross-device GitHub workflow bundle merged into repository memory and GitHub
  templates.
- Static validation checks and no-env route rendering verified.

### In progress

- Firebase integration milestone; authenticated runtime verification remains.
- Manual Safari and Chrome Google sign-in verification for
  `fix/firebase-safari-auth-persistence` remains pending until Firebase public
  web app values are available locally or the Vercel preview can be tested.

### Known blockers

- `.env.local` is absent in this workspace, so Google sign-in and real Firestore
  read/write behavior cannot be exercised here without local Firebase web app
  values.
- This also blocks local confirmation that Safari no longer reports
  "Database is closing/hidden", Chrome authentication still works, sign-out
  still works, and auth-state restoration survives browser restarts.
- Firestore emulator verification is blocked in this workspace because no Java
  runtime is installed and no rules test harness is currently configured.
- Daily Log authenticated runtime QA, cross-device save/restore, Chrome/Safari
  sign-in smoke testing, and Vercel preview smoke testing remain pending until
  Firebase public web app values or a configured preview environment are
  available. `firebase emulators:exec --only firestore "true"` still fails
  because Java is not installed, so Daily Log rule validation is limited to
  static review in this workspace.
