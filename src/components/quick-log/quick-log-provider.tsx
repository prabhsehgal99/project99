"use client";

import type { User } from "firebase/auth";
import { GlassWater, Loader2, NotebookPen, Utensils, X } from "lucide-react";
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
import { useTodayData } from "@/components/today-data-provider";
import { type DailyLogMutation } from "@/lib/daily-log";
import { mutateDailyLog } from "@/lib/firestore";

type QuickLogEditor = "root" | "journal";

type QuickLogContextValue = {
  openQuickLog: () => void;
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
  const [journalNotes, setJournalNotes] = useState("");

  const openQuickLog = useCallback(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setJournalNotes(todayLog.journalNotes);
    setEditor("root");
    setError("");
    setStatus("");
    setRetryMutation(null);
    dialogRef.current?.showModal();
    window.setTimeout(() => firstActionRef.current?.focus(), 0);
  }, [todayLog.journalNotes]);

  const closeQuickLog = useCallback(() => {
    dialogRef.current?.close();
    restoreFocusRef.current?.focus();
  }, []);

  const openMeals = useCallback(() => {
    closeQuickLog();
    router.push(`/nutrition?date=${today}`);
  }, [closeQuickLog, router, today]);

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
              {editor === "root" ? "What would you like to log?" : "Journal"}
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
            <div className="grid gap-5">
              <button
                ref={firstActionRef}
                className="flex min-h-20 items-center justify-between rounded-2xl bg-primary px-5 text-left text-primary-ink transition active:scale-[0.99] disabled:opacity-60"
                type="button"
                disabled={saving}
                onClick={() => void runMutation({ type: "incrementWater", amountMl: 250 }, "Logged one glass of water.")}
              >
                <span className="inline-flex items-center gap-4">
                  {saving ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /> : <GlassWater className="h-6 w-6" aria-hidden="true" />}
                  <span>
                    <span className="block text-base font-medium">Log a glass of water</span>
                    <span className="mt-0.5 block text-sm text-primary-ink/70">250 mL</span>
                  </span>
                </span>
                <span className="text-sm font-medium">Tap to log</span>
              </button>

              <div className="divide-y divide-line border-y border-line">
                <QuickLogAction
                  icon={<Utensils className="h-5 w-5" aria-hidden="true" />}
                  label="Meals"
                  detail="Log food for today"
                  disabled={saving}
                  onClick={openMeals}
                />
                <QuickLogAction
                  icon={<NotebookPen className="h-5 w-5" aria-hidden="true" />}
                  label="Journal"
                  detail="Add a note about today"
                  disabled={saving}
                  onClick={() => setEditor("journal")}
                />
              </div>
            </div>
          ) : null}

          {editor === "journal" ? (
            <div className="grid gap-4">
              <button className="min-h-11 justify-self-start rounded-md border border-line px-4 text-sm font-medium text-ink" type="button" onClick={() => setEditor("root")}>
                Back
              </button>
              <label className="block">
                <span className="text-sm font-medium text-muted">Journal note</span>
                <textarea
                  className="mt-2 min-h-36 w-full resize-y rounded-md border border-line bg-raised px-3 py-3 text-base text-ink outline-hidden focus:border-mint"
                  maxLength={2200}
                  value={journalNotes}
                  onChange={(event) => setJournalNotes(event.target.value)}
                />
              </label>
              <PrimarySave saving={saving} onClick={() => void runMutation({ type: "setJournal", journalNotes }, "Journal saved.")} />
            </div>
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

function QuickLogAction({
  icon,
  label,
  detail,
  disabled,
  onClick
}: {
  icon: ReactNode;
  label: string;
  detail: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-16 w-full items-center gap-4 px-1 text-left transition hover:text-muted active:scale-[0.99] disabled:opacity-60"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="text-ink">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{detail}</span>
      </span>
    </button>
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
