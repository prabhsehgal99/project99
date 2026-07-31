"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase";
import { defaultSettings, type DailyMetric, type UserSettings } from "@/lib/types";

export async function ensureUserDocuments(user: User) {
  const db = getFirebaseDb();
  const userRef = doc(db, "users", user.uid);
  const settingsRef = doc(db, "users", user.uid, "settings", "preferences");
  const [userSnap, settingsSnap] = await Promise.all([getDoc(userRef), getDoc(settingsRef)]);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName ?? "Project 99 Athlete",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } else {
    await updateDoc(userRef, {
      displayName: user.displayName ?? userSnap.data().displayName ?? "Project 99 Athlete",
      email: user.email ?? userSnap.data().email ?? "",
      photoURL: user.photoURL ?? userSnap.data().photoURL ?? "",
      updatedAt: serverTimestamp()
    });
  }

  if (!settingsSnap.exists()) {
    await setDoc(settingsRef, {
      ...defaultSettings,
      updatedAt: serverTimestamp()
    });
  }
}

export function subscribeToSettings(
  uid: string,
  onNext: (settings: UserSettings) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const ref = doc(getFirebaseDb(), "users", uid, "settings", "preferences");

  return onSnapshot(
    ref,
    (snap) => {
      onNext({ ...defaultSettings, ...(snap.data() as Partial<UserSettings> | undefined) });
    },
    onError
  );
}

export function subscribeToDailyMetric(
  uid: string,
  date: string,
  onNext: (metric: Partial<DailyMetric> | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const ref = doc(getFirebaseDb(), "users", uid, "dailyMetrics", date);

  return onSnapshot(ref, (snap) => onNext(snap.exists() ? (snap.data() as DailyMetric) : null), onError);
}

export function subscribeToRecentMetrics(
  uid: string,
  onNext: (metrics: DailyMetric[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const metricsQuery = query(collection(getFirebaseDb(), "users", uid, "dailyMetrics"), orderBy("date", "asc"));

  return onSnapshot(
    metricsQuery,
    (snap) => {
      onNext(snap.docs.map((metricDoc) => metricDoc.data() as DailyMetric));
    },
    onError
  );
}

export async function saveDailyMetric(uid: string, metric: DailyMetric) {
  const ref = doc(getFirebaseDb(), "users", uid, "dailyMetrics", metric.date);
  await setDoc(
    ref,
    {
      ...metric,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function saveSettings(uid: string, settings: UserSettings) {
  const ref = doc(getFirebaseDb(), "users", uid, "settings", "preferences");
  await setDoc(
    ref,
    {
      ...settings,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
