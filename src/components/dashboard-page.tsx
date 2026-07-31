"use client";

import type { User } from "firebase/auth";
import {
  Bike,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flame,
  Loader2,
  Moon,
  Save,
  Scale,
  Utensils
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { NumberInput, Panel, ProgressBar, StatCard } from "@/components/ui";
import {
  currentWeight,
  dailyLogSummary,
  formatActivityStatus,
  habitStreak
} from "@/lib/daily-log";
import { recentDateKeys, shortDayLabel, todayKey } from "@/lib/dates";
import {
  saveSettings,
  subscribeToDailyLog,
  subscribeToRecentDailyLogs,
  subscribeToSettings
} from "@/lib/firestore";
import { defaultDailyLog, defaultSettings, type DailyLog, type UserSettings } from "@/lib/types";
import { litresToIntegerMillilitres, millilitresToLitres } from "@/lib/units";

export function DashboardPage() {
  return <AuthenticatedShell>{(user) => <DashboardContent user={user} />}</AuthenticatedShell>;
}

function DashboardContent({ user }: { user: User }) {
  const today = todayKey();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [settingsDraft, setSettingsDraft] = useState<UserSettings>(defaultSettings);
  const [todayLog, setTodayLog] = useState<DailyLog>(defaultDailyLog(today));
  const [todayExists, setTodayExists] = useState(false);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [settingsErrors, setSettingsErrors] = useState<string[]>([]);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    let settingsReady = false;
    let todayReady = false;
    let recentReady = false;

    const markReady = () => {
      if (settingsReady && todayReady && recentReady) {
        setDataLoading(false);
      }
    };

    const handleError = (error: Error) => {
      setDataError(error.message);
      setDataLoading(false);
    };

    const unsubSettings = subscribeToSettings(
      user.uid,
      (nextSettings) => {
        settingsReady = true;
        setSettings(nextSettings);
        setSettingsDraft((current) => (settingsDirty ? current : nextSettings));
        markReady();
      },
      handleError
    );

    const unsubToday = subscribeToDailyLog(
      user.uid,
      today,
      (snapshot) => {
        todayReady = true;
        setTodayExists(snapshot.exists);
        setTodayLog(snapshot.log);
        markReady();
      },
      handleError
    );

    const startDate = recentDateKeys(90)[0];
    const unsubRecent = subscribeToRecentDailyLogs(
      user.uid,
      startDate,
      (logs) => {
        recentReady = true;
        setRecentLogs(logs);
        markReady();
      },
      handleError
    );

    return () => {
      unsubSettings();
      unsubToday();
      unsubRecent();
    };
  }, [settingsDirty, today, user.uid]);

  const chartData = useMemo(() => {
    const byDate = new Map(recentLogs.map((item) => [item.date, item]));

    return recentDateKeys(7).map((date) => ({
      date,
      label: shortDayLabel(date),
      weight: byDate.get(date)?.weightKg ?? null
    }));
  }, [recentLogs]);

  const summary = dailyLogSummary(todayLog, settings);
  const weight = currentWeight(recentLogs);
  const streak = habitStreak(recentLogs, today);
  const goalDelta = weight === null ? null : weight - settings.goalWeightKg;
  const goalProgress = goalDelta === null ? 0 : 100 - Math.min(100, Math.abs(goalDelta) * 5);
  const waterGoalDraftLitres = millilitresToLitres(settingsDraft.waterGoalMl);

  function validateSettings(nextSettings: UserSettings) {
    const errors: string[] = [];
    const waterGoalLitres = millilitresToLitres(nextSettings.waterGoalMl);

    if (nextSettings.goalWeightKg < 25 || nextSettings.goalWeightKg > 300) {
      errors.push("Goal weight must be between 25 and 300 kg.");
    }

    if (nextSettings.calorieGoal < 500 || nextSettings.calorieGoal > 20000) {
      errors.push("Calorie goal must be between 500 and 20,000.");
    }

    if (nextSettings.proteinGoal < 20 || nextSettings.proteinGoal > 1000) {
      errors.push("Protein goal must be between 20 and 1,000 g.");
    }

    if (waterGoalLitres < 0.5 || waterGoalLitres > 15) {
      errors.push("Water goal must be between 0.5 and 15 litres.");
    }

    return errors;
  }

  async function handleSettingsSave() {
    const errors = validateSettings(settingsDraft);
    setSettingsErrors(errors);
    setSettingsSaved(false);

    if (errors.length > 0) {
      return;
    }

    setSettingsSaving(true);
    setDataError(null);

    try {
      await saveSettings(user.uid, settingsDraft);
      setSettingsDirty(false);
      setSettingsSaved(true);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSettingsSaving(false);
    }
  }

  function updateSettings(patch: Partial<UserSettings>) {
    setSettingsDraft((current) => ({ ...current, ...patch }));
    setSettingsDirty(true);
    setSettingsSaved(false);
    setSettingsErrors([]);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-50">Today</h1>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          href="/log"
        >
          {summary.hasMeaningfulEntry || todayExists ? "Edit today's log" : "Log today"}
        </Link>
      </div>

      {dataError || settingsErrors.length > 0 ? (
        <section className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100" role="alert">
          {dataError ? <p>{dataError}</p> : null}
          {settingsErrors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </section>
      ) : null}

      {settingsSaved ? (
        <section className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100" aria-live="polite">
          Settings saved.
        </section>
      ) : null}

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Current weight"
          value={weight === null ? "No entry" : `${weight.toFixed(1)} kg`}
          detail={goalDelta === null ? "Add morning weight in Daily Log" : `${Math.abs(goalDelta).toFixed(1)} kg ${goalDelta > 0 ? "above" : "from"} goal`}
          icon={Scale}
          tone="emerald"
        />
        <StatCard
          title="Calories"
          value={`${todayLog.caloriesConsumed} kcal`}
          detail={`${summary.caloriesRemaining} remaining of ${settings.calorieGoal}`}
          icon={Flame}
          tone="purple"
        />
        <StatCard
          title="Protein"
          value={`${todayLog.proteinConsumed} g`}
          detail={`${summary.proteinRemaining} g remaining`}
          icon={Utensils}
          tone="emerald"
        />
        <StatCard
          title="Habit streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          detail={todayLog.habitDone ? "Complete today" : "Open today's log"}
          icon={CheckCircle2}
          tone="purple"
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Panel
            title="Weekly weight trend"
            action={
              dataLoading ? (
                <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Syncing
                </span>
              ) : null
            }
          >
            {chartData.some((point) => point.weight !== null) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -24 }}>
                    <CartesianGrid stroke="#27272a" vertical={false} />
                    <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip
                      contentStyle={{
                        background: "#09090b",
                        border: "1px solid #3f3f46",
                        borderRadius: 8,
                        color: "#f4f4f5"
                      }}
                      formatter={(value) => [`${Number(value).toFixed(1)} kg`, "Weight"]}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: "#a78bfa" }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-6 text-center text-sm text-zinc-500">
                No weight entries this week.
              </div>
            )}
          </Panel>

          <Panel
            title="Daily Log summary"
            action={
              <Link className="text-sm font-medium text-emerald-200 hover:text-emerald-100" href="/log">
                Open
              </Link>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryLine label="Weight" value={todayLog.weightKg === null ? "No entry" : `${todayLog.weightKg.toFixed(1)} kg`} />
              <SummaryLine label="Sleep" value={todayLog.sleepHours === null ? "No entry" : `${todayLog.sleepHours} h`} />
              <SummaryLine label="Workout" value={formatActivityStatus(todayLog.workoutStatus)} icon={<Dumbbell className="h-4 w-4" aria-hidden="true" />} />
              <SummaryLine label="Cardio" value={formatActivityStatus(todayLog.cardioStatus)} icon={<Bike className="h-4 w-4" aria-hidden="true" />} />
              <SummaryLine label="Water" value={`${summary.waterLitres.toFixed(2)} L`} icon={<Droplets className="h-4 w-4" aria-hidden="true" />} />
              <SummaryLine label="Recovery" value={todayLog.energyLevel === null ? "No entry" : `Energy ${todayLog.energyLevel}/5`} icon={<Moon className="h-4 w-4" aria-hidden="true" />} />
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Goal progress">
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Weight goal</span>
                  <span className="font-medium text-zinc-100">{settings.goalWeightKg.toFixed(1)} kg</span>
                </div>
                <ProgressBar value={goalProgress} tone="emerald" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Calories</span>
                  <span className="font-medium text-zinc-100">{Math.round(summary.caloriePercent)}%</span>
                </div>
                <ProgressBar value={summary.caloriePercent} tone="purple" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Protein</span>
                  <span className="font-medium text-zinc-100">{Math.round(summary.proteinPercent)}%</span>
                </div>
                <ProgressBar value={summary.proteinPercent} tone="emerald" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Water</span>
                  <span className="font-medium text-zinc-100">{Math.round(summary.waterPercent)}%</span>
                </div>
                <ProgressBar value={summary.waterPercent} tone="purple" />
              </div>
            </div>
          </Panel>

          <Panel title="Settings">
            <div className="grid gap-4">
              <NumberInput
                label="Goal weight"
                value={settingsDraft.goalWeightKg}
                min={25}
                max={300}
                step={0.1}
                decimalPlaces={1}
                suffix="kg"
                onChange={(value) => updateSettings({ goalWeightKg: value === "" ? settingsDraft.goalWeightKg : value })}
              />
              <NumberInput
                label="Calorie goal"
                value={settingsDraft.calorieGoal}
                min={500}
                max={20000}
                step={50}
                decimalPlaces={0}
                suffix="kcal"
                onChange={(value) => updateSettings({ calorieGoal: value === "" ? settingsDraft.calorieGoal : value })}
              />
              <NumberInput
                label="Protein goal"
                value={settingsDraft.proteinGoal}
                min={20}
                max={1000}
                step={5}
                decimalPlaces={0}
                suffix="g"
                onChange={(value) => updateSettings({ proteinGoal: value === "" ? settingsDraft.proteinGoal : value })}
              />
              <NumberInput
                label="Water goal"
                value={waterGoalDraftLitres}
                min={0.5}
                max={15}
                step={0.25}
                decimalPlaces={2}
                suffix="L"
                onChange={(value) =>
                  updateSettings({
                    waterGoalMl: value === "" ? settingsDraft.waterGoalMl : litresToIntegerMillilitres(value)
                  })
                }
              />
            </div>
            <button
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-base font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSettingsSave}
              disabled={settingsSaving || dataLoading || !settingsDirty}
            >
              {settingsSaving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
              Save settings
            </button>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function SummaryLine({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4">
      <span className="flex items-center gap-2 text-sm text-zinc-400">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-zinc-100">{value}</span>
    </div>
  );
}
