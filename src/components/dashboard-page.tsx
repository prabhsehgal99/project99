"use client";

import { Bike, CheckCircle2, Dumbbell, Loader2, Moon, NotebookPen, Scale, Utensils, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useQuickLog } from "@/components/quick-log/quick-log-provider";
import { useTodayData } from "@/components/today-data-provider";
import { ProgressBar } from "@/components/ui";
import { dailyLogSummary, formatActivityStatus } from "@/lib/daily-log";
import { longDateLabel } from "@/lib/dates";
import { dismissTodayFocus, isTodayFocusDismissed } from "@/lib/today-focus-visibility";
import { todayFocus } from "@/lib/today";
import { nutritionDaySummary } from "@/lib/nutrition";

export function DashboardPage() {
  return <AuthenticatedShell>{() => <TodayContent />}</AuthenticatedShell>;
}

function TodayContent() {
  const { today, todayLog, todayExists, settings, activeWorkout, nutritionEntries, loading, error } = useTodayData();
  const { openQuickLog } = useQuickLog();
  const [focusDismissed, setFocusDismissed] = useState(() => isTodayFocusDismissed(today));
  const nutrition = nutritionDaySummary(todayLog, nutritionEntries).total;
  const summary = dailyLogSummary({ ...todayLog, caloriesConsumed: nutrition.calories, proteinConsumed: nutrition.protein, carbohydratesConsumed: nutrition.carbohydrates, fatConsumed: nutrition.fat, fibreConsumed: nutrition.fibre }, settings);
  const focus = todayFocus(todayLog, settings, activeWorkout);
  const rhythm = loggedMoments(todayLog);

  function dismissFocus() {
    dismissTodayFocus(today);
    setFocusDismissed(true);
  }

  return (
    <div className="mx-auto max-w-3xl pb-5">
      <header className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{longDateLabel(today)}</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] text-ink sm:text-4xl">Today</h1>
        </div>
        <Link className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition hover:bg-raised hover:text-ink" href={`/log/${today}`} aria-label="Open today’s full Daily Log">
          <Scale className="h-5 w-5" aria-hidden="true" />
        </Link>
      </header>

      {!focusDismissed ? (
        <section className="border-b border-line pb-6" aria-labelledby="up-next-title">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Up next</p>
            <button className="-mr-2 -mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-raised hover:text-ink" type="button" onClick={dismissFocus} aria-label="Dismiss Up next for this session">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <h2 id="up-next-title" className="mt-3 max-w-xl text-2xl font-medium tracking-[-0.035em] text-ink sm:text-3xl">{focus.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{todayExists || summary.hasMeaningfulEntry ? "Keep capture short and accurate. Your full day stays available when you need it." : "No log has been saved for today yet."}</p>
          <div className="mt-5">
            {"href" in focus ? (
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-ink transition hover:bg-ink/90" href={focus.href}>
                {focus.type.includes("workout") ? <Dumbbell className="h-5 w-5" aria-hidden="true" /> : null}
                {focus.label}
              </Link>
            ) : (
              <button className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-ink transition hover:bg-ink/90" type="button" onClick={() => openQuickLog(focus.quickLog)}>
                {focus.label}
              </button>
            )}
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="mt-5 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100" role="alert">
          <p>{error}</p>
          <button className="mt-3 min-h-11 rounded-xl border border-red-200/50 px-4 text-sm font-medium" type="button" onClick={() => window.location.reload()}>Retry</button>
        </section>
      ) : null}

      <section className="mt-8" aria-busy={loading} aria-label="Today so far">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-medium tracking-[-0.02em] text-ink">Today so far</h2>
          {loading ? <span className="inline-flex items-center gap-2 text-xs text-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Syncing</span> : <span className="text-xs text-muted">Tap Log to add anything</span>}
        </div>
        <div className="border-y border-line">
          <MetricRow label="Calories" value={`${nutrition.calories.toLocaleString()} / ${settings.calorieGoal.toLocaleString()}`} percent={summary.caloriePercent} />
          <MetricRow label="Protein" value={`${nutrition.protein} / ${settings.proteinGoal} g`} percent={summary.proteinPercent} />
          <MetricRow label="Water" value={`${summary.waterLitres.toFixed(2)} / ${summary.waterGoalLitres.toFixed(1)} L`} percent={summary.waterPercent} />
        </div>
      </section>

      <section className="mt-8" aria-label="Your rhythm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-medium tracking-[-0.02em] text-ink">Your rhythm</h2>
          <Link className="min-h-11 px-2 py-3 text-xs font-medium text-muted hover:text-ink" href={`/nutrition?date=${today}`}>Log food</Link>
        </div>
        {rhythm.length > 0 ? (
          <div className="relative ml-1 border-l border-line pl-6">
            {rhythm.map((moment) => (
              <article key={moment.label} className="relative grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-3 last:border-b-0">
                <span className={`absolute -left-[29px] h-2.5 w-2.5 rounded-full border-2 border-night ${moment.tone}`} aria-hidden="true" />
                <div><p className="text-sm text-ink">{moment.label}</p><p className="mt-0.5 text-xs text-muted">{moment.detail}</p></div>
                <moment.icon className="h-4 w-4 text-muted" aria-hidden="true" />
              </article>
            ))}
          </div>
        ) : (
          <button className="flex min-h-20 w-full items-center justify-between border-y border-line py-4 text-left text-sm text-muted transition hover:text-ink" type="button" onClick={() => openQuickLog()}>
            <span>Nothing logged yet. Add the first signal when you are ready.</span><span className="text-xs font-medium text-mint">Open Log</span>
          </button>
        )}
      </section>
    </div>
  );
}

function MetricRow({ label, value, percent }: { label: string; value: string; percent: number }) {
  return <div className="grid min-h-14 grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line last:border-b-0 sm:grid-cols-[92px_minmax(0,1fr)_auto]"><span className="text-sm text-ink">{label}</span><ProgressBar value={percent} /><span className="whitespace-nowrap text-xs tabular-nums text-muted">{value}</span></div>;
}

function loggedMoments(log: ReturnType<typeof useTodayData>["todayLog"]) {
  const moments: { label: string; detail: string; tone: string; icon: typeof Scale }[] = [];
  if (log.sleepHours !== null) moments.push({ label: "Sleep", detail: `${log.sleepHours} h`, tone: "bg-violet", icon: Moon });
  if (log.weightKg !== null) moments.push({ label: "Morning weight", detail: `${log.weightKg.toFixed(1)} kg`, tone: "bg-mint", icon: Scale });
  if (log.caloriesConsumed > 0 || log.proteinConsumed > 0) moments.push({ label: "Nutrition", detail: `${log.caloriesConsumed} kcal · ${log.proteinConsumed} g protein`, tone: "bg-warm", icon: Utensils });
  if (log.workoutStatus === "complete") moments.push({ label: "Workout", detail: formatActivityStatus(log.workoutStatus), tone: "bg-mint", icon: Dumbbell });
  if (log.cardioStatus === "complete") moments.push({ label: "Cardio", detail: formatActivityStatus(log.cardioStatus), tone: "bg-warm", icon: Bike });
  if (log.energyLevel !== null || log.moodLevel !== null || log.sorenessLevel !== null) moments.push({ label: "Recovery", detail: `Energy ${log.energyLevel ?? "—"}/5 · Mood ${log.moodLevel ?? "—"}/5`, tone: "bg-violet", icon: CheckCircle2 });
  if (log.journalNotes) moments.push({ label: "Journal", detail: "Note saved", tone: "bg-mint", icon: NotebookPen });
  return moments;
}
