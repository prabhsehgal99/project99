import OpenAI from "openai";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { exerciseCatalogue } from "@/data/exercise-catalogue";
import { authenticatedCoachUser, coachDb } from "@/lib/firebase-admin";
import { generatedPlanSchema, hasMeaningfulPlanChange, parseGeneratedPlan, parseTrainingProfile, proposalFromPlan } from "@/lib/training-plans";
import type { TrainingPlan } from "@/lib/types";

export const runtime = "nodejs";

const model = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";

export async function coachContext(uid: string) {
  const db = coachDb();
  const user = db.collection("users").doc(uid);
  const [profile, plans, proposals, logs, sessions, nutrition] = await Promise.all([
    user.collection("trainingProfiles").doc("current").get(), user.collection("trainingPlans").where("status", "==", "active").limit(1).get(), user.collection("trainingPlanProposals").where("status", "==", "pending").limit(1).get(), user.collection("dailyMetrics").orderBy("date", "desc").limit(56).get(), user.collection("workoutSessions").orderBy("date", "desc").limit(50).get(), user.collection("nutritionEntries").orderBy("createdAt", "desc").limit(150).get()
  ]);
  return { user, profile: profile.exists ? profile.data() : null, plan: plans.empty ? null : ({ id: plans.docs[0]!.id, ...plans.docs[0]!.data() } as TrainingPlan), pending: proposals.empty ? null : { id: proposals.docs[0]!.id, ...proposals.docs[0]!.data() }, fitnessData: { dailyLogs: logs.docs.map((item) => item.data()), workoutSessions: sessions.docs.map((item) => item.data()), nutritionEntries: nutrition.docs.map((item) => item.data()) } };
}

export async function generateCoachProposal(uid: string) {
  const context = await coachContext(uid);
  if (!context.profile) throw new Error("Set up your training profile before generating a plan.");
  if (context.pending) throw new Error("Review the pending coaching proposal before generating another.");
  if (!process.env.OPENAI_API_KEY) throw new Error("The coach is not configured yet. Add OPENAI_API_KEY on the server.");
  const response = await new OpenAI({ apiKey: process.env.OPENAI_API_KEY }).responses.create({ model, input: `You are Project99's workout planner. Produce JSON only. Build a conservative, adaptable training plan from this owner data. Do not diagnose, treat injury, prescribe nutrition, or imply medical advice. Use only catalogue exercise ids. Keep volume appropriate to the stated experience and schedule. Catalogue: ${JSON.stringify(exerciseCatalogue)}\nProfile: ${JSON.stringify(context.profile)}\nAvailable fitness history: ${JSON.stringify(context.fitnessData)}\nCurrent plan: ${JSON.stringify(context.plan)}`, text: { format: { type: "json_schema", name: "training_plan", strict: true, schema: z.toJSONSchema(generatedPlanSchema) as Record<string, unknown> } } });
  const next = parseGeneratedPlan(JSON.parse(response.output_text));
  const allowedIds = new Set(exerciseCatalogue.map((exercise) => exercise.id));
  if (next.workouts.some((workout) => workout.exercises.some((exercise) => !allowedIds.has(exercise.exerciseId)))) throw new Error("The generated plan included an unsupported exercise.");
  if (!hasMeaningfulPlanChange(context.plan, next)) return null;
  const proposalId = crypto.randomUUID();
  const proposal = proposalFromPlan(proposalId, context.plan?.id ?? null, next, "Created from your stated goal and recent training, recovery, nutrition, and body data.");
  await context.user.collection("trainingPlanProposals").doc(proposalId).set({ ...proposal, createdAt: FieldValue.serverTimestamp() });
  return proposal;
}

export async function GET(request: Request) {
  try {
    const user = await authenticatedCoachUser(request);
    const context = await coachContext(user.uid);
    return NextResponse.json({ profile: context.profile, plan: context.plan, proposal: context.pending });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load coach." }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await authenticatedCoachUser(request);
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || !("consent" in body) || body.consent !== true || !("profile" in body)) return NextResponse.json({ error: "Explicit coach consent is required." }, { status: 400 });
    const profile = parseTrainingProfile(body.profile);
    await coachDb().collection("users").doc(user.uid).collection("trainingProfiles").doc("current").set({ schemaVersion: 1, ...profile, consentedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save profile." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticatedCoachUser(request);
    const proposal = await generateCoachProposal(user.uid);
    return proposal ? NextResponse.json({ proposal }) : NextResponse.json({ message: "Your current plan is still appropriate; no proposal was created." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate a training proposal." }, { status: 500 });
  }
}
