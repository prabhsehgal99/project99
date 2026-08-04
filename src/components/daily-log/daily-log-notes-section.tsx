"use client";

import { Panel } from "@/components/ui";
import type { DailyLogFieldErrors } from "@/lib/daily-log";
import type { DailyLogDraft } from "@/lib/types";

export function DailyLogNotesSection({
  draft,
  errors,
  onChange
}: {
  draft: DailyLogDraft;
  errors: DailyLogFieldErrors;
  onChange: (patch: Partial<DailyLogDraft>) => void;
}) {
  const noteLength = draft.journalNotes.trim().length;

  return (
    <Panel title="Journal note">
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Notes</span>
        <textarea
          id="journalNotes"
          className="mt-2 min-h-36 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-3 text-base text-zinc-50 outline-hidden focus:border-emerald-400"
          value={draft.journalNotes}
          maxLength={2200}
          aria-invalid={errors.journalNotes ? "true" : undefined}
          aria-describedby="journalNotes-help journalNotes-error"
          onChange={(event) => onChange({ journalNotes: event.target.value })}
        />
      </label>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span id="journalNotes-help">Plain text only.</span>
        <span>{noteLength}/2,000</span>
      </div>
      {errors.journalNotes ? (
        <p id="journalNotes-error" className="mt-2 text-sm text-red-200">
          {errors.journalNotes}
        </p>
      ) : null}
    </Panel>
  );
}
