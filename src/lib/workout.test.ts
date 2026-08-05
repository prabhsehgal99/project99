import { describe, expect, it } from "vitest";
import { estimatedOneRepMaxLb, exerciseVolumeLb, previousCompletedExercise, validateWorkoutSession, workoutVolumeLb } from "@/lib/workout";
import type { WorkoutExercise, WorkoutSession } from "@/lib/types";

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
});

describe("validateWorkoutSession", () => {
  it("requires a completed working set when finishing", () => {
    const invalid = session({ exercises: [{ ...bench, sets: [bench.sets[2]] }] });
    expect(validateWorkoutSession(invalid, { forCompletion: true }).valid).toBe(false);
    expect(validateWorkoutSession(session(), { forCompletion: true }).valid).toBe(true);
  });
});
