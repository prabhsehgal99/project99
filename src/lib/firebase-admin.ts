import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function required(name: "FIREBASE_ADMIN_PROJECT_ID" | "FIREBASE_ADMIN_CLIENT_EMAIL" | "FIREBASE_ADMIN_PRIVATE_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be configured for training coach requests.`);
  return value;
}

function app() {
  if (getApps().length) return getApps()[0]!;
  return initializeApp({ credential: cert({ projectId: required("FIREBASE_ADMIN_PROJECT_ID"), clientEmail: required("FIREBASE_ADMIN_CLIENT_EMAIL"), privateKey: required("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n") }) });
}

export async function authenticatedCoachUser(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Authentication is required.");
  return getAuth(app()).verifyIdToken(header.slice(7));
}

export function coachDb() {
  return getFirestore(app());
}
