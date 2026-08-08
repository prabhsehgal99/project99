# Architecture Observatory exceptions

Use this file only when a pull request changes files watched by
`npm run architecture:check` but has no architectural effect worth recording in
`src/data/architecture-events.ts`.

Each exception must include:

- Date
- Pull request or issue
- Changed paths
- Reason the change does not affect the Project99 architecture

## Exceptions

### 2026-08-08 — Issue #39, calm visual system

- **Changed paths:** `docs/project/CURRENT_STATE.md`,
  `docs/project/DECISIONS.md`, `src/app/error.tsx`,
  `src/app/global-error.tsx`, `src/app/globals.css`, `src/app/layout.tsx`,
  `src/components/authenticated-shell.tsx`, `src/components/daily-log-page.tsx`,
  `src/components/dashboard-page.tsx`, `src/components/more-page.tsx`,
  `src/components/progress-page.tsx`,
  `src/components/quick-log/quick-log-provider.tsx`, `src/components/ui.tsx`,
  `src/components/workout-page.tsx`, and `src/lib/today-focus-visibility.ts`.
- **Reason:** This change modifies presentation hierarchy, typography, and
  ephemeral client UI visibility only. It introduces no persistent data model,
  service, authorization boundary, route, or architectural dependency.
