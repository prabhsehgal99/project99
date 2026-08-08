# Project 99

Project 99 is a mobile-first personal fitness and health tracking PWA built with
Next.js App Router, TypeScript, Tailwind CSS, Firebase Authentication, Cloud
Firestore, Recharts, and Lucide icons.

The current product includes Google sign-in, a protected Today experience at the
route-compatible `/dashboard` URL, global Quick Log capture, Firestore-backed
profiles and settings, Daily Logs, Progress trends, More account/settings
surfaces, and a phone-first workout logger.

## Requirements

- Node.js 22 (see `.nvmrc` and `package.json`)
- npm
- Access to the Project99 development Firebase project
- Vercel access for preview and production deployments

## Firebase environments

Project99 deliberately uses separate Firebase projects:

| App environment | Firebase project | Used by |
| --- | --- | --- |
| `dev` | `project99-dev` | Development, agent sessions, and Vercel previews |
| `prod` | `project99live` | Vercel production only |

Every configured environment supplies the keys in `.env.example`, including
`NEXT_PUBLIC_APP_ENV`. Runtime validation rejects mixed Firebase project
values. Vercel builds additionally fail unless Production uses `prod` and
Preview/Development use `dev`.

Set `NEXT_PUBLIC_SENTRY_DSN` in the hosting provider when a Sentry project is
configured. The app captures uncaught client errors, route error-boundary
failures, authentication failures, and failed Firestore operations without
including user health data or default personally identifiable information.

Firebase web configuration is public client metadata, not a server credential.
Authorization is enforced by Firebase Authentication and Firestore Security
Rules. Never commit environment files, service-account credentials, or other
privileged values.

## Development

Install dependencies:

```bash
npm install
```

Create the ignored development environment file:

```bash
cp .env.example .env.development.local
```

Set `NEXT_PUBLIC_APP_ENV=dev` and fill the remaining values from the
`project99-dev` Firebase web app configuration. Production values belong
only in Vercel.

For ephemeral development or agent environments, protected environment
variables can generate an ignored `.env.local` file:

```bash
npm run env:setup
```

The setup command rejects any environment other than
`dev` / `project99-dev`.

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Firestore data model

- `users/{uid}` stores the signed-in user's profile.
- `users/{uid}/settings/preferences` stores goals and preferences.
- `users/{uid}/dailyMetrics/{yyyy-mm-dd}` stores Daily Logs.
- `users/{uid}/workoutSessions/{sessionId}` stores workout sessions.

Body weight uses kilograms. Water is displayed in litres and stored as integer
millilitres. Training loads use pounds.

## Firebase Security Rules

`firestore.rules` restricts each user to their own `users/{uid}` document tree
and validates Daily Log and workout-session writes. Project aliases are committed
in `.firebaserc`; there is no default alias.

Run the emulator-backed Security Rules suite without connecting to a deployed
Firebase project:

```bash
npm run test:rules
```

Rules releases run only through the protected GitHub Actions workflow, which
always checks out `main`, runs the emulator suite, and records the source commit
and Rules checksum. This prevents an old local branch from being released by
mistake.

After a reviewed merge, request a development release:

```bash
npm run rules:deploy:dev
```

That command requires an authenticated GitHub CLI and dispatches the workflow
against `main`; it does not deploy the Rules from the current folder. The same
workflow can be run from the Actions tab without a local checkout.

After the development release and authenticated runtime check pass, request a
production release:

```bash
npm run rules:deploy:prod
```

Configure two GitHub Actions environments before the first release:

- `firestore-dev`, with a `FIREBASE_SERVICE_ACCOUNT` secret for a service
  account scoped to `project99-dev`.
- `firestore-prod`, with the same secret name but a distinct account scoped to
  `project99live`; require approval for this environment.

Each account needs only the Firebase Rules Admin role
(`roles/firebaserules.admin`) in its own project. Store its JSON key only as the
environment secret, never in a repository file or local environment file. The
Firebase CLI uses these Application Default Credentials in CI, rather than a
human Firebase login or a legacy `FIREBASE_TOKEN`.

Do not run a raw `firebase deploy` for Rules. The Actions run is the release
record and must be followed by the applicable authenticated app smoke test.

## Vercel deployment

Configure project-level environment variables using the `.env.example`
contract:

- Development and Preview scopes: `NEXT_PUBLIC_APP_ENV=dev` and
  `project99-dev` values.
- Production scope: `NEXT_PUBLIC_APP_ENV=prod` and `project99live`
  values.

Firebase Authentication must authorize the assigned domain used for testing.
Environment changes affect only new deployments. Redeploy without reusing the
build cache after changing `NEXT_PUBLIC_*` values because Next.js inlines
them during the build.

Production Google redirect sign-in is served through a first-party Firebase Auth
helper on the deployed app host. Keep the production app domain authorized in
Firebase Authentication, and keep
`https://project99-ten.vercel.app/__/auth/handler` in the Google OAuth client's
authorized redirect URIs. `next.config.ts` proxies `/__/auth/*` and
`/__/firebase/init.json` to the configured Firebase project's `firebaseapp.com`
host so Safari and installed iOS PWAs do not depend on third-party storage.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
