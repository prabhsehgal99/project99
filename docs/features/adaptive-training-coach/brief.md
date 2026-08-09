# Feature brief: Expanded workout library and adaptive coach

## Summary

Make Train a complete, phone-first workout system with a broad exercise library,
structured cardio logging, reusable templates, and an AI-assisted plan that the
owner must approve before it changes.

## User problem

The original eight-exercise catalogue cannot represent a real gym routine, and
the owner has no integrated way to turn goals and history into a flexible plan.

## Primary user and moment

The owner uses Train on a phone between sets, then reviews a proposed plan at
the start of a training week or a meaningful training milestone.

## Success criteria

- The owner can find and log 140+ gym, bodyweight, conditioning, and cardio movements without another logger.
- A coach-created plan is validated, owner-scoped, and never becomes active without explicit approval.

## In scope

- Searchable exercise library, cardio blocks, safe session-schema compatibility, template starts, and coach profile/proposals.
- Server-only OpenAI integration, weekly Vercel review, and milestone-triggered proposal generation.

## Out of scope

- Medical diagnosis, nutrition prescriptions, wearable integration, notifications, and automatic plan mutation.

## User flow

1. Start Train and search/filter exercises or add a structured cardio block.
2. Log and complete a session as before.
3. Set a goal, schedule, equipment, and constraints in the adaptive plan panel.
4. Review a generated proposal, then accept or decline it.

## Data and rules

- Sessions preserve immutable exercise snapshots; schema v1 sessions normalize alongside schema v2 additions.
- Coach documents are server-managed beneath the authenticated owner and are client-write protected by Rules.
- OpenAI receives only an authenticated owner’s available fitness data after explicit consent; no key is exposed to the browser.

## Acceptance criteria

- [ ] Exercise search/filter and cardio logging work on phone and desktop.
- [ ] Invalid cardio data and malformed plans are rejected.
- [ ] Coach proposals require an explicit accept/decline decision.
- [ ] Owner isolation is covered by Firestore Rules tests.
- [ ] Lint, typecheck, unit tests, Rules tests, and build pass.
