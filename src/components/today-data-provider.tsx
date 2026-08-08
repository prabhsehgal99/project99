"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { todayKey } from "@/lib/dates";
import { subscribeToActiveWorkout, subscribeToDailyLog, subscribeToNutritionEntries, subscribeToSettings } from "@/lib/firestore";
import { defaultDailyLog, defaultSettings, type DailyLog, type NutritionEntry, type UserSettings, type WorkoutSession } from "@/lib/types";

type TodayDataContextValue = {
  today: string;
  settings: UserSettings;
  todayLog: DailyLog;
  todayExists: boolean;
  activeWorkout: WorkoutSession | null;
  nutritionEntries: NutritionEntry[];
  loading: boolean;
  error: string | null;
};

const TodayDataContext = createContext<TodayDataContextValue | null>(null);

export function TodayDataProvider({ user, children }: { user: User; children: ReactNode }) {
  const today = todayKey();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [todayLog, setTodayLog] = useState<DailyLog>(defaultDailyLog(today));
  const [todayExists, setTodayExists] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let settingsReady = false;
    let todayReady = false;
    let workoutReady = false;
    let nutritionReady = false;

    const markReady = () => {
      if (settingsReady && todayReady && workoutReady && nutritionReady) {
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

    const unsubscribeToday = subscribeToDailyLog(
      user.uid,
      today,
      (snapshot) => {
        todayReady = true;
        setTodayLog(snapshot.log);
        setTodayExists(snapshot.exists);
        markReady();
      },
      handleError
    );

    const unsubscribeWorkout = subscribeToActiveWorkout(
      user.uid,
      (session) => {
        workoutReady = true;
        setActiveWorkout(session);
        markReady();
      },
      handleError
    );
    const unsubscribeNutrition = subscribeToNutritionEntries(
      user.uid,
      today,
      (entries) => { nutritionReady = true; setNutritionEntries(entries); markReady(); },
      handleError
    );

    return () => {
      unsubscribeSettings();
      unsubscribeToday();
      unsubscribeWorkout();
      unsubscribeNutrition();
    };
  }, [today, user.uid]);

  const value = useMemo(
    () => ({
      today,
      settings,
      todayLog,
      todayExists,
      activeWorkout,
      nutritionEntries,
      loading,
      error
    }),
    [activeWorkout, error, loading, nutritionEntries, settings, today, todayExists, todayLog]
  );

  return <TodayDataContext.Provider value={value}>{children}</TodayDataContext.Provider>;
}

export function useTodayData() {
  const context = useContext(TodayDataContext);

  if (!context) {
    throw new Error("useTodayData must be used within TodayDataProvider");
  }

  return context;
}
