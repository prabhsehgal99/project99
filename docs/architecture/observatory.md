# Architecture Observatory

The Architecture Observatory is the internal `/architecture` route. It visualizes
Project99 as a building whose structure is driven by a version-controlled event
ledger, not by line counts, folder sizes, or inferred quality scores.

## Update workflow

When a pull request ships a meaningful architectural change:

1. Add or update one event in `src/data/architecture-events.ts`.
2. Include real evidence: paths, PR or issue references, verification, and known
   limitations.
3. Run `npm run architecture:generate`.
4. Run `npm run architecture:check`.
5. Include the observatory update in the pull request.

Use the change operation that best describes the effect:

- `added`: a new architectural element exists.
- `modified`: an existing element materially changed responsibility, paths, or
  relationships.
- `removed`: an element no longer exists in that historical state.
- `reinforced`: tests, rules, validation, workflow, or safeguards strengthened an
  element.
- `repaired`: a defect or weakness in an element was fixed.
- `verified`: objective evidence was added or refreshed.

If a watched file changes without architectural impact, add a dated entry to
`docs/architecture/observatory-exceptions.md` with the PR or issue, changed
paths, and reason. Do not use exceptions for convenience when the building
should actually change.

## Evidence rules

- Use repository paths, merged PRs, issues, project memory, tests, rules, and
  deployment verification as evidence.
- Mark unknown information as unknown.
- Planned roadmap areas may appear only as planned blueprint elements.
- Do not expose secrets, `.env.local`, user data, production data, or repository
  source contents.
- Do not invent strength scores or imply that more code means stronger
  architecture.

## Scripts

```bash
npm run architecture:generate
npm run architecture:check
```

`architecture:generate` validates the ledger and writes the deterministic
generated data consumed by the route.

`architecture:check` verifies the generated data is fresh and checks whether
relevant changed paths need a ledger update or a documented exception.
