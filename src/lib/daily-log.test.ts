import { describe, expect, it } from "vitest";
import {
  dailyLogSummary,
  habitStreak,
  normalizeDailyLog,
  serializeDailyLog,
  toDailyLogDraft,
  validateDailyLogDraft
} from "@/lib/daily-log";
import { defaultDailyLog, defaultSettings, type DailyLog, type DailyLogDraft } from "@/lib/types";

function draft(overrides: Partial<DailyLogDraft> = {}): DailyLogDraft {
  return {
    date: "2026-07-30",
    timezone: "America/Toronto",
    weightKg: 80,
    sleepHours: 8,
    caloriesConsumed: 2000,
    proteinConsumed: 150,
    carbohydratesConsumed: 200,
    fatConsumed: 60,
    fibreConsumed: 30,
    waterLitres: 2.5,
    workoutStatus: "complete",
    cardioStatus: "rest",
    habitDone: true,
    moodLevel: 4,
    energyLevel: 3,
    sorenessLevel: 2,
    steps: 9000,
    journalNotes: "  solid day  ",
    ...overrides
  };
}

function log(date: string, overrides: Partial<DailyLog> = {}): DailyLog {
  return { ...defaultDailyLog(date), ...overrides };
}

describe("normalizeDailyLog", () => {
  it("returns defaults for non-object data", () => {
    const normalized = normalizeDailyLog("2026-07-30", undefined);
    expect(normalized.date).toBe("2026-07-30");
    expect(normalized.caloriesConsumed).toBe(0);
    expect(normalized.weightKg).toBeNull();
  });

  it("keeps valid fields and replaces invalid ones", () => {
    const normalized = normalizeDailyLog("2026-07-30", {
      weightKg: 82.5,
      caloriesConsumed: "not-a-number",
      workoutStatus: "sprinted",
      moodLevel: 9,
      journalNotes: 42
    });

    expect(normalized.weightKg).toBe(82.5);
    expect(normalized.caloriesConsumed).toBe(0);
    expect(normalized.workoutStatus).toBe("planned");
    expect(normalized.moodLevel).toBeNull();
    expect(normalized.journalNotes).toBe("");
  });
});

describe("serializeDailyLog", () => {
  it("trims notes, rounds totals, and converts litres to integer millilitres", () => {
    const serialized = serializeDailyLog(draft({ caloriesConsumed: 1999.6, waterLitres: 2.567 }));

    expect(serialized.caloriesConsumed).toBe(2000);
    expect(serialized.waterMl).toBe(2567);
    expect(serialized.journalNotes).toBe("solid day");
  });

  it("maps empty draft values to nulls and zeroed totals", () => {
    const serialized = serializeDailyLog(
      draft({ weightKg: "", sleepHours: "", caloriesConsumed: "", waterLitres: "", steps: "" })
    );

    expect(serialized.weightKg).toBeNull();
    expect(serialized.sleepHours).toBeNull();
    expect(serialized.caloriesConsumed).toBe(0);
    expect(serialized.waterMl).toBe(0);
    expect(serialized.steps).toBeNull();
  });
});

describe("toDailyLogDraft", () => {
  it("round-trips a serialized log", () => {
    const serialized = serializeDailyLog(draft());
    const roundTripped = toDailyLogDraft(serialized);

    expect(roundTripped.waterLitres).toBe(2.5);
    expect(roundTripped.weightKg).toBe(80);
    expect(roundTripped.journalNotes).toBe("solid day");
  });

  it("presents zero totals as empty fields for a new log", () => {
    const empty = toDailyLogDraft(defaultDailyLog("2026-07-30"), { emptyTotals: true });
    expect(empty.caloriesConsumed).toBe("");
    expect(empty.waterLitres).toBe("");
  });
});

describe("validateDailyLogDraft", () => {
  const today = "2026-07-31";

  it("accepts a complete valid draft", () => {
    const result = validateDailyLogDraft(draft(), today);
    expect(result.valid).toBe(true);
    expect(result.summary).toEqual([]);
  });

  it("rejects future and malformed dates", () => {
    expect(validateDailyLogDraft(draft({ date: "2026-08-01" }), today).fieldErrors.date).toBeDefined();
    expect(validateDailyLogDraft(draft({ date: "2026-02-31" }), today).fieldErrors.date).toBeDefined();
  });

  it("rejects out-of-range and non-integer values", () => {
    const result = validateDailyLogDraft(
      draft({ weightKg: 10, caloriesConsumed: 100.5, steps: 300000 }),
      today
    );

    expect(result.valid).toBe(false);
    expect(result.fieldErrors.weightKg).toBeDefined();
    expect(result.fieldErrors.caloriesConsumed).toBeDefined();
    expect(result.fieldErrors.steps).toBeDefined();
  });

  it("allows optional fields to stay empty", () => {
    const result = validateDailyLogDraft(
      draft({ weightKg: "", sleepHours: "", steps: "", journalNotes: "" }),
      today
    );
    expect(result.valid).toBe(true);
  });
});

describe("habitStreak", () => {
  const today = "2026-07-31";

  it("counts consecutive completed days ending today", () => {
    const logs = [
      log("2026-07-29", { habitDone: true }),
      log("2026-07-30", { habitDone: true }),
      log("2026-07-31", { habitDone: true })
    ];
    expect(habitStreak(logs, today)).toBe(3);
  });

  it("preserves the streak when today is not logged yet", () => {
    const logs = [log("2026-07-29", { habitDone: true }), log("2026-07-30", { habitDone: true })];
    expect(habitStreak(logs, today)).toBe(2);
  });

  it("breaks the streak on a missed day", () => {
    const logs = [log("2026-07-28", { habitDone: true }), log("2026-07-30", { habitDone: true })];
    expect(habitStreak(logs, today)).toBe(1);
  });

  it("returns zero when yesterday and today are both incomplete", () => {
    const logs = [log("2026-07-29", { habitDone: true })];
    expect(habitStreak(logs, today)).toBe(0);
  });
});

describe("dailyLogSummary", () => {
  it("computes remaining values and percentages", () => {
    const summary = dailyLogSummary(
      log("2026-07-31", { caloriesConsumed: 1100, proteinConsumed: 80, waterMl: 1500 }),
      defaultSettings
    );

    expect(summary.caloriesRemaining).toBe(1100);
    expect(summary.proteinRemaining).toBe(80);
    expect(summary.caloriePercent).toBe(50);
    expect(summary.waterLitres).toBe(1.5);
    expect(summary.waterPercent).toBe(50);
    expect(summary.hasMeaningfulEntry).toBe(true);
  });

  it("treats an untouched default log as not meaningful", () => {
    const summary = dailyLogSummary(log("2026-07-31"), defaultSettings);
    expect(summary.hasMeaningfulEntry).toBe(false);
  });
});
