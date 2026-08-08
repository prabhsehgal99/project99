# Feature brief: Calm daily experience redesign

## Status

- **Stage:** Ready for implementation issue breakdown and user review
- **Owner:** One active implementation agent per isolated feature branch
- **Target milestone:** Phase 1A daily operating system and Phase 1B workout
  experience refinement
- **Durable decisions used:** D-001 Daily Log as the central dated record,
  D-003 mobile-first PWA, D-007 GitHub as the cross-tool source of truth, and
  D-018 Today and Quick Log as the primary daily interaction model
- **Prior issue:** Issue #31 described a visual-only redesign and was closed as
  not planned. This brief supersedes that scope because the approved direction
  intentionally changes information architecture and interaction behavior while
  preserving the existing data architecture.

## Summary

Redesign Project99 around a calm, adaptive Today experience and a global Quick
Log action so the user can understand the day at a glance and record common
health information in seconds. Preserve the existing Daily Log and workout data
models, while moving detailed forms, account actions, settings, and historical
editing out of the everyday path.

The experience should feel like a composed personal fitness operating system,
not a dashboard of forms or a checklist that asks the user to complete every
possible field.

## User problem

Project99 currently exposes its underlying data model too directly. The
authenticated experience presents long stacks of panels, stepper controls,
settings, and save actions. Even a small update can feel like starting an
assignment.

This creates several problems:

1. The dashboard explains what can be entered instead of helping the user decide
   what matters now.
2. Common actions such as adding water require navigating into a long form and
   explicitly saving it.
3. Every field receives similar visual weight, so important information is hard
   to distinguish from optional detail.
4. The persistent name, email address, and sign-out control consume valuable
   space without helping with daily fitness decisions.
5. Adding nutrition, measurements, recovery, vitals, and future health domains
   to the current structure would make the interface increasingly overwhelming.
6. The workout logger is functional but form-heavy during a context where the
   user has limited attention and may be operating the phone with one hand.

The user needs an interface that progressively reveals complexity: show the
current state and best next action first, make frequent updates immediate, and
keep complete editing available one level deeper.

## Primary user and moment

The initial user is the product owner, using Project99 throughout the day on a
phone and occasionally reviewing history or settings on desktop.

Typical moments include:

- checking the day shortly after waking;
- recording weight or sleep before moving on;
- adding water or nutrition during the day;
- starting or resuming a workout between sets;
- recording a brief recovery check-in;
- reviewing progress without entering data;
- correcting a past day or changing a goal on desktop.

These moments are short and interruption-prone. The phone experience must be
comfortable one-handed, preserve partial information, and never imply that every
available field must be completed.

## Product principles

### One clear answer before many controls

Today answers "What should I do now?" before presenting detailed metrics. It has
one primary focus action, a compact status summary, and links to deeper detail.

### Progressive disclosure

Quick actions are available globally. Category editors reveal only the fields
needed for the selected task. The comprehensive dated editor remains available
for review and correction, but it is not the default daily workflow.

### Calm does not mean empty

The interface removes administrative chrome and repeated containers, not useful
context. Labels, units, progress, save state, and recovery paths remain explicit.

### Truthful, not predictive by appearance

Project99 must not display planned workout times, meal events, per-field
timestamps, readiness guidance, or vitals that the current data cannot support.
Empty states should invite a real action rather than simulate a mature data set.

### Fast actions remain safe

One-tap logging must preserve unrelated fields, respect validation, expose
failure, and never claim synchronization before Firestore confirms the write.

### Designed to grow by category

Future nutrition, measurements, recovery, and vitals features should enter the
same hierarchy: a concise Today signal, an appropriate Quick Log action, and a
dedicated detail or history experience. They should not add another permanent
dashboard panel or lengthen one universal form.

## Goals

- Make Today the useful default destination after authentication.
- Reduce the most common daily logging actions to a few obvious taps.
- Remove identity, email, and sign-out controls from persistent application
  chrome.
- Separate daily status, fast capture, trends, and administrative settings into
  predictable destinations.
- Preserve the existing Daily Log as the canonical dated record and workout
  sessions as independent linked records.
- Preserve current validation, ownership, conflict, offline-warning, and
  unsaved-change protections.
- Establish a restrained visual system that remains coherent as more health
  domains are added.
- Make the workout logger easier to operate with one hand between sets without
  changing its persisted session model.

## Success criteria

- The authenticated landing screen communicates today's status and one primary
  action without presenting a full data-entry form.
- The user can add a standard water increment from any primary destination in
  two taps: open Quick Log, then choose the increment.
- The user can begin entering weight, sleep, recovery, nutrition totals, steps,
  or a note without navigating through unrelated categories.
- The user can start or resume a workout from Today in no more than two taps.
- Every existing Daily Log field remains editable for today and past dates.
- Name, email, and sign out are absent from persistent phone and desktop chrome;
  account actions remain discoverable under More.
- Common Quick Log updates do not overwrite unrelated changes made by another
  device.
- Adding a future supported health domain does not require another persistent
  top-level card or navigation destination.
- The primary flows work without horizontal scrolling at 320 CSS pixels and
  remain efficient at desktop widths.
- The redesign passes the repository quality gates and the mobile, desktop,
  accessibility, data-isolation, loading, empty, error, and offline acceptance
  matrix.

No analytics dependency will be introduced solely to measure this redesign.
Tap counts and task completion will be assessed manually during acceptance
testing until product analytics is adopted deliberately.

## Information architecture

```text
Authenticated app shell
├── Today                 /dashboard
│   ├── Date context
│   ├── One primary focus action
│   ├── Daily progress
│   ├── Logged signals
│   └── Contextual links into details
├── Train                 /workouts
│   └── Start or resume workout
├── Log                   global action, not a destination
│   └── Quick Log sheet
├── Progress              /progress
│   ├── Weight trend
│   ├── Goal progress
│   └── Later domain-specific trends
└── More                  /more
    ├── Daily Log history and detailed editor
    ├── Goals and preferences
    └── Account and sign out
```

The `/dashboard` route remains stable for backward compatibility, but its visible
label and purpose become Today. `/log` and `/log/[date]` remain the detailed
dated-record routes. The center Log control opens a sheet and does not create an
inactive or duplicate route.

## Visual direction

### Desired feeling

Calm, capable, focused, and private. The product should feel ready before the
user is, then recede while the user records an action.

### Palette roles

- **Night:** `#080d0c` — primary canvas
- **Panel:** `#101816` — resting content surface
- **Raised:** `#17211e` — selected and interactive surfaces
- **Ink:** `#f3f3ec` — primary text
- **Muted:** `#98a39e` — secondary labels and context
- **Line:** `#26322e` — quiet boundaries
- **Mint:** `#a9dcc4` — primary action and positive state
- **Violet:** `#c0b9e8` — recovery and secondary signal accent
- **Warm:** `#d9cda9` — restrained nutrition or body accent

These values establish direction, not permission to use every accent at once.
Most screens should use Night, Panel, Ink, Muted, and Line, with one contextual
accent.

### Typography

- Use the platform system font for body copy, controls, and numerical data unless
  a bundled display face is proven to improve the approved identity without
  creating a runtime dependency.
- Use weight, optical size, line height, and size-specific tracking to establish
  hierarchy.
- Use sentence case throughout. Avoid decorative uppercase except for short
  contextual eyebrows where the label genuinely aids orientation.

### Layout and surfaces

- Use fewer, larger compositional regions instead of placing every value inside
  an equal card.
- Spend visual emphasis on the current focus surface; keep surrounding progress
  and history quiet.
- Use translucent navigation and sheets only where they communicate floating
  hierarchy. Do not stack translucent surfaces.
- Remove the pervasive page-level glow. A restrained accent atmosphere may sit
  behind the current focus surface.
- Maintain at least 44-by-44-pixel interactive targets and account for device
  safe areas.

### Signature interaction

The recognizable Project99 interaction is the combination of an adaptive
**Up next** surface and the persistent central **Log** action. The first reduces
decision effort; the second turns capture into a short, focused gesture instead
of a form-filling session.

## In scope

### Application shell and navigation

- Remove the persistent project name, user email, and sign-out button from the
  authenticated header.
- Add five primary mobile positions: Today, Train, Log, Progress, and More.
- Treat Log as a visually distinct action that opens Quick Log.
- Provide the same destinations in a compact desktop sidebar, with a prominent
  Log action.
- Preserve navigation guards for unsaved Daily Log and workout drafts.
- Place profile identity and sign out under More > Account.
- Keep route protection and authentication-loss behavior unchanged.

### Today experience

- Show local date context without a large administrative header.
- Show exactly one primary focus action selected from available real data.
- Prioritize an active workout when one exists; otherwise provide a truthful
  start-workout, missing-log, or quick-check-in action.
- Show compact calorie, protein, and water progress using the existing Daily Log
  and settings calculations.
- Show a compact collection of today's recorded signals without fabricating
  per-field event times.
- Link each signal to its focused editor or relevant detail screen.
- Use directional empty states such as `Add morning weight` rather than neutral
  `No entry` wherever an immediate action is useful.

### Quick Log

- Open from the central navigation action and contextual Today controls.
- Render above the current route as an accessible bottom sheet on phone and an
  appropriately sized dialog on desktop.
- Support the data Project99 stores today:
  - water increments and direct water entry;
  - morning weight;
  - sleep duration;
  - nutrition totals;
  - mood, energy, and soreness;
  - steps;
  - workout and cardio status;
  - daily habit state;
  - journal note.
- Allow the first screen of the sheet to prioritize frequent actions without
  displaying every field at once.
- Confirm completed writes with a quiet, accessible success message.
- Keep entered values available after a failed write and provide a retry path.
- Provide a direct `Edit full day` path to the dated Daily Log.

### Detailed Daily Log

- Preserve today and past-date navigation.
- Replace the uninterrupted vertical form with summary rows for Body, Nutrition,
  Activity, Recovery, and Notes.
- Open one focused category editor at a time.
- Preserve current draft state, validation, field-level errors, conflict notice,
  cached-data warning, and unsaved-navigation protection.
- Show a persistent save action only while the draft is dirty or a save is in
  progress.
- Preserve the ability to edit every existing field and the linked workout state.

### Progress

- Move the existing weekly weight trend and goal progress out of Today.
- Show useful empty states that link to the corresponding logging action.
- Keep goal changes out of the progress-reading flow; link to More > Goals.
- Leave room for later nutrition, training, measurements, and recovery trends
  without displaying inactive placeholders.

### More

- Provide Daily Log history and detailed editing entry points.
- Move current goal settings into a Goals and preferences section.
- Show account identity only inside Account.
- Place sign out inside Account with clear wording and appropriate dirty-draft
  protection.
- Do not make More a miscellaneous grid of future or unavailable features.

### Workout experience refinement

- Preserve the existing workout-session model, calculations, and completion
  behavior.
- Make active exercise and set entry the dominant content.
- Move workout name and notes behind a secondary Options action.
- Use compact, touch-friendly set rows with clear warm-up/working distinction.
- Keep previous completed values close to the set they inform.
- Keep Finish workout as the primary sticky action.
- Present manual save and synchronization as quiet status rather than a competing
  primary action.
- Present exercise selection in a focused, searchable sheet when search is
  introduced.

### Design system foundation

- Express the palette as semantic Tailwind theme tokens rather than repeated raw
  colors.
- Introduce reusable primitives only where at least two real screens need them:
  bottom sheet, progress row, number field, status/toast, and surface.
- Preserve Lucide as the icon system.
- Use platform and installed capabilities before adding a UI or motion library.

## Out of scope

- Changing the Firestore collection paths or replacing the Daily Log document
  model.
- A bulk data migration.
- Wearable, Apple Health, Health Connect, Fitbit, Oura, or WHOOP integrations.
- Automatic import of nutrition, sleep, steps, recovery, or vitals.
- Meal-level logging, saved meals, barcode scanning, or `usual breakfast` actions
  before the Phase 1C nutrition model exists.
- Per-field event timelines before records contain truthful event timestamps.
- Vitals that have no accepted field or domain model.
- Readiness scores, recovery scores, AI coaching, or implied medical guidance.
- Customizable dashboards or user-reorderable navigation in the initial slice.
- New workout templates, exercise library capabilities, PR systems, or rest
  timers beyond the accepted workout roadmap.
- Native-only gestures, haptics, or APIs that prevent the PWA from working well
  on other platforms.
- Light mode unless separately requested.
- Marketing-site redesign unless explicitly added to an implementation issue.

## User flows

### Open the app and understand today

1. The authenticated user lands on Today.
2. Today loads the current local date's Daily Log, settings, and active workout.
3. The focus surface selects one actionable state from those real records.
4. Daily progress and recorded signals appear below it.
5. The user can act immediately or leave without being asked to complete the
   rest of the day.

### Add water quickly

1. The user selects Log from any primary destination.
2. Quick Log opens with frequent actions visible.
3. The user selects `+250 mL` or another supported increment.
4. The control responds immediately and the write begins.
5. Firestore confirms the update, the sheet closes or remains ready for another
   action according to the selected control, and an accessible confirmation is
   announced.
6. Today progress updates from the shared data source.

If the write fails, the sheet stays open, the intended value remains visible,
and the user can retry. The interface does not announce that the value is saved.

### Record a focused metric

1. The user opens Quick Log and chooses Weight, Sleep, Recovery, Nutrition,
   Activity, Steps, or Note.
2. The sheet transitions to a focused editor containing only relevant controls.
3. The user saves the value.
4. Validation is explained next to the affected field without clearing input.
5. A successful write returns to the Quick Log root or closes the sheet and
   updates visible summaries.

### Edit the complete day

1. The user selects `Edit full day`, opens a day from history, or follows a
   Today detail link.
2. The dated Daily Log displays category summaries.
3. The user opens one category, edits its fields, and returns to the summary.
4. The page indicates unsaved changes and exposes Save daily log.
5. Existing save, error, remote-conflict, and navigation-guard behavior applies.

### Start or resume training

1. Today detects an active session and offers Resume workout, or otherwise
   offers Start workout when training is the selected focus.
2. The user enters Train with the active exercise and sets visually dominant.
3. Previous values remain visible near the current work.
4. Save status remains secondary while Finish workout remains the primary
   completion action.
5. Finishing retains the existing atomic Daily Log linkage.

### Find account actions

1. The user opens More.
2. The user selects Account.
3. Identity and sign out appear in this dedicated context.
4. Sign out respects active dirty-draft protection before ending the session.

## UX requirements

### Phone behavior

- Design and acceptance testing start at 320 CSS pixels.
- Keep the bottom navigation reachable and account for the device safe area.
- Do not place form content beneath the navigation or Quick Log action.
- The Quick Log root exposes frequent actions without scrolling on common phone
  heights where practical.
- Focused editors may scroll, but the active field and save action must remain
  visible when the software keyboard opens.
- Pressed-state feedback begins immediately. Avoid artificial delays.
- Do not require drag gestures to dismiss or complete an action; tapping Close,
  Escape where available, and browser-safe navigation must remain sufficient.

### Desktop behavior

- Use a compact sidebar and a readable content measure rather than stretching
  phone cards across the viewport.
- Quick Log appears as a contained dialog while retaining the same information
  order and keyboard behavior as the phone sheet.
- Hover may supplement but never replace visible labels, focus, or click targets.
- Use additional width for comparison and supporting context, not for exposing
  every form category simultaneously.

### Motion and material

- Use motion to preserve spatial relationships: a sheet exits along its entry
  path and contextual editors remain anchored to the action that opened them.
- Prefer `transform` and `opacity` for transitions.
- Use a critically damped, restrained transition for non-gesture sheet movement.
- Do not add bounce without a momentum-driven gesture.
- All animations must be interruptible by user input.
- Under `prefers-reduced-motion`, replace movement with short opacity changes or
  immediate state changes.
- Under reduced transparency or increased contrast preferences, replace floating
  translucent materials with more opaque, bordered surfaces.

### Accessibility

- Use semantic landmarks and labeled navigation.
- Implement Quick Log with accessible dialog semantics, focus containment,
  initial focus, Escape handling, and focus restoration to its trigger.
- Every icon-only control has an accessible name and at least a 44-by-44-pixel
  target.
- Never communicate state through color alone.
- Announce save success, save failure, loading, and validation summaries through
  appropriate live regions without excessive repetition.
- Maintain a logical keyboard order and visible focus treatment.
- Support browser zoom and increased text size without clipped content or hidden
  actions.

### Loading, empty, error, conflict, and offline behavior

- Preserve the authenticated shell while route data loads; use stable skeletons
  or concise loading states that do not shift the main controls unexpectedly.
- Empty Today data should present one useful next action, not a wall of `No
  entry` rows.
- Progress empty states should explain which logging action creates the trend.
- A Quick Log write failure keeps the attempted value and offers Retry.
- Cached Firestore data must remain identified as cached when the current editor
  already does so.
- Remote updates must never silently replace a dirty detailed-editor draft.
- Offline state must not be represented as synchronized success.
- Authentication loss follows the existing protected-route behavior.
- Firebase configuration errors continue to use the existing dedicated state.

## Data and rules

### Existing records remain authoritative

- Daily Logs remain at `users/{uid}/dailyMetrics/{yyyy-mm-dd}`.
- Workout sessions remain at `users/{uid}/workoutSessions/{sessionId}`.
- Settings and profile paths remain unchanged.
- The flat Daily Log schema remains version-compatible with existing documents.
- Detailed edits continue to use the centralized normalization, validation, and
  serialization rules.

### Quick Log mutation behavior

- Add a transaction-based Daily Log mutation path for focused updates.
- The transaction reads the latest document, normalizes it, applies a strictly
  typed domain mutation, validates the result, and writes a complete valid
  document.
- Preserve an existing `createdAt` and update `updatedAt` using the accepted
  server timestamp behavior.
- Creating a previously missing day must produce a complete Rules-valid Daily
  Log rather than a partial merged document.
- Increment actions such as water must use the latest server-backed value and
  preserve unrelated concurrent field changes.
- Pure mutation helpers must enforce the same accepted bounds and units as the
  detailed editor.

### Shared reads

- The authenticated shell should provide today's Daily Log and settings to Today
  and Quick Log without establishing avoidable duplicate listeners.
- Detailed past-day editors continue to own subscriptions for their selected
  dates.
- Active workout state may be read alongside today's data but remains an
  independent record with its own lifecycle.

### Authorization and privacy

- Existing owner-only Firestore Rules remain the security boundary.
- UI relocation of account actions does not weaken route or data protection.
- Quick Log operations must use the authenticated user's own path and remain
  covered by cross-user denial tests.
- Monitoring must not attach health values, dates, document contents, or user
  identity to error events.

### Units, dates, and calculations

- Daily Log keys continue to use the user's local calendar date in
  `YYYY-MM-DD` format.
- Future-dated Daily Logs remain invalid.
- Water is displayed in litres where appropriate and stored as integer
  millilitres.
- Body weight remains kilograms, gym load remains pounds, energy remains kcal,
  and sleep remains hours.
- Today progress continues to use centralized summary calculations rather than
  reproducing formulas in presentation components.
- The first implementation must not present field-level logging times because
  the current Daily Log stores only document-level timestamps.

## Proposed implementation structure

### Shell and shared state

- Refactor `src/components/authenticated-shell.tsx` so authentication and
  navigation remain shell responsibilities while account presentation moves to
  More.
- Add a focused authenticated navigation component for phone and desktop.
- Add a Today-data boundary that shares today's Daily Log and settings with
  Today and Quick Log.
- Add a Quick Log provider that opens a requested category from any authenticated
  page and renders one sheet at the shell root.

### Components

```text
src/components/
├── app-shell/
│   └── app-nav.tsx
├── today/
│   ├── today-page.tsx
│   ├── today-focus.tsx
│   ├── today-progress.tsx
│   └── logged-signals.tsx
├── quick-log/
│   ├── quick-log-provider.tsx
│   ├── quick-log-sheet.tsx
│   └── focused category editors
├── ui/
│   ├── bottom-sheet.tsx
│   ├── number-field.tsx
│   ├── progress-row.tsx
│   ├── surface.tsx
│   └── toast.tsx
├── progress-page.tsx
└── more-page.tsx
```

This is a target organization, not a requirement to create every file before it
is needed. Components should be extracted when they have a clear responsibility
or real reuse; do not replace the current monolith with a speculative framework.

### Platform choices

- Start with the native `dialog` element for Quick Log, styled as a phone bottom
  sheet and desktop dialog.
- Do not add a motion library for the first slice. Add one only if direct,
  interruptible drag behavior is approved and the platform implementation cannot
  meet it cleanly.
- Do not install a component system solely for this redesign.
- Keep business rules and mutation helpers outside React components under
  `src/lib` with strict TypeScript and no `any`.

## Delivery plan

The brief is an umbrella direction. Implementation should use one issue, branch,
and pull request for each vertical slice.

### Slice 1 — Today foundation and minimum useful Quick Log

- New authenticated navigation and account relocation.
- Today screen with one focus action and existing progress values.
- More > Account with sign out.
- Global Quick Log sheet.
- Transaction-safe water, weight, and sleep actions.
- Semantic color and surface tokens needed by these screens.
- Loading, empty, write-error, keyboard, reduced-motion, and mobile/desktop
  acceptance coverage.

This slice must be independently useful and is the recommended first
implementation issue.

### Slice 2 — Complete daily experience

- Remaining current-schema Quick Log actions.
- Progress destination using existing trends and goals.
- More > Goals and Daily Log history entry points.
- Detailed Daily Log category summaries and focused editors.
- Preservation of dirty-state, conflict, cached-data, and navigation protections.

### Slice 3 — Focused workout experience

- Compact active-workout layout.
- Workout Options disclosure.
- Improved set entry and previous-value presentation.
- Quieter save/synchronization treatment and primary Finish workout action.
- Exercise selection sheet when supported by the implementation issue.

## Test strategy

### Unit tests

- Today focus priority for active workout, missing log, and available quick
  actions.
- Daily progress mapping from existing summaries and settings.
- Quick Log mutations preserve unrelated fields.
- Water increments use integer millilitres and respect accepted bounds.
- Weight, sleep, recovery, nutrition, steps, status, habit, and note mutations
  normalize and validate correctly as they are introduced.
- Missing-date mutation creates a complete normalized document.
- Local-date boundary behavior remains correct.

### Firestore Rules and persistence tests

- Owner Quick Log update succeeds with a valid complete document.
- Cross-user and unauthenticated Quick Log writes remain denied.
- Invalid values, future dates, timestamp changes, and unexpected fields remain
  denied.
- A focused mutation does not remove unrelated Daily Log values.
- Workout completion continues to link the matching Daily Log without
  overwriting other fields.

### Interaction acceptance

- Verify at 320px, a common phone width, tablet width, and desktop width.
- Verify bottom navigation, safe-area spacing, keyboard opening, long content,
  and page scrolling.
- Verify Quick Log focus containment, Escape, close control, backdrop behavior,
  focus restoration, and repeated open/close cycles.
- Verify screen-reader names and live save/error announcements.
- Verify reduced motion, increased contrast, and reduced transparency fallbacks
  where supported.
- Verify empty, loading, cached, offline, write-error, remote-conflict, and
  authentication-loss behavior.
- Verify that no visible control promises unavailable data or automation.

## Acceptance criteria

- [ ] Today is the authenticated landing experience and shows one primary focus
      action based only on available data.
- [ ] Persistent authenticated chrome does not display the user's name, email,
      or sign-out action.
- [ ] Account identity and sign out are available under More > Account.
- [ ] Mobile navigation provides Today, Train, Log, Progress, and More; Log opens
      Quick Log rather than navigating to an inactive page.
- [ ] The user can add 250 mL of water from any primary destination in two taps.
- [ ] Quick Log supports each current-schema category included in its delivery
      slice without exposing unrelated fields.
- [ ] Successful writes update Today from the shared data source; failed writes
      preserve the attempted value and provide Retry.
- [ ] Quick Log mutations preserve unrelated Daily Log fields and concurrent
      server-backed updates.
- [ ] Every existing Daily Log field remains editable for today and past dates.
- [ ] The detailed Daily Log preserves validation, dirty-state navigation,
      cached-data warning, remote-conflict handling, and save recovery.
- [ ] Progress contains the current weight trend and goal progress; Today does
      not duplicate the full analytics surface.
- [ ] The active workout prioritizes exercise and set entry while retaining all
      existing session validation, calculations, save, resume, and finish
      behavior.
- [ ] No meal event, per-field timestamp, vital, readiness score, or automated
      recommendation is shown without a supporting accepted data model.
- [ ] Interactive targets are at least 44 by 44 pixels and the experience works
      without horizontal scrolling at 320 CSS pixels.
- [ ] Quick Log has correct dialog semantics, keyboard behavior, focus
      restoration, and accessible status announcements.
- [ ] Reduced-motion behavior avoids large sliding or spring movement.
- [ ] Owner-only data access and cross-user denial remain verified by Firestore
      Rules tests.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] `npm run test:rules` passes when persistence behavior changes.
- [ ] `npm run build` passes.
- [ ] Mobile and desktop behavior is verified in a preview deployment before
      merge.

## Open questions

- None block the first implementation slice. Any new product capability proposed
  during implementation must be separated from this interaction redesign and
  evaluated against the roadmap.

## Non-blocking assumptions

- A new implementation issue will replace rather than reopen issue #31 because
  the old issue excludes behavior changes that this brief requires.
- The existing `/dashboard`, `/log`, `/log/[date]`, and `/workouts` URLs remain
  stable even when their visible navigation labels change.
- The first slice uses system typography. A bundled display face may be reviewed
  later if it materially improves the approved identity and does not introduce a
  runtime font dependency.
- The first Quick Log sheet uses explicit current-domain actions rather than a
  generic plugin or schema-driven form system.
- Sheet dismissal works through standard controls before optional drag-to-dismiss
  behavior is considered.
- The approved interactive mockup is a visual and interaction reference, not a
  source of truth for unsupported sample data.
