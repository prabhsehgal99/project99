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

### D-010 - Tailwind v4 with CSS-first configuration

- **Date:** 2026-08-01
- **Status:** Accepted
- **Context:** Tailwind 3.4 was two majors behind, and the roadmap expects a
  long-lived styling foundation as the workout, nutrition, and measurement
  systems arrive.
- **Decision:** Upgrade to Tailwind v4 and keep theme configuration in
  `src/app/globals.css` via `@theme` and `@plugin`. `tailwind.config.ts` is
  removed and `autoprefixer` is dropped, because v4 prefixes internally.
- **Reason:** The codebase is small enough that the migration is contained to
  one stylesheet and four renamed utilities, so the cost is far lower now than
  after several more feature systems are built on v3 conventions.
- **Consequences:** Theme tokens are CSS custom properties, not TypeScript.
  The default palette now emits in `lab()`/OKLCH, so solid brand fills render
  slightly more saturated on wide-gamut displays; the hand-written hex values
  in `globals.css` stay sRGB and are no longer pixel-identical to their palette
  equivalents. Both are used only in low-alpha gradients and the glow shadow,
  so the difference is not perceptible. Plugins must be registered with
  `@plugin` — losing that directive silently removes their styles.

### D-011 - Transitive advisories are fixed with `overrides`, not downgrades

- **Date:** 2026-08-01
- **Status:** Accepted
- **Context:** Three high-severity advisories (postcss XSS/path traversal,
  sharp libvips CVEs) arrived through dependencies nested under `next`.
  `npm audit fix --force` proposed downgrading Next.js from 16 to 9, and the
  advisories are only fixed in Next 16.3 preview builds.
- **Decision:** Pin vulnerable transitive dependencies forward with an
  `overrides` block, and keep Next.js on the newest stable release.
- **Reason:** A framework downgrade of seven majors is far more dangerous than
  forcing a patch-level bump of two leaf packages, and waiting for a preview
  release to go stable would leave known-exploitable code in the tree.
- **Consequences:** `overrides` must be revisited when Next.js 16.3 ships
  stable, and removed once upstream carries the patched versions itself.
  Overrides silently apply to the whole tree, so each entry needs a reason.

### D-012 - `AGENTS.md` is the only rulebook; the project stays model-agnostic

- **Date:** 2026-08-01
- **Status:** Accepted
- **Context:** `CLAUDE.md` and `AGENTS.md` were near-duplicates and had already
  drifted. `CLAUDE.md` alone carried "never push directly to `main`" and the
  pull-request handoff step; `AGENTS.md` alone carried "preserve existing user
  changes and do not use destructive Git operations". Claude and Codex were
  therefore working from different rules on the same repository, and each new
  tool would have added another copy to drift.
- **Decision:** `AGENTS.md` is the single source of truth, and it now holds the
  union of both rule sets. `CLAUDE.md` is reduced to a pointer, and any future
  vendor file must be a pointer too. Quality gates and routine tasks must exist
  as `package.json` scripts; instruction files reference them rather than
  describing commands. Tool configuration may only wrap those scripts.
- **Reason:** The project is developed with several AI tools at once and must not
  depend on any of them. Interchangeability is only real if the rules, the
  quality gates, and the environment contract live in vendor-neutral files.
- **Consequences:** Adding a tool means adding a pointer file, not a rulebook.
  Any new gate has to become an npm script before it can be required, which also
  makes it enforceable in CI. Reviewers should reject vendor files that contain
  project rules, and `.conductor/settings.toml` stays the reference example of a
  wrapper that encodes no project knowledge.

## Decision entry template

### D-XXX - Short title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded
- **Context:** What prompted the decision?
- **Decision:** What exactly was chosen?
- **Reason:** Why is it the best current choice?
- **Consequences:** What becomes easier, harder, or constrained?
- **Supersedes / superseded by:** D-XXX, when applicable
