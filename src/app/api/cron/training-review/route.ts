import { NextResponse } from "next/server";
import { coachDb } from "@/lib/firebase-admin";
import { generateCoachProposal } from "@/app/api/training-coach/route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profiles = await coachDb().collectionGroup("trainingProfiles").where("consentedAt", "!=", null).limit(20).get();
    const results = await Promise.all(profiles.docs.map(async (profile) => {
      const uid = profile.ref.parent.parent?.id;
      if (!uid) return "skipped";
      try { return (await generateCoachProposal(uid)) ? "proposed" : "unchanged"; } catch { return "skipped"; }
    }));
    return NextResponse.json({ reviewed: results.length, proposed: results.filter((result) => result === "proposed").length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Weekly review failed." }, { status: 500 });
  }
}
