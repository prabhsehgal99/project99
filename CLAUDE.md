# Project99 Claude instructions

Project99 is a premium, production-quality, mobile-first personal fitness operating
system. It is built first for its owner and designed to remain suitable for an
eventual commercial SaaS product.

## Required reading

Before planning, reviewing, or implementing work, read:

1. `PROJECT_CONTEXT.md`
2. `docs/project/CURRENT_STATE.md`
3. `docs/project/DECISIONS.md`
4. `docs/project/WORKFLOW.md`

For significant features, create or read a feature brief based on
`docs/project/FEATURE_BRIEF_TEMPLATE.md`.

Do not ask the user to reconfirm anything already answered in these files. If the
newest explicit request conflicts with repository context, identify the conflict,
follow the newest user direction, and update the appropriate context file.

## Working rules

- Inspect the existing architecture and relevant code before changing anything.
- Reuse established components and patterns where appropriate.
- Explain materially better architectural alternatives before implementation.
- Prefer the simplest maintainable solution that meets current requirements.
- Keep changes focused and avoid speculative systems or unrelated refactors.
- Use strict TypeScript and never introduce `any`.
- Build mobile-first, accessible, touch-friendly interfaces.
- Do not implement roadmap features early unless explicitly requested.
- Protect authenticated routes and user data with Firebase Security Rules.
- Never expose secrets or commit `.env.local`.
- Use one issue, one isolated branch, and one active agent owner per task.
- Never push directly to `main`.
- Commit and push all intended work before handing the branch to another tool.

## Definition of done

Before declaring implementation complete:

1. Verify the requested behavior on mobile and desktop layouts.
2. Check loading, empty, error, and accessibility states.
3. Review security and user-data isolation when persisted data is involved.
4. Run `npm run lint`.
5. Run `npm run typecheck`.
6. Run `npm run build`.
7. Fix failures caused by the work.
8. Open or update a pull request with a complete handoff summary.
9. Update project memory when the milestone or a durable decision changes.

Do not merge significant feature work without review. The user controls the final
merge unless they explicitly delegate it.
