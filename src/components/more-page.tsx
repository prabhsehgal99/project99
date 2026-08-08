"use client";

import type { User } from "firebase/auth";
import { CalendarDays, Loader2, LogOut, Save, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { useAuth } from "@/components/auth-provider";
import { useNavigationGuard } from "@/components/navigation-guard";
import { NumberInput } from "@/components/ui";
import { recentDateKeys, todayKey } from "@/lib/dates";
import { saveSettings, subscribeToRecentDailyLogs, subscribeToSettings } from "@/lib/firestore";
import { defaultSettings, type DailyLog, type UserSettings } from "@/lib/types";
import { litresToIntegerMillilitres, millilitresToLitres } from "@/lib/units";

export function MorePage() {
  return <AuthenticatedShell>{(user) => <MoreContent user={user} />}</AuthenticatedShell>;
}

function MoreContent({ user }: { user: User }) {
  const router = useRouter();
  const { signOutUser } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [settingsDraft, setSettingsDraft] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsErrors, setSettingsErrors] = useState<string[]>([]);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingSignOut, setPendingSignOut] = useState(false);
  const settingsDirtyRef = useRef(false);

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
        setSettingsDraft((current) => (settingsDirtyRef.current ? current : nextSettings));
        markReady();
      },
      handleError
    );
    const unsubscribeLogs = subscribeToRecentDailyLogs(
      user.uid,
      recentDateKeys(30)[0],
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

  const guardNavigation = useCallback((href: string) => {
    if (!settingsDirtyRef.current) {
      return false;
    }
    setPendingHref(href);
    return true;
  }, []);
  useNavigationGuard(guardNavigation);

  function updateSettings(patch: Partial<UserSettings>) {
    setSettingsDraft((current) => ({ ...current, ...patch }));
    setSettingsDirty(true);
    settingsDirtyRef.current = true;
    setSettingsSaved(false);
    setSettingsErrors([]);
  }

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
      return false;
    }

    setSettingsSaving(true);
    setError(null);

    try {
      await saveSettings(user.uid, settingsDraft);
      setSettingsDirty(false);
      settingsDirtyRef.current = false;
      setSettingsSaved(true);
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not save settings.");
      return false;
    } finally {
      setSettingsSaving(false);
    }
  }

  async function saveAndContinue() {
    const saved = await handleSettingsSave();
    if (!saved) {
      return;
    }
    if (pendingSignOut) {
      await signOutUser();
      return;
    }
    if (pendingHref) {
      router.push(pendingHref);
    }
  }

  async function discardAndContinue() {
    setSettingsDraft(settings);
    setSettingsDirty(false);
    settingsDirtyRef.current = false;
    if (pendingSignOut) {
      await signOutUser();
      return;
    }
    if (pendingHref) {
      router.push(pendingHref);
    }
  }

  const waterGoalDraftLitres = millilitresToLitres(settingsDraft.waterGoalMl);
  const history = [...logs].reverse().slice(0, 14);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">More</p>
        <h1 className="mt-1 text-3xl font-medium tracking-[-0.04em] text-ink">History, goals, and account.</h1>
      </header>

      {error || settingsErrors.length > 0 ? (
        <section className="rounded-lg border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100" role="alert">
          {error ? <p>{error}</p> : null}
          {settingsErrors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </section>
      ) : null}
      {settingsSaved ? <p className="rounded-lg border border-mint/30 bg-mint/10 p-4 text-sm text-mint">Settings saved.</p> : null}

      {pendingHref || pendingSignOut ? (
        <section className="rounded-lg border border-violet/40 bg-violet/10 p-4 text-sm text-ink">
          <p className="font-medium">Save goal changes before continuing?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink disabled:opacity-60" type="button" disabled={settingsSaving} onClick={saveAndContinue}>
              Save and continue
            </button>
            <button className="min-h-11 rounded-md border border-line bg-raised px-4 text-sm font-medium" type="button" onClick={discardAndContinue}>
              Discard changes
            </button>
            <button className="min-h-11 rounded-md border border-line px-4 text-sm font-medium" type="button" onClick={() => { setPendingHref(null); setPendingSignOut(false); }}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-y border-line py-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-mint" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink">Daily Log history</h2>
          </div>
          <Link className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-ink" href={`/log/${todayKey()}`}>
            Edit today
          </Link>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {loading ? (
              <p className="inline-flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading history
              </p>
            ) : history.length > 0 ? (
              history.map((log) => (
                <Link key={log.date} className="flex min-h-12 items-center justify-between px-1 text-sm transition hover:bg-raised/40" href={`/log/${log.date}`}>
                  <span className="font-medium text-ink">{log.date}</span>
                  <span className="text-muted">{log.weightKg === null ? "Partial" : `${log.weightKg.toFixed(1)} kg`}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">Saved days appear here after you log weight, food, water, recovery, activity, or notes.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-panel p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-warm" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink">Goals and preferences</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberInput label="Goal weight" value={settingsDraft.goalWeightKg} min={25} max={300} step={0.1} decimalPlaces={1} suffix="kg" onChange={(value) => updateSettings({ goalWeightKg: value === "" ? settingsDraft.goalWeightKg : value })} />
            <NumberInput label="Calorie goal" value={settingsDraft.calorieGoal} min={500} max={20000} step={50} decimalPlaces={0} suffix="kcal" onChange={(value) => updateSettings({ calorieGoal: value === "" ? settingsDraft.calorieGoal : value })} />
            <NumberInput label="Protein goal" value={settingsDraft.proteinGoal} min={20} max={1000} step={5} decimalPlaces={0} suffix="g" onChange={(value) => updateSettings({ proteinGoal: value === "" ? settingsDraft.proteinGoal : value })} />
            <NumberInput label="Water goal" value={waterGoalDraftLitres} min={0.5} max={15} step={0.25} decimalPlaces={2} suffix="L" onChange={(value) => updateSettings({ waterGoalMl: value === "" ? settingsDraft.waterGoalMl : litresToIntegerMillilitres(value) })} />
          </div>
          <button
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-medium text-primary-ink transition disabled:opacity-60 sm:w-auto"
            type="button"
            onClick={handleSettingsSave}
            disabled={settingsSaving || loading || !settingsDirty}
          >
            {settingsSaving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
            Save settings
          </button>
        </div>
      </section>

      <section className="border-y border-line py-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-violet" aria-hidden="true" />
          <h2 className="text-base font-semibold text-ink">Account</h2>
        </div>
        <div className="mt-4 divide-y divide-line border-y border-line text-sm">
          <div className="flex items-center justify-between gap-4 py-3"><p className="text-muted">Name</p><p className="font-medium text-ink">{user.displayName ?? "Project99 athlete"}</p></div>
          <div className="flex items-center justify-between gap-4 py-3"><p className="text-muted">Email</p><p className="truncate font-medium text-ink">{user.email ?? "No email available"}</p></div>
        </div>
        <button
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-raised px-4 text-sm font-medium text-ink"
          type="button"
          onClick={() => {
            if (settingsDirtyRef.current) {
              setPendingSignOut(true);
              return;
            }
            void signOutUser();
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </section>
    </div>
  );
}
