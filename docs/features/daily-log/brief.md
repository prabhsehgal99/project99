# Feature brief: Daily Log vertical slice

## Status

- **Stage:** Ready for implementation after user review
- **Owner:** One active implementation agent on an isolated feature branch
- **Target milestone:** Phase 1 foundation — canonical daily health record
- **Durable decisions used:** D-001 Daily Log as the central dated record,
  D-003 mobile-first PWA, D-006 current measurement units, and D-007 GitHub
  as the cross-tool source of truth

## Summary

Create a dedicated Daily Log experience where an authenticated user can open a
calendar day, record the core facts of that day, save them as one user-owned
Firestore document, and reliably restore them on any signed-in device. The
dashboard will summarize the current Daily Log and link to it instead of acting
as the primary daily data-entry surface.

This slice establishes the Daily Log as the canonical dated record without yet
building the full workout engine, meal database, measurements system, or
analytics layer.

## User problem

The dashboard currently combines summary cards, settings, and today's data entry
in one large component. It only edits the current date and stores a partial set of
daily health metrics. This creates three problems:

1. The dashboard is becoming a second data-entry system instead of answering
   "How am I doing today?"
2. The user cannot intentionally review or correct an earlier day's record.
3. Recovery, complete nutrition totals, steps, and notes do not yet have a
   coherent daily home.

The Daily Log should become the single place to answer "What happened today?"
while the dashboard stays a fast summary and navigation surface.

## Primary user and moment

The initial user is the product owner, usually on a phone throughout the day and
occasionally on desktop for review. Typical moments are:

- logging morning weight and sleep shortly after waking;
- updating water or nutrition totals during the day;
- marking workout/cardio status after training;
- recording recovery, steps, and a short note at the end of the day;
- correcting a recent day after realizing an entry was missed or inaccurate.

The flow must be comfortable one-handed, tolerate partial completion, and remain
clear when reopened on another device.

## Goals

- Make one Daily Log document the source of truth for one local calendar date.
- Support today and past-date entry without allowing accidental future logs.
- Preserve every existing `dailyMetrics` document and current dashboard value.
- Give the user an obvious saved, unsaved, loading, empty, and error state.
- Keep the dashboard summary synchronized with Daily Log changes.
- Preserve strict per-user ownership in Firestore.
- Establish clean domain and component boundaries for later workout, nutrition,
  measurements, and recovery slices.

## Success criteria

- The user can open today's log from the dashboard, complete all included
  sections, save, refresh, and see identical values.
- The user can open a past date, create or edit its log, and return to today.
- A value saved on one signed-in device appears after the log is loaded on another
  signed-in device.
- Existing production values for weight, calories, protein, water, sleep,
  workout/cardio status, and the daily habit remain visible and editable.
- The owner can complete a typical partial Daily Log in under two minutes without
  horizontal scrolling on a phone-sized viewport.
- No signed-in user can read or write another user's Daily Logs.
- The slice passes lint, typecheck, production build, the manual acceptance
  matrix, and a Vercel preview/production smoke test.

No analytics dependency will be introduced solely to measure this slice. The
time-to-complete target will be assessed manually during acceptance testing.

## In scope

### Daily Log entry

- A dedicated `/log` route for today.
- A date-addressable `/log/[date]` route using `YYYY-MM-DD` keys.
- Previous day, next day, today, and date-picker navigation.
- Editing today or any past date.
- A friendly not-found/invalid-date state for malformed dates.
- Future dates visible only as a disabled navigation boundary; they cannot be
  created or edited in this slice.

### Included fields

**Morning and body**

- Morning weight in kilograms, optional.
- Sleep duration in hours, optional.

**Nutrition totals**

- Calories in kcal.
- Protein in grams.
- Carbohydrates in grams.
- Fat in grams.
- Fibre in grams.
- Water entered/displayed in litres and persisted as integer millilitres.

These are daily totals entered directly. Meal-level food logging and automatic
aggregation come in the nutrition slice.

**Activity**

- Workout status: `planned`, `complete`, `rest`, or `missed`.
- Cardio status: `planned`, `complete`, `rest`, or `missed`.
- Daily habit complete/incomplete, preserving the existing streak behavior.

Detailed exercises, sets, reps, load, RPE, rest timers, workout templates, and
personal records belong to the workout engine. A future workout session may be
referenced by a Daily Log, but no placeholder reference is required yet.

**Recovery and context**

- Mood on a labeled 1–5 scale, optional.
- Energy on a labeled 1–5 scale, optional.
- Soreness on a labeled 1–5 scale, optional, where 1 is none and 5 is severe.
- Steps as a non-negative integer, optional.
- Plain-text journal note, optional, with a 2,000-character limit.

### Dashboard integration

- Replace the dashboard's large "Today" editor with a concise Daily Log summary
  and a primary `Log today` or `Edit today's log` action.
- Keep weight, nutrition, water, sleep, workout/cardio, and streak summaries driven
  by the same persisted document fields.
- Keep goal settings separate from Daily Log saving. Settings may remain in the
  existing dashboard panel for this slice, but they receive their own save action.
- Add a lightweight authenticated navigation shell with Dashboard and Daily Log
  destinations: bottom navigation on mobile and a small sidebar on desktop. The
  structure must be ready for later destinations without displaying inactive
  roadmap features.

### Persistence and synchronization

- Continue using `users/{uid}/dailyMetrics/{yyyy-mm-dd}` for this slice.
- Rename the TypeScript domain concept from `DailyMetric` to `DailyLog` while
  retaining the Firestore collection path and existing flat field names.
- Normalize legacy documents that lack newly introduced fields.
- Save the full normalized Daily Log atomically to its date document.
- Use server timestamps for `createdAt` and `updatedAt`; preserve an existing
  `createdAt` when editing.
- Retain the user's draft after a failed save.
- Detect a remote snapshot arriving while the current draft is dirty. Do not
  silently overwrite local edits; show a non-blocking conflict notice with
  `Reload saved version` and `Keep editing` choices.

### Validation

- Centralize defaults, normalization, validation, and summary calculations outside
  React components.
- Validate on the client before saving and mirror durable integrity checks in
  Firestore Security Rules where practical.
- Display an error summary and field-level messages without clearing valid input.

## Out of scope

- Exercise/set/rep/RPE logging or any full workout-session lifecycle.
- Workout templates, previous performance, records, 1RM, volume, or rest timers.
- Meals, individual foods, barcode scanning, or a food database.
- Body measurements beyond weight or progress-photo uploads.
- Goals beyond the settings already present.
- Charts or insights for mood, recovery, nutrition, or training.
- AI coaching, rule-based recommendations, XP, achievements, or social features.
- Offline-first guarantees, manual sync controls, or conflict merging at the field
  level.
- Importing historical data or running a bulk Firestore migration.
- Notifications, reminders, or calendar integrations.
- Creating future-dated plans. Planning is a separate concept from recording what
  happened.

## Proposed information architecture

```text
Authenticated app shell
├── Dashboard
│   ├── Today summary
│   ├── Trend cards
│   ├── Log today / Edit today's log
│   └── Goal settings (temporary location)
└── Daily Log
    ├── Date navigation
    ├── Morning and body
    ├── Nutrition totals
    ├── Activity
    ├── Recovery and context
    ├── Journal note
    └── Save state and primary action
```

On phone, the sections form one vertical flow with a sticky save region above the
bottom navigation. On desktop, the same reading order is preserved in a balanced
two-column layout; the journal note and save state span the available content
width.

## User flow

### Create today's log

1. The user signs in and lands on the dashboard.
2. The dashboard loads today's document and shows either `Log today` for an empty
   document or `Edit today's log` for an existing one.
3. The user opens `/log`, which resolves to today's local date.
4. Existing values load into a draft; missing values receive safe defaults.
5. The user completes any subset of fields.
6. The page marks the draft as unsaved and enables `Save daily log`.
7. Client validation runs on save.
8. A single Firestore write persists the normalized document.
9. The page announces `Daily log saved`, clears the dirty state, and displays the
   server-backed saved state.
10. Returning to the dashboard shows the updated summary.

### Edit a past log

1. The user moves to the previous day or selects a valid past date.
2. The page shows a loading state associated with that date.
3. If a document exists, it is normalized and displayed; otherwise an empty draft
   is shown with `No log for this day yet`.
4. The user edits and saves using the same validation and persistence path.
5. Date navigation does not discard a dirty draft silently. The user must save,
   discard, or cancel the navigation.

### Remote update while editing

1. A snapshot newer than the loaded version arrives while the local draft is
   dirty.
2. The page preserves the local draft and displays `This log changed on another
   device`.
3. `Reload saved version` replaces the draft only after explicit confirmation.
4. `Keep editing` leaves the local draft intact; saving intentionally becomes the
   latest version.

### Error and recovery

- Authentication loss redirects to the landing page through the existing auth
  guard.
- Initial read failure replaces the form with a retryable error state.
- Save failure keeps the form and its dirty state available for retry.
- Invalid dates show a clear recovery action back to today's log.
- If Firebase is unconfigured, reuse the existing configuration-required state.
- If the browser goes offline, do not claim the entry is safely synchronized.
  Keep the draft visible and provide a retry action when connectivity returns.

## UX requirements

### Shared behavior

- The date and save state remain visible near the top of the page.
- Empty optional fields look empty; zero is displayed only when zero is an
  intentional value.
- Section headings explain the moment, not implementation details.
- Status values use text labels, never color alone.
- Numeric input controls preserve typed intermediate values and support mobile
  numeric keyboards.
- Saving disables duplicate submissions but does not disable reading or copying
  entered values.
- Success feedback uses an `aria-live="polite"` region. Errors use an assertive
  summary and associate messages with their fields.
- Journal notes render only as plain text; never interpret user input as HTML.

### Phone behavior

- One-column layout from 320 px upward with no horizontal scrolling.
- Touch targets are at least 44 by 44 CSS pixels.
- Date navigation is reachable with one hand and does not depend on hover.
- The primary save action is sticky above the bottom navigation when the draft is
  dirty, without covering the last input.
- Sections may use clear panels but should not be deeply nested or collapsed by
  default.
- The focused field remains visible when the software keyboard opens.

### Desktop behavior

- Sidebar navigation remains visible.
- Content width is constrained for readable scanning.
- Related sections may occupy two columns, but DOM order and keyboard order remain
  logical.
- Keyboard users can move through date controls, every field, conflict actions,
  and save without a pointer.

### Accessibility

- Use semantic `main`, `nav`, `form`, `fieldset`, `legend`, `label`, and button
  elements.
- Each 1–5 scale exposes a text label for every value and communicates what the
  endpoints mean.
- All icons are decorative unless they communicate information not present in
  text.
- Focus indicators meet contrast requirements and are never removed.
- Error summaries link or move focus to the first invalid field.
- Loading indicators include accessible text and avoid motion as the only cue.
- Saved, unsaved, conflict, and error states remain distinguishable without color.

## Data and rules

### Firestore path

```text
users/{uid}/dailyMetrics/{yyyy-mm-dd}
```

The path remains unchanged to avoid splitting or migrating production data. In
application code and user-facing language, the document is a `DailyLog`. A later
collection rename requires an explicit migration decision and is not implied by
this slice.

### Proposed document shape

```ts
type ActivityStatus = "planned" | "complete" | "rest" | "missed";

type DailyLog = {
  schemaVersion: 1;
  date: string;
  timezone: string;
  weightKg: number | null;
  sleepHours: number | null;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbohydratesConsumed: number;
  fatConsumed: number;
  fibreConsumed: number;
  waterMl: number;
  workoutStatus: ActivityStatus;
  cardioStatus: ActivityStatus;
  habitDone: boolean;
  moodLevel: 1 | 2 | 3 | 4 | 5 | null;
  energyLevel: 1 | 2 | 3 | 4 | 5 | null;
  sorenessLevel: 1 | 2 | 3 | 4 | 5 | null;
  steps: number | null;
  journalNotes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
```

`schemaVersion`, `timezone`, new nutrition fields, recovery fields, steps, notes,
and `createdAt` are additive. Existing documents normalize missing fields to
defaults in application memory and receive the new fields only on the next user
save. No background or bulk migration is required.

### Default and empty semantics

- Weight, sleep, mood, energy, soreness, and steps default to `null` because an
  absent entry differs from a measured zero.
- Existing nutrition and water fields retain numeric defaults for compatibility.
  The editor may use an empty draft representation and normalize it to `0` only
  when saving, so the UI does not force a visible zero into every untouched field.
- Workout and cardio retain the current `planned` default.
- `habitDone` defaults to `false`.
- Notes default to an empty string and are trimmed on save without collapsing
  intentional internal line breaks.
- `timezone` records the device's IANA timezone when the log is first created.
  Editing from another timezone does not change the log's `date` or original
  timezone automatically.

### Validation limits

- Date: valid local calendar date in `YYYY-MM-DD`; must match the document ID and
  must not be later than the user's current local date.
- Weight: `null` or 25–300 kg, one decimal place in the interface.
- Sleep: `null` or 0–24 hours, quarter-hour input supported.
- Calories: 0–20,000 kcal, integer.
- Protein: 0–1,000 g, integer.
- Carbohydrates: 0–2,000 g, integer.
- Fat: 0–1,000 g, integer.
- Fibre: 0–200 g, integer.
- Water: 0–15,000 ml, integer; displayed as 0–15 L.
- Steps: `null` or 0–200,000, integer.
- Mood, energy, soreness: `null` or integer 1–5.
- Notes: at most 2,000 Unicode characters after trimming.
- Activity statuses: only the four defined string values.
- Unknown client-supplied fields should not be relied upon by the application.

### Date and timezone behavior

- A log key represents a local calendar date, not a UTC instant.
- Date parsing and previous/next calculations must avoid UTC conversion that can
  shift the displayed day. Construct local dates at midday or operate directly on
  date parts.
- The current `todayKey` behavior remains the source of today's local key but is
  expanded with strict parsing, formatting, comparison, and day-shifting helpers.
- Traveling does not relabel an existing log. A new day's default timezone comes
  from `Intl.DateTimeFormat().resolvedOptions().timeZone`.

### Authorization and integrity rules

- Reads, creates, updates, and deletes remain limited to
  `request.auth.uid == userId`.
- The existing broad nested owner rule already preserves tenant isolation.
- Before adding server-side field validation, restructure the broad nested match
  so a permissive catch-all cannot bypass a specific `dailyMetrics` validation
  rule. Firestore `allow` expressions are additive across matching rules.
- For Daily Log creates and updates, rules should at minimum validate that the
  stored `date` equals the `{date}` document ID and that known fields have the
  expected primitive types/ranges.
- Deletion remains owner-only and should require an explicit UI confirmation if a
  delete action is added later. Deletion UI is not part of this slice.
- Emulator-backed rules tests should be tracked as security hardening if Java and
  the rules test harness remain unavailable. Static rule review and production
  owner-path verification are required for this slice.

### Backward compatibility

- Existing flat fields and path names remain unchanged.
- `normalizeDailyLog` accepts documents without `schemaVersion` and supplies all
  additive defaults.
- The dashboard and Daily Log must share normalization and summary helpers so an
  old document cannot render differently between screens.
- A write from the new editor upgrades that date document additively.
- Rolling the UI back is safe because older code ignores the new fields and still
  reads all original fields.

## Component and code plan

### Domain layer

**`src/lib/types.ts`**

- Introduce `ActivityStatus`, `DailyLog`, `DailyLogDraft`, and `ScaleLevel`.
- Preserve an interim `DailyMetric` alias only if it makes the refactor safer;
  remove the alias before completion once all callers use `DailyLog`.
- Keep `UserProfile` and `UserSettings` unchanged.

**New `src/lib/daily-log.ts`**

- `defaultDailyLog(date, timezone)`
- `toDailyLogDraft(log)` and `normalizeDailyLog(date, raw)`
- `validateDailyLogDraft(draft, today)` returning structured field errors
- `serializeDailyLog(draft, existingLog)`
- Pure summary helpers used by both dashboard and log screens
- No Firebase or React imports

**`src/lib/dates.ts`**

- Add strict `YYYY-MM-DD` parsing and real-calendar validation.
- Add `compareDateKeys`, `shiftDateKey`, `isFutureDateKey`, and accessible display
  formatting.
- Keep calculations based on local calendar parts.

### Persistence layer

**`src/lib/firestore.ts`**

- Rename subscriptions and saves to Daily Log terminology.
- Keep direct document reads/subscriptions scoped by `uid` and `date`.
- Normalize snapshot data at the boundary instead of type-casting raw Firestore
  data throughout components.
- Split `saveDailyLog` from `saveSettings`; no combined dashboard write.
- Preserve `createdAt`, always set `updatedAt`, and use one document write.
- Bound the dashboard history query to the range it actually displays instead of
  subscribing to the user's entire collection indefinitely.
- Return or expose enough snapshot metadata to distinguish initial load, local
  pending writes, and a newer remote version for conflict handling.

### Routes and UI

**New `src/components/authenticated-shell.tsx`**

- Shared authenticated header/navigation structure.
- Mobile bottom navigation and desktop sidebar with only Dashboard and Daily Log.
- Active-route indication and accessible navigation labels.

**New `src/app/log/page.tsx`**

- Resolve today's local key and render/navigate to the corresponding editor.

**New `src/app/log/[date]/page.tsx`**

- Validate the route parameter and render the Daily Log page or recovery state.

**New `src/components/daily-log-page.tsx`**

- Own the selected-date subscription, draft, dirty state, validation messages,
  conflict state, and save action.
- Compose section components rather than becoming another monolithic dashboard.

**New focused components**

- `daily-log-date-nav.tsx`
- `daily-log-morning-section.tsx`
- `daily-log-nutrition-section.tsx`
- `daily-log-activity-section.tsx`
- `daily-log-recovery-section.tsx`
- `daily-log-notes-section.tsx`
- Keep components together under `src/components/daily-log/` if that reduces the
  size and import surface of the main page.

**`src/components/ui.tsx`**

- Reuse `Panel` and `NumberInput` where their behavior meets the new requirements.
- Add small reusable form primitives only when used by multiple Daily Log
  sections, such as a labeled scale or field error.
- Do not introduce a form or UI dependency solely for this slice.

**`src/components/dashboard-page.tsx`**

- Reduce responsibilities: auth/data orchestration, summaries, history, and goal
  settings only.
- Remove Daily Log form state and daily save logic.
- Add today's completion/summary panel and link to the editor.
- Keep the weekly weight trend using normalized Daily Logs.

### Firestore rules

**`firestore.rules`**

- Preserve the `owns(userId)` invariant.
- Add a specific `dailyMetrics/{date}` match if field validation is implemented.
- Remove or narrow any overlapping permissive nested rule before relying on the
  specific validator.
- Keep user profile and settings access working for the authenticated owner.
- Document any validation intentionally deferred to the client.

## State-management design

No global state library is required. The page can use a focused reducer or small
hook with these states:

```text
loading
  -> ready-clean
  -> load-error

ready-clean
  -> ready-dirty (field edit)
  -> loading (date change)

ready-dirty
  -> saving
  -> conflict (new remote snapshot)
  -> navigation confirmation

saving
  -> ready-clean (acknowledged success)
  -> ready-dirty + save error

conflict
  -> ready-clean (reload remote)
  -> ready-dirty (keep local draft)
```

The subscription may refresh the draft while it is clean. Once dirty, it must not
replace the draft without an explicit user choice. A `beforeunload` warning may
protect browser/tab closure; in-app date and nav controls must use the explicit
save/discard/cancel flow.

## Implementation sequence

### Phase 0 — Issue and baseline

1. Create/select one GitHub issue using this brief as its acceptance contract.
2. Confirm one active branch owner and create `feature/<issue>-daily-log`.
3. Capture the current production behavior and one mobile/desktop screenshot for
   comparison.
4. Run baseline `npm run lint`, `npm run typecheck`, and `npm run build`.

### Phase 1 — Domain and date foundations

1. Add the Daily Log types and pure normalization/validation module.
2. Add strict date-key helpers and edge-case examples.
3. Preserve every existing field and validate normalization against representative
   legacy documents: complete, partial, empty, and missing new fields.
4. Update Firestore boundaries to return normalized Daily Logs.
5. Separate settings persistence from Daily Log persistence.

### Phase 2 — Dedicated editor

1. Add `/log` and `/log/[date]`.
2. Implement date navigation and invalid/future-date handling.
3. Build the sections in mobile DOM order using existing UI primitives.
4. Add structured validation, field errors, and save behavior.
5. Add dirty-state protection and save/error announcements.
6. Add remote-update conflict handling.

### Phase 3 — App shell and dashboard handoff

1. Add the two-destination authenticated shell.
2. Move daily editing out of the dashboard.
3. Add today's Daily Log summary and CTA.
4. Keep settings independently editable and savable.
5. Verify charts, streak, goals, and status cards still derive correct values.
6. Bound recent history reads to the needed date window.

### Phase 4 — Rules and resilience

1. Review the new document fields against Firestore rules.
2. Add compatible rule-level integrity validation without weakening the owner
   check or breaking profile/settings access.
3. Audit every new read/write path to confirm it uses `user.uid` from auth state.
4. Verify load, empty, invalid date, validation, save failure, auth loss, and
   conflict recovery states.
5. Record emulator-backed rules tests as a follow-up if the Java/runtime blocker
   remains; do not misrepresent a static audit as emulator proof.

### Phase 5 — Acceptance and rollout

1. Run lint, typecheck, and production build.
2. Review the diff for accidental data-path or field-name changes.
3. Test at 320 px, a representative modern phone width, tablet, and desktop.
4. Test keyboard navigation and screen-reader announcements for save/error states.
5. Test existing and new production-like documents with a non-production user.
6. Test Chrome and Safari sign-in, save, refresh, sign-out/in, past-date edit, and
   cross-device restoration.
7. Inspect the Vercel preview. If Google sign-in is needed on preview, authorize
   that exact preview domain or perform authenticated smoke testing locally with
   protected environment values.
8. Update `CURRENT_STATE.md`; update `DECISIONS.md` only if an accepted durable
   choice changes.
9. Commit, push, open a draft PR, request cross-model review, resolve findings,
   and leave final merge control with the user.

## Acceptance criteria

### Routing and dates

- [ ] `/log` opens today's log using the device's local calendar date.
- [ ] `/log/YYYY-MM-DD` loads that exact valid date without timezone drift.
- [ ] Previous, next, today, and date-picker controls work by keyboard and touch.
- [ ] Next/future navigation is disabled at today.
- [ ] Malformed or impossible dates show a recovery state and do not query
  Firestore.
- [ ] Changing dates with unsaved edits requires save, discard, or cancel.

### Data entry and validation

- [ ] Every in-scope field can be entered, cleared where optional, and saved.
- [ ] Water displays in litres and persists as integer millilitres.
- [ ] Weight remains kilograms and all validation limits match this brief.
- [ ] Recovery scales expose labeled 1–5 choices and support a cleared state.
- [ ] Notes preserve line breaks, reject more than 2,000 characters, and render as
  plain text.
- [ ] Validation identifies the field, preserves the draft, and prevents invalid
  writes.

### Persistence and compatibility

- [ ] A new date creates one document at
  `users/{uid}/dailyMetrics/{yyyy-mm-dd}`.
- [ ] Editing a date updates that document without deleting valid existing data.
- [ ] Refresh and sign-out/sign-in restore identical saved values.
- [ ] Existing production DailyMetric documents normalize without errors or data
  loss.
- [ ] A new-editor save additively upgrades a legacy document.
- [ ] `createdAt` is stable after creation and `updatedAt` changes on save.
- [ ] A save failure retains the user's draft and offers retry.
- [ ] A remote update never silently overwrites a dirty local draft.

### Dashboard integration

- [ ] Dashboard summary values update after a Daily Log save.
- [ ] Dashboard no longer duplicates the full daily-entry form.
- [ ] Goal settings save independently and retain existing behavior.
- [ ] Weekly weight trend and habit streak remain correct with legacy and new logs.
- [ ] Mobile bottom navigation and desktop sidebar expose Dashboard and Daily Log
  with a clear active state.

### Security and quality

- [ ] Every Daily Log read/write path uses the authenticated user's UID.
- [ ] Firestore rules continue to deny cross-user reads and writes.
- [ ] Any new rule validation cannot be bypassed by an overlapping permissive
  match.
- [ ] Loading, empty, invalid date, offline/save failure, auth loss, and conflict
  states are reviewed.
- [ ] Phone and desktop layouts are verified without horizontal overflow.
- [ ] Keyboard navigation, labels, focus, error association, and live
  announcements are verified.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes on the repository's pinned Node.js 22 runtime.
- [ ] Vercel preview/production smoke testing passes in Chrome and Safari.
- [ ] `CURRENT_STATE.md` accurately records what was verified and what remains.

## Manual QA matrix

| Scenario | Expected result |
| --- | --- |
| First visit to today | Empty defaults, clear `No log yet` state, save available after edit |
| Existing legacy date | Original values load; new fields are empty/defaulted |
| Complete valid save | One success announcement; data remains after refresh |
| Invalid numeric value | Field error and summary; no write; draft preserved |
| Notes over limit | Clear length error; draft preserved |
| Past-date create/edit | Correct document ID; today remains unchanged |
| Attempt future date | No editable form and no Firestore write |
| Navigate while dirty | Save/discard/cancel choice; no silent loss |
| Network/read error | Retryable state with no fabricated empty log |
| Network/save error | Draft remains dirty and retryable |
| Remote update while clean | View refreshes to saved remote value |
| Remote update while dirty | Conflict notice; local draft is not overwritten |
| Sign out and back in | Saved values restore for the same UID |
| Different user | Cannot read or write the first user's document tree |
| 320 px viewport | No horizontal scrolling; save/nav do not cover fields |
| Desktop keyboard path | All controls reachable in logical order with visible focus |
| Safari production | Auth persists; log saves and restores without prior auth error |

## Risks and mitigations

### Existing production documents are partial

**Risk:** Directly treating Firestore data as the expanded type can produce
undefined values and broken controls.

**Mitigation:** Normalize once at the persistence boundary and use the normalized
type everywhere else.

### Dashboard and editor can diverge

**Risk:** Duplicated defaulting, validation, and summary calculations create
different values across screens.

**Mitigation:** Put pure domain logic in `src/lib/daily-log.ts` and reuse it.

### Real-time snapshots can erase unsaved input

**Risk:** A snapshot triggered by another device or local pending write replaces a
dirty React draft.

**Mitigation:** Track clean/dirty state and the loaded revision; require an
explicit conflict choice.

### Firestore rule validation can be accidentally bypassed

**Risk:** The current recursive owner rule and a new specific rule both match;
Firestore grants access if any matching allow expression succeeds.

**Mitigation:** Restructure matches before depending on field-level validation,
then statically audit the final effective rules and add emulator tests when the
runtime is available.

### The editor becomes a premature full health platform

**Risk:** Adding workout sets, meals, measurements, insights, and planning at once
makes the slice too large and creates unstable models.

**Mitigation:** Store only scalar daily totals/status/context in this brief.
Independent lifecycle objects are separate future vertical slices.

### Date drift across timezones

**Risk:** Parsing `YYYY-MM-DD` as UTC can show or write the adjacent date.

**Mitigation:** Treat date keys as local calendar identifiers and test around UTC
offsets and daylight-saving transitions.

### Node version mismatch

**Risk:** Local development on a newer Node version can hide differences from the
pinned Node.js 22 production/CI environment.

**Mitigation:** Run final checks with Node.js 22, matching `.nvmrc`, `package.json`,
GitHub Actions, and Vercel.

## Rollout and rollback

- The schema change is additive and requires no bulk migration.
- Deploy through a Vercel preview before production.
- Use a non-production test user or disposable dates for acceptance testing.
- After deployment, verify today's legacy fields, a newly added field, refresh,
  and the dashboard summary.
- If the UI must be rolled back, older code will ignore additive fields and keep
  reading the original fields from the unchanged collection path.
- If stricter Firestore rules cause an unexpected regression, fix the explicit
  collection rule; do not restore a broad rule that weakens tenant isolation.

## Follow-up slices enabled by this work

1. Workout session logging, with the Daily Log deriving completion and linking to
   a separately owned workout session.
2. Meal and food logging, with Daily Log nutrition totals derived from meal
   entries instead of manually entered totals.
3. Measurements and progress photos.
4. Recovery trends and rule-based insights.
5. Emulator-backed Firestore rules test harness if not completed here.

These are not acceptance requirements for the Daily Log vertical slice.

## Open questions

No question blocks implementation if the non-blocking assumptions below are
accepted. Before implementation, the user may choose to change any of these
product decisions:

- Whether the single existing `habitDone` flag should receive a user-facing name
  now or remain `Daily habit` until a habits feature defines it.
- Whether a past-date editing window should eventually be limited. This plan
  allows all past dates because no current product requirement justifies a limit.

## Non-blocking assumptions

- Direct daily nutrition totals are acceptable until meal logging exists.
- Explicit save is preferred over silent autosave for the first slice.
- Future dates are not editable.
- The current Firestore `dailyMetrics` path remains an internal compatibility
  detail while `Daily Log` becomes the product/domain term.
- The existing four-value workout/cardio status vocabulary remains unchanged.
- The existing daily habit continues to drive streak calculations.
- No new state-management, form, component, analytics, or date library is needed.
- Static Firestore rule review is acceptable for this slice if the documented
  Java/emulator blocker remains, with automated rules proof tracked explicitly.
