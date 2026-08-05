import type { NextConfig } from "next";
import {
  vercelFirebaseConfigError,
  type FirebaseEnv
} from "./src/lib/firebase-config";

const firebaseEnv: FirebaseEnv = {
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const deploymentConfigError = vercelFirebaseConfigError(
  firebaseEnv,
  process.env.VERCEL_ENV
);

if (deploymentConfigError) {
  throw new Error(
    `Invalid Firebase deployment configuration: ${deploymentConfigError}`
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false
};

export default nextConfig;
