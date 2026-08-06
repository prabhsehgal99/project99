# Project 99

Project 99 is a mobile-first personal fitness and health tracking PWA built with Next.js App Router, TypeScript, Tailwind CSS, Firebase Authentication, Cloud Firestore, Recharts, and Lucide icons.

The first milestone includes Google sign-in, protected dashboard pages, Firestore-backed user profiles/settings, daily health metrics, weekly weight trend charts, validation, loading/empty/error states, and PWA install support.

## Requirements

- Node.js 22 (see `.nvmrc` and the `engines` field)
- npm
- Firebase project on the free Spark plan
- Vercel account on the free tier

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Firebase project:

   - Use the Firebase Spark plan.
   - Enable Authentication.
   - Add Google as a sign-in provider.
   - Create a Cloud Firestore database.
   - Register a Web App in Firebase project settings.

3. Copy the environment example:

   ```bash
   cp .env.example .env.local
   ```

4. Fill `.env.local` with the Firebase Web App config values:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Firestore Data Model

- `users/{uid}` stores the signed-in user's profile.
- `users/{uid}/settings/preferences` stores dashboard goals and preferences.
- `users/{uid}/dailyMetrics/{yyyy-mm-dd}` stores daily dashboard metrics.

Body weight is stored and displayed in kilograms. Water is displayed and entered in litres, then stored internally in Firestore as integer millilitres for precision and compatibility. Training loads should be stored and displayed in pounds as workout tracking expands beyond this milestone.

## Firebase Security Rules

The repository includes `firestore.rules`, which restricts each user to their own
`users/{uid}` document tree and validates Daily Log and workout-session writes.

Run the emulator-backed Security Rules suite without connecting to a deployed
Firebase project:

```bash
npm run test:rules
```

Rules deployments are explicit and environment-specific:

```bash
npm run rules:deploy:dev
npm run rules:deploy:prod
```

## Vercel Deployment

1. Import this repository into Vercel.
2. Keep the default Next.js build settings:
   - Build command: `npm run build`
   - Output: Next.js default
3. Add all `NEXT_PUBLIC_FIREBASE_*` variables from `.env.example` to Vercel project environment variables.
4. In Firebase Authentication settings, add the Vercel production domain to Authorized domains.
5. Deploy.

No paid infrastructure is required for this milestone.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
