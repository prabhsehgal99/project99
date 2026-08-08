"use client";

import type { User } from "firebase/auth";
import { Check, ChevronDown, Dumbbell, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useNavigationGuard } from "@/components/navigation-guard";
import { Panel } from "@/components/ui";
import { todayKey } from "@/lib/dates";
import {
  finishWorkoutSession,
  saveActiveWorkoutSession,
  startWorkoutSession,
  subscribeToActiveWorkout,
  subscribeToRecentWorkoutSessions
} from "@/lib/firestore";
import {
  estimatedOneRepMaxLb,
  exerciseCatalogue,
  exerciseVolumeLb,
  isCompletedSet,
  newWorkoutExercise,
  newWorkoutSet,
  previousCompletedExercise,
  validateWorkoutSession,
  workoutVolumeLb
} from "@/lib/workout";
import type { WorkoutExercise, WorkoutSession, WorkoutSet } from "@/lib/types";

export function WorkoutPage() {
  return <AuthenticatedShell>{(user) => <WorkoutContent user={user} />}</AuthenticatedShell>;
}

function WorkoutContent({ user }: { user: User }) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [draft, setDraft] = useState<WorkoutSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [remoteChanged, setRemoteChanged] = useState(false);
  const dirtyRef = useRef(false);
  const baselineRef = useRef("");

  const markDirty = useCallback((next: WorkoutSession) => {
    setDraft(next);
    setDirty(true);
    dirtyRef.current = true;
    setSaveMessage("");
  }, []);

  useEffect(() => {
    return subscribeToActiveWorkout(
      user.uid,
      (nextSession) => {
        setSession(nextSession);
        setLoading(false);
        if (!nextSession) {
          if (!dirtyRef.current) {
            setDraft(null);
          }
          return;
        }

        const nextSignature = workoutDataSignature(nextSession);
        if (dirtyRef.current && baselineRef.current && nextSignature !== baselineRef.current) {
          setRemoteChanged(true);
          return;
        }

        setDraft(nextSession);
        baselineRef.current = nextSignature;
      },
      (error) => {
        setLoadError(error.message || "Unable to load the active workout.");
        setLoading(false);
      }
    );
  }, [user.uid]);

  useEffect(
    () =>
      subscribeToRecentWorkoutSessions(
        user.uid,
        setRecentSessions,
        (error) => setLoadError(error.message || "Unable to load workout history.")
      ),
    [user.uid]
  );

  const requestLeave = useCallback(
    (href: string) => {
      if (!dirtyRef.current) {
        return false;
      }
      setPendingHref(href);
      return true;
    },
    []
  );
  useNavigationGuard(requestLeave);

  async function startWorkout() {
    setStarting(true);
    setLoadError(null);
    try {
      await startWorkoutSession(user.uid, todayKey());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to start the workout.");
    } finally {
      setStarting(false);
    }
  }

  async function saveWorkout() {
    if (!draft) {
      return false;
    }
    const validation = validateWorkoutSession(draft);
    setErrors(validation.errors);
    if (!validation.valid) {
      return false;
    }

    setSaving(true);
    try {
      await saveActiveWorkoutSession(user.uid, draft);
      baselineRef.current = workoutDataSignature(draft);
      setDirty(false);
      dirtyRef.current = false;
      setRemoteChanged(false);
      setSaveMessage("Workout saved.");
      return true;
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Unable to save the workout. Your edits are still here."]);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function finishWorkout() {
    if (!draft) {
      return;
    }
    const validation = validateWorkoutSession(draft, { forCompletion: true });
    setErrors(validation.errors);
    if (!validation.valid) {
      return;
    }

    setFinishing(true);
    try {
      await finishWorkoutSession(user.uid, draft);
      setDirty(false);
      dirtyRef.current = false;
      baselineRef.current = "";
      setDraft(null);
      setSaveMessage("Workout complete and linked to today’s Daily Log.");
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Unable to finish the workout. Your edits are still here."]);
    } finally {
      setFinishing(false);
    }
  }

  const completedSessionCount = useMemo(
    () => recentSessions.filter((recentSession) => recentSession.status === "completed").length,
    [recentSessions]
  );

  if (loadError && !draft) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel title="Workout unavailable">
          <p className="text-sm leading-6 text-red-100">{loadError}</p>
          <button
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100"
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </Panel>
      </div>
    );
  }

  if (loading && !draft) {
    return <WorkoutLoading />;
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-line bg-panel p-5 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-raised">
            <Dumbbell className="h-6 w-6 text-mint" aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-medium uppercase tracking-wide text-zinc-500">Workout</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Ready when you are.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
            Record warm-ups and working sets in pounds, then finish to update today’s Daily Log.
          </p>
          {saveMessage ? (
            <p className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
              {saveMessage}
            </p>
          ) : null}
          <button
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-medium text-primary-ink transition hover:bg-ink/90 disabled:opacity-60 sm:w-auto"
            type="button"
            disabled={starting}
            onClick={startWorkout}
          >
            {starting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Dumbbell className="h-5 w-5" aria-hidden="true" />}
            Start workout
          </button>
          {completedSessionCount > 0 ? <p className="mt-4 text-sm text-zinc-500">{completedSessionCount} recent completed workout{completedSessionCount === 1 ? "" : "s"} available for context.</p> : null}
        </section>
      </div>
    );
  }

  const volume = workoutVolumeLb(draft);
  const activeExercise = draft.exercises[0];
  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b border-line pb-5">
        <div>
          <p className="text-sm font-medium text-muted">Active workout</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">{activeExercise?.name ?? "Build today's workout"}</h1>
          <p className="mt-2 text-sm text-muted">{draft.date} · {volume.toLocaleString()} lb working volume · {draft.exercises.length} exercise{draft.exercises.length === 1 ? "" : "s"}</p>
        </div>
        <span className={`mt-4 inline-flex rounded-md border px-3 py-2 text-sm ${dirty ? "border-warm/40 bg-warm/10 text-warm" : "border-line bg-raised text-muted"}`}>
          {dirty ? "Unsaved changes" : "Saved workout"}
        </span>
      </div>

      <div aria-live="polite" className="sr-only">{saveMessage}</div>
      {saveMessage ? <p className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">{saveMessage}</p> : null}
      {loadError ? <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">{loadError}</p> : null}
      {remoteChanged ? (
        <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
          This workout changed on another device. Your local edits are still intact; saving will replace the saved version.
          <button
            className="ml-3 min-h-11 rounded-md border border-amber-200/50 px-3 text-sm font-medium"
            type="button"
            onClick={() => {
              if (session) {
                setDraft(session);
                baselineRef.current = workoutDataSignature(session);
                setDirty(false);
                dirtyRef.current = false;
                setRemoteChanged(false);
              }
            }}
          >
            Reload saved version
          </button>
        </div>
      ) : null}
      {errors.length > 0 ? (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100" role="alert">
          <p className="font-medium">Review this workout before continuing.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}
      {pendingHref ? (
        <div className="mt-4 rounded-lg border border-purple-400/30 bg-purple-400/10 p-4 text-sm text-purple-50">
          <p className="font-medium">Save changes before leaving this workout?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink disabled:opacity-60" type="button" disabled={saving} onClick={async () => { if (await saveWorkout()) window.location.assign(pendingHref); }}>Save and go</button>
            <button className="min-h-11 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium" type="button" onClick={() => { setDirty(false); dirtyRef.current = false; window.location.assign(pendingHref); }}>Discard changes</button>
            <button className="min-h-11 rounded-md border border-zinc-700 px-4 text-sm font-medium" type="button" onClick={() => setPendingHref(null)}>Cancel</button>
          </div>
        </div>
      ) : null}

      <form className="mt-5 space-y-5" onSubmit={(event) => { event.preventDefault(); void saveWorkout(); }}>
        <details className="rounded-lg border border-line bg-panel p-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
            Options
            <ChevronDown className="h-5 w-5 text-muted" aria-hidden="true" />
          </summary>
          <label className="block text-sm font-medium text-zinc-200" htmlFor="workout-title">Workout name</label>
          <input id="workout-title" className="mt-2 block min-h-11 w-full rounded-md border-zinc-700 bg-zinc-900 text-zinc-50 placeholder:text-zinc-600 focus:border-emerald-400 focus:ring-emerald-400 sm:max-w-md" value={draft.title} maxLength={80} onChange={(event) => markDirty({ ...draft, title: event.target.value })} />
          <label className="mt-4 block text-sm font-medium text-zinc-200" htmlFor="workout-notes">Workout notes <span className="font-normal text-zinc-500">(optional)</span></label>
          <textarea id="workout-notes" className="mt-2 block min-h-24 w-full rounded-md border-zinc-700 bg-zinc-900 text-zinc-50 placeholder:text-zinc-600 focus:border-emerald-400 focus:ring-emerald-400" value={draft.notes} maxLength={2000} onChange={(event) => markDirty({ ...draft, notes: event.target.value })} />
        </details>

        {draft.exercises.map((exercise, index) => (
          <ExerciseEditor
            key={exercise.id}
            exercise={exercise}
            index={index}
            previous={previousCompletedExercise(recentSessions, exercise.exerciseId, draft.id)}
            onChange={(nextExercise) => markDirty({ ...draft, exercises: draft.exercises.map((item) => item.id === nextExercise.id ? nextExercise : item) })}
            onRemove={() => markDirty({ ...draft, exercises: draft.exercises.filter((item) => item.id !== exercise.id) })}
          />
        ))}

        <ExercisePicker
          chosenIds={draft.exercises.map((exercise) => exercise.exerciseId)}
          onAdd={(definition) => markDirty({ ...draft, exercises: [...draft.exercises, newWorkoutExercise(definition)] })}
        />

        <div className="sticky bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 -mx-4 flex flex-col gap-2 border-t border-line bg-night/95 px-4 py-3 backdrop-blur-sm md:static md:mx-0 md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0">
          <button className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-medium text-primary-ink disabled:opacity-60 md:flex-none" type="button" disabled={saving || finishing} onClick={finishWorkout}>
            {finishing ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Check className="h-5 w-5" aria-hidden="true" />}
            Finish workout
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-raised px-4 text-sm font-medium text-muted disabled:opacity-60 md:flex-none" type="submit" disabled={saving || finishing || !dirty}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function ExercisePicker({ chosenIds, onAdd }: { chosenIds: string[]; onAdd: (definition: (typeof exerciseCatalogue)[number]) => void }) {
  const available = exerciseCatalogue.filter((exercise) => !chosenIds.includes(exercise.id));
  if (available.length === 0) return null;
  return (
    <details className="rounded-lg border border-dashed border-line bg-panel p-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink">
        Add exercise <ChevronDown className="h-5 w-5 text-muted" aria-hidden="true" />
      </summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {available.map((exercise) => (
          <button key={exercise.id} className="flex min-h-12 items-center justify-between rounded-md border border-line bg-raised px-3 text-left text-sm text-ink hover:border-mint/50" type="button" onClick={() => onAdd(exercise)}>
            <span><span className="block font-medium">{exercise.name}</span><span className="text-xs text-muted">{exercise.primaryMuscleGroup}</span></span>
            <Plus className="h-5 w-5 text-mint" aria-hidden="true" />
          </button>
        ))}
      </div>
    </details>
  );
}

function ExerciseEditor({ exercise, index, previous, onChange, onRemove }: { exercise: WorkoutExercise; index: number; previous?: WorkoutExercise; onChange: (exercise: WorkoutExercise) => void; onRemove: () => void }) {
  const volume = exerciseVolumeLb(exercise);
  const bestEstimatedOneRepMax = Math.max(0, ...exercise.sets.map((set) => estimatedOneRepMaxLb(set) ?? 0));
  const previousSet = previous?.sets.find((set) => set.kind === "working" && isCompletedSet(set));
  return (
    <section className="border-b border-line py-5 first:border-t">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Exercise {index + 1}</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">{exercise.name}</h2>
        </div>
        <button className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-muted hover:text-red-200" type="button" onClick={onRemove}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Remove</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
        <span className="rounded-md border border-line bg-raised px-2 py-1 text-muted">{exercise.primaryMuscleGroup}</span>
        <span className="rounded-md border border-line bg-raised px-2 py-1 text-muted">{volume.toLocaleString()} lb volume</span>
        {bestEstimatedOneRepMax > 0 ? <span className="rounded-md border border-violet/25 bg-violet/10 px-2 py-1 text-violet">Est. 1RM {bestEstimatedOneRepMax} lb</span> : null}
      </div>
      <div className="mt-4 space-y-3">
        {exercise.sets.map((set, setIndex) => <SetEditor key={set.id} set={set} index={setIndex} previousSet={previousSet} onChange={(nextSet) => onChange({ ...exercise, sets: exercise.sets.map((item) => item.id === nextSet.id ? nextSet : item) })} onRemove={() => onChange({ ...exercise, sets: exercise.sets.filter((item) => item.id !== set.id) })} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-raised px-3 text-sm font-medium text-ink" type="button" onClick={() => onChange({ ...exercise, sets: [...exercise.sets, newWorkoutSet("working")] })}><Plus className="h-4 w-4" aria-hidden="true" /> Working set</button>
        <button className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-raised px-3 text-sm font-medium text-ink" type="button" onClick={() => onChange({ ...exercise, sets: [...exercise.sets, newWorkoutSet("warmup")] })}><Plus className="h-4 w-4" aria-hidden="true" /> Warm-up</button>
      </div>
      <details className="mt-4 rounded-md border border-line bg-night/30 p-3">
        <summary className="min-h-11 cursor-pointer text-sm font-medium text-muted">Exercise notes</summary>
        <input id={`exercise-notes-${exercise.id}`} className="mt-2 block min-h-11 w-full rounded-md border-line bg-raised text-ink focus:border-mint focus:ring-mint" value={exercise.notes} maxLength={500} onChange={(event) => onChange({ ...exercise, notes: event.target.value })} />
      </details>
    </section>
  );
}

function SetEditor({ set, index, previousSet, onChange, onRemove }: { set: WorkoutSet; index: number; previousSet?: WorkoutSet; onChange: (set: WorkoutSet) => void; onRemove: () => void }) {
  const id = `set-${set.id}`;
  const numericChange = (field: "weightLb" | "reps" | "rpe", raw: string) => onChange({ ...set, [field]: raw === "" ? null : Number(raw) });
  return (
    <fieldset className={`rounded-md border p-3 ${set.kind === "warmup" ? "border-warm/35 bg-warm/10" : "border-line bg-raised"}`}>
      <div className="flex items-center justify-between gap-3">
        <legend className="text-sm font-medium text-ink">{set.kind === "warmup" ? "Warm-up" : "Working"} set {index + 1}</legend>
        <button className="inline-flex min-h-11 items-center text-sm text-muted hover:text-red-200" type="button" onClick={onRemove}>Remove</button>
      </div>
      {previousSet && previousSet.weightLb !== null && previousSet.reps !== null ? (
        <p className="mt-1 text-xs text-muted">Previous working set: {previousSet.weightLb} lb × {previousSet.reps}</p>
      ) : null}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <NumberField id={`${id}-weight`} label="Weight (lb)" min={0} max={2000} step="0.5" value={set.weightLb} onChange={(value) => numericChange("weightLb", value)} />
        <NumberField id={`${id}-reps`} label="Reps" min={1} max={100} step="1" value={set.reps} onChange={(value) => numericChange("reps", value)} />
        <NumberField id={`${id}-rpe`} label="RPE" min={1} max={10} step="0.5" value={set.rpe} onChange={(value) => numericChange("rpe", value)} />
      </div>
    </fieldset>
  );
}

function NumberField({ id, label, value, min, max, step, onChange }: { id: string; label: string; value: number | null; min: number; max: number; step: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-medium text-muted" htmlFor={id}>{label}<input id={id} className="mt-1 block min-h-11 w-full rounded-md border-line bg-night text-sm text-ink focus:border-mint focus:ring-mint" type="number" inputMode="decimal" min={min} max={max} step={step} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
}

function WorkoutLoading() {
  return <div className="mx-auto flex min-h-64 max-w-3xl items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80 text-zinc-300"><Loader2 className="mr-3 h-5 w-5 animate-spin text-emerald-300" aria-hidden="true" />Loading workout</div>;
}

function workoutDataSignature(session: WorkoutSession) {
  return JSON.stringify({ date: session.date, title: session.title, status: session.status, exercises: session.exercises, notes: session.notes });
}
