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

> **Status (2026-07-31):** GitHub branch protection is not available for private
> repositories on the GitHub Free plan, so the safeguards below cannot currently
> be enforced by GitHub. Until the repository moves to GitHub Pro or becomes
> public, "never push directly to `main`" is a convention that every agent and
> tool must follow voluntarily. Revisit this when the plan changes.

When branch protection becomes available, protect `main` and enable:

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

1. Read `AGENTS.md` or `CLAUDE.md`, `PROJECT_CONTEXT.md`, `CURRENT_STATE.md`, and
   `DECISIONS.md`.
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

## Secrets and environments

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
