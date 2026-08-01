"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { longDateLabel, todayKey } from "@/lib/dates";

export function DailyLogDateNav({
  dateKey,
  previousDate,
  nextDate,
  isToday,
  disabled,
  onNavigate
}: {
  dateKey: string;
  previousDate: string;
  nextDate: string | null;
  isToday: boolean;
  disabled?: boolean;
  onNavigate: (dateKey: string) => void;
}) {
  const today = todayKey();

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Daily Log</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-50">{longDateLabel(dateKey)}</h1>
        </div>
        <div className="grid grid-cols-[44px_1fr_44px] gap-2 sm:w-auto sm:grid-cols-[44px_150px_44px_90px]">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 transition hover:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => onNavigate(previousDate)}
            disabled={disabled}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <label className="relative block">
            <span className="sr-only">Select date</span>
            <CalendarDays className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-zinc-500" aria-hidden="true" />
            <input
              className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-900 pl-10 pr-2 text-sm text-zinc-100 outline-hidden focus:border-emerald-400"
              type="date"
              value={dateKey}
              max={today}
              disabled={disabled}
              onChange={(event) => onNavigate(event.target.value)}
            />
          </label>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 transition hover:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => {
              if (nextDate) {
                onNavigate(nextDate);
              }
            }}
            disabled={disabled || !nextDate}
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            className="col-span-3 inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm font-medium text-zinc-200 transition hover:border-purple-400/60 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1"
            type="button"
            onClick={() => onNavigate(today)}
            disabled={disabled || isToday}
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}
