import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FIREBASE_ENV_KEYS,
  firebaseConfigError,
  missingFirebaseEnvKeys,
  vercelFirebaseConfigError,
  type FirebaseEnv
} from "./firebase-config";

const completeDev: FirebaseEnv = {
  NEXT_PUBLIC_APP_ENV: "dev",
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "project99-dev.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project99-dev",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "project99-dev.firebasestorage.app",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "366763085398",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:366763085398:web:test"
};

const completeProd: FirebaseEnv = {
  NEXT_PUBLIC_APP_ENV: "prod",
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "project99live.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project99live",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "project99live.firebasestorage.app",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1013590080881",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1013590080881:web:test"
};

function envExampleKeys(): string[] {
  const path = fileURLToPath(new URL("../../.env.example", import.meta.url));

  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((line) => line.split("=")[0]);
}

describe("firebase config contract", () => {
  it("matches .env.example exactly", () => {
    expect(envExampleKeys().filter((key) => key !== "NEXT_PUBLIC_SENTRY_DSN")).toEqual([...FIREBASE_ENV_KEYS]);
    expect(envExampleKeys()).toContain("NEXT_PUBLIC_SENTRY_DSN");
  });
});

describe("missingFirebaseEnvKeys", () => {
  it("returns nothing when every value is present", () => {
    expect(missingFirebaseEnvKeys(completeDev)).toEqual([]);
  });

  it("lists every key when the environment is empty", () => {
    expect(missingFirebaseEnvKeys({})).toEqual([...FIREBASE_ENV_KEYS]);
  });

  it("treats blank and whitespace-only values as missing", () => {
    expect(
      missingFirebaseEnvKeys({ ...completeDev, NEXT_PUBLIC_FIREBASE_API_KEY: "" })
    ).toEqual(["NEXT_PUBLIC_FIREBASE_API_KEY"]);

    expect(
      missingFirebaseEnvKeys({ ...completeDev, NEXT_PUBLIC_FIREBASE_APP_ID: "   " })
    ).toEqual(["NEXT_PUBLIC_FIREBASE_APP_ID"]);
  });

  it("reports only the keys that are absent", () => {
    const partial = { ...completeDev };
    delete partial.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    expect(missingFirebaseEnvKeys(partial)).toEqual([
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    ]);
  });
});

describe("firebaseConfigError", () => {
  it("accepts coherent development and production configurations", () => {
    expect(firebaseConfigError(completeDev)).toBeNull();
    expect(firebaseConfigError(completeProd)).toBeNull();
  });

  it("names missing variables", () => {
    const message = firebaseConfigError({});

    expect(message).toContain(
      `Missing ${FIREBASE_ENV_KEYS.length} of ${FIREBASE_ENV_KEYS.length}`
    );
    for (const key of FIREBASE_ENV_KEYS) {
      expect(message).toContain(key);
    }
  });

  it("rejects unsupported environment identifiers", () => {
    expect(
      firebaseConfigError({ ...completeDev, NEXT_PUBLIC_APP_ENV: "staging" })
    ).toContain("must be either dev or prod");
  });

  it("rejects the wrong Firebase project for the identifier", () => {
    expect(
      firebaseConfigError({
        ...completeDev,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project99live"
      })
    ).toContain("requires Firebase project project99-dev");
  });

  it("rejects mixed auth domains and storage buckets", () => {
    expect(
      firebaseConfigError({
        ...completeDev,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "project99live.firebaseapp.com"
      })
    ).toContain("auth domain does not match");

    expect(
      firebaseConfigError({
        ...completeDev,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
          "project99live.firebasestorage.app"
      })
    ).toContain("storage bucket does not match");
  });

  it("rejects an app ID from another messaging sender", () => {
    expect(
      firebaseConfigError({
        ...completeDev,
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:1013590080881:web:test"
      })
    ).toContain("app ID does not match");
  });
});

describe("vercelFirebaseConfigError", () => {
  it("maps production to prod and preview/development to dev", () => {
    expect(vercelFirebaseConfigError(completeProd, "production")).toBeNull();
    expect(vercelFirebaseConfigError(completeDev, "preview")).toBeNull();
    expect(vercelFirebaseConfigError(completeDev, "development")).toBeNull();
  });

  it("rejects a dev project in production", () => {
    expect(vercelFirebaseConfigError(completeDev, "production")).toContain(
      "requires prod"
    );
  });

  it("rejects a prod project in preview", () => {
    expect(vercelFirebaseConfigError(completeProd, "preview")).toContain(
      "requires dev"
    );
  });

  it("leaves unconfigured non-Vercel CI builds unchanged", () => {
    expect(vercelFirebaseConfigError({}, undefined)).toBeNull();
  });

  it("rejects unknown Vercel environments", () => {
    expect(vercelFirebaseConfigError(completeDev, "unknown")).toContain(
      "Unsupported VERCEL_ENV"
    );
  });
});
