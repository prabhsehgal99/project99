"use client";

import type { User } from "firebase/auth";
import { Activity, AlertTriangle, ChevronRight, Loader2, Moon, NotebookPen, Save, Scale, Utensils } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useNavigationGuard } from "@/components/navigation-guard";
import { DailyLogActivitySection } from "@/components/daily-log/daily-log-activity-section";
import { DailyLogDateNav } from "@/components/daily-log/daily-log-date-nav";
import { DailyLogMorningSection } from "@/components/daily-log/daily-log-morning-section";
import { DailyLogNotesSection } from "@/components/daily-log/daily-log-notes-section";
import { DailyLogNutritionSection } from "@/components/daily-log/daily-log-nutrition-section";
import { DailyLogRecoverySection } from "@/components/daily-log/daily-log-recovery-section";
import { Panel } from "@/components/ui";
import {
  dailyLogDataSignature,
  formatActivityStatus,
  serializeDailyLog,
  toDailyLogDraft,
  validateDailyLogDraft,
  type DailyLogFieldErrors
} from "@/lib/daily-log";
import { compareDateKeys, isFutureDateKey, isValidDateKey, shiftDateKey, todayKey } from "@/lib/dates";
import { saveDailyLog, subscribeToDailyLog, type DailyLogSnapshot } from "@/lib/firestore";
import type { DailyLog, DailyLogDraft } from "@/lib/types";

type DailyLogSection = "body" | "nutrition" | "activity" | "recovery" | "notes";

export function DailyLogPage({ dateKey }: { dateKey: string }) {
  return <AuthenticatedShell>{(user) => <DailyLogContent user={user} dateKey={dateKey} />}</AuthenticatedShell>;
}

function DailyLogContent({ user, dateKey }: { user: User; dateKey: string }) {
  const router = useRouter();
  const today = todayKey();
  const validDate = isValidDateKey(dateKey);
  const futureDate = validDate && isFutureDateKey(dateKey, today);
  const [snapshot, setSnapshot] = useState<DailyLogSnapshot | null>(null);
  const [draft, setDraft] = useState<DailyLogDraft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DailyLogFieldErrors>({});
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [conflictLog, setConflictLog] = useState<DailyLog | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [cachedWarningDate, setCachedWarningDate] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DailyLogSection | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);
  const loadedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    if (!validDate || futureDate) {
      return;
    }

    loadedSignatureRef.current = null;
    dirtyRef.current = false;

    return subscribeToDailyLog(
      user.uid,
      dateKey,
      (nextSnapshot) => {
        const nextSignature = dailyLogDataSignature(nextSnapshot.log);
        const loadedSignature = loadedSignatureRef.current;

        setSnapshot(nextSnapshot);
        if (!nextSnapshot.fromCache) {
          setCachedWarningDate(null);
        }

        if (!dirtyRef.current || loadedSignature === null) {
          setDraft(toDailyLogDraft(nextSnapshot.log, { emptyTotals: !nextSnapshot.exists }));
          setDirty(false);
          setLoadError(null);
          setSaveError(null);
          setFieldErrors({});
          setErrorSummary([]);
          setSavedMessage("");
          setPendingHref(null);
          loadedSignatureRef.current = nextSignature;
          setConflictLog(null);
          return;
        }

        if (!nextSnapshot.hasPendingWrites && loadedSignature && nextSignature !== loadedSignature) {
          setConflictLog(nextSnapshot.log);
        }
      },
      (error) => {
        setLoadError(error.message);
      }
    );
  }, [dateKey, futureDate, user.uid, validDate]);

  useEffect(() => {
    if (errorSummary.length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errorSummary]);

  useEffect(() => {
    if (!snapshot?.fromCache) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCachedWarningDate(dateKey);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [dateKey, snapshot?.fromCache]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const previousDate = useMemo(() => shiftDateKey(dateKey, -1) ?? today, [dateKey, today]);
  const nextDate = useMemo(() => {
    const shifted = shiftDateKey(dateKey, 1);
    return shifted && compareDateKeys(shifted, today) <= 0 ? shifted : null;
  }, [dateKey, today]);

  const updateDraft = useCallback((patch: Partial<DailyLogDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setDirty(true);
    setSavedMessage("");
    setSaveError(null);
  }, []);

  const runSave = useCallback(async () => {
    if (!draft) {
      return false;
    }

    const validation = validateDailyLogDraft(draft, todayKey());
    setFieldErrors(validation.fieldErrors);
    setErrorSummary(validation.summary);
    setSavedMessage("");

    if (!validation.valid) {
      return false;
    }

    const log = serializeDailyLog(draft);
    setSaving(true);
    setSaveError(null);

    try {
      await saveDailyLog(user.uid, log, snapshot?.exists ? snapshot.log : null);
      setDirty(false);
      dirtyRef.current = false;
      loadedSignatureRef.current = dailyLogDataSignature(log);
      setConflictLog(null);
      setSavedMessage("Daily log saved.");
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save Daily Log.");
      setDirty(true);
      dirtyRef.current = true;
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, snapshot, user.uid]);

  const guardAppNavigation = useCallback((href: string) => {
    if (!dirtyRef.current) {
      return false;
    }

    setPendingHref(href);
    return true;
  }, []);

  useNavigationGuard(guardAppNavigation);

  function requestNavigate(next: string) {
    if (!isValidDateKey(next) || isFutureDateKey(next, today)) {
      return;
    }

    const href = `/log/${next}`;

    if (dirty) {
      setPendingHref(href);
      return;
    }

    router.push(href);
  }

  async function saveAndNavigate() {
    if (!pendingHref) {
      return;
    }

    const saved = await runSave();

    if (saved) {
      router.push(pendingHref);
    }
  }

  function discardAndNavigate() {
    if (!pendingHref) {
      return;
    }

    setDirty(false);
    dirtyRef.current = false;
    router.push(pendingHref);
  }

  function reloadConflict() {
    if (!conflictLog) {
      return;
    }

    setDraft(toDailyLogDraft(conflictLog));
    setDirty(false);
    dirtyRef.current = false;
    loadedSignatureRef.current = dailyLogDataSignature(conflictLog);
    setConflictLog(null);
    setSavedMessage("Saved version loaded.");
  }

  if (!validDate) {
    return <InvalidDateState message="That Daily Log date is not valid." />;
  }

  if (futureDate) {
    return <InvalidDateState message="Future Daily Logs cannot be created in this slice." />;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel title="Daily Log unavailable">
          <p className="text-sm text-red-100">{loadError}</p>
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

  if (!draft || !snapshot || draft.date !== dateKey) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80 text-zinc-300">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-emerald-300" aria-hidden="true" />
          Loading Daily Log
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <DailyLogDateNav
        dateKey={dateKey}
        previousDate={previousDate}
        nextDate={nextDate}
        isToday={dateKey === today}
        disabled={saving}
        onNavigate={requestNavigate}
      />

      <div aria-live="polite" className="sr-only">
        {savedMessage}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-300">
          {dirty ? "Unsaved changes" : snapshot.exists ? "Saved log loaded" : "No log for this day yet"}
        </span>
        {cachedWarningDate === dateKey ? (
          <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-100">
            Showing cached data; retry when the connection is available.
          </span>
        ) : null}
        {savedMessage ? (
          <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-emerald-100">
            {savedMessage}
          </span>
        ) : null}
      </div>

      {errorSummary.length > 0 || saveError ? (
        <div
          ref={errorSummaryRef}
          className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100 outline-hidden"
          role="alert"
          tabIndex={-1}
        >
          {saveError ? <p>{saveError}</p> : null}
          {errorSummary.length > 0 ? (
            <>
              <p className="font-medium">Review these fields before saving.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errorSummary.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      {conflictLog ? (
        <section className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">This log changed on another device.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-amber-200 px-4 text-sm font-semibold text-zinc-950"
                  type="button"
                  onClick={reloadConflict}
                >
                  Reload saved version
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-200/50 px-4 text-sm font-medium text-amber-50"
                  type="button"
                  onClick={() => setConflictLog(null)}
                >
                  Keep editing
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {pendingHref ? (
        <section className="mt-4 rounded-lg border border-purple-400/30 bg-purple-400/10 p-4 text-sm text-purple-50">
          <p className="font-medium">
            {pendingHref.startsWith("/log/") ? "Save changes before changing dates?" : "Save changes before leaving this log?"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-60"
              type="button"
              disabled={saving}
              onClick={saveAndNavigate}
            >
              Save and go
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-100"
              type="button"
              onClick={discardAndNavigate}
            >
              Discard changes
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-700 px-4 text-sm font-medium text-zinc-100"
              type="button"
              onClick={() => setPendingHref(null)}
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <form
        className="mt-5 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          await runSave();
        }}
      >
        {activeSection ? (
          <div className="rounded-lg border border-line bg-panel p-4 sm:p-5">
            <button
              className="mb-4 min-h-11 rounded-md border border-line bg-raised px-4 text-sm font-medium text-ink"
              type="button"
              onClick={() => setActiveSection(null)}
            >
              Back to categories
            </button>
            {activeSection === "body" ? <DailyLogMorningSection draft={draft} errors={fieldErrors} onChange={updateDraft} /> : null}
            {activeSection === "nutrition" ? <DailyLogNutritionSection draft={draft} errors={fieldErrors} onChange={updateDraft} /> : null}
            {activeSection === "activity" ? <DailyLogActivitySection draft={draft} onChange={updateDraft} /> : null}
            {activeSection === "recovery" ? <DailyLogRecoverySection draft={draft} errors={fieldErrors} onChange={updateDraft} /> : null}
            {activeSection === "notes" ? <DailyLogNotesSection draft={draft} errors={fieldErrors} onChange={updateDraft} /> : null}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <CategoryButton
              icon={<Scale className="h-5 w-5" aria-hidden="true" />}
              title="Body"
              detail={`${draft.weightKg === "" ? "Add morning weight" : `${draft.weightKg} kg`} · ${draft.sleepHours === "" ? "Log sleep" : `${draft.sleepHours} h sleep`}`}
              onClick={() => setActiveSection("body")}
            />
            <CategoryButton
              icon={<Utensils className="h-5 w-5" aria-hidden="true" />}
              title="Nutrition"
              detail={`${draft.caloriesConsumed === "" ? 0 : draft.caloriesConsumed} kcal · ${draft.proteinConsumed === "" ? 0 : draft.proteinConsumed} g protein · ${draft.waterLitres === "" ? 0 : draft.waterLitres} L`}
              onClick={() => setActiveSection("nutrition")}
            />
            <CategoryButton
              icon={<Activity className="h-5 w-5" aria-hidden="true" />}
              title="Activity"
              detail={`Workout ${formatActivityStatus(draft.workoutStatus)} · cardio ${formatActivityStatus(draft.cardioStatus)} · ${draft.habitDone ? "habit done" : "habit open"}`}
              onClick={() => setActiveSection("activity")}
            />
            <CategoryButton
              icon={<Moon className="h-5 w-5" aria-hidden="true" />}
              title="Recovery"
              detail={`${draft.energyLevel === null ? "Add energy" : `Energy ${draft.energyLevel}/5`} · ${draft.steps === "" ? "Add steps" : `${draft.steps} steps`}`}
              onClick={() => setActiveSection("recovery")}
            />
            <div className="md:col-span-2">
              <CategoryButton
                icon={<NotebookPen className="h-5 w-5" aria-hidden="true" />}
                title="Notes"
                detail={draft.journalNotes.trim() ? "Journal note saved" : "Add a journal note"}
                onClick={() => setActiveSection("notes")}
              />
            </div>
          </div>
        )}

        {dirty || saving ? (
        <div className="sticky bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 -mx-4 border-t border-line bg-night/95 px-4 py-3 backdrop-blur-sm md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-mint px-5 text-base font-semibold text-night transition disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            type="submit"
            disabled={saving || !dirty}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
            Save Daily Log
          </button>
        </div>
        ) : null}
      </form>
    </div>
  );
}

function CategoryButton({
  icon,
  title,
  detail,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-20 w-full items-center justify-between gap-4 rounded-lg border border-line bg-panel p-4 text-left transition hover:border-mint/50"
      type="button"
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-mint">{icon}</span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-ink">{title}</span>
          <span className="mt-1 block truncate text-sm text-muted">{detail}</span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
    </button>
  );
}

function InvalidDateState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Panel title="Daily Log unavailable">
        <p className="text-sm leading-6 text-zinc-300">{message}</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950"
          href="/log"
        >
          Go to today
        </Link>
      </Panel>
    </div>
  );
}
