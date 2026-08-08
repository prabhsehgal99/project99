/**
 * The Firebase client configuration contract.
 *
 * `.env.example` is the canonical list of required variables; a unit test
 * asserts these keys stay identical to it, so the documented contract and the
 * code cannot drift apart.
 *
 * These values are not secrets. Next.js inlines every `NEXT_PUBLIC_*` variable
 * into the client bundle. Security comes from Firebase Authentication and
 * Security Rules, while this module prevents builds from targeting the wrong
 * Project99 environment.
 */

export const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
] as const;

export type AppEnvironment = "dev" | "prod";
export type FirebaseEnvKey = (typeof FIREBASE_ENV_KEYS)[number];
export type FirebaseEnv = Partial<Record<FirebaseEnvKey, string>>;
export type BrowserLocationLike = {
  host: string;
  hostname: string;
  protocol: string;
};

const FIREBASE_PROJECTS: Record<AppEnvironment, string> = {
  dev: "project99-dev",
  prod: "project99live"
};

function value(env: FirebaseEnv, key: FirebaseEnvKey): string {
  return env[key]?.trim() ?? "";
}

export function firebaseClientAuthDomain(
  env: FirebaseEnv,
  location?: BrowserLocationLike
): string {
  const configuredAuthDomain = value(env, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");

  if (!location || value(env, "NEXT_PUBLIC_APP_ENV") !== "prod") {
    return configuredAuthDomain;
  }

  const host = location.host.trim();
  const hostname = location.hostname.trim();

  if (
    location.protocol !== "https:"
    || host === ""
    || hostname === ""
    || hostname === configuredAuthDomain
    || hostname.endsWith(".firebaseapp.com")
    || hostname === "localhost"
    || hostname.endsWith(".localhost")
  ) {
    return configuredAuthDomain;
  }

  return host;
}

/** Names of the required variables that are absent or blank. */
export function missingFirebaseEnvKeys(env: FirebaseEnv): FirebaseEnvKey[] {
  return FIREBASE_ENV_KEYS.filter((key) => value(env, key) === "");
}

/** Human-readable configuration error, or `null` when the values are coherent. */
export function firebaseConfigError(
  env: FirebaseEnv,
  expectedEnvironment?: AppEnvironment
): string | null {
  const missing = missingFirebaseEnvKeys(env);

  if (missing.length > 0) {
    return `Firebase is not configured. Missing ${missing.length} of ${FIREBASE_ENV_KEYS.length} required values: ${missing.join(", ")}. Copy .env.example and fill it from the Firebase console, or run \`npm run env:setup\`.`;
  }

  const appEnvironment = value(env, "NEXT_PUBLIC_APP_ENV");

  if (appEnvironment !== "dev" && appEnvironment !== "prod") {
    return "NEXT_PUBLIC_APP_ENV must be either dev or prod.";
  }

  if (expectedEnvironment && appEnvironment !== expectedEnvironment) {
    return `NEXT_PUBLIC_APP_ENV is ${appEnvironment}, but this deployment requires ${expectedEnvironment}.`;
  }

  const projectId = value(env, "NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const expectedProjectId = FIREBASE_PROJECTS[appEnvironment];

  if (projectId !== expectedProjectId) {
    return `NEXT_PUBLIC_APP_ENV=${appEnvironment} requires Firebase project ${expectedProjectId}, not ${projectId}.`;
  }

  const authDomain = value(env, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (authDomain !== `${projectId}.firebaseapp.com`) {
    return `Firebase auth domain does not match project ${projectId}.`;
  }

  const storageBucket = value(env, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (storageBucket !== `${projectId}.firebasestorage.app`) {
    return `Firebase storage bucket does not match project ${projectId}.`;
  }

  const messagingSenderId = value(env, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!/^\d+$/.test(messagingSenderId)) {
    return "Firebase messaging sender ID must contain digits only.";
  }

  const appId = value(env, "NEXT_PUBLIC_FIREBASE_APP_ID");
  if (!appId.startsWith(`1:${messagingSenderId}:web:`)) {
    return "Firebase app ID does not match the messaging sender ID.";
  }

  return null;
}

/**
 * Enforce the Firebase target for Vercel builds.
 *
 * Non-Vercel CI intentionally returns `null` so the existing unconfigured-app
 * build remains available to repository quality checks.
 */
export function vercelFirebaseConfigError(
  env: FirebaseEnv,
  vercelEnvironment: string | undefined
): string | null {
  if (!vercelEnvironment) {
    return null;
  }

  if (vercelEnvironment === "production") {
    return firebaseConfigError(env, "prod");
  }

  if (vercelEnvironment === "preview" || vercelEnvironment === "development") {
    return firebaseConfigError(env, "dev");
  }

  return `Unsupported VERCEL_ENV value: ${vercelEnvironment}.`;
}
