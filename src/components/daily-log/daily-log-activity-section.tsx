"use client";

import { Bike, Dumbbell } from "lucide-react";
import { Panel } from "@/components/ui";
import { activityStatuses, formatActivityStatus } from "@/lib/daily-log";
import type { ActivityStatus, DailyLogDraft } from "@/lib/types";

export function DailyLogActivitySection({
  draft,
  onChange
}: {
  draft: DailyLogDraft;
  onChange: (patch: Partial<DailyLogDraft>) => void;
}) {
  return (
    <Panel title="Activity">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Activity</legend>
        <StatusSelect
          label="Workout status"
          icon={<Dumbbell className="h-4 w-4 text-purple-300" aria-hidden="true" />}
          value={draft.workoutStatus}
          onChange={(workoutStatus) => onChange({ workoutStatus })}
        />
        <StatusSelect
          label="Cardio status"
          icon={<Bike className="h-4 w-4 text-purple-300" aria-hidden="true" />}
          value={draft.cardioStatus}
          onChange={(cardioStatus) => onChange({ cardioStatus })}
        />
        <label className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 sm:col-span-2">
          <span>
            <span className="block text-sm font-medium text-zinc-200">Daily habit</span>
            <span className="block text-xs text-zinc-500">Counts toward streak</span>
          </span>
          <input
            className="h-5 w-5 rounded-sm border-zinc-700 bg-zinc-950 text-emerald-400 focus:ring-emerald-400"
            type="checkbox"
            checked={draft.habitDone}
            onChange={(event) => onChange({ habitDone: event.target.checked })}
          />
        </label>
      </fieldset>
    </Panel>
  );
}

function StatusSelect({
  label,
  icon,
  value,
  onChange
}: {
  label: string;
  icon: React.ReactNode;
  value: ActivityStatus;
  onChange: (value: ActivityStatus) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        {icon}
        {label}
      </span>
      <select
        className="mt-2 min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-3 text-base text-zinc-50 outline-hidden focus:border-emerald-400 focus:ring-0"
        value={value}
        onChange={(event) => onChange(event.target.value as ActivityStatus)}
      >
        {activityStatuses.map((status) => (
          <option key={status} value={status}>
            {formatActivityStatus(status)}
          </option>
        ))}
      </select>
    </label>
  );
}
