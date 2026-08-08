"use client";

import { Bike, CheckCircle2, Droplets, Dumbbell, Flame, Loader2, Moon, NotebookPen, Scale, Utensils } from "lucide-react";
import Link from "next/link";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useQuickLog } from "@/components/quick-log/quick-log-provider";
import { useTodayData } from "@/components/today-data-provider";
import { ProgressBar } from "@/components/ui";
import { dailyLogSummary, formatActivityStatus } from "@/lib/daily-log";
import { longDateLabel } from "@/lib/dates";
import { todayFocus } from "@/lib/today";

export function DashboardPage() {
  return <AuthenticatedShell>{() => <TodayContent />}</AuthenticatedShell>;
}

function TodayContent() {
  const { today, todayLog, todayExists, settings, activeWorkout, loading, error } = useTodayData();
  const { openQuickLog } = useQuickLog();
  const summary = dailyLogSummary(todayLog, settings);
  const focus = todayFocus(todayLog, settings, activeWorkout);

  return (
    <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[minmax(0,1.05fr)_360px]">
      <div className="space-y-5">
        <section className="rounded-lg border border-line bg-panel p-5 shadow-glow sm:p-7">
          <p className="text-sm font-medium text-muted">{longDateLabel(today)}</p>
          <div className="mt-5 rounded-lg border border-mint/30 bg-raised p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-mint">Up next</p>
                <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">{focus.title}</h1>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {todayExists || summary.hasMeaningfulEntry ? "Today has started. Keep capture short and accurate." : "No log has been saved for today yet."}
                </p>
              </div>
              {"href" in focus ? (
                <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-base font-semibold text-night" href={focus.href}>
                  {focus.type.includes("workout") ? <Dumbbell className="h-5 w-5" aria-hidden="true" /> : null}
                  {focus.label}
                </Link>
              ) : (
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-mint px-5 text-base font-semibold text-night"
                  type="button"
                  onClick={() => openQuickLog(focus.quickLog)}
                >
                  {focus.label}
                </button>
              )}
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-lg border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100" role="alert">
            <p>{error}</p>
            <button className="mt-3 min-h-11 rounded-md border border-red-200/50 px-4 text-sm font-medium" type="button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </section>
        ) : null}

        <section className="rounded-lg border border-line bg-panel p-4 sm:p-5" aria-busy={loading}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Daily progress</h2>
            {loading ? (
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Syncing
              </span>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ProgressLine icon={<Flame className="h-5 w-5" aria-hidden="true" />} label="Calories" value={`${todayLog.caloriesConsumed} kcal`} detail={`${summary.caloriesRemaining} remaining`} percent={summary.caloriePercent} />
            <ProgressLine icon={<Utensils className="h-5 w-5" aria-hidden="true" />} label="Protein" value={`${todayLog.proteinConsumed} g`} detail={`${summary.proteinRemaining} g remaining`} percent={summary.proteinPercent} />
            <ProgressLine icon={<Droplets className="h-5 w-5" aria-hidden="true" />} label="Water" value={`${summary.waterLitres.toFixed(2)} L`} detail={`${summary.waterGoalLitres.toFixed(2)} L target`} percent={summary.waterPercent} />
          </div>
        </section>

        <section className="rounded-lg border border-line bg-panel p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Recorded today</h2>
            <Link className="min-h-11 px-2 py-3 text-sm font-medium text-mint" href={`/log/${today}`}>
              Edit full day
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Signal label="Morning weight" value={todayLog.weightKg === null ? "Add morning weight" : `${todayLog.weightKg.toFixed(1)} kg`} icon={<Scale className="h-5 w-5" aria-hidden="true" />} onClick={() => openQuickLog("body")} />
            <Signal label="Sleep" value={todayLog.sleepHours === null ? "Log sleep" : `${todayLog.sleepHours} h`} icon={<Moon className="h-5 w-5" aria-hidden="true" />} onClick={() => openQuickLog("sleep")} />
            <Signal label="Workout" value={formatActivityStatus(todayLog.workoutStatus)} icon={<Dumbbell className="h-5 w-5" aria-hidden="true" />} href="/workouts" />
            <Signal label="Cardio" value={formatActivityStatus(todayLog.cardioStatus)} icon={<Bike className="h-5 w-5" aria-hidden="true" />} onClick={() => openQuickLog("activity")} />
            <Signal label="Recovery" value={todayLog.energyLevel === null ? "Check in" : `Energy ${todayLog.energyLevel}/5`} icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} onClick={() => openQuickLog("recovery")} />
            <Signal label="Notes" value={todayLog.journalNotes ? "Journal note saved" : "Add note"} icon={<NotebookPen className="h-5 w-5" aria-hidden="true" />} onClick={() => openQuickLog("note")} />
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-base font-semibold text-ink">Fast capture</h2>
          <div className="mt-4 grid gap-3">
            <button className="min-h-12 rounded-md bg-mint px-4 text-sm font-semibold text-night" type="button" onClick={() => openQuickLog()}>
              Open Quick Log
            </button>
            <button className="min-h-12 rounded-md border border-line bg-raised px-4 text-sm font-medium text-ink" type="button" onClick={() => openQuickLog("nutrition")}>
              Add food totals or water
            </button>
            <button className="min-h-12 rounded-md border border-line bg-raised px-4 text-sm font-medium text-ink" type="button" onClick={() => openQuickLog("steps")}>
              Add steps
            </button>
          </div>
        </section>
        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="text-base font-semibold text-ink">Next destinations</h2>
          <div className="mt-4 grid gap-2">
            <Link className="min-h-11 rounded-md border border-line bg-raised px-4 py-3 text-sm font-medium text-ink" href="/progress">
              Review progress
            </Link>
            <Link className="min-h-11 rounded-md border border-line bg-raised px-4 py-3 text-sm font-medium text-ink" href="/more">
              History, goals, and account
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}

function ProgressLine({ icon, label, value, detail, percent }: { icon: React.ReactNode; label: string; value: string; detail: string; percent: number }) {
  return (
    <div className="rounded-md border border-line bg-night/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-muted">
          <span className="text-mint">{icon}</span>
          {label}
        </span>
        <span className="text-sm font-semibold text-ink">{value}</span>
      </div>
      <div className="mt-4">
        <ProgressBar value={percent} tone="emerald" />
      </div>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}

function Signal({
  icon,
  label,
  value,
  href,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="text-mint">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block truncate text-sm text-muted">{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link className="flex min-h-16 items-center gap-3 rounded-md border border-line bg-raised px-4 text-left" href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className="flex min-h-16 items-center gap-3 rounded-md border border-line bg-raised px-4 text-left" type="button" onClick={onClick}>
      {content}
    </button>
  );
}
