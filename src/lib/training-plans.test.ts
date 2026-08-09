import { describe, expect, it } from "vitest";
import { hasMeaningfulPlanChange, parseTrainingProfile } from "@/lib/training-plans";
import type { TrainingPlan } from "@/lib/types";

describe("training profile validation", () => {
  it("accepts a bounded free-form goal and training constraints", () => {
    expect(parseTrainingProfile({ goal: "Build strength", experience: "intermediate", trainingDays: 4, sessionMinutes: 60, equipment: ["Full gym"], constraints: "" }).goal).toBe("Build strength");
  });

  it("rejects incomplete plans and identifies meaningful changes", () => {
    expect(() => parseTrainingProfile({ goal: "x", experience: "expert", trainingDays: 9, sessionMinutes: 0, equipment: [], constraints: "" })).toThrow();
    const plan: TrainingPlan = { id: "p", schemaVersion: 1, status: "active", title: "Upper", summary: "", workouts: [], };
    expect(hasMeaningfulPlanChange(plan, { title: "Upper", summary: "changed", workouts: [] })).toBe(false);
    expect(hasMeaningfulPlanChange(plan, { title: "Lower", summary: "", workouts: [] })).toBe(true);
  });
});
