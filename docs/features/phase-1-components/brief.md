# Feature brief: Phase 1 workout and nutrition components

## Summary

Add reusable workout templates/custom exercise definitions and first-party food
logging while retaining the Daily Log as the dated coordination record.

## User problem

The current workout flow starts empty and nutrition is limited to a single set
of manual daily totals. The owner needs repeatable routines and itemized meals
without losing existing daily nutrition history.

## In scope

- Owner-scoped custom exercise definitions and workout templates copied into
  independent active-session snapshots.
- A small local rest timer and recent completed-workout context.
- User-created foods, dated meal entries, saved meals, and manual-adjustment
  nutrition summaries.
- Strict Firestore Rules and unit/emulator coverage for the new collections.

## Out of scope

- Curated or external food data, barcode scanning, imports, notifications,
  workout calendar planning, and offline-first synchronization.

## Acceptance criteria

- [ ] Templates and food records remain owner-scoped and validated by Rules.
- [ ] A template edit cannot change a session started from it.
- [ ] Meal values and manual Daily Log values are displayed as one explicit sum.
- [ ] Mobile and desktop builds, lint, unit tests, and Rules tests pass.
