import { getLocalTimezone, isFutureDateKey, isValidDateKey } from "@/lib/dates";
import { litresToIntegerMillilitres, millilitresToLitres } from "@/lib/units";
import {
  defaultDailyLog,
  type ActivityStatus,
  type DailyLog,
  type DailyLogDraft,
  type ScaleLevel,
  type UserSettings
} from "@/lib/types";

export type DailyLogField = keyof DailyLogDraft;
export type DailyLogFieldErrors = Partial<Record<DailyLogField, string>>;

export type DailyLogValidation = {
  valid: boolean;
  fieldErrors: DailyLogFieldErrors;
  summary: string[];
};

export type DailyLogMutation =
  | { type: "incrementWater"; amountMl: number }
  | { type: "setWater"; waterMl: number }
  | { type: "setWeight"; weightKg: number | null }
  | { type: "setSleep"; sleepHours: number | null }
  | {
      type: "setNutrition";
      caloriesConsumed: number;
      proteinConsumed: number;
      carbohydratesConsumed: number;
      fatConsumed: number;
      fibreConsumed: number;
    }
  | {
      type: "setRecovery";
      moodLevel: ScaleLevel | null;
      energyLevel: ScaleLevel | null;
      sorenessLevel: ScaleLevel | null;
    }
  | { type: "setSteps"; steps: number | null }
  | { type: "setWorkoutStatus"; workoutStatus: ActivityStatus }
  | { type: "setCardioStatus"; cardioStatus: ActivityStatus }
  | { type: "setHabit"; habitDone: boolean }
  | { type: "setJournal"; journalNotes: string };

export const activityStatuses: ActivityStatus[] = ["planned", "complete", "rest", "missed"];
export const scaleLevels: ScaleLevel[] = [1, 2, 3, 4, 5];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function numberOrDefault(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function booleanOrDefault(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function activityStatusOrDefault(value: unknown, fallback: ActivityStatus) {
  return typeof value === "string" && activityStatuses.includes(value as ActivityStatus)
    ? (value as ActivityStatus)
    : fallback;
}

function scaleOrNull(value: unknown) {
  return typeof value === "number" && scaleLevels.includes(value as ScaleLevel) ? (value as ScaleLevel) : null;
}

function numberFromDraft(value: number | "", fallback = 0) {
  return value === "" ? fallback : value;
}

function nullableNumberFromDraft(value: number | "") {
  return value === "" ? null : value;
}

function roundTo(value: number, decimals: number) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

export function normalizeDailyLog(date: string, raw: unknown): DailyLog {
  const fallback = defaultDailyLog(date, getLocalTimezone());

  if (!isRecord(raw)) {
    return fallback;
  }

  return {
    ...fallback,
    schemaVersion: 1,
    date,
    timezone: stringOrDefault(raw.timezone, fallback.timezone),
    weightKg: nullableNumber(raw.weightKg),
    sleepHours: nullableNumber(raw.sleepHours),
    caloriesConsumed: numberOrDefault(raw.caloriesConsumed, fallback.caloriesConsumed),
    proteinConsumed: numberOrDefault(raw.proteinConsumed, fallback.proteinConsumed),
    carbohydratesConsumed: numberOrDefault(raw.carbohydratesConsumed, fallback.carbohydratesConsumed),
    fatConsumed: numberOrDefault(raw.fatConsumed, fallback.fatConsumed),
    fibreConsumed: numberOrDefault(raw.fibreConsumed, fallback.fibreConsumed),
    waterMl: numberOrDefault(raw.waterMl, fallback.waterMl),
    workoutStatus: activityStatusOrDefault(raw.workoutStatus, fallback.workoutStatus),
    workoutSessionId: typeof raw.workoutSessionId === "string" ? raw.workoutSessionId : null,
    cardioStatus: activityStatusOrDefault(raw.cardioStatus, fallback.cardioStatus),
    habitDone: booleanOrDefault(raw.habitDone, fallback.habitDone),
    moodLevel: scaleOrNull(raw.moodLevel),
    energyLevel: scaleOrNull(raw.energyLevel),
    sorenessLevel: scaleOrNull(raw.sorenessLevel),
    steps: nullableNumber(raw.steps),
    journalNotes: stringOrDefault(raw.journalNotes, fallback.journalNotes),
    createdAt: raw.createdAt as DailyLog["createdAt"],
    updatedAt: raw.updatedAt as DailyLog["updatedAt"]
  };
}

export function toDailyLogDraft(log: DailyLog, options: { emptyTotals?: boolean } = {}): DailyLogDraft {
  const emptyTotal = options.emptyTotals;

  return {
    date: log.date,
    timezone: log.timezone,
    weightKg: log.weightKg ?? "",
    sleepHours: log.sleepHours ?? "",
    caloriesConsumed: emptyTotal && log.caloriesConsumed === 0 ? "" : log.caloriesConsumed,
    proteinConsumed: emptyTotal && log.proteinConsumed === 0 ? "" : log.proteinConsumed,
    carbohydratesConsumed: emptyTotal && log.carbohydratesConsumed === 0 ? "" : log.carbohydratesConsumed,
    fatConsumed: emptyTotal && log.fatConsumed === 0 ? "" : log.fatConsumed,
    fibreConsumed: emptyTotal && log.fibreConsumed === 0 ? "" : log.fibreConsumed,
    waterLitres: emptyTotal && log.waterMl === 0 ? "" : millilitresToLitres(log.waterMl),
    workoutStatus: log.workoutStatus,
    workoutSessionId: log.workoutSessionId,
    cardioStatus: log.cardioStatus,
    habitDone: log.habitDone,
    moodLevel: log.moodLevel,
    energyLevel: log.energyLevel,
    sorenessLevel: log.sorenessLevel,
    steps: log.steps ?? "",
    journalNotes: log.journalNotes
  };
}

function addFieldError(
  fieldErrors: DailyLogFieldErrors,
  summary: string[],
  field: DailyLogField,
  message: string
) {
  fieldErrors[field] = message;
  summary.push(message);
}

function validateNumberRange(
  fieldErrors: DailyLogFieldErrors,
  summary: string[],
  field: DailyLogField,
  value: number | "",
  min: number,
  max: number,
  label: string,
  options: { required?: boolean; integer?: boolean } = {}
) {
  if (value === "") {
    if (options.required) {
      addFieldError(fieldErrors, summary, field, `${label} is required.`);
    }
    return;
  }

  if (!Number.isFinite(value) || value < min || value > max) {
    addFieldError(fieldErrors, summary, field, `${label} must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`);
    return;
  }

  if (options.integer && !Number.isInteger(value)) {
    addFieldError(fieldErrors, summary, field, `${label} must be a whole number.`);
  }
}

export function validateDailyLogDraft(draft: DailyLogDraft, today: string): DailyLogValidation {
  const fieldErrors: DailyLogFieldErrors = {};
  const summary: string[] = [];
  const trimmedNotes = draft.journalNotes.trim();

  if (!isValidDateKey(draft.date)) {
    addFieldError(fieldErrors, summary, "date", "Date must use YYYY-MM-DD and be a real calendar date.");
  } else if (isFutureDateKey(draft.date, today)) {
    addFieldError(fieldErrors, summary, "date", "Daily Logs cannot be saved for future dates.");
  }

  validateNumberRange(fieldErrors, summary, "weightKg", draft.weightKg, 25, 300, "Weight");
  validateNumberRange(fieldErrors, summary, "sleepHours", draft.sleepHours, 0, 24, "Sleep");
  validateNumberRange(fieldErrors, summary, "caloriesConsumed", draft.caloriesConsumed, 0, 20000, "Calories", {
    integer: true
  });
  validateNumberRange(fieldErrors, summary, "proteinConsumed", draft.proteinConsumed, 0, 1000, "Protein", {
    integer: true
  });
  validateNumberRange(fieldErrors, summary, "carbohydratesConsumed", draft.carbohydratesConsumed, 0, 2000, "Carbohydrates", {
    integer: true
  });
  validateNumberRange(fieldErrors, summary, "fatConsumed", draft.fatConsumed, 0, 1000, "Fat", { integer: true });
  validateNumberRange(fieldErrors, summary, "fibreConsumed", draft.fibreConsumed, 0, 200, "Fibre", { integer: true });
  validateNumberRange(fieldErrors, summary, "waterLitres", draft.waterLitres, 0, 15, "Water");
  validateNumberRange(fieldErrors, summary, "steps", draft.steps, 0, 200000, "Steps", { integer: true });

  if (trimmedNotes.length > 2000) {
    addFieldError(fieldErrors, summary, "journalNotes", "Journal note must be 2,000 characters or fewer.");
  }

  return {
    valid: summary.length === 0,
    fieldErrors,
    summary
  };
}

export function serializeDailyLog(draft: DailyLogDraft): DailyLog {
  return {
    schemaVersion: 1,
    date: draft.date,
    timezone: draft.timezone || getLocalTimezone(),
    weightKg: nullableNumberFromDraft(draft.weightKg),
    sleepHours: nullableNumberFromDraft(draft.sleepHours),
    caloriesConsumed: Math.round(numberFromDraft(draft.caloriesConsumed)),
    proteinConsumed: Math.round(numberFromDraft(draft.proteinConsumed)),
    carbohydratesConsumed: Math.round(numberFromDraft(draft.carbohydratesConsumed)),
    fatConsumed: Math.round(numberFromDraft(draft.fatConsumed)),
    fibreConsumed: Math.round(numberFromDraft(draft.fibreConsumed)),
    waterMl: litresToIntegerMillilitres(numberFromDraft(draft.waterLitres)),
    workoutStatus: draft.workoutStatus,
    workoutSessionId: draft.workoutSessionId,
    cardioStatus: draft.cardioStatus,
    habitDone: draft.habitDone,
    moodLevel: draft.moodLevel,
    energyLevel: draft.energyLevel,
    sorenessLevel: draft.sorenessLevel,
    steps: draft.steps === "" ? null : Math.round(draft.steps),
    journalNotes: draft.journalNotes.trim()
  };
}

function validateCompleteDailyLog(log: DailyLog, today: string) {
  return validateDailyLogDraft(toDailyLogDraft(log), today);
}

export function applyDailyLogMutation(log: DailyLog, mutation: DailyLogMutation, today: string): DailyLog {
  const next: DailyLog = { ...log };

  switch (mutation.type) {
    case "incrementWater":
      next.waterMl = Math.max(0, Math.min(15_000, Math.round(next.waterMl + mutation.amountMl)));
      break;
    case "setWater":
      next.waterMl = Math.round(mutation.waterMl);
      break;
    case "setWeight":
      next.weightKg = mutation.weightKg;
      break;
    case "setSleep":
      next.sleepHours = mutation.sleepHours;
      break;
    case "setNutrition":
      next.caloriesConsumed = Math.round(mutation.caloriesConsumed);
      next.proteinConsumed = Math.round(mutation.proteinConsumed);
      next.carbohydratesConsumed = Math.round(mutation.carbohydratesConsumed);
      next.fatConsumed = Math.round(mutation.fatConsumed);
      next.fibreConsumed = Math.round(mutation.fibreConsumed);
      break;
    case "setRecovery":
      next.moodLevel = mutation.moodLevel;
      next.energyLevel = mutation.energyLevel;
      next.sorenessLevel = mutation.sorenessLevel;
      break;
    case "setSteps":
      next.steps = mutation.steps === null ? null : Math.round(mutation.steps);
      break;
    case "setWorkoutStatus":
      next.workoutStatus = mutation.workoutStatus;
      break;
    case "setCardioStatus":
      next.cardioStatus = mutation.cardioStatus;
      break;
    case "setHabit":
      next.habitDone = mutation.habitDone;
      break;
    case "setJournal":
      next.journalNotes = mutation.journalNotes.trim();
      break;
  }

  const validation = validateCompleteDailyLog(next, today);
  if (!validation.valid) {
    throw new Error(validation.summary[0] ?? "Daily Log update is not valid.");
  }

  return serializeDailyLog(toDailyLogDraft(next));
}

export function dailyLogDataSignature(log: DailyLog) {
  return JSON.stringify({
    schemaVersion: log.schemaVersion,
    date: log.date,
    timezone: log.timezone,
    weightKg: log.weightKg,
    sleepHours: log.sleepHours,
    caloriesConsumed: log.caloriesConsumed,
    proteinConsumed: log.proteinConsumed,
    carbohydratesConsumed: log.carbohydratesConsumed,
    fatConsumed: log.fatConsumed,
    fibreConsumed: log.fibreConsumed,
    waterMl: log.waterMl,
    workoutStatus: log.workoutStatus,
    workoutSessionId: log.workoutSessionId,
    cardioStatus: log.cardioStatus,
    habitDone: log.habitDone,
    moodLevel: log.moodLevel,
    energyLevel: log.energyLevel,
    sorenessLevel: log.sorenessLevel,
    steps: log.steps,
    journalNotes: log.journalNotes
  });
}

export function formatActivityStatus(status: ActivityStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function remaining(consumed: number, goal: number) {
  return Math.max(0, goal - consumed);
}

export function currentWeight(logs: DailyLog[]) {
  return [...logs].reverse().find((log) => typeof log.weightKg === "number")?.weightKg ?? null;
}

function previousDateKey(dateKey: string) {
  const parts = dateKey.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function habitStreak(logs: DailyLog[], today: string) {
  const byDate = new Map(logs.map((log) => [log.date, log]));
  // A streak is not broken until the day is actually missed, so an unlogged
  // today falls back to counting from yesterday.
  let cursor = byDate.get(today)?.habitDone ? today : previousDateKey(today);
  let streak = 0;

  while (byDate.get(cursor)?.habitDone) {
    cursor = previousDateKey(cursor);
    streak += 1;
  }

  return streak;
}

export function dailyLogSummary(log: DailyLog, settings: UserSettings) {
  const waterLitres = roundTo(millilitresToLitres(log.waterMl), 2);
  const waterGoalLitres = roundTo(millilitresToLitres(settings.waterGoalMl), 2);

  return {
    caloriesRemaining: remaining(log.caloriesConsumed, settings.calorieGoal),
    proteinRemaining: remaining(log.proteinConsumed, settings.proteinGoal),
    caloriePercent: settings.calorieGoal ? (log.caloriesConsumed / settings.calorieGoal) * 100 : 0,
    proteinPercent: settings.proteinGoal ? (log.proteinConsumed / settings.proteinGoal) * 100 : 0,
    waterLitres,
    waterGoalLitres,
    waterPercent: waterGoalLitres ? (waterLitres / waterGoalLitres) * 100 : 0,
    hasMeaningfulEntry:
      log.weightKg !== null ||
      log.sleepHours !== null ||
      log.caloriesConsumed > 0 ||
      log.proteinConsumed > 0 ||
      log.carbohydratesConsumed > 0 ||
      log.fatConsumed > 0 ||
      log.fibreConsumed > 0 ||
      log.waterMl > 0 ||
      log.habitDone ||
      log.workoutStatus !== "planned" ||
      log.workoutSessionId !== null ||
      log.cardioStatus !== "planned" ||
      log.moodLevel !== null ||
      log.energyLevel !== null ||
      log.sorenessLevel !== null ||
      log.steps !== null ||
      log.journalNotes.trim().length > 0
  };
}
