# Project99 - Canonical Project Context

Last updated: 2026-07-31

## Product identity

Project99 is a production-quality, premium personal fitness operating system. It
is being built first for its owner as a product they genuinely use every day, but
technical and product decisions should remain suitable for an eventual commercial
SaaS product serving thousands of users.

It is not merely a calorie tracker, workout logger, demo, or coding exercise. It
should help people train, eat, recover, remain consistent, understand long-term
trends, and build lifelong habits.

Every feature should help answer at least one question:

- What should I do today?
- How am I progressing?
- What is holding me back?
- What should I improve next?

## Product form

- Web application and installable Progressive Web App.
- Designed for phones first, with an excellent desktop experience.
- Cloud synchronized and hosted on Vercel with Firebase services.
- Not currently a native iOS, Android, or Electron application.
- Avoid native-only choices so a later Capacitor wrapper remains practical.
- Offline-first synchronization is not a current requirement.

## Product and engineering priorities

In order:

1. Working software.
2. Maintainable architecture.
3. Excellent user experience.
4. Scalability.
5. Performance.
6. Simplicity.

When two approaches satisfy the requirement, choose the simpler one unless a
specific, meaningful trade-off justifies added complexity. Build for reasonable
extension without speculative abstractions, magic code, or unused dependencies.

## Experience and design direction

The product should feel minimal, calm, spacious, modern, fast, and premium. Visual
inspiration includes Apple Health, Linear, Notion, and Arc Browser.

Defaults:

- Dark mode.
- Monochrome, emerald, and purple accent themes.
- Persistent bottom navigation on mobile and a sidebar on desktop.
- Readable, accessible, one-hand-friendly screens and touch targets.
- Restrained motion used only when it improves comprehension.

Avoid dashboard clutter, excessive colors, large gradients, pervasive
gamification, unnecessary animation, and generic Bootstrap-dashboard aesthetics.

Accessibility requires semantic HTML, proper labels, keyboard navigation, screen
reader support, and sufficient color contrast.

## Current technology stack

### Frontend

- Next.js with App Router
- React
- TypeScript with strict settings
- Tailwind CSS
- shadcn/ui

### Backend and hosting

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Vercel

### Supporting libraries

- TanStack Query
- React Hook Form
- Zod
- Framer Motion
- Recharts
- Lucide Icons

Use installed libraries only where they earn their place. Do not introduce a new
dependency when the platform or existing stack handles the requirement cleanly.

## Authentication and security

- Google Sign-In only unless the user explicitly changes this decision.
- Do not add email/password, username/password, Apple, or Facebook sign-in.
- Protect authenticated routes.
- Never expose secrets or commit environment-variable files.
- Enforce authorization with Firebase Security Rules, not only the interface.
- Design all user-owned data for tenant isolation from the beginning.

## Central domain model

The Daily Log is the central entity. Other systems should derive information from
Daily Logs wherever that produces a coherent source of truth.

A Daily Log may contain:

- Morning weight and sleep
- Nutrition totals: calories, protein, carbohydrates, fat, fibre, and water
- Workout and cardio completion
- Mood, energy, soreness, and steps
- Supplements
- Journal notes

Do not force every domain object into a Daily Log if it has an independent
lifecycle. Stable definitions such as exercises, workout templates, foods, goals,
and user preferences may be separate entities referenced by dated logs.

## Units

- Body metrics: kilograms
- Gym weights: pounds
- Height: centimetres internally; feet/inches where appropriate for display
- Energy: kcal
- Water: litres

Unit conversion and formatting should be centralized rather than repeated in UI
components.

## Phase 1 core product

### Dashboard

The dashboard answers "How am I doing today?" and may show calories remaining,
protein remaining, today's workout and cardio, weight, water, sleep, streak, and
daily/goal progress. It should summarize rather than become a second data-entry
system.

### Workout engine

Exercises support warm-up and working sets, weight, repetitions, RPE, previous
workout, previous best, lifetime personal record, estimated 1RM, training volume,
rest timer, and notes. Relevant previous values and records carry forward
automatically.

### Nutrition

Use an internal food database rather than depending on MyFitnessPal. Track
calories, protein, carbohydrates, fat, and fibre.

### Measurements

Track weight, waist, chest, neck, hips, left/right arm, left/right thigh, and
progress photos.

### Recovery

Track sleep, soreness, energy, mood, steps, and cardio.

## Roadmap boundaries

### Phase 1 - Foundation

Authentication, dashboard, workouts, nutrition, measurements, and Daily Logs.

### Phase 2 - Insights

Analytics, trends, rule-based recommendations, and later AI-assisted insights.

### Phase 3 - Engagement

XP, achievements, levels, challenges, themes, streak improvements, and
personalization. Data models may leave room for these, but do not implement them
during foundation work.

### Phase 4 - Community

Friends, coaches, accountability, and shared challenges. Do not build a social
media feed.

Do not implement AI until explicitly requested. Begin with rule-based insights;
LLM coaching comes later.

## Explicit non-goals for now

- Subscription billing
- Social feed, chat, or marketplace
- Wearable integrations
- Apple Health or Health Connect synchronization
- Native-only iOS or Android features
- Multiple languages
- Offline-first synchronization
- Public API
- Admin panel

## Performance standards

Prefer fast, responsive screens, minimal client-side JavaScript, good Lighthouse
results, and deliberate rendering boundaries. Do not prematurely optimize, but do
not accept needless client components or avoidable rerenders.

## Delivery workflow

For significant features:

1. Define the user problem and acceptance criteria.
2. Inspect the existing architecture and relevant code.
3. Make necessary product and architecture decisions.
4. Implement a focused vertical slice.
5. Review functionality, UX, accessibility, security, and maintainability.
6. Run lint, typecheck, and production build checks.
7. Resolve regressions before merge.
8. Update project memory when the feature changes current state or a durable
   decision.

Implementation may be performed through Conductor, Codex, or Claude from desktop,
web, or mobile. GitHub branches and pull requests, not chat history or an agent's
local workspace, are the durable handoff mechanism. Conductor remains the
preferred laptop workspace orchestrator, while Codex and Claude may plan,
implement, review, or continue work when they have the repository context and an
isolated branch.

Each task should have one active branch owner at a time. A different tool may take
over only after the current work is committed and pushed, and after it reads the
issue, feature brief, pull-request discussion, and repository instructions. Never
allow two agents to modify the same branch concurrently.

## Definition of done

A feature is complete only when it:

- Meets agreed requirements and acceptance criteria.
- Works correctly on phone and desktop layouts.
- Is accessible for the supported interaction paths.
- Preserves security and user-data isolation.
- Fits the established architecture and design system.
- Introduces no known regressions.
- Passes `npm run lint`, `npm run typecheck`, and `npm run build`.
- Has been reviewed before merging.

## Repository

Private GitHub repository: `github.com/prabhsehgal99/project99`

This file is the durable source of truth for stable Project99 context. Update it
when the product direction, supported platform, core architecture, stack, or
roadmap boundaries change. Put temporary progress in `docs/project/CURRENT_STATE.md`
and individual durable choices in `docs/project/DECISIONS.md`.
