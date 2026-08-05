import type { Timestamp } from "firebase/firestore";

export type ActivityStatus = "planned" | "complete" | "rest" | "missed";

export type ScaleLevel = 1 | 2 | 3 | 4 | 5;

export type DailyLog = {
  schemaVersion: 1;
  date: string;
  timezone: string;
  weightKg: number | null;
  sleepHours: number | null;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbohydratesConsumed: number;
  fatConsumed: number;
  fibreConsumed: number;
  waterMl: number;
  workoutStatus: ActivityStatus;
  workoutSessionId: string | null;
  cardioStatus: ActivityStatus;
  habitDone: boolean;
  moodLevel: ScaleLevel | null;
  energyLevel: ScaleLevel | null;
  sorenessLevel: ScaleLevel | null;
  steps: number | null;
  journalNotes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type DailyLogDraft = {
  date: string;
  timezone: string;
  weightKg: number | "";
  sleepHours: number | "";
  caloriesConsumed: number | "";
  proteinConsumed: number | "";
  carbohydratesConsumed: number | "";
  fatConsumed: number | "";
  fibreConsumed: number | "";
  waterLitres: number | "";
  workoutStatus: ActivityStatus;
  workoutSessionId: string | null;
  cardioStatus: ActivityStatus;
  habitDone: boolean;
  moodLevel: ScaleLevel | null;
  energyLevel: ScaleLevel | null;
  sorenessLevel: ScaleLevel | null;
  steps: number | "";
  journalNotes: string;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type UserSettings = {
  goalWeightKg: number;
  calorieGoal: number;
  proteinGoal: number;
  waterGoalMl: number;
  updatedAt?: Timestamp;
};

export type MuscleGroup = "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "full-body";

export type WorkoutSetKind = "warmup" | "working";

export type WorkoutSet = {
  id: string;
  kind: WorkoutSetKind;
  weightLb: number | null;
  reps: number | null;
  rpe: number | null;
  notes: string;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  notes: string;
  sets: WorkoutSet[];
};

export type WorkoutSessionStatus = "active" | "completed";

export type WorkoutSession = {
  id: string;
  schemaVersion: 1;
  date: string;
  title: string;
  status: WorkoutSessionStatus;
  exercises: WorkoutExercise[];
  notes: string;
  startedAt?: Timestamp;
  completedAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ExerciseDefinition = {
  id: string;
  name: string;
  primaryMuscleGroup: MuscleGroup;
};

export const defaultDailyLog = (date: string, timezone = "UTC"): DailyLog => ({
  schemaVersion: 1,
  date,
  timezone,
  weightKg: null,
  sleepHours: null,
  caloriesConsumed: 0,
  proteinConsumed: 0,
  carbohydratesConsumed: 0,
  fatConsumed: 0,
  fibreConsumed: 0,
  waterMl: 0,
  workoutStatus: "planned",
  workoutSessionId: null,
  cardioStatus: "planned",
  habitDone: false,
  moodLevel: null,
  energyLevel: null,
  sorenessLevel: null,
  steps: null,
  journalNotes: ""
});

export const defaultSettings: UserSettings = {
  goalWeightKg: 75,
  calorieGoal: 2200,
  proteinGoal: 160,
  waterGoalMl: 3000
};
