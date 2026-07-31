import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: "emerald" | "purple" | "neutral";
};

export function StatCard({ title, value, detail, icon: Icon, tone = "neutral" }: StatCardProps) {
  const toneClass = {
    emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    purple: "border-purple-400/25 bg-purple-400/10 text-purple-200",
    neutral: "border-zinc-700 bg-zinc-900/75 text-zinc-200"
  }[tone];

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-50">{value}</p>
        </div>
        <div className={`rounded-md border p-2 ${toneClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {detail ? <p className="mt-3 text-sm text-zinc-400">{detail}</p> : null}
    </section>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 shadow-glow sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-50">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProgressBar({ value, tone = "emerald" }: { value: number; tone?: "emerald" | "purple" }) {
  const width = Math.max(0, Math.min(100, value));
  const color = tone === "emerald" ? "bg-emerald-400" : "bg-purple-400";

  return (
    <div className="h-2 overflow-hidden rounded-full bg-zinc-800" aria-hidden="true">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

type NumberInputProps = {
  label: string;
  value: number | "";
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (value: number | "") => void;
};

export function NumberInput({ label, value, min, max, step = 1, suffix, onChange }: NumberInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <div className="mt-2 flex items-center rounded-md border border-zinc-700 bg-zinc-900/80 px-3 focus-within:border-emerald-400">
        <input
          className="min-h-11 w-full border-0 bg-transparent px-0 text-base text-zinc-50 outline-none placeholder:text-zinc-600 focus:ring-0"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? "" : Number(next));
          }}
        />
        {suffix ? <span className="ml-2 text-sm text-zinc-500">{suffix}</span> : null}
      </div>
    </label>
  );
}
