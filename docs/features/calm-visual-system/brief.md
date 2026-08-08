# Feature brief: Calm visual system

## Summary

Issue #39 applies the approved calm daily mockup as a consistent visual system
across authenticated Project99 screens. It makes frequent fitness actions feel
focused rather than like a checklist of equally weighted cards.

## User problem

The current authenticated experience overuses mint fills, Inter typography, and
nested cards. On a phone, Today reads as a long list before the user can see
what matters next.

## Primary user and moment

The owner opens the installed PWA or web app throughout the day to see one next
action, log a short update, record training, or correct a Daily Log.

## Success criteria

- Every authenticated destination uses Sora, the shared dark token system, and
  divider-led grouping.
- Today presents a compact header, one focused Up next surface, three flat
  metrics, and a concise log rhythm.
- The authenticated product renders in dark grayscale only, with semantic
  tokens ready for a later light mode and optional accents.

## In scope

- Today, Train, Daily Log, Progress, More, Quick Log, and authenticated
  loading/error states.
- Session-only dismissal for Today’s Up next surface.
- Shared tokens, controls, primary actions, navigation, typography, and visual
  density.

## Out of scope

- Unauthenticated landing-page redesign.
- Daily Log schema, settings, Firestore Rules, migrations, and new preferences.
- New fitness data, recommendations, or changes to route behavior.

## User flow

1. Open an authenticated destination.
2. Scan a calm hierarchy of heading, focused action, and grouped data.
3. Use the light primary action or global Quick Log to capture data.
4. Dismiss Up next with its labeled X when it is not useful; it remains hidden
   until the browser runtime reloads.

## UX requirements

- Use Sora, deep near-black surfaces, light primary buttons, and flat metric
  rows. Do not render mint, violet, or warm accents in this release.
- Preserve 44px touch targets, keyboard focus, dialog behavior, reduced-motion
  behavior, safe-area layout, and all existing loading/error/recovery states.
- Verify phone widths from 320px and desktop layouts.

## Data and rules

- Reads and writes are unchanged.
- Up next visibility is an in-memory client-only Set keyed by date; it never
  writes to Firestore or browser storage.

## Acceptance criteria

- [ ] Authenticated screens follow the visual-system direction.
- [ ] Up next dismisses for the runtime session without data mutation.
- [ ] Existing logging, workout, settings, and navigation-guard flows work.
- [ ] Mobile and desktop behavior verified.
- [ ] Accessibility path verified.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:rules`, and
  `npm run build` pass.

## Open questions

None.

## Non-blocking assumptions

- The supplied mockup remains the visual source of truth.
- The landing page is intentionally out of scope.
