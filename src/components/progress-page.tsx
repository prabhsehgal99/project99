"use client";

import type { User } from "firebase/auth";
import { Loader2, Scale } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useQuickLog } from "@/components/quick-log/quick-log-provider";
import { ProgressBar } from "@/components/ui";
import { currentWeight, dailyLogSummary } from "@/lib/daily-log";
import { recentDateKeys, shortDayLabel } from "@/lib/dates";
import { subscribeToRecentDailyLogs, subscribeToSettings } from "@/lib/firestore";
import { defaultSettings, type DailyLog, type UserSettings } from "@/lib/types";

export function ProgressPage() {
  return <AuthenticatedShell>{(user) => <ProgressContent user={user} />}</AuthenticatedShell>;
}

function ProgressContent({ user }: { user: User }) {
  const { openQuickLog } = useQuickLog();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let settingsReady = false;
    let logsReady = false;
    const markReady = () => {
      if (settingsReady && logsReady) {
        setLoading(false);
      }
    };
    const handleError = (nextError: Error) => {
      setError(nextError.message);
      setLoading(false);
    };
    const unsubscribeSettings = subscribeToSettings(
      user.uid,
      (nextSettings) => {
        settingsReady = true;
        setSettings(nextSettings);
        markReady();
      },
      handleError
    );
    const unsubscribeLogs = subscribeToRecentDailyLogs(
      user.uid,
      recentDateKeys(90)[0],
      (nextLogs) => {
        logsReady = true;
        setLogs(nextLogs);
        markReady();
      },
      handleError
    );

    return () => {
      unsubscribeSettings();
      unsubscribeLogs();
    };
  }, [user.uid]);

  const chartData = useMemo(() => {
    const byDate = new Map(logs.map((item) => [item.date, item]));
    return recentDateKeys(7).map((date) => ({
      date,
      label: shortDayLabel(date),
      weight: byDate.get(date)?.weightKg ?? null
    }));
  }, [logs]);

  const weight = currentWeight(logs);
  const goalDelta = weight === null ? null : weight - settings.goalWeightKg;
  const goalProgress = goalDelta === null ? 0 : 100 - Math.min(100, Math.abs(goalDelta) * 5);
  const latestSummary = logs.length > 0 ? dailyLogSummary(logs[logs.length - 1], settings) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Progress</p>
        <h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] text-ink">Trends without the daily noise.</h1>
      </header>

      {error ? (
        <section className="rounded-lg border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100" role="alert">
          <p>{error}</p>
          <button className="mt-3 min-h-11 rounded-md border border-red-200/50 px-4 text-sm font-medium" type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </section>
      ) : null}

      <section className="rounded-3xl border border-line bg-panel p-5 sm:p-6" aria-busy={loading}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Weekly weight trend</h2>
          {loading ? (
            <span className="inline-flex items-center gap-2 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Loading
            </span>
          ) : null}
        </div>
        {chartData.some((point) => point.weight !== null) ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid stroke="#26322e" vertical={false} />
                <XAxis dataKey="label" stroke="#98a39e" tickLine={false} axisLine={false} />
                <YAxis stroke="#98a39e" tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip
                  contentStyle={{ background: "#101816", border: "1px solid #26322e", borderRadius: 8, color: "#f3f3ec" }}
                  formatter={(value) => [`${Number(value).toFixed(1)} kg`, "Weight"]}
                />
                <Line type="monotone" dataKey="weight" stroke="#a9dcc4" strokeWidth={3} dot={{ r: 4, fill: "#d9cda9" }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyAction
            icon={<Scale className="h-5 w-5" aria-hidden="true" />}
            title="No weight trend yet"
            detail="Add morning weight in Quick Log to start the weekly trend."
            action="Add morning weight"
            onClick={() => openQuickLog("body")}
          />
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border-y border-line py-5">
          <h2 className="text-base font-semibold text-ink">Weight goal</h2>
          <div className="mt-5">
            <div className="mb-2 flex justify-between gap-3 text-sm">
              <span className="text-muted">Current</span>
              <span className="font-medium text-ink">{weight === null ? "Add morning weight" : `${weight.toFixed(1)} kg`}</span>
            </div>
            <ProgressBar value={goalProgress} tone="emerald" />
            <p className="mt-3 text-sm text-muted">
              {goalDelta === null ? "Goal progress appears after a weight entry." : `${Math.abs(goalDelta).toFixed(1)} kg ${goalDelta > 0 ? "above" : "from"} ${settings.goalWeightKg.toFixed(1)} kg.`}
            </p>
          </div>
        </div>

        <div className="border-y border-line py-5">
          <h2 className="text-base font-semibold text-ink">Current daily targets</h2>
          {latestSummary ? (
            <div className="mt-5 grid gap-4">
              <TargetLine label="Calories" percent={latestSummary.caloriePercent} value={`${Math.round(latestSummary.caloriePercent)}%`} />
              <TargetLine label="Protein" percent={latestSummary.proteinPercent} value={`${Math.round(latestSummary.proteinPercent)}%`} />
              <TargetLine label="Water" percent={latestSummary.waterPercent} value={`${Math.round(latestSummary.waterPercent)}%`} />
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">Log calories, protein, or water to see daily target progress here.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function TargetLine({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="border-b border-line pb-4 last:border-b-0 last:pb-0">
      <div className="mb-2 flex justify-between gap-3 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-ink">{value}</span>
      </div>
      <ProgressBar value={percent} tone="emerald" />
    </div>
  );
}

function EmptyAction({ icon, title, detail, action, onClick }: { icon: React.ReactNode; title: string; detail: string; action: string; onClick: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-night/30 p-6 text-center">
      <div className="text-mint">{icon}</div>
      <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{detail}</p>
      <button className="mt-4 min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink" type="button" onClick={onClick}>
        {action}
      </button>
    </div>
  );
}
