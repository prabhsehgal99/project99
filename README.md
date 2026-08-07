# Project 99

Project 99 is a mobile-first personal fitness and health tracking PWA built with
Next.js App Router, TypeScript, Tailwind CSS, Firebase Authentication, Cloud
Firestore, Recharts, and Lucide icons.

The current product includes Google sign-in, protected dashboard pages,
Firestore-backed profiles and settings, Daily Logs, weekly weight trends, and a
phone-first workout logger.

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

Deploy and test development first:

```bash
npm run rules:deploy:dev
```

After validation, review, and merge, deploy the same committed rules to
production:

```bash
npm run rules:deploy:prod
```

Do not use a raw project ID or a bare `firebase deploy`.

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

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
