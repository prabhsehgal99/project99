# Project99 Recommendation Status Report

**Report date:** 2026-08-05  
**Repository:** [prabhsehgal99/project99](https://github.com/prabhsehgal99/project99)  
**Production:** [project99-ten.vercel.app](https://project99-ten.vercel.app)

## Executive summary

The Firebase environment split and the safeguards that prevent dev/live
configuration mix-ups are fully implemented on `main` and deployed to
production. The broader foundation hardening, Daily Log navigation guard, PWA
icons, and initial workout engine are also implemented.

The highest-priority remaining recommendations are Firestore Security Rules
hardening, emulator-backed rules tests, completion of runtime acceptance testing,
and evaluation of installed-iOS-PWA authentication. Error monitoring and project
tracking cleanup remain outstanding.

## Completed recommendations

| Recommendation | Status | Evidence |
| --- | --- | --- |
| Separate development and production Firebase projects | Complete | Development uses `project99-dev`; production uses `project99live`. Rules are deployed to both environments. |
| Correct the production Firebase configuration | Complete | The production runtime identifies as `prod`, targets `project99live`, and has passed Google sign-in and persisted Firestore Daily Log verification. |
| Prevent future environment mix-ups | Complete | [PR #24](https://github.com/prabhsehgal99/project99/pull/24) added fail-closed runtime and build validation and was merged as [`905f5e7`](https://github.com/prabhsehgal99/project99/commit/905f5e7509a11c567ac9213b6492311596c7062d). |
| Reject mixed Firebase metadata | Complete | Project ID, auth domain, storage bucket, messaging sender ID, and app ID are validated as one coherent Firebase project. |
| Protect development from production credentials | Complete | `npm run env:setup` accepts only the development Firebase project. Vercel Production requires `prod`; Preview and Development require `dev`. |
| Add automated quality gates | Complete | GitHub Actions runs lint, typecheck, tests, and build. The current suite has 49 passing tests. |
| Harden service-worker and dependency setup | Complete | Navigation uses network-first caching, immutable assets use cache-first behavior, dependencies are pinned, Tailwind CSS 4 is installed, and known high-severity dependency findings were cleared. |
| Prevent loss of unsaved Daily Log edits during app navigation | Complete | [Issue #12](https://github.com/prabhsehgal99/project99/issues/12) is closed and the navigation guard is on `main`. |
| Add the workout-engine foundation | Complete | [Issue #21](https://github.com/prabhsehgal99/project99/issues/21) and PR #22 are merged. |
| Add production PWA icons | Implemented; tracking cleanup remains | Apple touch, 192px, and 512px PNG assets exist. The manifest declares the PNG icons as `any maskable`, but [issue #13](https://github.com/prabhsehgal99/project99/issues/13) remains open and an installed-device icon check should be recorded before closure. |

## Pending recommendations

### 1. Harden Firestore Security Rules — high priority

Tracked by [issue #15](https://github.com/prabhsehgal99/project99/issues/15).

Remaining work:

- Validate fields, types, and sizes for user profile and settings documents.
- Reject future-dated Daily Log documents server-side.
- Reject impossible calendar dates such as `2026-02-31`.
- Resolve the concurrent first-save `createdAt` permission race or provide a
  friendly retry path.

### 2. Add emulator-backed Firestore rules tests — high priority

Tracked by [issue #16](https://github.com/prabhsehgal99/project99/issues/16).

Required coverage:

- Same-user reads and writes are allowed.
- Cross-user reads and writes are denied.
- Invalid document shapes are denied.
- The additional protections from issue #15 are verified.

These tests can run in GitHub Actions even if a local Java runtime is not
available.

### 3. Evaluate installed-iOS-PWA authentication — medium priority

Tracked by [issue #14](https://github.com/prabhsehgal99/project99/issues/14).

Test Google authentication in installed iOS standalone mode and decide between
redirect authentication or a popup/redirect hybrid while preserving the existing
Safari persistence behavior.

### 4. Complete Phase 0 runtime acceptance testing — medium priority

Outstanding scenarios from the
[roadmap](https://github.com/prabhsehgal99/project99/blob/main/docs/project/ROADMAP.md):

- Google sign-in in Chrome and Safari.
- Session restoration after closing and reopening the browser.
- Sign-out and authentication-loss behavior.
- Cross-device synchronization.
- Failed-save behavior.
- Remote-update conflict handling.
- Complete phone and desktop acceptance testing.

Production sign-in, one persisted Daily Log flow, the assigned production
domain, and the latest production deployment have already been verified.

### 5. Add actionable error monitoring — medium priority

Tracked by [issue #17](https://github.com/prabhsehgal99/project99/issues/17).

Select a free-tier-friendly monitoring service and capture client failures and
failed Firestore writes before the Phase 1 release.

## Operational and tracking cleanup

### Reconcile project documentation

[`CURRENT_STATE.md`](https://github.com/prabhsehgal99/project99/blob/main/docs/project/CURRENT_STATE.md)
contains stale post-merge language:

- The workout foundation is described as in progress in the milestone summary,
  despite PR #22 being merged.
- Firebase enforcement is described as "this branch," despite PR #24 being
  merged to `main`.
- The next steps still say to review and merge issue #21.

### Close or update stale tracking

- Verify the installed PWA icon once and close issue #13 if it passes.
- Review and delete the five pre-existing non-main remote branches. At least the
  Firebase enforcement, workout engine, and Phase 0.5 branches are already
  merged.

### Retire the superseded Firebase project

`project99-f7e3c` is no longer referenced by the application. Retire it only
after the agreed production stabilization and backup/safety review period.

## Recommended execution order

1. Harden Firestore Security Rules — issue #15.
2. Add emulator-backed rules tests — issue #16.
3. Complete authentication and synchronization acceptance testing, including
   issue #14.
4. Reconcile stale documentation, issues, and remote branches.
5. Add error monitoring — issue #17.
6. Continue Phase 1A and expand the workout engine through small vertical
   slices: custom exercises, templates, timers, history, and personal-record
   workflows.

## Overall status

The Firebase recommendations and deployment safeguards are complete. The main
remaining audit risks are Firestore rule coverage, automated rules verification,
installed-iOS authentication reliability, and full runtime acceptance testing.
