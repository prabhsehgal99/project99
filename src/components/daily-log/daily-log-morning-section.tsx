"use client";

import { NumberInput, Panel } from "@/components/ui";
import type { DailyLogDraft } from "@/lib/types";
import type { DailyLogFieldErrors } from "@/lib/daily-log";

export function DailyLogMorningSection({
  draft,
  errors,
  onChange
}: {
  draft: DailyLogDraft;
  errors: DailyLogFieldErrors;
  onChange: (patch: Partial<DailyLogDraft>) => void;
}) {
  return (
    <Panel title="Morning and body">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Morning and body</legend>
        <NumberInput
          id="weightKg"
          label="Morning weight"
          value={draft.weightKg}
          min={25}
          max={300}
          step={0.1}
          decimalPlaces={1}
          suffix="kg"
          error={errors.weightKg}
          onChange={(weightKg) => onChange({ weightKg })}
        />
        <NumberInput
          id="sleepHours"
          label="Sleep duration"
          value={draft.sleepHours}
          min={0}
          max={24}
          step={0.25}
          decimalPlaces={2}
          suffix="hours"
          error={errors.sleepHours}
          onChange={(sleepHours) => onChange({ sleepHours })}
        />
      </fieldset>
    </Panel>
  );
}
