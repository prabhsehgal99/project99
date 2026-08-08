# Project context system

These files let a new session understand Project99 without repeatedly asking for
basic context.

| File | Purpose | Update when |
| --- | --- | --- |
| `../../PROJECT_CONTEXT.md` | Stable product, design, architecture, and engineering defaults | A foundational direction changes |
| `CURRENT_STATE.md` | What exists, what is happening now, and what comes next | A task or milestone starts/finishes |
| `DECISIONS.md` | Durable decisions and their reasoning | A consequential choice is accepted or reversed |
| `FEATURE_BRIEF_TEMPLATE.md` | Minimum input for a well-scoped feature | Copy it for each significant feature |
| `WORKFLOW.md` | Cross-device and cross-agent delivery rules | The development or handoff process changes |

## Active feature briefs

- [Calm daily experience redesign](../features/daily-experience-redesign/brief.md)

## Recommended feature folder

For a substantial feature, create:

```text
docs/features/<feature-name>/
  brief.md          # problem, scope, UX, and acceptance criteria
  data-model.md     # only when the feature changes persisted data
  rollout.md        # only when migration, flags, or staged release is needed
```

Do not create documents that have no decision-making value. Small fixes usually
need only a clear task description and an update to `CURRENT_STATE.md`.

## Best way to provide new context

Use facts and decisions rather than long conversational history. Separate:

- **Known fact:** what is true today.
- **Decision:** what has been chosen and why.
- **Constraint:** what must or must not happen.
- **Assumption:** what may be treated as true until validated.
- **Open question:** what still needs a decision.

Include screenshots or links for visual references and name the exact behavior you
want to preserve. Never place secrets, API keys, service-account files, or the
contents of `.env.local` in project-memory documents.
