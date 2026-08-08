# Cross-device development workflow

This workflow allows Project99 work to move safely between Conductor, Codex, and
Claude on a laptop, phone, or browser.

## Sources of truth

In priority order:

1. The latest explicit user direction.
2. Merged repository files and code on `main`.
3. `PROJECT_CONTEXT.md` and `docs/project/DECISIONS.md`.
4. The relevant GitHub issue, feature brief, and pull request.
5. An agent conversation or unpushed local workspace.

Never rely on chat history as the only record of a requirement or decision.

## One task, one branch, one owner

- Create or select one GitHub issue for each meaningful change.
- Use one branch per issue: `feature/<issue>-<slug>`, `fix/<issue>-<slug>`, or
  `chore/<issue>-<slug>`.
- Only one agent or workspace actively edits a branch at a time.
- A tool may take over after the previous agent commits and pushes all intended
  work and records its handoff in the pull request.
- Never push directly to `main`.
- Never force-push a shared branch unless the user explicitly authorizes it.

## Repository safeguards

> **Status (2026-07-31):** The repository is public and branch protection is
> enabled on `main`: a pull request is required, the `Lint, typecheck, and
> build` status check must pass, conversations must be resolved, and force
> pushes and deletion are blocked. Approval count is 0 so the owner can merge
> their own reviewed PRs; admin enforcement is off as an owner escape hatch.

`main` protection enables:

- Require a pull request before merging.
- Require the `Lint, typecheck, and build` status check.
- Require conversations to be resolved before merging.
- Block force pushes and branch deletion.

The included workflow uses Node.js 22 and `npm ci`. Confirm those match the
repository's Node version and lockfile before making the check mandatory. If the
production build validates environment variables, configure the exact names from
`.env.example` in GitHub Actions using repository variables or secrets. Never copy
their values into documentation.

## Starting work

The agent must:

1. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `CURRENT_STATE.md`, and `DECISIONS.md`.
2. Read the issue or feature brief and confirm its acceptance criteria are
   testable.
3. Inspect the existing code before choosing an implementation.
4. Check for an existing branch or pull request for the same work.
5. Create an isolated branch if none exists.

## Finishing or handing off work

Before another tool takes over, the current agent must:

1. Run the relevant tests plus lint, typecheck, and build.
2. Commit and push the work.
3. Open or update a draft pull request.
4. Record what changed, what remains, checks run, known risks, and any decisions
   needed.
5. Stop editing that branch while another agent owns it.

## Review and merge

- Prefer cross-model review: Codex reviews Claude work or Claude reviews Codex
  work when practical.
- Review the diff, behavior, mobile layout, accessibility, data ownership, and
  Firebase Security Rules where applicable.
- Inspect the Vercel preview for visible changes.
- Resolve review conversations and require automated checks to pass.
- The user controls the final merge unless they explicitly delegate it.

## Phone workflow

1. Create or select the GitHub issue.
2. Start a cloud/mobile coding session against the repository and a dedicated
   branch.
3. Tell the agent to read the repository instructions and open a draft pull
   request; do not merge.
4. Review the pull request and preview from the phone.
5. Request a second-agent review before merging significant work.

## Firebase environments

Two Firebase projects, mapped to aliases in `.firebaserc` so no one types a raw
project ID:

| Alias  | Project ID      | Use                                          |
| ------ | --------------- | -------------------------------------------- |
| `dev`  | `project99-dev` | Local development, agent sessions, all testing |
| `prod` | `project99live` | Production, served by Vercel                 |

Agent sessions and local development must point at `dev`. Production credentials
belong only in the hosting provider's environment settings.

Every configured environment also sets `NEXT_PUBLIC_APP_ENV` to `dev` or
`prod`. `src/lib/firebase-config.ts` validates that the project ID, auth
domain, storage bucket, messaging sender, and app ID form one coherent
configuration. `next.config.ts` maps Vercel's environment identity to the
required Firebase target:

- Vercel Production requires `prod` / `project99live`.
- Vercel Preview and Development require `dev` / `project99-dev`.
- A mismatch or missing value fails the deployment before Next.js builds.
- Non-Vercel quality CI may remain unconfigured so it can verify the app's
  existing configuration-error state.

After changing any `NEXT_PUBLIC_*` value in Vercel, create a new deployment
without reusing the previous build cache; those values are compiled into the
client bundle.

There is deliberately **no `default` alias**. A bare `firebase deploy` fails with
"no project active" instead of silently targeting whichever project was last
used, so every deployment names its target.

Security rules live in `firestore.rules` and ship only through the
`Deploy Firestore Rules` GitHub Actions workflow. The workflow checks out
reviewed `main` itself, runs the emulator-backed Rules suite, then records the
target, source commit, and Rules checksum with the release. It uses separate
protected environments named `firestore-dev` and `firestore-prod`; each holds a
same-named `FIREBASE_SERVICE_ACCOUNT` secret scoped only to its Firebase
project. Production must require approval.

Request a release from a clean checkout with the portable scripts (or use the
Actions tab directly):

```bash
npm run rules:deploy:dev     # dispatches a main-based release to project99-dev
npm run rules:deploy:prod    # dispatches a main-based release to project99live
```

These scripts never deploy the Rules from the current working tree, so a stale
branch cannot be released accidentally. Deploy to `dev` first, complete the
authenticated runtime check, then request `prod`. Both projects run the same
`main` Rules file; if they ever diverge, stop and investigate the Actions
release evidence rather than attempting a console or raw-CLI correction.

## Secrets and environments

`.env.example` is the contract and `.env.local` is what the app reads. How each
environment fills it is that environment's business: a file on a development
machine, the hosting provider's settings in production, or environment variables
plus `npm run env:setup` in CI and ephemeral agent workspaces. No AI tool or
hosting provider is a dependency of this design.

Development machines and agent sessions use `project99-dev`. Production values
belong only in the hosting provider's environment settings.

- Never place `.env.local`, API keys, service-account credentials, or production
  secrets in chat, issues, commits, or pull-request text.
- Configure cloud tools and CI with their protected environment or secret stores.
- Grant the minimum repository and service permissions required.
- Treat Firebase client configuration and server credentials separately; never
  expose privileged server credentials to browser code.

## Handoff comment template

```text
Status: ready for review | needs continuation | blocked
Completed:
-

Remaining:
-

Checks run:
- npm run lint
- npm run typecheck
- npm test
- npm run build

Risks or decisions:
-

Next owner:
- Codex | Claude | Conductor | user
```
