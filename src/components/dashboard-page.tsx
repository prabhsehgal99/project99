"use client";

import {
  Activity,
  Bike,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flame,
  Loader2,
  LogOut,
  Moon,
  Save,
  Scale,
  Target,
  Utensils
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/components/auth-provider";
import { NumberInput, Panel, ProgressBar, StatCard } from "@/components/ui";
import { recentDateKeys, shortDayLabel, todayKey } from "@/lib/dates";
import {
  saveDailyMetric,
  saveSettings,
  subscribeToDailyMetric,
  subscribeToRecentMetrics,
  subscribeToSettings
} from "@/lib/firestore";
import { defaultDailyMetric, defaultSettings, type DailyMetric, type UserSettings } from "@/lib/types";

const statusOptions: DailyMetric["workoutStatus"][] = ["planned", "complete", "rest", "missed"];

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function remaining(consumed: number, goal: number) {
  return Math.max(0, goal - consumed);
}

function currentWeight(metrics: DailyMetric[]) {
  return [...metrics].reverse().find((metric) => typeof metric.weightKg === "number")?.weightKg ?? null;
}

function habitStreak(metrics: DailyMetric[]) {
  const byDate = new Map(metrics.map((metric) => [metric.date, metric]));
  let streak = 0;
  const cursor = new Date();

  while (byDate.get(todayKey(cursor))?.habitDone) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function validateMetric(metric: DailyMetric, settings: UserSettings) {
  const errors: string[] = [];

  if (metric.weightKg !== null && (metric.weightKg < 25 || metric.weightKg > 300)) {
    errors.push("Weight must be between 25 and 300 kg.");
  }

  if (metric.caloriesConsumed < 0 || metric.caloriesConsumed > 20000) {
    errors.push("Calories must be between 0 and 20,000.");
  }

  if (metric.proteinConsumed < 0 || metric.proteinConsumed > 1000) {
    errors.push("Protein must be between 0 and 1,000 g.");
  }

  if (metric.waterMl < 0 || metric.waterMl > 15000) {
    errors.push("Water must be between 0 and 15,000 ml.");
  }

  if (metric.sleepHours !== null && (metric.sleepHours < 0 || metric.sleepHours > 24)) {
    errors.push("Sleep must be between 0 and 24 hours.");
  }

  if (settings.goalWeightKg < 25 || settings.goalWeightKg > 300) {
    errors.push("Goal weight must be between 25 and 300 kg.");
  }

  if (settings.calorieGoal < 500 || settings.calorieGoal > 20000) {
    errors.push("Calorie goal must be between 500 and 20,000.");
  }

  if (settings.proteinGoal < 20 || settings.proteinGoal > 1000) {
    errors.push("Protein goal must be between 20 and 1,000 g.");
  }

  if (settings.waterGoalMl < 500 || settings.waterGoalMl > 15000) {
    errors.push("Water goal must be between 500 and 15,000 ml.");
  }

  return errors;
}

export function DashboardPage() {
  const router = useRouter();
  const { user, loading, error: authError, configured, signOutUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [metric, setMetric] = useState<DailyMetric>(defaultDailyMetric(todayKey()));
  const [recentMetrics, setRecentMetrics] = useState<DailyMetric[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !configured) {
      return;
    }

    const date = todayKey();
    let settingsReady = false;
    let todayReady = false;
    let recentReady = false;

    const markReady = () => {
      if (settingsReady && todayReady && recentReady) {
        setDataLoading(false);
      }
    };

    const handleError = (err: Error) => {
      setDataError(err.message);
      setDataLoading(false);
    };

    const unsubSettings = subscribeToSettings(
      user.uid,
      (nextSettings) => {
        settingsReady = true;
        setSettings(nextSettings);
        markReady();
      },
      handleError
    );

    const unsubToday = subscribeToDailyMetric(
      user.uid,
      date,
      (todayMetric) => {
        todayReady = true;
        setMetric({ ...defaultDailyMetric(date), ...todayMetric, date });
        markReady();
      },
      handleError
    );

    const unsubRecent = subscribeToRecentMetrics(
      user.uid,
      (metrics) => {
        recentReady = true;
        setRecentMetrics(metrics);
        markReady();
      },
      handleError
    );

    return () => {
      unsubSettings();
      unsubToday();
      unsubRecent();
    };
  }, [configured, user]);

  const chartData = useMemo(() => {
    const byDate = new Map(recentMetrics.map((item) => [item.date, item]));

    return recentDateKeys(7).map((date) => ({
      date,
      label: shortDayLabel(date),
      weight: byDate.get(date)?.weightKg ?? null
    }));
  }, [recentMetrics]);

  const weight = currentWeight(recentMetrics);
  const streak = habitStreak(recentMetrics);
  const calorieRemaining = remaining(metric.caloriesConsumed, settings.calorieGoal);
  const proteinRemaining = remaining(metric.proteinConsumed, settings.proteinGoal);
  const waterPercent = settings.waterGoalMl ? (metric.waterMl / settings.waterGoalMl) * 100 : 0;
  const caloriePercent = settings.calorieGoal ? (metric.caloriesConsumed / settings.calorieGoal) * 100 : 0;
  const proteinPercent = settings.proteinGoal ? (metric.proteinConsumed / settings.proteinGoal) * 100 : 0;
  const goalDelta = weight === null ? null : weight - settings.goalWeightKg;
  const goalProgress = goalDelta === null ? 0 : 100 - Math.min(100, Math.abs(goalDelta) * 5);

  async function handleSave() {
    if (!user) {
      return;
    }

    const errors = validateMetric(metric, settings);
    setValidationErrors(errors);
    setSaved(false);

    if (errors.length > 0) {
      return;
    }

    setSaving(true);
    setDataError(null);

    try {
      await Promise.all([saveDailyMetric(user.uid, metric), saveSettings(user.uid, settings)]);
      setSaved(true);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Could not save dashboard data.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || (!user && configured)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-300" aria-hidden="true" />
          Loading
        </div>
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
        <Panel title="Firebase configuration required">
          <p className="text-sm leading-6 text-zinc-300">
            Add Firebase Spark plan web app values to `.env.local`, then restart the development server.
          </p>
        </Panel>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="h-11 w-11 rounded-lg border border-zinc-800" src={user.photoURL} alt="" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
                <Activity className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-zinc-50">Project 99</p>
              <p className="truncate text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 transition hover:border-purple-400/60 hover:text-purple-100"
            onClick={signOutUser}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </header>

        {authError || dataError || validationErrors.length > 0 ? (
          <section className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            {authError ? <p>{authError}</p> : null}
            {dataError ? <p>{dataError}</p> : null}
            {validationErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </section>
        ) : null}

        {saved ? (
          <section className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Dashboard saved.
          </section>
        ) : null}

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Current weight"
            value={weight === null ? "No entry" : `${weight.toFixed(1)} kg`}
            detail={goalDelta === null ? "Add morning weight" : `${Math.abs(goalDelta).toFixed(1)} kg ${goalDelta > 0 ? "above" : "from"} goal`}
            icon={Scale}
            tone="emerald"
          />
          <StatCard
            title="Calories"
            value={`${metric.caloriesConsumed} kcal`}
            detail={`${calorieRemaining} remaining of ${settings.calorieGoal}`}
            icon={Flame}
            tone="purple"
          />
          <StatCard
            title="Protein"
            value={`${metric.proteinConsumed} g`}
            detail={`${proteinRemaining} g remaining`}
            icon={Utensils}
            tone="emerald"
          />
          <StatCard title="Habit streak" value={`${streak} day${streak === 1 ? "" : "s"}`} detail={metric.habitDone ? "Complete today" : "Open today"} icon={CheckCircle2} tone="purple" />
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

            <Panel title="Today">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberInput
                  label="Morning weight"
                  value={metric.weightKg ?? ""}
                  min={25}
                  max={300}
                  step={0.1}
                  suffix="kg"
                  onChange={(value) => setMetric((current) => ({ ...current, weightKg: value === "" ? null : value }))}
                />
                <NumberInput
                  label="Calories consumed"
                  value={metric.caloriesConsumed}
                  min={0}
                  max={20000}
                  suffix="kcal"
                  onChange={(value) => setMetric((current) => ({ ...current, caloriesConsumed: value === "" ? 0 : value }))}
                />
                <NumberInput
                  label="Protein consumed"
                  value={metric.proteinConsumed}
                  min={0}
                  max={1000}
                  suffix="g"
                  onChange={(value) => setMetric((current) => ({ ...current, proteinConsumed: value === "" ? 0 : value }))}
                />
                <NumberInput
                  label="Water intake"
                  value={metric.waterMl}
                  min={0}
                  max={15000}
                  step={250}
                  suffix="ml"
                  onChange={(value) => setMetric((current) => ({ ...current, waterMl: value === "" ? 0 : value }))}
                />
                <NumberInput
                  label="Sleep duration"
                  value={metric.sleepHours ?? ""}
                  min={0}
                  max={24}
                  step={0.25}
                  suffix="hours"
                  onChange={(value) => setMetric((current) => ({ ...current, sleepHours: value === "" ? null : value }))}
                />
                <label className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4">
                  <span>
                    <span className="block text-sm font-medium text-zinc-200">Daily habit</span>
                    <span className="block text-xs text-zinc-500">Counts toward streak</span>
                  </span>
                  <input
                    className="h-5 w-5 rounded border-zinc-700 bg-zinc-950 text-emerald-400 focus:ring-emerald-400"
                    type="checkbox"
                    checked={metric.habitDone}
                    onChange={(event) => setMetric((current) => ({ ...current, habitDone: event.target.checked }))}
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <StatusSelect
                  label="Workout status"
                  icon={Dumbbell}
                  value={metric.workoutStatus}
                  onChange={(workoutStatus) => setMetric((current) => ({ ...current, workoutStatus }))}
                />
                <StatusSelect
                  label="Cardio status"
                  icon={Bike}
                  value={metric.cardioStatus}
                  onChange={(cardioStatus) => setMetric((current) => ({ ...current, cardioStatus }))}
                />
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
                    <span className="font-medium text-zinc-100">{Math.round(caloriePercent)}%</span>
                  </div>
                  <ProgressBar value={caloriePercent} tone="purple" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-zinc-400">Protein</span>
                    <span className="font-medium text-zinc-100">{Math.round(proteinPercent)}%</span>
                  </div>
                  <ProgressBar value={proteinPercent} tone="emerald" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-zinc-400">Water</span>
                    <span className="font-medium text-zinc-100">{Math.round(waterPercent)}%</span>
                  </div>
                  <ProgressBar value={waterPercent} tone="purple" />
                </div>
              </div>
            </Panel>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <StatCard title="Water intake" value={`${(metric.waterMl / 1000).toFixed(2)} L`} detail={`${settings.waterGoalMl} ml target`} icon={Droplets} tone="emerald" />
              <StatCard title="Workout status" value={formatStatus(metric.workoutStatus)} detail="Loads tracked in lbs when workouts expand" icon={Dumbbell} tone="purple" />
              <StatCard title="Cardio status" value={formatStatus(metric.cardioStatus)} detail="Daily conditioning marker" icon={Bike} tone="neutral" />
              <StatCard title="Sleep duration" value={metric.sleepHours === null ? "No entry" : `${metric.sleepHours} h`} detail="Recovery input" icon={Moon} tone="emerald" />
            </section>

            <Panel title="Settings">
              <div className="grid gap-4">
                <NumberInput
                  label="Goal weight"
                  value={settings.goalWeightKg}
                  min={25}
                  max={300}
                  step={0.1}
                  suffix="kg"
                  onChange={(value) => setSettings((current) => ({ ...current, goalWeightKg: value === "" ? current.goalWeightKg : value }))}
                />
                <NumberInput
                  label="Calorie goal"
                  value={settings.calorieGoal}
                  min={500}
                  max={20000}
                  suffix="kcal"
                  onChange={(value) => setSettings((current) => ({ ...current, calorieGoal: value === "" ? current.calorieGoal : value }))}
                />
                <NumberInput
                  label="Protein goal"
                  value={settings.proteinGoal}
                  min={20}
                  max={1000}
                  suffix="g"
                  onChange={(value) => setSettings((current) => ({ ...current, proteinGoal: value === "" ? current.proteinGoal : value }))}
                />
                <NumberInput
                  label="Water goal"
                  value={settings.waterGoalMl}
                  min={500}
                  max={15000}
                  step={250}
                  suffix="ml"
                  onChange={(value) => setSettings((current) => ({ ...current, waterGoalMl: value === "" ? current.waterGoalMl : value }))}
                />
              </div>
            </Panel>

            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-base font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSave}
              disabled={saving || dataLoading}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
              Save dashboard
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusSelect({
  label,
  icon: Icon,
  value,
  onChange
}: {
  label: string;
  icon: typeof Target;
  value: DailyMetric["workoutStatus"];
  onChange: (value: DailyMetric["workoutStatus"]) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Icon className="h-4 w-4 text-purple-300" aria-hidden="true" />
        {label}
      </span>
      <select
        className="mt-2 min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-3 text-base text-zinc-50 outline-none focus:border-emerald-400 focus:ring-0"
        value={value}
        onChange={(event) => onChange(event.target.value as DailyMetric["workoutStatus"])}
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {formatStatus(status)}
          </option>
        ))}
      </select>
    </label>
  );
}
