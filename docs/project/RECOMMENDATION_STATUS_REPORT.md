# Project99 Recommendation Status Report

**Report date:** 2026-08-07
**Repository:** [prabhsehgal99/project99](https://github.com/prabhsehgal99/project99)  
**Production:** [project99-ten.vercel.app](https://project99-ten.vercel.app)

## Executive summary

The Firebase environment split and the safeguards that prevent dev/live
configuration mix-ups are fully implemented on `main` and deployed to
production. The broader foundation hardening, Daily Log navigation guard, PWA
icons, and initial workout engine are also implemented.

The four previously open tracked issues now have implementation work on the
current branch. Remaining work is deployment/device verification and a final
tracking update, not an unimplemented code path.

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
| Add production PWA icons | Implemented; device verification pending | Apple touch, 192px, and 512px PNG assets exist, with explicit `any` and `maskable` manifest entries. [Issue #13](https://github.com/prabhsehgal99/project99/issues/13) can close after an installed-device check. |

## Pending external verification

### 1. Harden Firestore Security Rules — implementation complete

Tracked by [issue #15](https://github.com/prabhsehgal99/project99/issues/15).

Implemented on the current branch. The emulator suite passes 66 tests covering
profile/settings validation, server-side date checks, and the timestamp race.
Deploy to development and production, then close #15.

### 2. Add emulator-backed Firestore rules tests — complete

Tracked by [issue #16](https://github.com/prabhsehgal99/project99/issues/16).

Issue #16 is closed. The suite is on `main` and now includes the additional
protections from #15.

### 3. Evaluate installed-iOS-PWA authentication — implementation complete

Tracked by [issue #14](https://github.com/prabhsehgal99/project99/issues/14).

Issue #14 now uses redirect authentication for installed standalone PWAs and
popup authentication in browser tabs. Real installed-iOS sign-in and session
restoration remain before closure.

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

Tracked by [issue #17](https://github.com/prabhsehgal99/project99/issues/17).

Issue #17 now uses optional Sentry monitoring for client, auth, error-boundary,
and Firestore operation failures. Configure a DSN and verify one controlled
event before closure.

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

1. Review and merge the current issue-closure branch.
2. Deploy and verify Rules, installed iOS auth/icons, and the Sentry DSN.
3. Close issues #13, #14, #15, and #17 after those checks.
4. Complete Phase 0 runtime acceptance testing and reconcile stale branches.
5. Continue Phase 1A and expand the workout engine through small vertical
   slices: custom exercises, templates, timers, history, and personal-record
   workflows.

## Overall status

The Firebase recommendations and deployment safeguards are complete. The main
remaining audit risks are Firestore rule coverage, automated rules verification,
installed-iOS authentication reliability, and full runtime acceptance testing.
