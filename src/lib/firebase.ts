"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  type Auth
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfigError, type FirebaseEnv } from "./firebase-config";

// Static `process.env.NEXT_PUBLIC_*` reads only. Next.js inlines these into the
// client bundle at build time; a dynamic lookup would be undefined in browsers.
const firebaseEnv: FirebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const firebaseConfig = {
  apiKey: firebaseEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: firebaseEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: firebaseEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseEnv.NEXT_PUBLIC_FIREBASE_APP_ID
};

const configError = firebaseConfigError(firebaseEnv);

export const firebaseReady = configError === null;

/** Which Firebase project this build points at, for environment banners. */
export const firebaseProjectId = firebaseConfig.projectId ?? null;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (firebaseReady && typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  try {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver
    });
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "auth/already-initialized") {
      auth = getAuth(app);
    } else {
      throw err;
    }
  }
  db = getFirestore(app);

  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
}

function configurationError(): Error {
  return new Error(
    configError ?? "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to .env.local."
  );
}

export function getFirebaseAuth() {
  if (!auth) {
    throw configurationError();
  }

  return auth;
}

export function getFirebaseDb() {
  if (!db) {
    throw configurationError();
  }

  return db;
}

export function getGoogleProvider() {
  if (!googleProvider) {
    throw configurationError();
  }

  return googleProvider;
}
