# Feature brief: Project99 Architecture Observatory

## Summary

Build an internal, HTML-based architectural visualization that represents
Project99 as a building under construction and lets contributors inspect how the
codebase changed across shipped milestones.

## User problem

Project99 has several durable architecture decisions, milestones, safeguards,
and product systems spread across code, project memory, pull requests, and Git
history. Today a contributor has to read those sources manually to understand
what exists, why it exists, and what changed in each release.

## Primary user and moment

The primary user is the project owner or an implementation/review agent during
planning, review, and handoff. The experience should work well on desktop for
inspection and remain usable on a phone for quick review.

## Success criteria

The current Project99 architecture appears as a coherent, evidence-backed
building. A contributor can select a historical milestone, inspect visible
elements, see what changed, and update the versioned event ledger through npm
scripts when future architectural work ships.

## In scope

- Internal observatory route that is not added to customer-facing navigation.
- Version-controlled architecture event ledger with strict TypeScript schema.
- Deterministic generation of an optimized static history artifact consumed by
  the route.
- Timeline reconstruction, current/latest view, change highlighting, filters,
  element inspector, and non-visual architecture list.
- Practical freshness check that detects relevant shipped code changes without a
  matching architecture-history update or documented exception.
- Tests for ledger validation, timeline reconstruction, and highlighting.
- Documentation for updating the observatory in future pull requests.

## Out of scope

- Public product navigation or marketing page.
- WebGL, large 3D engines, or heavyweight visualization dependencies.
- Arbitrary architecture or code-strength scores.
- Runtime access to repository source code, secrets, environment values, or user
  health data.
- AI-generated architecture claims.
- Automatic changes to `main`, automatic issue/PR merging, or bypassing review.

## User flow

1. Open the internal observatory route directly.
2. Review the latest building state or choose a milestone on the timeline.
3. Select a visible building element or non-visual list item.
4. Inspect responsibility, category, paths, relationships, evidence, history,
   verification, and known limitations.
5. Adjust filters or return to the latest state.
6. If history data is malformed or empty, see a clear recovery state.

## UX requirements

- Phone: stacked layout with timeline, filters, building view, inspector, and
  architecture list usable from 320px wide.
- Desktop: wider technical workstation layout with building view and inspector
  visible together.
- Loading, empty, malformed-data, no-results, latest, historical, selected
  element, unknown metadata, and generation-failure states represented.
- Keyboard-accessible timeline, previous/next/latest controls, filters, building
  elements, and inspector.
- Semantic headings, labels, visible focus indicators, sufficient contrast,
  reduced-motion support, and no hover-only inspection path.
- Calm technical visual direction aligned with Project99: dark graphite
  structure, emerald current-change highlight, restrained purple dependency
  connections, amber incomplete evidence, red only for failed safeguards or
  known structural risks, and blueprint treatment for planned work.

## Data and rules

- Data read: generated static observatory artifact and versioned source ledger.
- Data created or changed: repository-only architecture event data, generated
  public artifact, feature documentation, npm scripts, and tests.
- Ownership and authorization: no Firebase data, user data, secrets, or
  authenticated runtime state are read or exposed.
- Validation: TypeScript schema validation must reject malformed history data and
  tests must cover valid and invalid ledgers.
- Calculations: timeline reconstruction derives visible elements and
  added/modified/removed/reinforced/repaired/verified states from event entries.
- Migration: no user-data migration required.

## Acceptance criteria

- [ ] Current architecture appears as an understandable building.
- [ ] Every visible element maps to real repository paths or documented project
      evidence.
- [ ] The newest selected release is highlighted in emerald.
- [ ] Historical milestones reconstruct the building at each point.
- [ ] Added, modified, removed, repaired, reinforced, and verified states are
      distinguishable.
- [ ] Planned features are visibly different from implemented features.
- [ ] History is based on repository evidence and unknowns are marked unknown.
- [ ] Future contributors can add one structured event and regenerate through
      documented npm scripts.
- [ ] A freshness check detects relevant architecture changes without history
      updates or documented exceptions.
- [ ] Mobile and desktop behavior verified.
- [ ] Accessibility path verified.
- [ ] No secrets, user data, environment values, or unnecessary source contents
      are exposed.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Draft pull request opened with screenshots or preview and handoff summary.

## Open questions

- Should the internal route be unauthenticated but unlinked, or protected behind
  the existing authenticated shell? The implementation proposal recommends an
  unlinked static route to avoid requiring Firebase credentials for architecture
  review, but this should be revisited if the owner wants it private in
  production.
- Should the generated artifact be committed under `public/architecture/` or
  loaded directly from a typed source module? The implementation proposal should
  choose based on payload size and deterministic reviewability.

## Non-blocking assumptions

- Use issue #35 and branch `feature/35-architecture-observatory`.
- Keep the observatory internal by omitting it from authenticated navigation.
- Use no new runtime dependency unless repository inspection reveals an existing
  requirement that cannot be met with HTML, CSS, SVG, React, and TypeScript.
- Seed history from project memory, current code, and first-parent Git/PR
  evidence, marking unknown historical details as unknown.
