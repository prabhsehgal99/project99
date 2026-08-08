"use client";

import { NumberInput, Panel } from "@/components/ui";
import Link from "next/link";
import type { DailyLogFieldErrors } from "@/lib/daily-log";
import type { DailyLogDraft } from "@/lib/types";

export function DailyLogNutritionSection({
  draft,
  errors,
  onChange
}: {
  draft: DailyLogDraft;
  errors: DailyLogFieldErrors;
  onChange: (patch: Partial<DailyLogDraft>) => void;
}) {
  return (
    <Panel title="Manual nutrition adjustment">
      <p className="mb-4 text-sm leading-6 text-muted">These values are added to itemized meals. <Link className="font-medium text-ink underline" href={`/nutrition?date=${draft.date}`}>Log food</Link> for meal-level tracking.</p>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Nutrition totals</legend>
        <NumberInput
          id="caloriesConsumed"
          label="Calories"
          value={draft.caloriesConsumed}
          min={0}
          max={20000}
          step={50}
          decimalPlaces={0}
          suffix="kcal"
          error={errors.caloriesConsumed}
          onChange={(caloriesConsumed) => onChange({ caloriesConsumed })}
        />
        <NumberInput
          id="proteinConsumed"
          label="Protein"
          value={draft.proteinConsumed}
          min={0}
          max={1000}
          step={5}
          decimalPlaces={0}
          suffix="g"
          error={errors.proteinConsumed}
          onChange={(proteinConsumed) => onChange({ proteinConsumed })}
        />
        <NumberInput
          id="carbohydratesConsumed"
          label="Carbohydrates"
          value={draft.carbohydratesConsumed}
          min={0}
          max={2000}
          step={5}
          decimalPlaces={0}
          suffix="g"
          error={errors.carbohydratesConsumed}
          onChange={(carbohydratesConsumed) => onChange({ carbohydratesConsumed })}
        />
        <NumberInput
          id="fatConsumed"
          label="Fat"
          value={draft.fatConsumed}
          min={0}
          max={1000}
          step={5}
          decimalPlaces={0}
          suffix="g"
          error={errors.fatConsumed}
          onChange={(fatConsumed) => onChange({ fatConsumed })}
        />
        <NumberInput
          id="fibreConsumed"
          label="Fibre"
          value={draft.fibreConsumed}
          min={0}
          max={200}
          step={1}
          decimalPlaces={0}
          suffix="g"
          error={errors.fibreConsumed}
          onChange={(fibreConsumed) => onChange({ fibreConsumed })}
        />
        <NumberInput
          id="waterLitres"
          label="Water"
          value={draft.waterLitres}
          min={0}
          max={15}
          step={0.25}
          decimalPlaces={2}
          suffix="L"
          error={errors.waterLitres}
          onChange={(waterLitres) => onChange({ waterLitres })}
        />
      </fieldset>
    </Panel>
  );
}
