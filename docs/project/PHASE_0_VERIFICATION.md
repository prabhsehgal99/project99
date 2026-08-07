# Phase 0 verification

Last updated: 2026-08-07

Issue: https://github.com/prabhsehgal99/project99/issues/32

## Status

The code-side, Security Rules, build, and public production reachability checks
for Phase 0 passed on 2026-08-07 from the Conductor `seoul` workspace.

Formal Phase 0 exit still requires a short owner-run runtime QA pass because this
agent workspace does not have Firebase environment values, an authenticated
Google session, Vercel project linkage, Sentry configuration, or an installed iOS
standalone PWA.

## Verified from this workspace

- `npm ci` completed successfully and reported 0 vulnerabilities.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed: 6 files, 52 tests.
- `npm run test:rules` passed: 1 file, 66 Firestore emulator tests.
- `npm run build` passed with Next.js 16.2.12.
- Production landing page responded with HTTP 200 at
  `https://project99-ten.vercel.app`.
- Production PWA assets responded with HTTP 200:
  - `/manifest.webmanifest`
  - `/sw.js`
  - `/icon-192.png`
  - `/apple-touch-icon.png`
- The production manifest declares standalone display mode and any/maskable icon
  assets.
- The stale merged remote branch `chore/11-phase-0-5-setup-hardening` was
  deleted from GitHub.

## Runtime QA still required

These checks are not meaningfully verifiable from this workspace without handling
user credentials or private hosting configuration.

1. Chrome production auth path
   - Open `https://project99-ten.vercel.app` in Chrome.
   - Sign in with Google.
   - Create or edit today's Daily Log.
   - Refresh and confirm the saved values restore from Firestore.
   - Sign out and confirm protected routes return to the public state.

2. Safari production auth path
   - Repeat the Chrome flow in Safari.
   - Close and reopen the browser, then confirm session restoration.

3. Cross-device synchronization
   - Sign in as the same user on two devices or two browser profiles.
   - Edit a Daily Log on device A.
   - Confirm device B receives or restores the changed values.

4. Remote-update conflict handling
   - Open the same dated Daily Log in two tabs or devices.
   - Save a change in tab A.
   - Make a different unsaved change in tab B.
   - Confirm the remote-conflict banner appears and no local edits are silently
     discarded.

5. Failed-save behavior
   - Temporarily interrupt network access or use a controlled invalid write.
   - Attempt to save a Daily Log edit.
   - Confirm the user sees a clear error state and unsaved values are not treated
     as saved.
   - Restore connectivity and confirm a later save succeeds.

6. Phone and desktop acceptance
   - Exercise the authenticated dashboard and Daily Log on a phone-width viewport
     or device.
   - Repeat on a desktop viewport.
   - Confirm primary actions remain visible, touch targets are usable, focus
     states are visible, and loading, empty, error, and saved states are legible.

7. Installed iOS PWA
   - Add the production app to the iOS Home Screen.
   - Launch from the installed icon.
   - Confirm Google sign-in uses the redirect flow and completes.
   - Close and reopen the installed app and confirm the session restores.
   - Confirm the installed icon renders correctly.

8. Sentry monitoring
   - Configure `NEXT_PUBLIC_SENTRY_DSN` in Vercel Production.
   - Redeploy production without reusing the previous build cache.
   - Trigger a controlled client test error and confirm it appears in Sentry
     without default PII or health-record payloads.

9. Production Firestore write smoke test
   - On the assigned production domain, sign in and save a harmless Daily Log
     edit.
   - Confirm the write lands under the signed-in user's
     `users/{uid}/dailyMetrics/{date}` path in `project99live`.

## Phase 0 closure rule

Phase 0 may be marked complete after the runtime QA checklist above passes. Until
then, implementation can continue into Phase 1A, but the remaining Phase 0 work
should be treated as operational verification rather than missing application
code.
