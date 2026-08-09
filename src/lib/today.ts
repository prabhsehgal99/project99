import { dailyLogSummary } from "@/lib/daily-log";
import type { DailyLog, UserSettings, WorkoutSession } from "@/lib/types";

export type TodayFocus =
  | { type: "resume-workout"; title: string; href: "/workouts"; label: "Resume workout" }
  | { type: "start-workout"; title: string; href: "/workouts"; label: "Start workout" }
  | { type: "log-weight"; title: string; href: string; label: "Add morning weight" }
  | { type: "log-sleep"; title: string; href: string; label: "Log sleep" }
  | { type: "quick-check-in"; title: string; href: string; label: "Check in" }
  | { type: "add-water"; title: string; label: "Add water" }
  | { type: "open-log"; title: string; label: "Open Quick Log" };

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
    return { type: "log-weight", title: "Start with the first body signal.", href: `/log/${log.date}`, label: "Add morning weight" };
  }

  if (log.sleepHours === null) {
    return { type: "log-sleep", title: "Record last night's recovery.", href: `/log/${log.date}`, label: "Log sleep" };
  }

  if (log.workoutStatus === "planned") {
    return { type: "start-workout", title: "Training is still open today.", href: "/workouts", label: "Start workout" };
  }

  if (log.energyLevel === null || log.moodLevel === null || log.sorenessLevel === null) {
    return { type: "quick-check-in", title: "Add a short recovery check-in.", href: `/log/${log.date}`, label: "Check in" };
  }

  const summary = dailyLogSummary(log, settings);
  if (summary.waterPercent < 100) {
    return { type: "add-water", title: "Water is the next small update.", label: "Add water" };
  }

  return { type: "open-log", title: "Today is up to date.", label: "Open Quick Log" };
}
