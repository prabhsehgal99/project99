"use client";

import type { User } from "firebase/auth";
import {
  CheckCircle2,
  Dumbbell,
  Droplets,
  Flame,
  Loader2,
  Moon,
  NotebookPen,
  PlusCircle,
  Scale,
  Activity,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { NumberInput } from "@/components/ui";
import { useTodayData } from "@/components/today-data-provider";
import { activityStatuses, formatActivityStatus, scaleLevels, type DailyLogMutation } from "@/lib/daily-log";
import { mutateDailyLog } from "@/lib/firestore";
import type { ActivityStatus, ScaleLevel } from "@/lib/types";

export type QuickLogEditor =
  | "root"
  | "body"
  | "sleep"
  | "nutrition"
  | "recovery"
  | "activity"
  | "steps"
  | "note";

type QuickLogContextValue = {
  openQuickLog: (editor?: QuickLogEditor) => void;
};

const QuickLogContext = createContext<QuickLogContextValue | null>(null);

export function QuickLogProvider({ user, children }: { user: User; children: ReactNode }) {
  const router = useRouter();
  const { today, todayLog } = useTodayData();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const [editor, setEditor] = useState<QuickLogEditor>("root");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [retryMutation, setRetryMutation] = useState<DailyLogMutation | null>(null);

  const [weightKg, setWeightKg] = useState<number | "">("");
  const [sleepHours, setSleepHours] = useState<number | "">("");
  const [waterLitres, setWaterLitres] = useState<number | "">("");
  const [caloriesConsumed, setCaloriesConsumed] = useState<number | "">("");
  const [proteinConsumed, setProteinConsumed] = useState<number | "">("");
  const [carbohydratesConsumed, setCarbohydratesConsumed] = useState<number | "">("");
  const [fatConsumed, setFatConsumed] = useState<number | "">("");
  const [fibreConsumed, setFibreConsumed] = useState<number | "">("");
  const [moodLevel, setMoodLevel] = useState<ScaleLevel | null>(null);
  const [energyLevel, setEnergyLevel] = useState<ScaleLevel | null>(null);
  const [sorenessLevel, setSorenessLevel] = useState<ScaleLevel | null>(null);
  const [steps, setSteps] = useState<number | "">("");
  const [workoutStatus, setWorkoutStatus] = useState<ActivityStatus>("planned");
  const [cardioStatus, setCardioStatus] = useState<ActivityStatus>("planned");
  const [habitDone, setHabitDone] = useState(false);
  const [journalNotes, setJournalNotes] = useState("");

  const initializeFields = useCallback(() => {
    setWeightKg(todayLog.weightKg ?? "");
    setSleepHours(todayLog.sleepHours ?? "");
    setWaterLitres(todayLog.waterMl / 1000);
    setCaloriesConsumed(todayLog.caloriesConsumed);
    setProteinConsumed(todayLog.proteinConsumed);
    setCarbohydratesConsumed(todayLog.carbohydratesConsumed);
    setFatConsumed(todayLog.fatConsumed);
    setFibreConsumed(todayLog.fibreConsumed);
    setMoodLevel(todayLog.moodLevel);
    setEnergyLevel(todayLog.energyLevel);
    setSorenessLevel(todayLog.sorenessLevel);
    setSteps(todayLog.steps ?? "");
    setWorkoutStatus(todayLog.workoutStatus);
    setCardioStatus(todayLog.cardioStatus);
    setHabitDone(todayLog.habitDone);
    setJournalNotes(todayLog.journalNotes);
  }, [todayLog]);

  const openQuickLog = useCallback(
    (nextEditor: QuickLogEditor = "root") => {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      initializeFields();
      setEditor(nextEditor);
      setError("");
      setStatus("");
      setRetryMutation(null);
      dialogRef.current?.showModal();
      window.setTimeout(() => firstActionRef.current?.focus(), 0);
    },
    [initializeFields]
  );

  const closeQuickLog = useCallback(() => {
    dialogRef.current?.close();
    restoreFocusRef.current?.focus();
  }, []);

  const runMutation = useCallback(
    async (mutation: DailyLogMutation, successMessage: string) => {
      setSaving(true);
      setError("");
      setStatus("");
      setRetryMutation(mutation);

      try {
        await mutateDailyLog(user.uid, today, mutation, today);
        setStatus(successMessage);
        setRetryMutation(null);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Could not save this update. Your entry is still here.");
      } finally {
        setSaving(false);
      }
    },
    [today, user.uid]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleCancel = () => {
      restoreFocusRef.current?.focus();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, []);

  const value = useMemo(() => ({ openQuickLog }), [openQuickLog]);

  return (
    <QuickLogContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-line bg-panel p-0 text-ink shadow-glow backdrop:bg-black/60 md:inset-0 md:m-auto md:max-h-[82vh] md:w-[min(92vw,560px)] md:rounded-3xl"
        aria-labelledby="quick-log-title"
        onClose={() => restoreFocusRef.current?.focus()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-panel px-5 py-4">
          <div>
            <p className="text-xs font-medium text-muted">Quick Log</p>
            <h2 id="quick-log-title" className="text-lg font-medium tracking-[-0.03em] text-ink">
              {editor === "root" ? "What changed?" : editorTitle(editor)}
            </h2>
          </div>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-raised text-muted transition hover:text-ink"
            type="button"
            onClick={closeQuickLog}
            aria-label="Close Quick Log"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5">
          <div aria-live="polite" className="sr-only">
            {saving ? "Saving Quick Log update." : status || error}
          </div>
          {status ? <p className="mb-4 rounded-md border border-mint/40 bg-mint/10 px-3 py-2 text-sm text-mint">{status}</p> : null}
          {error ? (
            <div className="mb-4 rounded-md border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-100" role="alert">
              <p>{error}</p>
              {retryMutation ? (
                <button
                  className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md border border-red-200/50 px-3 text-sm font-medium"
                  type="button"
                  disabled={saving}
                  onClick={() => void runMutation(retryMutation, "Saved.")}
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}

          {editor === "root" ? (
            <div className="grid gap-3">
              <button
                ref={firstActionRef}
                className="flex min-h-14 items-center justify-between rounded-2xl bg-primary px-4 text-left font-medium text-primary-ink transition active:scale-[0.99]"
                type="button"
                disabled={saving}
                onClick={() => void runMutation({ type: "incrementWater", amountMl: 250 }, "Added 250 mL of water.")}
              >
                <span className="inline-flex items-center gap-3">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Droplets className="h-5 w-5" aria-hidden="true" />}
                  Add 250 mL water
                </span>
                <span className="text-sm">Now</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <QuickLogChoice icon={<Scale className="h-5 w-5" aria-hidden="true" />} label="Weight" onClick={() => setEditor("body")} />
                <QuickLogChoice icon={<Moon className="h-5 w-5" aria-hidden="true" />} label="Sleep" onClick={() => setEditor("sleep")} />
                <QuickLogChoice icon={<Flame className="h-5 w-5" aria-hidden="true" />} label="Manual nutrition" onClick={() => setEditor("nutrition")} />
                <QuickLogChoice icon={<PlusCircle className="h-5 w-5" aria-hidden="true" />} label="Add food" onClick={() => { closeQuickLog(); router.push("/nutrition"); }} />
                <QuickLogChoice icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} label="Recovery" onClick={() => setEditor("recovery")} />
                <QuickLogChoice icon={<Activity className="h-5 w-5" aria-hidden="true" />} label="Steps" onClick={() => setEditor("steps")} />
                <QuickLogChoice icon={<NotebookPen className="h-5 w-5" aria-hidden="true" />} label="Note" onClick={() => setEditor("note")} />
                <QuickLogChoice icon={<Dumbbell className="h-5 w-5" aria-hidden="true" />} label="Training" onClick={() => setEditor("activity")} />
                <QuickLogChoice icon={<Droplets className="h-5 w-5" aria-hidden="true" />} label="Water total" onClick={() => setEditor("nutrition")} />
              </div>
              <button
                className="min-h-11 rounded-md border border-line px-4 text-sm font-medium text-ink"
                type="button"
                onClick={() => {
                  closeQuickLog();
                  router.push(`/log/${today}`);
                }}
              >
                Edit full day
              </button>
            </div>
          ) : null}

          {editor === "body" ? (
            <FocusedEditor onBack={() => setEditor("root")}>
              <NumberInput label="Morning weight" value={weightKg} min={25} max={300} step={0.1} decimalPlaces={1} suffix="kg" onChange={setWeightKg} />
              <PrimarySave
                saving={saving}
                onClick={() => void runMutation({ type: "setWeight", weightKg: weightKg === "" ? null : weightKg }, "Weight saved.")}
              />
            </FocusedEditor>
          ) : null}

          {editor === "sleep" ? (
            <FocusedEditor onBack={() => setEditor("root")}>
              <NumberInput label="Sleep duration" value={sleepHours} min={0} max={24} step={0.25} decimalPlaces={2} suffix="hours" onChange={setSleepHours} />
              <PrimarySave
                saving={saving}
                onClick={() => void runMutation({ type: "setSleep", sleepHours: sleepHours === "" ? null : sleepHours }, "Sleep saved.")}
              />
            </FocusedEditor>
          ) : null}

          {editor === "nutrition" ? (
            <FocusedEditor onBack={() => setEditor("root")}>
              <NumberInput label="Water" value={waterLitres} min={0} max={15} step={0.25} decimalPlaces={2} suffix="L" onChange={setWaterLitres} />
              <p className="text-sm leading-6 text-muted">Manual adjustment is added to itemized meals. Use Add food for itemized nutrition.</p>
              <NumberInput label="Manual calories" value={caloriesConsumed} min={0} max={20000} step={50} decimalPlaces={0} suffix="kcal" onChange={setCaloriesConsumed} />
              <NumberInput label="Protein" value={proteinConsumed} min={0} max={1000} step={5} decimalPlaces={0} suffix="g" onChange={setProteinConsumed} />
              <details className="rounded-md border border-line bg-night/40 p-3">
                <summary className="min-h-11 cursor-pointer text-sm font-medium text-muted">Carbs, fat, and fibre</summary>
                <div className="mt-4 grid gap-4">
                  <NumberInput label="Carbohydrates" value={carbohydratesConsumed} min={0} max={2000} step={5} decimalPlaces={0} suffix="g" onChange={setCarbohydratesConsumed} />
                  <NumberInput label="Fat" value={fatConsumed} min={0} max={1000} step={5} decimalPlaces={0} suffix="g" onChange={setFatConsumed} />
                  <NumberInput label="Fibre" value={fibreConsumed} min={0} max={200} step={1} decimalPlaces={0} suffix="g" onChange={setFibreConsumed} />
                </div>
              </details>
              <PrimarySave
                saving={saving}
                label="Log"
                onClick={() =>
                  void runMutation(
                    {
                      type: "setNutrition",
                      waterMl: waterLitres === "" ? 0 : Math.round(waterLitres * 1000),
                      caloriesConsumed: caloriesConsumed === "" ? 0 : caloriesConsumed,
                      proteinConsumed: proteinConsumed === "" ? 0 : proteinConsumed,
                      carbohydratesConsumed: carbohydratesConsumed === "" ? 0 : carbohydratesConsumed,
                      fatConsumed: fatConsumed === "" ? 0 : fatConsumed,
                      fibreConsumed: fibreConsumed === "" ? 0 : fibreConsumed
                    },
                    "Nutrition saved."
                  )
                }
              />
            </FocusedEditor>
          ) : null}

          {editor === "recovery" ? (
            <FocusedEditor onBack={() => setEditor("root")}>
              <ScaleButtons label="Mood" value={moodLevel} onChange={setMoodLevel} />
              <ScaleButtons label="Energy" value={energyLevel} onChange={setEnergyLevel} />
              <ScaleButtons label="Soreness" value={sorenessLevel} onChange={setSorenessLevel} />
              <PrimarySave saving={saving} onClick={() => void runMutation({ type: "setRecovery", moodLevel, energyLevel, sorenessLevel }, "Recovery saved.")} />
            </FocusedEditor>
          ) : null}

          {editor === "steps" ? (
            <FocusedEditor onBack={() => setEditor("root")}>
              <NumberInput label="Steps" value={steps} min={0} max={200000} step={500} decimalPlaces={0} onChange={setSteps} />
              <PrimarySave saving={saving} onClick={() => void runMutation({ type: "setSteps", steps: steps === "" ? null : steps }, "Steps saved.")} />
            </FocusedEditor>
          ) : null}

          {editor === "activity" ? (
            <FocusedEditor onBack={() => setEditor("root")}>
              <StatusSelect label="Workout status" value={workoutStatus} onChange={setWorkoutStatus} />
              <StatusSelect label="Cardio status" value={cardioStatus} onChange={setCardioStatus} />
              <label className="flex min-h-14 items-center justify-between rounded-md border border-line bg-raised px-4 text-sm text-ink">
                Daily habit
                <input className="h-5 w-5 rounded-sm border-line bg-night text-mint focus:ring-mint" type="checkbox" checked={habitDone} onChange={(event) => setHabitDone(event.target.checked)} />
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                <PrimarySave saving={saving} label="Save workout" onClick={() => void runMutation({ type: "setWorkoutStatus", workoutStatus }, "Workout status saved.")} />
                <PrimarySave saving={saving} label="Save cardio" onClick={() => void runMutation({ type: "setCardioStatus", cardioStatus }, "Cardio status saved.")} />
                <PrimarySave saving={saving} label="Save habit" onClick={() => void runMutation({ type: "setHabit", habitDone }, "Habit saved.")} />
              </div>
            </FocusedEditor>
          ) : null}

          {editor === "note" ? (
            <FocusedEditor onBack={() => setEditor("root")}>
              <label className="block">
                <span className="text-sm font-medium text-muted">Journal note</span>
                <textarea
                  className="mt-2 min-h-36 w-full resize-y rounded-md border border-line bg-raised px-3 py-3 text-base text-ink outline-hidden focus:border-mint"
                  maxLength={2200}
                  value={journalNotes}
                  onChange={(event) => setJournalNotes(event.target.value)}
                />
              </label>
              <PrimarySave saving={saving} onClick={() => void runMutation({ type: "setJournal", journalNotes }, "Note saved.")} />
            </FocusedEditor>
          ) : null}
        </div>
      </dialog>
    </QuickLogContext.Provider>
  );
}

export function useQuickLog() {
  const context = useContext(QuickLogContext);

  if (!context) {
    throw new Error("useQuickLog must be used within QuickLogProvider");
  }

  return context;
}

function editorTitle(editor: QuickLogEditor) {
  const titles: Record<QuickLogEditor, string> = {
    root: "What changed?",
    body: "Morning weight",
    sleep: "Sleep",
    nutrition: "Nutrition and water",
    recovery: "Recovery",
    activity: "Training and habit",
    steps: "Steps",
    note: "Journal note"
  };
  return titles[editor];
}

function QuickLogChoice({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className="flex min-h-16 flex-col items-start justify-center gap-2 rounded-2xl border border-line bg-raised px-3 text-left text-sm font-medium text-ink transition hover:border-violet/60 active:scale-[0.99]"
      type="button"
      onClick={onClick}
    >
      <span className="text-mint">{icon}</span>
      {label}
    </button>
  );
}

function FocusedEditor({ children, onBack }: { children: ReactNode; onBack: () => void }) {
  return (
    <div className="grid gap-4">
      <button className="min-h-11 justify-self-start rounded-md border border-line px-4 text-sm font-medium text-ink" type="button" onClick={onBack}>
        Back
      </button>
      {children}
    </div>
  );
}

function PrimarySave({ saving, label = "Save", onClick }: { saving: boolean; label?: string; onClick: () => void }) {
  return (
    <button
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-medium text-primary-ink transition hover:bg-ink/90 disabled:opacity-60"
      type="button"
      disabled={saving}
      onClick={onClick}
    >
      {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}

function ScaleButtons({
  label,
  value,
  onChange
}: {
  label: string;
  value: ScaleLevel | null;
  onChange: (value: ScaleLevel | null) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-muted">{label}</legend>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <button
          className={`min-h-11 rounded-md border px-2 text-sm ${value === null ? "border-mint bg-mint/10 text-mint" : "border-line bg-raised text-ink"}`}
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={value === null}
        >
          Clear
        </button>
        {scaleLevels.map((level) => (
          <button
            key={level}
            className={`min-h-11 rounded-md border px-2 text-sm ${value === level ? "border-mint bg-mint/10 text-mint" : "border-line bg-raised text-ink"}`}
            type="button"
            onClick={() => onChange(level)}
            aria-pressed={value === level}
          >
            {level}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function StatusSelect({
  label,
  value,
  onChange
}: {
  label: string;
  value: ActivityStatus;
  onChange: (value: ActivityStatus) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted">{label}</span>
      <select
        className="mt-2 min-h-11 w-full rounded-md border border-line bg-raised px-3 text-base text-ink outline-hidden focus:border-mint"
        value={value}
        onChange={(event) => onChange(event.target.value as ActivityStatus)}
      >
        {activityStatuses.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {formatActivityStatus(statusOption)}
          </option>
        ))}
      </select>
    </label>
  );
}
