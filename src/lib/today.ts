import { dailyLogSummary } from "@/lib/daily-log";
import type { DailyLog, UserSettings, WorkoutSession } from "@/lib/types";

export type TodayFocus =
  | { type: "resume-workout"; title: string; href: "/workouts"; label: "Resume workout" }
  | { type: "start-workout"; title: string; href: "/workouts"; label: "Start workout" }
  | { type: "log-weight"; title: string; quickLog: "body"; label: "Add morning weight" }
  | { type: "log-sleep"; title: string; quickLog: "sleep"; label: "Log sleep" }
  | { type: "quick-check-in"; title: string; quickLog: "recovery"; label: "Check in" }
  | { type: "add-water"; title: string; quickLog: "root"; label: "Add water" }
  | { type: "open-log"; title: string; quickLog: "root"; label: "Open Quick Log" };

export function todayFocus(log: DailyLog, settings: UserSettings, activeWorkout: WorkoutSession | null): TodayFocus {
  if (activeWorkout) {
    return {
      type: "resume-workout",
      title: activeWorkout.title.trim() || "Active workout",
      href: "/workouts",
      label: "Resume workout"
    };
  }

  if (log.weightKg === null) {
    return { type: "log-weight", title: "Start with the first body signal.", quickLog: "body", label: "Add morning weight" };
  }

  if (log.sleepHours === null) {
    return { type: "log-sleep", title: "Record last night's recovery.", quickLog: "sleep", label: "Log sleep" };
  }

  if (log.workoutStatus === "planned") {
    return { type: "start-workout", title: "Training is still open today.", href: "/workouts", label: "Start workout" };
  }

  if (log.energyLevel === null || log.moodLevel === null || log.sorenessLevel === null) {
    return { type: "quick-check-in", title: "Add a short recovery check-in.", quickLog: "recovery", label: "Check in" };
  }

  const summary = dailyLogSummary(log, settings);
  if (summary.waterPercent < 100) {
    return { type: "add-water", title: "Water is the next small update.", quickLog: "root", label: "Add water" };
  }

  return { type: "open-log", title: "Today is up to date.", quickLog: "root", label: "Open Quick Log" };
}
