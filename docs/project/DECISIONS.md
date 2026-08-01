# Decision log

Record decisions that future work should follow without reopening them by default.
The newest explicit user direction can supersede an older decision; mark the older
entry as superseded instead of deleting history.

## Accepted decisions

### D-001 - Daily Log is the central dated record

- **Status:** Accepted
- **Decision:** Dated health behavior and outcome data should live in, or be
  referenced by, a user's Daily Log. Stable definitions with independent
  lifecycles may remain separate entities.
- **Reason:** This creates a coherent daily experience and supports trend analysis
  without turning the Daily Log into an unmaintainable universal document.

### D-002 - Google Sign-In only

- **Status:** Accepted
- **Decision:** Use Google Sign-In. Do not add other authentication methods unless
  explicitly requested.
- **Reason:** It meets the initial user's needs and keeps the foundation focused.

### D-003 - Mobile-first PWA

- **Status:** Accepted
- **Decision:** Build a responsive, installable web application without native-only
  dependencies; preserve the option to package it with Capacitor later.
- **Reason:** One production surface serves the current need while retaining a
  practical route to app-store distribution.

### D-004 - Internal food database

- **Status:** Accepted
- **Decision:** Nutrition must not depend on MyFitnessPal. Project99 owns its food
  data model and may later choose appropriate data sources.
- **Reason:** Product control and long-term independence.

### D-005 - Delay AI implementation

- **Status:** Accepted
- **Decision:** Do not build AI until requested. Start insight functionality with
  deterministic rules before adding LLM coaching.
- **Reason:** Reliable fundamentals and sufficient user data must precede coaching.

### D-006 - Current measurement units

- **Status:** Accepted
- **Decision:** Body mass uses kilograms, gym load uses pounds, height is stored in
  centimetres and may display as feet/inches, water is displayed and entered in
  litres while persisted as integer millilitres, and energy uses kcal.
- **Reason:** These match the owner's real-world usage.

### D-007 - GitHub is the cross-tool source of truth

- **Date:** 2026-07-31
- **Status:** Accepted
- **Decision:** Conductor, Codex, and Claude may all work on Project99 from laptop,
  web, or mobile. Durable work moves through GitHub issues, isolated branches, and
  pull requests. No chat history or local agent workspace is authoritative.
- **Reason:** This permits flexible tool choice without losing context or allowing
  agents to overwrite one another.
- **Consequences:** Every meaningful implementation must be committed and pushed
  before handoff. Only one agent may own a branch at a time, and `main` must be
  protected by review and automated checks.

### D-008 - Dependencies are pinned; never `"latest"`

- **Date:** 2026-07-31
- **Status:** Accepted
- **Context:** Every dependency was declared as `"latest"`, so any lockfile
  regeneration could silently jump the entire stack across major versions.
- **Decision:** Declare dependencies with caret ranges against known-good
  versions and commit the lockfile. Upgrades are deliberate, reviewed changes.
- **Reason:** Reproducible installs are a prerequisite for a production-quality
  product and for trustworthy automated checks.
- **Consequences:** Framework upgrades become explicit tasks instead of
  side effects of an install.

### D-009 - Pure logic requires unit tests

- **Date:** 2026-07-31
- **Status:** Accepted
- **Context:** Date, validation, serialization, and streak logic had no tests,
  and future workout/nutrition formulas raise the stakes.
- **Decision:** Keep domain logic in pure functions under `src/lib` and cover it
  with Vitest unit tests (`npm test`, enforced in CI). Firestore rules tests via
  the emulator remain a separate Phase 0 requirement.
- **Reason:** Pure-function tests are cheap, fast, and catch exactly the class
  of bugs already found in the streak and date logic.
- **Consequences:** New `src/lib` logic ships with tests; the definition of done
  includes `npm test`.

## Decision entry template

### D-XXX - Short title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded
- **Context:** What prompted the decision?
- **Decision:** What exactly was chosen?
- **Reason:** Why is it the best current choice?
- **Consequences:** What becomes easier, harder, or constrained?
- **Supersedes / superseded by:** D-XXX, when applicable
