import { z } from "zod";
import type { TrainingPlan, TrainingPlanProposal, TrainingProfile } from "@/lib/types";

export const trainingProfileSchema = z.object({
  goal: z.string().trim().min(3).max(500),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  trainingDays: z.number().int().min(1).max(7),
  sessionMinutes: z.number().int().min(15).max(240),
  equipment: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  constraints: z.string().trim().max(1000)
});

const setSchema = z.object({ kind: z.enum(["warmup", "working"]), targetSets: z.number().int().min(1).max(12), repMin: z.number().int().min(1).max(100).nullable(), repMax: z.number().int().min(1).max(100).nullable(), targetRpe: z.number().min(1).max(10).nullable() });
const exerciseSchema = z.object({ id: z.string().min(1), exerciseId: z.string().min(1), name: z.string().min(1).max(100), primaryMuscleGroup: z.enum(["chest", "back", "shoulders", "arms", "legs", "core", "full-body"]), notes: z.string().max(500), restSeconds: z.number().int().min(0).max(900).nullable(), prescriptions: z.array(setSchema).max(12) });
const cardioSchema = z.object({ id: z.string().min(1), activity: z.string().min(1).max(100), durationMinutes: z.number().positive().max(1440).nullable(), distanceKm: z.number().min(0).max(1000).nullable(), rpe: z.number().min(1).max(10).nullable(), notes: z.string().max(300) });

export const generatedPlanSchema = z.object({
  title: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(1000),
  workouts: z.array(z.object({ id: z.string().min(1), dayLabel: z.string().trim().min(1).max(60), title: z.string().trim().min(1).max(80), exercises: z.array(exerciseSchema).min(1).max(12), cardioBlocks: z.array(cardioSchema).max(4) })).min(1).max(7)
});

export function parseTrainingProfile(input: unknown): Omit<TrainingProfile, "schemaVersion" | "consentedAt" | "updatedAt"> {
  return trainingProfileSchema.parse(input);
}

export function parseGeneratedPlan(input: unknown): Omit<TrainingPlan, "id" | "schemaVersion" | "status" | "createdAt" | "updatedAt"> {
  return generatedPlanSchema.parse(input);
}

export function hasMeaningfulPlanChange(current: TrainingPlan | null, next: Omit<TrainingPlan, "id" | "schemaVersion" | "status" | "createdAt" | "updatedAt">) {
  if (!current) return true;
  return JSON.stringify({ title: current.title, workouts: current.workouts }) !== JSON.stringify({ title: next.title, workouts: next.workouts });
}

export function proposalFromPlan(id: string, planId: string | null, plan: Omit<TrainingPlan, "id" | "schemaVersion" | "status" | "createdAt" | "updatedAt">, rationale: string): Omit<TrainingPlanProposal, "createdAt" | "decidedAt"> {
  return { id, schemaVersion: 1, planId, status: "pending", rationale: rationale.slice(0, 1000), summary: plan.summary, plan };
}
