import { describe, expect, it } from "vitest";
import { todayFocus } from "@/lib/today";
import { defaultDailyLog, defaultSettings, type WorkoutSession } from "@/lib/types";

function activeWorkout(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: "session-1",
    schemaVersion: 1,
    date: "2026-07-31",
    title: "Lower body",
    status: "active",
    exercises: [],
    notes: "",
    ...overrides
  };
}

describe("todayFocus", () => {
  it("prioritizes an active workout", () => {
    const focus = todayFocus(defaultDailyLog("2026-07-31"), defaultSettings, activeWorkout());
    expect(focus.type).toBe("resume-workout");
  });

  it("asks for morning weight before other empty-day actions", () => {
    const focus = todayFocus(defaultDailyLog("2026-07-31"), defaultSettings, null);
    expect(focus.type).toBe("log-weight");
    expect(focus).toMatchObject({ href: "/log/2026-07-31" });
  });

  it("offers training after body and sleep signals exist", () => {
    const focus = todayFocus(
      defaultDailyLog("2026-07-31", "UTC"),
      defaultSettings,
      null
    );
    expect(focus.type).toBe("log-weight");

    const trainingFocus = todayFocus(
      { ...defaultDailyLog("2026-07-31"), weightKg: 80, sleepHours: 7 },
      defaultSettings,
      null
    );
    expect(trainingFocus.type).toBe("start-workout");
  });

  it("does not invent recommendations after logged recovery", () => {
    const focus = todayFocus(
      {
        ...defaultDailyLog("2026-07-31"),
        weightKg: 80,
        sleepHours: 7,
        workoutStatus: "complete",
        moodLevel: 4,
        energyLevel: 4,
        sorenessLevel: 2,
        waterMl: 500
      },
      defaultSettings,
      null
    );
    expect(focus.type).toBe("add-water");
  });

  it("sends detailed sleep and recovery updates to the Daily Log", () => {
    const sleepFocus = todayFocus({ ...defaultDailyLog("2026-07-31"), weightKg: 80 }, defaultSettings, null);
    expect(sleepFocus).toMatchObject({ type: "log-sleep", href: "/log/2026-07-31" });

    const recoveryFocus = todayFocus(
      { ...defaultDailyLog("2026-07-31"), weightKg: 80, sleepHours: 7, workoutStatus: "complete" },
      defaultSettings,
      null
    );
    expect(recoveryFocus).toMatchObject({ type: "quick-check-in", href: "/log/2026-07-31" });
  });
});
