# Project99 Recommendation Status Report

**Report date:** 2026-08-07
**Repository:** [prabhsehgal99/project99](https://github.com/prabhsehgal99/project99)  
**Production:** [project99-ten.vercel.app](https://project99-ten.vercel.app)

## Executive summary

The Firebase environment split and the safeguards that prevent dev/live
configuration mix-ups are fully implemented on `main` and deployed to
production. The broader foundation hardening, Daily Log navigation guard, PWA
icons, and initial workout engine are also implemented.

The four previously open tracked issues were implemented in PR #28, merged to
`main`, and closed. Remaining work is operational/device verification, not an
unimplemented code path.

## Completed recommendations

| Recommendation | Status | Evidence |
| --- | --- | --- |
| Separate development and production Firebase projects | Complete | Development uses `project99-dev`; production uses `project99live`. Rules are deployed to both environments. |
| Correct the production Firebase configuration | Complete | The production runtime identifies as `prod`, targets `project99live`, and has passed Google sign-in and persisted Firestore Daily Log verification. |
| Prevent future environment mix-ups | Complete | [PR #24](https://github.com/prabhsehgal99/project99/pull/24) added fail-closed runtime and build validation and was merged as [`905f5e7`](https://github.com/prabhsehgal99/project99/commit/905f5e7509a11c567ac9213b6492311596c7062d). |
| Reject mixed Firebase metadata | Complete | Project ID, auth domain, storage bucket, messaging sender ID, and app ID are validated as one coherent Firebase project. |
| Protect development from production credentials | Complete | `npm run env:setup` accepts only the development Firebase project. Vercel Production requires `prod`; Preview and Development require `dev`. |
| Add automated quality gates | Complete | GitHub Actions runs lint, typecheck, tests, and build. The current suite has 52 unit tests and 66 emulator rules tests. |
| Harden service-worker and dependency setup | Complete | Navigation uses network-first caching, immutable assets use cache-first behavior, dependencies are pinned, Tailwind CSS 4 is installed, and known high-severity dependency findings were cleared. |
| Prevent loss of unsaved Daily Log edits during app navigation | Complete | [Issue #12](https://github.com/prabhsehgal99/project99/issues/12) is closed and the navigation guard is on `main`. |
| Add the workout-engine foundation | Complete | [Issue #21](https://github.com/prabhsehgal99/project99/issues/21) and PR #22 are merged. |
| Add production PWA icons | Complete in code; device verification follow-up remains | Apple touch, 192px, and 512px PNG assets exist, with explicit `any` and `maskable` manifest entries. [Issue #13](https://github.com/prabhsehgal99/project99/issues/13) is closed. |
| Harden Firestore Security Rules | Complete | [Issue #15](https://github.com/prabhsehgal99/project99/issues/15) is closed. Rules validate profile/settings fields, reject impossible and future Daily Log dates, and handle the concurrent `createdAt` race; Rules are deployed to both Firebase projects. |
| Evaluate installed-iOS-PWA authentication | Complete in code; device follow-up remains | [Issue #14](https://github.com/prabhsehgal99/project99/issues/14) is closed. Installed standalone PWAs use redirect auth and browser tabs use popup auth. |
| Add actionable error monitoring | Complete in code; DSN follow-up remains | [Issue #17](https://github.com/prabhsehgal99/project99/issues/17) is closed. Optional Sentry captures client, auth, boundary, and Firestore operation failures without default PII. |

## Operational follow-up

### 1. Harden Firestore Security Rules — implementation complete

Issue #15 is closed. The emulator suite passes 66 tests covering
profile/settings validation, server-side date checks, and the timestamp race.
Rules are deployed to development and production.

### 2. Add emulator-backed Firestore rules tests — complete

Issue #16 is closed. The suite is on `main` and now includes the additional
protections from #15.

### 3. Evaluate installed-iOS-PWA authentication — implementation complete

Issue #14 now uses redirect authentication for installed standalone PWAs and
popup authentication in browser tabs. Real installed-iOS sign-in and session
restoration remain as follow-up QA.

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

### 5. Add actionable error monitoring — implementation complete

Issue #17 now uses optional Sentry monitoring for client, auth, error-boundary,
and Firestore operation failures. Configure a DSN and verify one controlled
event before relying on production alerts.

## Operational and tracking cleanup

### Remaining housekeeping

- No GitHub issues are open. Keep the operational follow-up above in the
  project memory rather than reopening implementation issues.
- Review and delete the pre-existing non-main remote branches. At least the
  Firebase enforcement, workout engine, and Phase 0.5 branches are already
  merged.

### Retire the superseded Firebase project

`project99-f7e3c` is no longer referenced by the application. Retire it only
after the agreed production stabilization and backup/safety review period.

## Recommended execution order

1. Verify installed iOS auth/icons and the Sentry DSN.
2. Complete Phase 0 runtime acceptance testing and reconcile stale branches.
3. Retire the superseded Firebase project after the stabilization period.
4. Continue Phase 1A and expand the workout engine through small vertical
   slices: custom exercises, templates, timers, history, and personal-record
   workflows.

## Overall status

The Firebase recommendations and deployment safeguards are complete. The main
remaining audit risks are Firestore rule coverage, automated rules verification,
installed-iOS authentication reliability, and full runtime acceptance testing.
