# Feature brief: Workout engine foundation

## Summary

Start Phase 1B with a fast, phone-first workout logger. An authenticated user can start a session, add exercises from a small built-in library, record warm-up and working sets, save safely, and finish the session into their Daily Log.

## User problem

The Daily Log can only record a workout status, so it cannot answer what was trained, what was lifted, or what to do next time. The owner currently needs another tool or paper to log a real gym session.

## Primary user and moment

The owner opens the app on a phone between sets. The controls must be quick to use with one hand and work equally well on desktop.

## Success criteria

- A signed-in user can complete a real multi-exercise workout without another logger.
- Completing a session marks its dated Daily Log as complete and stores the session reference.
- The next workout can see the prior completed values for an exercise.

## In scope

- A small built-in exercise catalogue and immutable exercise snapshots in sessions.
- One active session per user, with start, save, resume, and finish.
- Warm-up and working sets with pounds, reps, optional RPE, and notes.
- Workout and exercise notes, set removal, adding exercises and sets.
- Per-exercise/workout volume, Epley estimated 1RM, and prior-session context.
- User-owned Firestore session documents and Daily Log linkage.

## Out of scope

- Custom exercise management, template authoring, substitutions, reordering, rest timers, PR celebrations, and history/detail pages.
- Deleting or editing a completed session, field-level conflict merging, planning future sessions, and offline-first guarantees.

## Data and rules

- Sessions are stored at `users/{uid}/workoutSessions/{sessionId}`; user ownership is enforced by Firestore Rules.
- Each exercise is stored as a snapshot so later catalogue changes cannot change historical activity.
- Gym load is stored in pounds. Volume is completed working-set load × reps. Estimated 1RM uses the Epley formula.
- Completing a workout writes the completed session and the linked Daily Log in one batched write.

## Acceptance criteria

- [ ] The user can start, save, resume, and finish a workout with warm-up and working sets.
- [ ] Previous completed working-set values appear when an exercise is added.
- [ ] Completion updates the matching Daily Log without overwriting its other fields.
- [ ] Invalid or incomplete finishing data is explained and remains recoverable.
- [ ] Mobile and desktop layouts, keyboard labels, loading, empty, error, and unsaved states are covered.
- [ ] User-owned session data is isolated by Firestore Rules.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
