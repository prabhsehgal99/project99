# Feature brief: Complete meal-level nutrition logging

## Summary

Complete Project99's owner-managed nutrition core so a normal day of food can
be logged quickly, reused safely, and reflected in truthful daily totals.

## User problem

The first nutrition foundation stored foods and entries but presented them in a
compressed utility screen. The owner needs a date-specific meal workflow that
makes common food capture, correction, copying, and reuse fast without losing
manual Daily Log history.

## Primary user and moment

The owner logs food on a phone throughout the day, then corrects a meal or
reviews the whole day on phone or desktop.

## Success criteria

- A personal food can be created once, added to a named meal, and reused from
  favourites, recents, copied meals, or saved meals.
- Meals and manual nutrition adjustments combine into one visible daily total.
- Historical entry snapshots do not change when the food library is edited or archived.

## In scope

- Date-specific Breakfast, Lunch, Dinner, Snacks, and custom meal logging.
- Owner-created food library, editing, favourites, and archive/restore.
- Quantity and standard meal placement edits; entry deletion and copying.
- Saved meals, copy-forward, meal totals, daily totals, and target deltas.
- Atomic multi-entry copies/saved-meal additions and strict owner Rules.

## Out of scope

- Curated/external food data, barcode scanning, CSV import, recipes, and historical nutrition analytics.

## User flow

1. Open Nutrition from Today, Quick Log, or a dated Daily Log.
2. Choose the destination meal and find, create, or reuse food.
3. Confirm a serving quantity and see its macro preview before adding it.
4. Review, correct, copy, or save the assembled meal; totals update from the dated entry snapshot plus any manual adjustment.

## UX requirements

- Phone-first day view with 44px controls and an accessible add/edit sheet.
- Desktop preserves the same task order without requiring a separate workflow.
- Explicit empty, error, retry/dismiss, and unavailable-date states.
- Keyboard labels, focusable actions, and dialog semantics for all paths.

## Data and rules

- Keep `foods`, flat `nutritionEntries`, and `savedMeals` under the owner.
- Entries are immutable food snapshots after creation; only quantity and meal placement may change. Food archival hides new-library choices but retains history and saved snapshots.
- Daily totals are computed at read time from entry values plus the Daily Log's manual-adjustment fields. No migration or duplicate aggregate is stored.

## Acceptance criteria

- [x] Meal and manual totals combine consistently on Nutrition and Today.
- [x] Foods can be created, edited, favourited, and archived without altering history.
- [x] Multi-entry saved/copy operations are bounded atomic batch writes.
- [x] Rules validate saved-meal items and reject changed entry snapshots.
- [x] Unit, Rules, lint, typecheck, build, and architecture checks pass.

## Non-blocking assumptions

- Owner-created foods are sufficient for Phase 1C; food catalogues and imports remain later work.
