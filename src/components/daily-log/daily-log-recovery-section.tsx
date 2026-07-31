"use client";

import { NumberInput, Panel } from "@/components/ui";
import { scaleLevels, type DailyLogFieldErrors } from "@/lib/daily-log";
import type { DailyLogDraft, ScaleLevel } from "@/lib/types";

export function DailyLogRecoverySection({
  draft,
  errors,
  onChange
}: {
  draft: DailyLogDraft;
  errors: DailyLogFieldErrors;
  onChange: (patch: Partial<DailyLogDraft>) => void;
}) {
  return (
    <Panel title="Recovery and context">
      <div className="grid gap-5">
        <ScaleField
          legend="Mood"
          value={draft.moodLevel}
          lowLabel="Low"
          highLabel="Great"
          onChange={(moodLevel) => onChange({ moodLevel })}
        />
        <ScaleField
          legend="Energy"
          value={draft.energyLevel}
          lowLabel="Drained"
          highLabel="High"
          onChange={(energyLevel) => onChange({ energyLevel })}
        />
        <ScaleField
          legend="Soreness"
          value={draft.sorenessLevel}
          lowLabel="None"
          highLabel="Severe"
          onChange={(sorenessLevel) => onChange({ sorenessLevel })}
        />
        <NumberInput
          id="steps"
          label="Steps"
          value={draft.steps}
          min={0}
          max={200000}
          step={500}
          decimalPlaces={0}
          error={errors.steps}
          onChange={(steps) => onChange({ steps })}
        />
      </div>
    </Panel>
  );
}

function ScaleField({
  legend,
  value,
  lowLabel,
  highLabel,
  onChange
}: {
  legend: string;
  value: ScaleLevel | null;
  lowLabel: string;
  highLabel: string;
  onChange: (value: ScaleLevel | null) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-zinc-300">{legend}</legend>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <button
          className={`min-h-11 rounded-md border px-2 text-sm ${
            value === null
              ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
              : "border-zinc-700 bg-zinc-900 text-zinc-300"
          }`}
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={value === null}
        >
          Clear
        </button>
        {scaleLevels.map((level) => {
          const selected = value === level;
          const endpoint = level === 1 ? lowLabel : level === 5 ? highLabel : "";
          return (
            <button
              key={level}
              className={`min-h-11 rounded-md border px-2 text-sm ${
                selected
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300"
              }`}
              type="button"
              onClick={() => onChange(level)}
              aria-pressed={selected}
              aria-label={`${legend} ${level}${endpoint ? `, ${endpoint}` : ""}`}
            >
              <span className="block font-medium">{level}</span>
              <span className="block text-[11px] text-zinc-500">{endpoint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
