import type {
  ExerciseDefinition,
  MuscleGroup,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSessionStatus,
  WorkoutSet,
  WorkoutSetKind,
  WorkoutTemplate,
  WorkoutTemplateExercise
} from "@/lib/types";

export const exerciseCatalogue: ExerciseDefinition[] = [
  { id: "barbell-back-squat", name: "Barbell Back Squat", primaryMuscleGroup: "legs" },
  { id: "barbell-bench-press", name: "Barbell Bench Press", primaryMuscleGroup: "chest" },
  { id: "barbell-row", name: "Barbell Row", primaryMuscleGroup: "back" },
  { id: "conventional-deadlift", name: "Conventional Deadlift", primaryMuscleGroup: "legs" },
  { id: "dumbbell-shoulder-press", name: "Dumbbell Shoulder Press", primaryMuscleGroup: "shoulders" },
  { id: "lat-pulldown", name: "Lat Pulldown", primaryMuscleGroup: "back" },
  { id: "leg-press", name: "Leg Press", primaryMuscleGroup: "legs" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", primaryMuscleGroup: "legs" }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringOrDefault(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function nullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function muscleGroupOrDefault(value: unknown): MuscleGroup {
  const groups: MuscleGroup[] = ["chest", "back", "shoulders", "arms", "legs", "core", "full-body"];
  return typeof value === "string" && groups.includes(value as MuscleGroup) ? (value as MuscleGroup) : "full-body";
}

function setKindOrDefault(value: unknown): WorkoutSetKind {
  return value === "warmup" || value === "working" ? value : "working";
}

function sessionStatusOrDefault(value: unknown): WorkoutSessionStatus {
  return value === "completed" ? "completed" : "active";
}

export function newWorkoutSet(kind: WorkoutSetKind = "working"): WorkoutSet {
  return { id: crypto.randomUUID(), kind, weightLb: null, reps: null, rpe: null, notes: "" };
}

export function newWorkoutExercise(definition: ExerciseDefinition): WorkoutExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId: definition.id,
    name: definition.name,
    primaryMuscleGroup: definition.primaryMuscleGroup,
    notes: "",
    sets: [newWorkoutSet("working")]
  };
}

export function workoutExerciseFromTemplate(exercise: WorkoutTemplateExercise): WorkoutExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    primaryMuscleGroup: exercise.primaryMuscleGroup,
    notes: exercise.notes,
    sets: exercise.prescriptions.flatMap((prescription) =>
      Array.from({ length: prescription.targetSets }, () => newWorkoutSet(prescription.kind))
    )
  };
}

export function workoutFromTemplate(template: WorkoutTemplate, id: string, date: string): WorkoutSession {
  return {
    id,
    schemaVersion: 1,
    date,
    title: template.title,
    status: "active",
    exercises: template.exercises.map(workoutExerciseFromTemplate),
    notes: template.notes
  };
}

export function isLifetimePersonalRecord(current: WorkoutSet, sessions: WorkoutSession[], exerciseId: string, currentSessionId?: string) {
  const currentBest = estimatedOneRepMaxLb(current);
  if (currentBest === null) return false;
  const previousBest = Math.max(
    0,
    ...sessions.filter((session) => session.id !== currentSessionId && session.status === "completed").flatMap((session) =>
      session.exercises.filter((exercise) => exercise.exerciseId === exerciseId).flatMap((exercise) => exercise.sets.map(estimatedOneRepMaxLb))
    ).filter((value): value is number => value !== null)
  );
  return currentBest > previousBest;
}

export function normalizeWorkoutSession(id: string, raw: unknown): WorkoutSession | null {
  if (!isRecord(raw) || typeof raw.date !== "string") {
    return null;
  }

  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.flatMap((value): WorkoutExercise[] => {
        if (!isRecord(value) || typeof value.name !== "string") {
          return [];
        }

        const sets = Array.isArray(value.sets)
          ? value.sets.flatMap((set): WorkoutSet[] => {
              if (!isRecord(set) || typeof set.id !== "string") {
                return [];
              }
              return [
                {
                  id: set.id,
                  kind: setKindOrDefault(set.kind),
                  weightLb: nullableNumber(set.weightLb),
                  reps: nullableNumber(set.reps),
                  rpe: nullableNumber(set.rpe),
                  notes: stringOrDefault(set.notes)
                }
              ];
            })
          : [];

        return [
          {
            id: stringOrDefault(value.id, crypto.randomUUID()),
            exerciseId: stringOrDefault(value.exerciseId, stringOrDefault(value.name)),
            name: value.name,
            primaryMuscleGroup: muscleGroupOrDefault(value.primaryMuscleGroup),
            notes: stringOrDefault(value.notes),
            sets
          }
        ];
      })
    : [];

  return {
    id,
    schemaVersion: 1,
    date: raw.date,
    title: stringOrDefault(raw.title, "Workout"),
    status: sessionStatusOrDefault(raw.status),
    exercises,
    notes: stringOrDefault(raw.notes),
    startedAt: raw.startedAt as WorkoutSession["startedAt"],
    completedAt: raw.completedAt as WorkoutSession["completedAt"],
    createdAt: raw.createdAt as WorkoutSession["createdAt"],
    updatedAt: raw.updatedAt as WorkoutSession["updatedAt"]
  };
}

export function isCompletedSet(set: WorkoutSet) {
  return set.weightLb !== null && set.weightLb >= 0 && set.reps !== null && set.reps > 0;
}

export function estimatedOneRepMaxLb(set: WorkoutSet) {
  if (!isCompletedSet(set) || set.weightLb === null || set.reps === null) {
    return null;
  }
  return Math.round(set.weightLb * (1 + set.reps / 30));
}

export function exerciseVolumeLb(exercise: WorkoutExercise) {
  return exercise.sets.reduce(
    (total, set) => (set.kind === "working" && isCompletedSet(set) && set.weightLb !== null && set.reps !== null ? total + set.weightLb * set.reps : total),
    0
  );
}

export function workoutVolumeLb(session: Pick<WorkoutSession, "exercises">) {
  return session.exercises.reduce((total, exercise) => total + exerciseVolumeLb(exercise), 0);
}

export function previousCompletedExercise(sessions: WorkoutSession[], exerciseId: string, currentSessionId?: string) {
  return sessions.find(
    (session) =>
      session.id !== currentSessionId &&
      session.status === "completed" &&
      session.exercises.some((exercise) => exercise.exerciseId === exerciseId && exercise.sets.some(isCompletedSet))
  )?.exercises.find((exercise) => exercise.exerciseId === exerciseId);
}

export type WorkoutValidation = { valid: boolean; errors: string[] };

export function validateWorkoutSession(session: WorkoutSession, options: { forCompletion?: boolean } = {}): WorkoutValidation {
  const errors: string[] = [];
  if (session.title.trim().length === 0 || session.title.trim().length > 80) {
    errors.push("Workout name must be between 1 and 80 characters.");
  }
  if (session.notes.trim().length > 2_000) {
    errors.push("Workout notes must be 2,000 characters or fewer.");
  }
  if (session.exercises.length > 30) {
    errors.push("A workout can contain up to 30 exercises.");
  }

  let completedWorkingSets = 0;
  for (const exercise of session.exercises) {
    if (exercise.name.trim().length === 0 || exercise.name.length > 100) {
      errors.push("Each exercise needs a name of 100 characters or fewer.");
    }
    if (exercise.notes.trim().length > 500 || exercise.sets.length > 30) {
      errors.push(`${exercise.name} has too many sets or too many note characters.`);
    }
    for (const set of exercise.sets) {
      if (set.weightLb !== null && (!Number.isFinite(set.weightLb) || set.weightLb < 0 || set.weightLb > 2_000)) {
        errors.push(`${exercise.name} has a weight outside 0–2,000 lb.`);
      }
      if (set.reps !== null && (!Number.isInteger(set.reps) || set.reps < 1 || set.reps > 100)) {
        errors.push(`${exercise.name} has repetitions outside 1–100.`);
      }
      if (set.rpe !== null && (!Number.isFinite(set.rpe) || set.rpe < 1 || set.rpe > 10)) {
        errors.push(`${exercise.name} has RPE outside 1–10.`);
      }
      if (set.notes.trim().length > 300) {
        errors.push(`${exercise.name} has a set note longer than 300 characters.`);
      }
      if (set.kind === "working" && isCompletedSet(set)) {
        completedWorkingSets += 1;
      }
    }
  }

  if (options.forCompletion && completedWorkingSets === 0) {
    errors.push("Add at least one completed working set before finishing the workout.");
  }

  return { valid: errors.length === 0, errors };
}
