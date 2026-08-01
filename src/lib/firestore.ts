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
  where,
  type Unsubscribe
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { normalizeDailyLog } from "@/lib/daily-log";
import { getFirebaseDb } from "@/lib/firebase";
import { defaultSettings, type DailyLog, type UserSettings } from "@/lib/types";

export type DailyLogSnapshot = {
  exists: boolean;
  log: DailyLog;
  hasPendingWrites: boolean;
  fromCache: boolean;
};

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

export function subscribeToDailyLog(
  uid: string,
  date: string,
  onNext: (snapshot: DailyLogSnapshot) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const ref = doc(getFirebaseDb(), "users", uid, "dailyMetrics", date);

  return onSnapshot(
    ref,
    { includeMetadataChanges: true },
    (snap) =>
      onNext({
        exists: snap.exists(),
        log: normalizeDailyLog(date, snap.data()),
        hasPendingWrites: snap.metadata.hasPendingWrites,
        fromCache: snap.metadata.fromCache
      }),
    onError
  );
}

export function subscribeToRecentDailyLogs(
  uid: string,
  startDate: string,
  onNext: (logs: DailyLog[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const logsQuery = query(
    collection(getFirebaseDb(), "users", uid, "dailyMetrics"),
    where("date", ">=", startDate),
    orderBy("date", "asc")
  );

  return onSnapshot(
    logsQuery,
    (snap) => {
      onNext(snap.docs.map((logDoc) => normalizeDailyLog(logDoc.id, logDoc.data())));
    },
    onError
  );
}

export async function saveDailyLog(uid: string, log: DailyLog, existingLog: DailyLog | null) {
  const ref = doc(getFirebaseDb(), "users", uid, "dailyMetrics", log.date);
  await setDoc(ref, {
    ...log,
    createdAt: existingLog?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp()
  });
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
