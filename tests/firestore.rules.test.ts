import { readFile } from "node:fs/promises";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const PROJECT_ID = "demo-project99-rules";
const OWNER_UID = "owner-user";
const OTHER_UID = "other-user";
const DATE = "2026-08-06";
const FIXED_TIMESTAMP = firebase.firestore.Timestamp.fromDate(new Date("2026-08-06T12:00:00.000Z"));
const LATER_TIMESTAMP = firebase.firestore.Timestamp.fromDate(new Date("2026-08-06T13:00:00.000Z"));

type RuleDocument = Record<string, unknown>;
type Firestore = firebase.firestore.Firestore;

let testEnvironment: RulesTestEnvironment;

function dailyLog(overrides: RuleDocument = {}): RuleDocument {
  return {
    schemaVersion: 1,
    date: DATE,
    timezone: "America/Vancouver",
    weightKg: 82.5,
    sleepHours: 7.5,
    caloriesConsumed: 2_200,
    proteinConsumed: 180,
    carbohydratesConsumed: 240,
    fatConsumed: 70,
    fibreConsumed: 35,
    waterMl: 3_000,
    workoutStatus: "planned",
    workoutSessionId: null,
    cardioStatus: "complete",
    habitDone: true,
    moodLevel: 4,
    energyLevel: 4,
    sorenessLevel: 2,
    steps: 10_000,
    journalNotes: "Felt strong today.",
    createdAt: FIXED_TIMESTAMP,
    updatedAt: FIXED_TIMESTAMP,
    ...overrides
  };
}

function workoutSession(overrides: RuleDocument = {}): RuleDocument {
  return {
    schemaVersion: 1,
    date: DATE,
    title: "Upper body",
    status: "active",
    exercises: [
      {
        id: "exercise-entry-1",
        exerciseId: "bench-press",
        name: "Bench Press",
        primaryMuscleGroup: "chest",
        notes: "Controlled tempo",
        sets: []
      }
    ],
    notes: "Good session.",
    startedAt: FIXED_TIMESTAMP,
    completedAt: null,
    createdAt: FIXED_TIMESTAMP,
    updatedAt: FIXED_TIMESTAMP,
    ...overrides
  };
}

function userProfile(overrides: RuleDocument = {}): RuleDocument {
  return {
    uid: OWNER_UID,
    displayName: "Owner",
    email: "owner@example.com",
    photoURL: "",
    createdAt: FIXED_TIMESTAMP,
    updatedAt: FIXED_TIMESTAMP,
    ...overrides
  };
}

function userSettings(overrides: RuleDocument = {}): RuleDocument {
  return {
    goalWeightKg: 75,
    calorieGoal: 2_200,
    proteinGoal: 160,
    waterGoalMl: 3_000,
    updatedAt: FIXED_TIMESTAMP,
    ...overrides
  };
}

function withoutField(document: RuleDocument, field: string): RuleDocument {
  const copy = { ...document };
  delete copy[field];
  return copy;
}

function authenticatedDb(uid: string): Firestore {
  return testEnvironment.authenticatedContext(uid).firestore();
}

function unauthenticatedDb(): Firestore {
  return testEnvironment.unauthenticatedContext().firestore();
}

function dailyLogRef(db: Firestore, uid = OWNER_UID, date = DATE) {
  return db.doc(`users/${uid}/dailyMetrics/${date}`);
}

function workoutSessionRef(db: Firestore, uid = OWNER_UID, sessionId = "session-1") {
  return db.doc(`users/${uid}/workoutSessions/${sessionId}`);
}

function userProfileRef(db: Firestore, uid = OWNER_UID) {
  return db.doc(`users/${uid}`);
}

function userSettingsRef(db: Firestore, uid = OWNER_UID, documentId = "preferences") {
  return db.doc(`users/${uid}/settings/${documentId}`);
}

async function seedDailyLog(data: RuleDocument = dailyLog()): Promise<void> {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await dailyLogRef(context.firestore()).set(data);
  });
}

async function seedWorkoutSession(data: RuleDocument = workoutSession()): Promise<void> {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await workoutSessionRef(context.firestore()).set(data);
  });
}

beforeAll(async () => {
  const rules = await readFile(new URL("../firestore.rules", import.meta.url), "utf8");
  testEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules
    }
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
});

afterAll(async () => {
  await testEnvironment.cleanup();
});

describe("ownership", () => {
  it("allows an owner to create, read, update, query, and delete a Daily Log", async () => {
    const db = authenticatedDb(OWNER_UID);
    const reference = dailyLogRef(db);

    await assertSucceeds(reference.set(dailyLog()));
    await assertSucceeds(reference.get());
    await assertSucceeds(reference.update({
      journalNotes: "Updated",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    await assertSucceeds(db.collection(`users/${OWNER_UID}/dailyMetrics`).get());
    await assertSucceeds(reference.delete());
  });

  it("denies another user access to an owner's Daily Logs", async () => {
    await seedDailyLog();
    const db = authenticatedDb(OTHER_UID);
    const existingReference = dailyLogRef(db);
    const unseededReference = dailyLogRef(db, OWNER_UID, "2026-08-07");

    await assertFails(existingReference.get());
    await assertFails(existingReference.update({
      journalNotes: "Tampered",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    await assertFails(existingReference.delete());
    await assertFails(unseededReference.set(dailyLog({ date: "2026-08-07" })));
    await assertFails(db.collection(`users/${OWNER_UID}/dailyMetrics`).get());
  });

  it("denies unauthenticated Daily Log access", async () => {
    await seedDailyLog();
    const db = unauthenticatedDb();
    const existingReference = dailyLogRef(db);
    const unseededReference = dailyLogRef(db, OWNER_UID, "2026-08-08");

    await assertFails(existingReference.get());
    await assertFails(existingReference.update({
      journalNotes: "Tampered",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    await assertFails(existingReference.delete());
    await assertFails(unseededReference.set(dailyLog({ date: "2026-08-08" })));
  });

  it("enforces ownership for workout sessions", async () => {
    await seedWorkoutSession();
    const ownerDb = authenticatedDb(OWNER_UID);
    const otherDb = authenticatedDb(OTHER_UID);
    const unauthenticated = unauthenticatedDb();
    const existingOtherReference = workoutSessionRef(otherDb);
    const existingUnauthenticatedReference = workoutSessionRef(unauthenticated);

    await assertSucceeds(workoutSessionRef(ownerDb).get());
    await assertFails(existingOtherReference.get());
    await assertFails(existingOtherReference.update({ notes: "Tampered" }));
    await assertFails(existingOtherReference.delete());
    await assertFails(workoutSessionRef(otherDb, OWNER_UID, "cross-user-create").set(workoutSession()));
    await assertFails(existingUnauthenticatedReference.get());
    await assertFails(existingUnauthenticatedReference.update({ notes: "Tampered" }));
    await assertFails(existingUnauthenticatedReference.delete());
    await assertFails(
      workoutSessionRef(unauthenticated, OWNER_UID, "unauthenticated-create").set(workoutSession())
    );
  });

  it("enforces ownership for user profiles, including creates", async () => {
    const ownerDb = authenticatedDb(OWNER_UID);
    const otherDb = authenticatedDb(OTHER_UID);
    const unauthenticated = unauthenticatedDb();
    const ownerReference = userProfileRef(ownerDb);
    const existingOtherReference = userProfileRef(otherDb);
    const existingUnauthenticatedReference = userProfileRef(unauthenticated);
    const profile = userProfile();

    await assertSucceeds(ownerReference.set(profile));
    await assertSucceeds(ownerReference.get());
    await assertSucceeds(ownerReference.update({ displayName: "Updated owner" }));
    await assertFails(existingOtherReference.get());
    await assertFails(existingOtherReference.update({ displayName: "Tampered" }));
    await assertFails(existingOtherReference.delete());
    await assertFails(userProfileRef(otherDb, "cross-user-create").set(profile));
    await assertFails(existingUnauthenticatedReference.get());
    await assertFails(existingUnauthenticatedReference.update({ displayName: "Tampered" }));
    await assertFails(existingUnauthenticatedReference.delete());
    await assertFails(userProfileRef(unauthenticated, "unauthenticated-create").set(profile));
    await assertSucceeds(ownerReference.delete());
  });

  it("enforces ownership for settings documents, including creates", async () => {
    const ownerDb = authenticatedDb(OWNER_UID);
    const otherDb = authenticatedDb(OTHER_UID);
    const unauthenticated = unauthenticatedDb();
    const ownerReference = userSettingsRef(ownerDb);
    const existingOtherReference = userSettingsRef(otherDb);
    const existingUnauthenticatedReference = userSettingsRef(unauthenticated);
    const settings = userSettings();

    await assertSucceeds(ownerReference.set(settings));
    await assertSucceeds(ownerReference.get());
    await assertSucceeds(ownerReference.update({ calorieGoal: 2_300 }));
    await assertFails(existingOtherReference.get());
    await assertFails(existingOtherReference.update({ calorieGoal: 1 }));
    await assertFails(existingOtherReference.delete());
    await assertFails(userSettingsRef(otherDb, OWNER_UID, "cross-user-create").set(settings));
    await assertFails(existingUnauthenticatedReference.get());
    await assertFails(existingUnauthenticatedReference.update({ calorieGoal: 1 }));
    await assertFails(existingUnauthenticatedReference.delete());
    await assertFails(
      userSettingsRef(unauthenticated, OWNER_UID, "unauthenticated-create").set(settings)
    );
    await assertSucceeds(ownerReference.delete());
  });
});

describe("Daily Log schema", () => {
  it("accepts exact valid documents with resolved server timestamps", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertSucceeds(dailyLogRef(db).set(dailyLog({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })));

    const snapshot = await dailyLogRef(db).get();
    expect(snapshot.get("createdAt")).toBeInstanceOf(firebase.firestore.Timestamp);
    expect(snapshot.get("updatedAt")).toBeInstanceOf(firebase.firestore.Timestamp);
  });

  it("denies documents with missing or additional fields", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(dailyLogRef(db).set(withoutField(dailyLog(), "timezone")));
    await assertFails(dailyLogRef(db).set(dailyLog({ unexpected: true })));
  });

  it.each([
    ["schemaVersion", 2],
    ["timezone", ""],
    ["timezone", "x".repeat(101)],
    ["weightKg", 24.9],
    ["weightKg", 301],
    ["sleepHours", -0.1],
    ["sleepHours", 24.1],
    ["caloriesConsumed", 2_000.5],
    ["caloriesConsumed", 20_001],
    ["proteinConsumed", -1],
    ["proteinConsumed", 1_001],
    ["carbohydratesConsumed", 2_001],
    ["fatConsumed", 1_001],
    ["fibreConsumed", 201],
    ["waterMl", 15_001],
    ["workoutStatus", "skipped"],
    ["workoutSessionId", ""],
    ["workoutSessionId", "x".repeat(129)],
    ["cardioStatus", "unknown"],
    ["habitDone", "yes"],
    ["moodLevel", 0],
    ["energyLevel", 6],
    ["sorenessLevel", 2.5],
    ["steps", 200_001],
    ["journalNotes", "x".repeat(2_001)],
    ["createdAt", "2026-08-06T12:00:00.000Z"],
    ["updatedAt", 1_786_016_400]
  ])("denies an invalid %s value", async (field, value) => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(dailyLogRef(db).set(dailyLog({ [field]: value })));
  });

  it.each(["2026-8-06", "06-08-2026", "20260806", "2026_08_06", "2026-08-060"])(
    "denies the malformed date key %s",
    async (date) => {
      const db = authenticatedDb(OWNER_UID);

      await assertFails(dailyLogRef(db, OWNER_UID, date).set(dailyLog({ date })));
    }
  );

  it.each(["2026-02-29", "2026-02-31", "2026-04-31", "0000-01-01"])(
    "denies the impossible calendar date %s",
    async (date) => {
      const db = authenticatedDb(OWNER_UID);

      await assertFails(dailyLogRef(db, OWNER_UID, date).set(dailyLog({ date })));
    }
  );

  it("denies future Daily Logs server-side", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(
      dailyLogRef(db, OWNER_UID, "2999-01-01").set(dailyLog({ date: "2999-01-01" }))
    );
  });

  it("denies a body date that differs from the document key", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(dailyLogRef(db).set(dailyLog({ date: "2026-08-05" })));
  });

  it("preserves createdAt while allowing updatedAt to advance", async () => {
    await seedDailyLog();
    const db = authenticatedDb(OWNER_UID);
    const reference = dailyLogRef(db);

    await assertSucceeds(reference.update({ updatedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    await assertSucceeds(reference.update({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    await assertFails(reference.update({
      createdAt: LATER_TIMESTAMP,
      updatedAt: LATER_TIMESTAMP
    }));
  });
});

describe("profile and settings schema", () => {
  it("accepts valid profile and settings documents with server timestamps", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertSucceeds(userProfileRef(db).set(userProfile({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })));
    await assertSucceeds(userSettingsRef(db).set(userSettings({
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })));
  });

  it("denies profile documents with missing, additional, or mismatched fields", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(userProfileRef(db).set(withoutField(userProfile(), "email")));
    await assertFails(userProfileRef(db).set(userProfile({ unexpected: true })));
    await assertFails(userProfileRef(db).set(userProfile({ uid: OTHER_UID })));
    await assertFails(userProfileRef(db).set(userProfile({ displayName: "x".repeat(201) })));
    await assertFails(userProfileRef(db).set(userProfile({ email: "x".repeat(321) })));
    await assertFails(userProfileRef(db).set(userProfile({ photoURL: "x".repeat(2049) })));
  });

  it("denies invalid settings values and additional fields", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(userSettingsRef(db).set(withoutField(userSettings(), "proteinGoal")));
    await assertFails(userSettingsRef(db).set(userSettings({ unexpected: true })));
    await assertFails(userSettingsRef(db).set(userSettings({ goalWeightKg: 24.9 })));
    await assertFails(userSettingsRef(db).set(userSettings({ calorieGoal: 499 })));
    await assertFails(userSettingsRef(db).set(userSettings({ proteinGoal: 20.5 })));
    await assertFails(userSettingsRef(db).set(userSettings({ waterGoalMl: 15_001 })));
  });
});

describe("workout-session schema", () => {
  it("accepts valid active and completed sessions with server timestamps", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertSucceeds(workoutSessionRef(db, OWNER_UID, "active").set(workoutSession({
      startedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })));
    await assertSucceeds(workoutSessionRef(db, OWNER_UID, "completed").set(workoutSession({
      status: "completed",
      startedAt: firebase.firestore.FieldValue.serverTimestamp(),
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })));
  });

  it("denies sessions with missing or additional fields", async () => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(workoutSessionRef(db).set(withoutField(workoutSession(), "title")));
    await assertFails(workoutSessionRef(db).set(workoutSession({ unexpected: true })));
  });

  it.each([
    ["schemaVersion", 2],
    ["date", "2026-8-06"],
    ["title", ""],
    ["title", "x".repeat(81)],
    ["status", "paused"],
    ["exercises", "not-a-list"],
    ["exercises", Array.from({ length: 31 }, (_, index) => ({ id: `exercise-${index}` }))],
    ["notes", "x".repeat(2_001)],
    ["startedAt", "2026-08-06T12:00:00.000Z"],
    ["completedAt", "2026-08-06T13:00:00.000Z"],
    ["createdAt", false],
    ["updatedAt", 1_786_016_400]
  ])("denies an invalid %s value", async (field, value) => {
    const db = authenticatedDb(OWNER_UID);

    await assertFails(workoutSessionRef(db).set(workoutSession({ [field]: value })));
  });

  it("allows an active session update and completion but denies reverting completion", async () => {
    await seedWorkoutSession();
    const db = authenticatedDb(OWNER_UID);
    const reference = workoutSessionRef(db);

    await assertSucceeds(reference.update({
      notes: "Updated notes",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    await assertSucceeds(reference.update({
      status: "completed",
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    await assertFails(reference.update({
      status: "active",
      completedAt: null,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
  });

  it("denies changing createdAt on update", async () => {
    await seedWorkoutSession();
    const db = authenticatedDb(OWNER_UID);

    await assertFails(workoutSessionRef(db).update({
      createdAt: LATER_TIMESTAMP,
      updatedAt: LATER_TIMESTAMP
    }));
  });
});
