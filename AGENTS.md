# Project99 agent instructions

Project99 is a premium, production-quality, mobile-first personal fitness operating
system. It is built first for its owner and designed to remain suitable for an
eventual commercial SaaS product.

This file is the single source of truth for every agent and every AI tool working
on this repository. Vendor-specific files such as `CLAUDE.md` exist only to point
here. See "Tooling and portability" below before adding another one.

## Required reading

Before planning, reviewing, or implementing Project99 work, read:

1. `PROJECT_CONTEXT.md` - canonical product, architecture, and engineering defaults.
2. `docs/project/CURRENT_STATE.md` - current milestone, completed work, and next action.
3. `docs/project/DECISIONS.md` - decisions that must not be silently reopened.
4. `docs/project/WORKFLOW.md` - branch ownership, handoff, review, and mobile rules.
5. `docs/project/ROADMAP.md` - phased product roadmap and implementation order.

For a significant new feature, create a brief from
`docs/project/FEATURE_BRIEF_TEMPLATE.md`.

Do not ask the user to reconfirm anything already answered in these files. If a
new request conflicts with them, identify the conflict and treat the user's newest
explicit direction as authoritative. Update the appropriate memory file when a
decision, milestone, or architectural direction changes.

## Working rules

- Inspect and understand the existing architecture before making changes.
- Reuse existing components and patterns where appropriate.
- Explain a materially better architectural alternative before implementation.
- Prefer the simplest maintainable solution that meets current requirements.
- Keep changes focused; avoid unrelated refactors and speculative systems.
- Use strict TypeScript. Never introduce `any`.
- Build mobile-first, accessible, touch-friendly interfaces.
- Do not implement future-roadmap features unless explicitly requested.
- Protect authenticated routes and user data with Firebase Security Rules.
- Never expose secrets or commit `.env.local` or other environment files.
- Use one issue, one isolated branch, and one active agent owner per task.
- Never push directly to `main`.
- Commit and push all work before another tool or agent takes ownership.
- Preserve existing user changes and do not use destructive Git operations without
  explicit authorization.

## Definition of done

Before declaring implementation complete:

1. Verify the requested behavior on mobile and desktop layouts.
2. Check loading, empty, error, and accessibility states.
3. Review security and user-data isolation when persisted data is involved.
4. Run `npm run lint`.
5. Run `npm run typecheck`.
6. Run `npm test`.
7. Run `npm run build`.
8. Fix failures caused by the work.
9. Open or update a pull request with a complete handoff summary.
10. Update `docs/project/CURRENT_STATE.md` and the decision log when the milestone
    or a durable decision changes.

Do not merge significant feature work without review. The user controls the final
merge unless they explicitly delegate it.

## Tooling and portability

Project99 is deliberately not tied to any single AI tool or model. Claude, Codex,
Gemini, Conductor, and anything that replaces them must be interchangeable drivers
of the same project. Three rules keep it that way:

- **This file is the only rulebook.** `CLAUDE.md` and any future vendor file
  (`GEMINI.md`, `.cursorrules`, and so on) must contain nothing but a pointer to
  `AGENTS.md`. Never restate a rule in a vendor file - two copies drift, and the
  agents reading them then follow different rules.
- **The portable interface is `package.json` scripts.** Every quality gate and
  routine task must be runnable as an `npm run ...` script, so any tool, any CI
  job, and any human invokes it identically. Instruction files reference those
  scripts; they never describe the underlying commands.
- **Tool configuration may only wrap those scripts.** `.conductor/settings.toml`
  is the reference example: it maps buttons to `npm run dev`, `build`, `lint`,
  and `typecheck` and encodes no project knowledge of its own. Removing that file
  must cost nothing but convenience.

Environment configuration follows the same principle. `.env.example` is the
documented contract and `.env.local` is what the app reads; how each environment
populates it (hosting dashboard, agent environment settings, local file) is that
environment's business and never a project dependency.
