"use client";

import { Minus, Plus, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: "emerald" | "purple" | "neutral";
};

export function StatCard({ title, value, detail, icon: Icon, tone = "neutral" }: StatCardProps) {
  const toneClass = {
    emerald: "border-mint/30 bg-mint/10 text-mint",
    purple: "border-violet/30 bg-violet/10 text-violet",
    neutral: "border-line bg-raised text-ink"
  }[tone];

  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        <div className={`rounded-md border p-2 ${toneClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {detail ? <p className="mt-3 text-sm text-muted">{detail}</p> : null}
    </section>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-glow sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProgressBar({ value, tone = "emerald" }: { value: number; tone?: "emerald" | "purple" }) {
  const width = Math.max(0, Math.min(100, value));
  const color = tone === "emerald" ? "bg-mint" : "bg-violet";

  return (
    <div className="h-2 overflow-hidden rounded-full bg-raised" aria-hidden="true">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

type NumberInputProps = {
  id?: string;
  label: string;
  value: number | "";
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
  suffix?: string;
  error?: string;
  onChange: (value: number | "") => void;
};

function decimalsFromStep(step: number) {
  const [, decimals = ""] = String(step).split(".");
  return decimals.length;
}

function clampValue(value: number, min?: number, max?: number) {
  if (typeof min === "number" && value < min) {
    return min;
  }

  if (typeof max === "number" && value > max) {
    return max;
  }

  return value;
}

function formatNumber(value: number | "", decimalPlaces: number) {
  if (value === "") {
    return "";
  }

  return decimalPlaces > 0 ? value.toFixed(decimalPlaces) : String(Math.round(value));
}

export function NumberInput({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  decimalPlaces,
  suffix,
  error,
  onChange
}: NumberInputProps) {
  const precision = useMemo(() => decimalPlaces ?? decimalsFromStep(step), [decimalPlaces, step]);
  const formattedValue = formatNumber(value, precision);
  const [draft, setDraft] = useState(formattedValue);
  const [focused, setFocused] = useState(false);
  const displayValue = focused ? draft : formattedValue;
  const errorId = id ? `${id}-error` : undefined;

  function commitDraft(raw: string) {
    setDraft(raw);

    if (raw === "" || raw === "." || raw === "-" || raw === "-.") {
      onChange("");
      return;
    }

    const next = Number(raw);

    if (Number.isFinite(next)) {
      onChange(next);
    }
  }

  function stepBy(direction: 1 | -1) {
    const parsedDraft = Number(displayValue);
    const base = Number.isFinite(parsedDraft) && displayValue !== "" ? parsedDraft : value === "" ? min ?? 0 : value;
    const multiplier = 10 ** precision;
    const stepped = Math.round((base + direction * step) * multiplier) / multiplier;
    const next = clampValue(stepped, min, max);
    const formatted = formatNumber(next, precision);

    setDraft(formatted);
    onChange(next);
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-muted">{label}</span>
      <div className="mt-2 flex items-center rounded-md border border-line bg-raised focus-within:border-mint">
        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center border-r border-line text-muted transition hover:bg-panel hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={() => stepBy(-1)}
          disabled={typeof min === "number" && value !== "" && value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          id={id}
          className="min-h-11 w-full min-w-0 border-0 bg-transparent px-3 text-center text-base text-ink outline-hidden placeholder:text-muted focus:ring-0"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          onFocus={() => {
            setFocused(true);
            setDraft(formattedValue);
          }}
          onBlur={() => setFocused(false)}
          onChange={(event) => commitDraft(event.target.value)}
        />
        {suffix ? <span className="ml-2 text-sm text-muted">{suffix}</span> : null}
        <button
          className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center border-l border-line text-muted transition hover:bg-panel hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={() => stepBy(1)}
          disabled={typeof max === "number" && value !== "" && value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <span id={errorId} className="mt-2 block text-sm text-red-200">
          {error}
        </span>
      ) : null}
    </label>
  );
}
