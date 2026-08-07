"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { normalizeDailyLog } from "@/lib/daily-log";
import { getFirebaseDb } from "@/lib/firebase";
import { reportFirestoreError } from "@/lib/monitoring";
import { normalizeWorkoutSession } from "@/lib/workout";
import { defaultDailyLog, defaultSettings, type DailyLog, type UserSettings, type WorkoutSession } from "@/lib/types";

export type DailyLogSnapshot = {
  exists: boolean;
  log: DailyLog;
  hasPendingWrites: boolean;
  fromCache: boolean;
};

export async function ensureUserDocuments(user: User) {
  return reportFirestoreError("ensure-user-documents", async () => {
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
      const existing = userSnap.data();
      const nextProfile = {
        displayName: user.displayName ?? existing.displayName ?? "Project 99 Athlete",
        email: user.email ?? existing.email ?? "",
        photoURL: user.photoURL ?? existing.photoURL ?? ""
      };
      const changed =
        nextProfile.displayName !== existing.displayName ||
        nextProfile.email !== existing.email ||
        nextProfile.photoURL !== existing.photoURL;

      if (changed) {
        await updateDoc(userRef, {
          ...nextProfile,
          updatedAt: serverTimestamp()
        });
      }
    }

    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, {
        ...defaultSettings,
        updatedAt: serverTimestamp()
      });
    }
  });
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
  return reportFirestoreError("save-daily-log", async () => {
    const ref = doc(getFirebaseDb(), "users", uid, "dailyMetrics", log.date);
    await setDoc(ref, {
      ...log,
      createdAt: existingLog?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
}

export async function saveSettings(uid: string, settings: UserSettings) {
  return reportFirestoreError("save-settings", async () => {
    const ref = doc(getFirebaseDb(), "users", uid, "settings", "preferences");
    await setDoc(
      ref,
      {
        ...settings,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  });
}

export function subscribeToActiveWorkout(
  uid: string,
  onNext: (session: WorkoutSession | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const sessionsQuery = query(
    collection(getFirebaseDb(), "users", uid, "workoutSessions"),
    where("status", "==", "active"),
    limit(1)
  );

  return onSnapshot(
    sessionsQuery,
    (snap) => onNext(snap.empty ? null : normalizeWorkoutSession(snap.docs[0].id, snap.docs[0].data())),
    onError
  );
}

export function subscribeToRecentWorkoutSessions(
  uid: string,
  onNext: (sessions: WorkoutSession[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const sessionsQuery = query(
    collection(getFirebaseDb(), "users", uid, "workoutSessions"),
    orderBy("date", "desc"),
    limit(50)
  );

  return onSnapshot(
    sessionsQuery,
    (snap) => onNext(snap.docs.flatMap((sessionDoc) => {
      const session = normalizeWorkoutSession(sessionDoc.id, sessionDoc.data());
      return session ? [session] : [];
    })),
    onError
  );
}

export async function startWorkoutSession(uid: string, date: string) {
  return reportFirestoreError("start-workout-session", async () => {
    const ref = await addDoc(collection(getFirebaseDb(), "users", uid, "workoutSessions"), {
      schemaVersion: 1,
      date,
      title: "Workout",
      status: "active",
      exercises: [],
      notes: "",
      startedAt: serverTimestamp(),
      completedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  });
}

export async function saveActiveWorkoutSession(uid: string, session: WorkoutSession) {
  return reportFirestoreError("save-active-workout-session", async () => {
    const ref = doc(getFirebaseDb(), "users", uid, "workoutSessions", session.id);
    await updateDoc(ref, {
      schemaVersion: 1,
      date: session.date,
      title: session.title.trim(),
      status: "active",
      exercises: session.exercises,
      notes: session.notes.trim(),
      updatedAt: serverTimestamp()
    });
  });
}

export async function finishWorkoutSession(uid: string, session: WorkoutSession) {
  return reportFirestoreError("finish-workout-session", async () => {
    const db = getFirebaseDb();
    const dailyLogRef = doc(db, "users", uid, "dailyMetrics", session.date);
    const dailyLogSnapshot = await getDoc(dailyLogRef);
    const existingLog = dailyLogSnapshot.exists() ? normalizeDailyLog(session.date, dailyLogSnapshot.data()) : null;
    const completedSessionRef = doc(db, "users", uid, "workoutSessions", session.id);
    const dailyLog = {
      ...(existingLog ?? defaultDailyLog(session.date)),
      workoutStatus: "complete" as const,
      workoutSessionId: session.id
    };
    const batch = writeBatch(db);
    batch.update(completedSessionRef, {
      schemaVersion: 1,
      date: session.date,
      title: session.title.trim(),
      status: "completed",
      exercises: session.exercises,
      notes: session.notes.trim(),
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    batch.set(dailyLogRef, {
      ...dailyLog,
      createdAt: existingLog?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await batch.commit();
  });
}
