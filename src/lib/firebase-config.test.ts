import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FIREBASE_ENV_KEYS,
  firebaseConfigError,
  missingFirebaseEnvKeys,
  type FirebaseEnv
} from "./firebase-config";

const complete: FirebaseEnv = Object.fromEntries(
  FIREBASE_ENV_KEYS.map((key) => [key, "value"])
) as FirebaseEnv;

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
    // Guards the documented contract against the code drifting from it.
    expect(envExampleKeys()).toEqual([...FIREBASE_ENV_KEYS]);
  });
});

describe("missingFirebaseEnvKeys", () => {
  it("returns nothing when every value is present", () => {
    expect(missingFirebaseEnvKeys(complete)).toEqual([]);
  });

  it("lists every key when the environment is empty", () => {
    expect(missingFirebaseEnvKeys({})).toEqual([...FIREBASE_ENV_KEYS]);
  });

  it("treats blank and whitespace-only values as missing", () => {
    expect(
      missingFirebaseEnvKeys({ ...complete, NEXT_PUBLIC_FIREBASE_API_KEY: "" })
    ).toEqual(["NEXT_PUBLIC_FIREBASE_API_KEY"]);

    expect(
      missingFirebaseEnvKeys({ ...complete, NEXT_PUBLIC_FIREBASE_APP_ID: "   " })
    ).toEqual(["NEXT_PUBLIC_FIREBASE_APP_ID"]);
  });

  it("reports only the keys that are absent", () => {
    const partial = { ...complete };
    delete partial.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    expect(missingFirebaseEnvKeys(partial)).toEqual(["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]);
  });
});

describe("firebaseConfigError", () => {
  it("is null when configuration is complete", () => {
    expect(firebaseConfigError(complete)).toBeNull();
  });

  it("names the missing variables so the fix is obvious", () => {
    const message = firebaseConfigError({});

    expect(message).toContain("Missing 6 of 6");
    for (const key of FIREBASE_ENV_KEYS) {
      expect(message).toContain(key);
    }
  });
});
