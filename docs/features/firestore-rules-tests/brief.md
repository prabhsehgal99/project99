# Feature brief: Emulator-backed Firestore Security Rules tests

## Summary

Prove Project99's committed Firestore Security Rules against the local emulator
so ownership and persisted document contracts are enforced continuously in CI.

## User problem

Security Rules protect all user-owned fitness data, but the repository currently
relies on manual inspection. A permissive ownership or schema regression could
therefore reach review without an executable failure.

## Primary user and moment

Developers and reviewers use the suite locally and on every pull request when a
persisted model, Firestore write, or rules file changes.

## Success criteria

`npm run test:rules` starts an isolated Firestore emulator, tests the committed
rules, exits cleanly, and runs in the Quality workflow without contacting either
configured Firebase project.

## In scope

- Same-user read, create, update, and delete behavior.
- Cross-user and unauthenticated access denial.
- Exact Daily Log field, type, range, date, and timestamp validation.
- Exact workout-session top-level field, type, size, timestamp, and status
  transition validation.
- Dedicated emulator and Vitest configuration.
- A portable npm script and pull-request CI integration.

## Out of scope

- Deploying or changing deployed Security Rules.
- Adding profile or settings schemas.
- Blocking future Daily Logs or validating real calendar dates beyond the
  current `yyyy-mm-dd` rules contract.
- Duplicating the workout domain's nested exercise/set validation in Firestore
  Rules.

## User flow

1. A developer runs `npm run test:rules`, or opens a pull request.
2. Firebase CLI starts only the local Firestore emulator with a demo project ID.
3. Vitest runs authenticated and unauthenticated operations against
   `firestore.rules`.
4. The emulator shuts down and the command reports success or a focused failure.

## UX requirements

- Not applicable: this is repository security infrastructure with no interface
  changes.
- Failures must name the rejected or unexpectedly allowed contract clearly.

## Data and rules

- Tests use emulator-only data that is cleared between cases and removed at the
  end of the run.
- Owner identity comes from the Rules Unit Testing authenticated context, not
  real Firebase Authentication.
- The suite loads `firestore.rules` from the repository so tested and reviewed
  rules are the same file.
- The demo project ID cannot address Project99's dev or production data.

## Acceptance criteria

- [x] Owner access succeeds and cross-user/unauthenticated access fails.
- [x] Invalid Daily Log fields, values, date keys, and timestamps fail.
- [x] Invalid workout-session fields, values, timestamps, and status reversions
      fail.
- [x] `npm run test:rules` starts and stops the emulator automatically.
- [x] The Quality workflow runs the rules suite with Java available.
- [x] Lint, typecheck, unit tests, rules tests, and build pass.

## Open questions

- None.

## Non-blocking assumptions

- `firebase-tools@15` remains invoked through pinned `npx`, matching the accepted
  deployment-tooling decision without adding it to the application dependency
  tree.
