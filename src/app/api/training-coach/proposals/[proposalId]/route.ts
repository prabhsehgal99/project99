import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authenticatedCoachUser, coachDb } from "@/lib/firebase-admin";
import { parseGeneratedPlan } from "@/lib/training-plans";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const user = await authenticatedCoachUser(request);
    const { proposalId } = await params;
    const body: unknown = await request.json();
    const decision = typeof body === "object" && body !== null && "decision" in body ? body.decision : null;
    if (decision !== "accept" && decision !== "decline") return NextResponse.json({ error: "Choose accept or decline." }, { status: 400 });
    const db = coachDb();
    const owner = db.collection("users").doc(user.uid);
    const proposalRef = owner.collection("trainingPlanProposals").doc(proposalId);
    const proposal = await proposalRef.get();
    if (!proposal.exists || proposal.data()?.status !== "pending") return NextResponse.json({ error: "This proposal is no longer available." }, { status: 404 });
    if (decision === "decline") {
      await proposalRef.update({ status: "declined", decidedAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ status: "declined" });
    }
    const data = proposal.data()!;
    const plan = parseGeneratedPlan(data.plan);
    const planId = crypto.randomUUID();
    const batch = db.batch();
    if (typeof data.planId === "string") batch.update(owner.collection("trainingPlans").doc(data.planId), { status: "superseded", updatedAt: FieldValue.serverTimestamp() });
    batch.set(owner.collection("trainingPlans").doc(planId), { id: planId, schemaVersion: 1, status: "active", ...plan, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    batch.update(proposalRef, { status: "accepted", decidedAt: FieldValue.serverTimestamp() });
    await batch.commit();
    return NextResponse.json({ status: "accepted", planId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update proposal." }, { status: 500 });
  }
}
