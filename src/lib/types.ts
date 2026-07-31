import type { Timestamp } from "firebase/firestore";

export type DailyMetric = {
  date: string;
  weightKg: number | null;
  caloriesConsumed: number;
  proteinConsumed: number;
  waterMl: number;
  workoutStatus: "planned" | "complete" | "rest" | "missed";
  cardioStatus: "planned" | "complete" | "rest" | "missed";
  sleepHours: number | null;
  habitDone: boolean;
  updatedAt?: Timestamp;
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

export const defaultDailyMetric = (date: string): DailyMetric => ({
  date,
  weightKg: null,
  caloriesConsumed: 0,
  proteinConsumed: 0,
  waterMl: 0,
  workoutStatus: "planned",
  cardioStatus: "planned",
  sleepHours: null,
  habitDone: false
});

export const defaultSettings: UserSettings = {
  goalWeightKg: 75,
  calorieGoal: 2200,
  proteinGoal: 160,
  waterGoalMl: 3000
};
