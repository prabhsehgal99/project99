/**
 * The Firebase client configuration contract.
 *
 * `.env.example` is the canonical list of required variables; a unit test
 * asserts these keys stay identical to it, so the documented contract and the
 * code cannot drift apart.
 *
 * These values are not secrets. Next.js inlines every `NEXT_PUBLIC_*` variable
 * into the client bundle, so anyone using the app can read them. Access is
 * controlled by Firestore Security Rules, the Firebase authorised-domain list,
 * and App Check - never by hiding this configuration.
 */

export const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
] as const;

export type FirebaseEnvKey = (typeof FIREBASE_ENV_KEYS)[number];

export type FirebaseEnv = Partial<Record<FirebaseEnvKey, string>>;

/**
 * Names of the required variables that are absent or blank.
 *
 * Callers must pass an object built with static `process.env.NEXT_PUBLIC_*`
 * property access. Next.js only inlines those static reads into the client
 * bundle; a dynamic `process.env[key]` lookup resolves to `undefined` in the
 * browser, which would report every variable as missing in production.
 */
export function missingFirebaseEnvKeys(env: FirebaseEnv): FirebaseEnvKey[] {
  return FIREBASE_ENV_KEYS.filter((key) => {
    const value = env[key];
    return typeof value !== "string" || value.trim() === "";
  });
}

/** Human-readable reason the app is unconfigured, or `null` when it is ready. */
export function firebaseConfigError(env: FirebaseEnv): string | null {
  const missing = missingFirebaseEnvKeys(env);

  if (missing.length === 0) {
    return null;
  }

  return `Firebase is not configured. Missing ${missing.length} of ${FIREBASE_ENV_KEYS.length} required values in .env.local: ${missing.join(", ")}. Copy .env.example and fill it from the Firebase console, or run \`npm run env:setup\`.`;
}
