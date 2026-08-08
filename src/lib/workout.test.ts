import { describe, expect, it } from "vitest";
import { estimatedOneRepMaxLb, exerciseVolumeLb, previousCompletedExercise, validateWorkoutSession, workoutFromTemplate, workoutVolumeLb } from "@/lib/workout";
import type { WorkoutExercise, WorkoutSession, WorkoutTemplate } from "@/lib/types";

const bench: WorkoutExercise = {
  id: "bench-1",
  exerciseId: "barbell-bench-press",
  name: "Barbell Bench Press",
  primaryMuscleGroup: "chest",
  notes: "",
  sets: [
    { id: "warmup", kind: "warmup", weightLb: 95, reps: 10, rpe: null, notes: "" },
    { id: "work-1", kind: "working", weightLb: 135, reps: 8, rpe: 8, notes: "" },
    { id: "empty", kind: "working", weightLb: null, reps: null, rpe: null, notes: "" }
  ]
};

function session(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: "session-1",
    schemaVersion: 1,
    date: "2026-08-04",
    title: "Upper",
    status: "active",
    exercises: [bench],
    notes: "",
    ...overrides
  };
}

describe("workout calculations", () => {
  it("counts completed working-set volume but excludes warm-ups and blank sets", () => {
    expect(exerciseVolumeLb(bench)).toBe(1080);
    expect(workoutVolumeLb(session())).toBe(1080);
  });

  it("uses the Epley formula for estimated 1RM", () => {
    expect(estimatedOneRepMaxLb(bench.sets[1])).toBe(171);
    expect(estimatedOneRepMaxLb(bench.sets[2])).toBeNull();
  });

  it("finds the matching exercise from the latest supplied completed session", () => {
    const previous = session({ id: "previous", status: "completed", date: "2026-08-01" });
    expect(previousCompletedExercise([previous], bench.exerciseId, "session-1")?.name).toBe("Barbell Bench Press");
  });

  it("copies template prescriptions into an independent active-session snapshot", () => {
    const template: WorkoutTemplate = { id: "upper", schemaVersion: 1, title: "Upper", notes: "", archived: false, exercises: [{ id: "bench", exerciseId: bench.exerciseId, name: bench.name, primaryMuscleGroup: "chest", notes: "", restSeconds: 120, prescriptions: [{ kind: "working", targetSets: 3, repMin: 8, repMax: 10, targetRpe: 8 }] }] };
    const workout = workoutFromTemplate(template, "active", "2026-08-08");
    expect(workout.exercises[0].sets).toHaveLength(3);
    template.exercises[0].name = "Changed template";
    expect(workout.exercises[0].name).toBe("Barbell Bench Press");
  });
});

describe("validateWorkoutSession", () => {
  it("requires a completed working set when finishing", () => {
    const invalid = session({ exercises: [{ ...bench, sets: [bench.sets[2]] }] });
    expect(validateWorkoutSession(invalid, { forCompletion: true }).valid).toBe(false);
    expect(validateWorkoutSession(session(), { forCompletion: true }).valid).toBe(true);
  });
});
