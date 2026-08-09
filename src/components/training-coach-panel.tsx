"use client";

import type { User } from "firebase/auth";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { TrainingPlan, TrainingPlanProposal, TrainingProfile } from "@/lib/types";

type ProfileDraft = Omit<TrainingProfile, "schemaVersion" | "consentedAt" | "updatedAt">;
const initialProfile: ProfileDraft = { goal: "", experience: "intermediate", trainingDays: 4, sessionMinutes: 60, equipment: ["Full gym"], constraints: "" };

export function TrainingCoachPanel({ user }: { user: User }) {
  const [profile, setProfile] = useState(initialProfile);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [proposal, setProposal] = useState<TrainingPlanProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const token = () => user.getIdToken();
  const headers = async () => ({ "content-type": "application/json", authorization: `Bearer ${await token()}` });
  const load = async () => {
    setLoading(true); setError("");
    try { const response = await fetch("/api/training-coach", { headers: { authorization: `Bearer ${await token()}` } }); const data: unknown = await response.json(); if (!response.ok || typeof data !== "object" || data === null) throw new Error("Unable to load coach."); const value = data as { profile?: TrainingProfile; plan?: TrainingPlan; proposal?: TrainingPlanProposal | null; pendingProposal?: boolean }; if (value.profile) setProfile(value.profile); setPlan(value.plan ?? null); if (value.proposal) setProposal(value.proposal); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Unable to load coach."); } finally { setLoading(false); }
  };
  useEffect(() => {
    const loadInitial = async () => {
      try { const response = await fetch("/api/training-coach", { headers: { authorization: `Bearer ${await user.getIdToken()}` } }); const data: unknown = await response.json(); if (!response.ok || typeof data !== "object" || data === null) throw new Error("Unable to load coach."); const value = data as { profile?: TrainingProfile; plan?: TrainingPlan; proposal?: TrainingPlanProposal | null }; if (value.profile) setProfile(value.profile); setPlan(value.plan ?? null); if (value.proposal) setProposal(value.proposal); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Unable to load coach."); } finally { setLoading(false); }
    };
    void loadInitial();
  }, [user]);
  const saveAndGenerate = async () => {
    setBusy(true); setError("");
    try {
      const saved = await fetch("/api/training-coach", { method: "PUT", headers: await headers(), body: JSON.stringify({ profile, consent: true }) });
      if (!saved.ok) { const data: unknown = await saved.json(); throw new Error(typeof data === "object" && data !== null && "error" in data ? String(data.error) : "Unable to save coaching preferences."); }
      const generated = await fetch("/api/training-coach", { method: "POST", headers: await headers() }); const data: unknown = await generated.json(); if (!generated.ok) throw new Error(typeof data === "object" && data !== null && "error" in data ? String(data.error) : "Unable to generate plan."); if (typeof data === "object" && data !== null && "proposal" in data) setProposal((data as { proposal: TrainingPlanProposal }).proposal);
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Unable to generate plan."); } finally { setBusy(false); }
  };
  const decide = async (decision: "accept" | "decline") => {
    if (!proposal) return; setBusy(true); setError("");
    try { const response = await fetch(`/api/training-coach/proposals/${proposal.id}`, { method: "POST", headers: await headers(), body: JSON.stringify({ decision }) }); if (!response.ok) throw new Error("Unable to update proposal."); setProposal(null); await load(); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Unable to update proposal."); } finally { setBusy(false); }
  };
  if (loading) return <div className="mt-5 flex min-h-16 items-center gap-2 border-t border-line pt-5 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading training plan</div>;
  return <section className="mt-6 border-t border-line pt-5"><div className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-muted" aria-hidden="true" /><h2 className="text-sm font-medium text-ink">Adaptive training plan</h2></div><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Set a goal in your own words. Project99 uses your available training, recovery, nutrition, and body data to prepare a plan or a change for your approval.</p>{error ? <p className="mt-3 text-sm text-red-200" role="alert">{error}</p> : null}{proposal ? <div className="mt-4 rounded-xl border border-line bg-raised p-4"><p className="font-medium text-ink">{proposal.plan.title}</p><p className="mt-1 text-sm text-muted">{proposal.rationale}</p><div className="mt-3 flex gap-2"><button className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink" disabled={busy} onClick={() => void decide("accept")}>Use this plan</button><button className="min-h-11 rounded-md border border-line px-4 text-sm text-muted" disabled={busy} onClick={() => void decide("decline")}>Not now</button></div></div> : <><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-muted sm:col-span-2">Training goal<input className="mt-1 min-h-11 w-full rounded-md border-line bg-raised text-sm text-ink" value={profile.goal} maxLength={500} onChange={(event) => setProfile({ ...profile, goal: event.target.value })} placeholder="Build strength while training four days each week" /></label><label className="text-xs font-medium text-muted">Experience<select className="mt-1 min-h-11 w-full rounded-md border-line bg-raised text-sm text-ink" value={profile.experience} onChange={(event) => setProfile({ ...profile, experience: event.target.value as TrainingProfile["experience"] })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label className="text-xs font-medium text-muted">Training days<input className="mt-1 min-h-11 w-full rounded-md border-line bg-raised text-sm text-ink" type="number" min="1" max="7" value={profile.trainingDays} onChange={(event) => setProfile({ ...profile, trainingDays: Number(event.target.value) })} /></label><label className="text-xs font-medium text-muted">Minutes per session<input className="mt-1 min-h-11 w-full rounded-md border-line bg-raised text-sm text-ink" type="number" min="15" max="240" value={profile.sessionMinutes} onChange={(event) => setProfile({ ...profile, sessionMinutes: Number(event.target.value) })} /></label><label className="text-xs font-medium text-muted">Equipment<input className="mt-1 min-h-11 w-full rounded-md border-line bg-raised text-sm text-ink" value={profile.equipment.join(", ")} onChange={(event) => setProfile({ ...profile, equipment: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label></div><label className="mt-3 block text-xs font-medium text-muted">Constraints or preferences<textarea className="mt-1 min-h-20 w-full rounded-md border-line bg-raised text-sm text-ink" value={profile.constraints} maxLength={1000} onChange={(event) => setProfile({ ...profile, constraints: event.target.value })} placeholder="Optional. Avoid or flag movements that do not work for you." /></label><button className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink disabled:opacity-60" disabled={busy} onClick={() => void saveAndGenerate()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />} {plan ? "Review my plan" : "Create my plan"}</button></>}</section>;
}
