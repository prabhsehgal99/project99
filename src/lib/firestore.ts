"use client";

import {
  collection,
  deleteField,
  doc,
  type DocumentData,
  getDoc,
  limitToLast,
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
import { defaultDailyMetric, defaultSettings, type DailyMetric, type UserSettings } from "@/lib/types";

type StoredDailyMetric = Partial<Omit<DailyMetric, "waterLitres">> & {
  waterLitres?: number;
  waterMl?: number;
};

type StoredUserSettings = Partial<Omit<UserSettings, "waterGoalLitres">> & {
  waterGoalLitres?: number;
  waterGoalMl?: number;
};

function storedLitres(litres?: number, millilitres?: number) {
  if (typeof litres === "number") {
    return litres;
  }

  return typeof millilitres === "number" ? millilitres / 1000 : undefined;
}

function normalizeSettings(data: DocumentData | undefined): UserSettings {
  const stored = data as StoredUserSettings | undefined;

  return {
    ...defaultSettings,
    ...stored,
    waterGoalLitres: storedLitres(stored?.waterGoalLitres, stored?.waterGoalMl) ?? defaultSettings.waterGoalLitres
  };
}

function normalizeDailyMetric(date: string, data: DocumentData | undefined): DailyMetric {
  const stored = data as StoredDailyMetric | undefined;

  return {
    ...defaultDailyMetric(date),
    ...stored,
    date,
    waterLitres: storedLitres(stored?.waterLitres, stored?.waterMl) ?? defaultDailyMetric(date).waterLitres
  };
}

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
      onNext(normalizeSettings(snap.data()));
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

  return onSnapshot(ref, (snap) => onNext(snap.exists() ? normalizeDailyMetric(date, snap.data()) : null), onError);
}

export function subscribeToRecentMetrics(
  uid: string,
  onNext: (metrics: DailyMetric[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const metricsQuery = query(collection(getFirebaseDb(), "users", uid, "dailyMetrics"), orderBy("date", "asc"), limitToLast(7));

  return onSnapshot(
    metricsQuery,
    (snap) => {
      onNext(snap.docs.map((metricDoc) => normalizeDailyMetric(metricDoc.id, metricDoc.data())));
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
      waterMl: deleteField(),
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
      waterGoalMl: deleteField(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
