import type { ArchitectureElement, ArchitectureEvent, ArchitectureReference } from "../lib/architecture-observatory";

function githubPr(number: number, title: string, commit: string): ArchitectureReference {
  return {
    label: `PR #${number}: ${title}`,
    pullRequest: number,
    commit,
    url: `https://github.com/prabhsehgal99/project99/pull/${number}`
  };
}

function githubIssue(number: number, title: string): ArchitectureReference {
  return {
    label: `Issue #${number}: ${title}`,
    issue: number,
    url: `https://github.com/prabhsehgal99/project99/issues/${number}`
  };
}

function decision(label: string): ArchitectureReference {
  return { label, url: "docs/project/DECISIONS.md" };
}

type ElementInput = Omit<ArchitectureElement, "sourceRefs" | "verification" | "limitations"> & {
  sourceRefs?: ArchitectureElement["sourceRefs"];
  verification?: ArchitectureElement["verification"];
  limitations?: ArchitectureElement["limitations"];
};

function element(input: ElementInput): ArchitectureElement {
  return {
    ...input,
    sourceRefs: input.sourceRefs ?? [],
    verification: input.verification ?? [],
    limitations: input.limitations ?? []
  };
}

const initialPr = githubPr(1, "Build Project 99 fitness PWA", "98908d9a0fb80344456ec824a947ddfe7a6cdeca");
const workflowPr = githubPr(3, "Add clean cross-device workflow bundle", "8472279f608709cefa56816d7aa8181174ab2392");
const waterPr = githubPr(4, "Display water in litres while storing millilitres", "6fb851a2597555e878bbd752cc36c0f3de68e573");
const rulesAuditPr = githubPr(6, "Document Firestore user data rules audit", "3400506043d532672a351eb30b820c2cd30a347b");
const dailyLogPr = githubPr(9, "Build Daily Log vertical slice", "6ba57ae52585cb74d0334651476cacd085d66b92");
const hardeningPr = githubPr(18, "Phase 0.5 setup hardening", "3d16f45287c8d10541177ec030c55e510587acca");
const navGuardPr = githubPr(19, "Guard unsaved Daily Log edits on app-shell navigation", "c6c4369225be835c1e6d193704c54996da84d508");
const firebaseSplitPr = githubPr(20, "Upgrade Tailwind v4, split Firebase projects, harden environment setup", "2a07ff5699bf2d1e850934facc8358935a39a982");
const workoutPr = githubPr(22, "Start workout engine foundation", "e4be0295255655d881ee33d96278fee0b69cb625");
const envIdentityPr = githubPr(24, "Enforce Firebase dev and production environment identity", "905f5e7509a11c567ac9213b6492311596c7062d");
const rulesTestsPr = githubPr(27, "Add emulator-backed Firestore rules tests", "81bb7ab34cf28428aa13c2fd5a82c922006cd6dc");
const foundationClosurePr = githubPr(28, "Close pending foundation issues", "07d30a539dc7706b9e37af4288aed2cacf8fbb39");
const phaseZeroPr = githubPr(33, "Record Phase 0 verification pass", "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91");
const pwaAuthFixPr = githubPr(34, "Fix installed iOS PWA Google sign-in loop", "4f8f776f3ae391b90117e5f2f04bc04d8acaffd8");
const observatoryPr: ArchitectureReference = {
  label: "PR #36: Build Project99 Architecture Observatory",
  pullRequest: 36,
  url: "https://github.com/prabhsehgal99/project99/pull/36"
};

export const architectureEvents: ArchitectureEvent[] = [
  {
    id: "2026-07-31-initial-pwa-foundation",
    date: "2026-07-31",
    title: "Initial authenticated PWA foundation",
    summary:
      "Project99 began as a mobile-first Next.js PWA with Google authentication, Firebase-backed user documents, a dashboard, and first Daily Log surface.",
    changeType: "added",
    milestone: "Phase 0 foundation",
    sourceRefs: [initialPr],
    changes: [
      {
        operation: "added",
        elementId: "application-foundation",
        summary: "Created the core Next.js App Router, React, strict TypeScript, Tailwind, and PWA shell.",
        element: element({
          id: "application-foundation",
          name: "Application foundation",
          category: "foundation",
          filter: "shared-architecture",
          status: "implemented",
          feature: "Core app setup",
          responsibility: "Hosts the App Router application, root layout, global styling, manifest metadata, and installed-app baseline.",
          paths: ["src/app/layout.tsx", "src/app/page.tsx", "src/app/globals.css", "public/manifest.webmanifest", "next.config.ts"],
          dependencies: [],
          introduced: "2026-07-31",
          lastChanged: "2026-08-07",
          sourceRefs: [initialPr, phaseZeroPr],
          verification: [
            { label: "Production build", status: "passed", detail: "Verified during Phase 0 closure." },
            { label: "Public production reachability", status: "passed", detail: "Production site returned HTTP 200 on 2026-08-07." }
          ],
          position: { x: 120, y: 500, width: 520, height: 62 }
        })
      },
      {
        operation: "added",
        elementId: "firebase-auth-boundary",
        summary: "Added Google-authenticated access and Firebase client setup.",
        element: element({
          id: "firebase-auth-boundary",
          name: "Authentication boundary",
          category: "foundation",
          filter: "data-security",
          status: "implemented",
          feature: "Google authentication",
          responsibility: "Keeps app data behind authenticated Firebase users and initializes Firebase client services from environment configuration.",
          paths: ["src/components/auth-provider.tsx", "src/lib/firebase.ts", "src/lib/firebase-config.ts"],
          dependencies: ["application-foundation"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-07",
          sourceRefs: [initialPr, envIdentityPr, foundationClosurePr],
          verification: [
            { label: "Google Sign-In runtime QA", status: "passed", detail: "Chrome, Safari, and installed iOS PWA sign-in passed during Phase 0 closure." },
            { label: "Google-only decision", status: "present", path: "docs/project/DECISIONS.md" }
          ],
          position: { x: 670, y: 500, width: 310, height: 62 }
        })
      },
      {
        operation: "added",
        elementId: "dashboard-wing",
        summary: "Introduced the dashboard as the first summary surface.",
        element: element({
          id: "dashboard-wing",
          name: "Dashboard wing",
          category: "product",
          filter: "interface",
          status: "implemented",
          feature: "Dashboard",
          responsibility: "Summarizes today's Daily Log, recent weight, goals, hydration, nutrition, and habit streak without becoming a second editor.",
          paths: ["src/app/dashboard/page.tsx", "src/components/dashboard-page.tsx"],
          dependencies: ["application-foundation", "daily-log-core", "settings-utilities"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-01",
          sourceRefs: [initialPr, hardeningPr],
          verification: [{ label: "Dashboard rendering", status: "passed", detail: "Covered by production build and Phase 0 runtime QA." }],
          position: { x: 160, y: 250, width: 180, height: 78 }
        })
      }
    ],
    knownLimitations: ["Early repository history before PR #1 is unavailable beyond the initial commit and merged PR metadata."]
  },
  {
    id: "2026-07-31-project-bedrock",
    date: "2026-07-31",
    title: "Portable project workflow bedrock",
    summary:
      "Project memory and workflow files became the cross-tool source of truth for planning, ownership, review, and handoff.",
    changeType: "added",
    milestone: "Phase 0 foundation",
    sourceRefs: [workflowPr, decision("D-007 - GitHub is the cross-tool source of truth"), decision("D-012 - AGENTS.md is the only rulebook")],
    changes: [
      {
        operation: "added",
        elementId: "project-bedrock",
        summary: "Established the repository rulebook, current-state memory, decision log, workflow, and roadmap.",
        element: element({
          id: "project-bedrock",
          name: "Project bedrock",
          category: "bedrock",
          filter: "shared-architecture",
          status: "implemented",
          feature: "Engineering operating system",
          responsibility: "Defines Project99 principles, current state, accepted decisions, roadmap boundaries, and cross-agent workflow.",
          paths: ["AGENTS.md", "PROJECT_CONTEXT.md", "docs/project/CURRENT_STATE.md", "docs/project/DECISIONS.md", "docs/project/WORKFLOW.md", "docs/project/ROADMAP.md"],
          dependencies: [],
          introduced: "2026-07-31",
          lastChanged: "2026-08-07",
          sourceRefs: [workflowPr, hardeningPr, phaseZeroPr],
          verification: [{ label: "Required reading", status: "present", path: "AGENTS.md" }],
          position: { x: 80, y: 585, width: 940, height: 50 }
        })
      },
      {
        operation: "added",
        elementId: "future-phase-blueprints",
        summary: "Recorded planned product phases without presenting them as implemented features.",
        element: element({
          id: "future-phase-blueprints",
          name: "Future phase blueprints",
          category: "product",
          filter: "product",
          status: "planned",
          feature: "Nutrition, measurements, recovery, insights, engagement, community",
          responsibility: "Keeps approved future product areas visible as plans while separating them from shipped architecture.",
          paths: ["docs/project/ROADMAP.md", "PROJECT_CONTEXT.md"],
          dependencies: ["project-bedrock", "daily-log-core"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-07",
          sourceRefs: [workflowPr, hardeningPr, phaseZeroPr],
          verification: [{ label: "Roadmap status", status: "planned", path: "docs/project/ROADMAP.md" }],
          limitations: ["Blueprint areas are roadmap intent only; they do not indicate shipped screens or data models."],
          position: { x: 735, y: 225, width: 220, height: 110 }
        })
      }
    ],
    knownLimitations: []
  },
  {
    id: "2026-07-31-daily-log-core",
    date: "2026-07-31",
    title: "Daily Log central core",
    summary:
      "The dated Daily Log became the central entity for body, nutrition, activity, recovery, habit, and journal data.",
    changeType: "added",
    milestone: "Phase 1A daily operating system",
    sourceRefs: [dailyLogPr, decision("D-001 - Daily Log is the central dated record")],
    changes: [
      {
        operation: "added",
        elementId: "daily-log-core",
        summary: "Built the date-addressed Daily Log editor and pure validation/serialization logic.",
        element: element({
          id: "daily-log-core",
          name: "Daily Log core",
          category: "core",
          filter: "product",
          status: "implemented",
          feature: "Daily Log",
          responsibility: "Stores and edits the dated source of truth that connects health behavior, outcomes, and linked workout sessions.",
          paths: ["src/app/log/page.tsx", "src/components/daily-log-page.tsx", "src/components/daily-log", "src/lib/daily-log.ts", "src/lib/types.ts"],
          dependencies: ["application-foundation", "firebase-auth-boundary", "firestore-data-boundary", "date-utilities", "unit-utilities"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-07",
          sourceRefs: [dailyLogPr, navGuardPr, workoutPr, foundationClosurePr],
          verification: [
            { label: "Daily Log unit tests", status: "passed", path: "src/lib/daily-log.test.ts" },
            { label: "Production Firestore write", status: "passed", detail: "Verified during Phase 0 closure." }
          ],
          position: { x: 390, y: 325, width: 240, height: 88 }
        })
      },
      {
        operation: "added",
        elementId: "firestore-data-boundary",
        summary: "Added owner-scoped Firestore persistence functions for user documents and Daily Logs.",
        element: element({
          id: "firestore-data-boundary",
          name: "Firestore data boundary",
          category: "frame",
          filter: "data-security",
          status: "implemented",
          feature: "User-owned persistence",
          responsibility: "Centralizes client reads, subscriptions, writes, normalization, and error reporting for user-owned Firestore documents.",
          paths: ["src/lib/firestore.ts", "src/lib/types.ts", "firestore.rules"],
          dependencies: ["firebase-auth-boundary"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-07",
          sourceRefs: [initialPr, rulesAuditPr, dailyLogPr, workoutPr, foundationClosurePr],
          verification: [
            { label: "Owner-only rules", status: "passed", path: "firestore.rules" },
            { label: "Rules emulator tests", status: "passed", path: "tests/firestore.rules.test.ts" }
          ],
          position: { x: 680, y: 400, width: 245, height: 78 }
        })
      }
    ],
    knownLimitations: ["Historical details for the first Daily Log slice are limited to merged PR metadata and committed project memory."]
  },
  {
    id: "2026-07-31-units-and-rules-audit",
    date: "2026-07-31",
    title: "Units and security audit reinforcement",
    summary:
      "Water display/storage rules and Firestore authorization expectations were clarified and reinforced.",
    changeType: "reinforced",
    milestone: "Phase 0 hardening",
    sourceRefs: [waterPr, rulesAuditPr, decision("D-006 - Current measurement units")],
    changes: [
      {
        operation: "added",
        elementId: "unit-utilities",
        summary: "Centralized litres-to-millilitres conversion and unit expectations.",
        element: element({
          id: "unit-utilities",
          name: "Unit utilities",
          category: "utility",
          filter: "shared-architecture",
          status: "implemented",
          feature: "Measurement units",
          responsibility: "Keeps water conversion centralized and aligns body, gym, height, water, and energy units with accepted decisions.",
          paths: ["src/lib/units.ts", "src/lib/units.test.ts", "docs/project/DECISIONS.md"],
          dependencies: ["daily-log-core"],
          introduced: "2026-07-31",
          lastChanged: "2026-07-31",
          sourceRefs: [waterPr, decision("D-006 - Current measurement units")],
          verification: [{ label: "Unit conversion tests", status: "passed", path: "src/lib/units.test.ts" }],
          position: { x: 155, y: 430, width: 165, height: 58 }
        })
      },
      {
        operation: "reinforced",
        elementId: "firestore-data-boundary",
        summary: "Documented user-data rules expectations before emulator coverage existed.",
        element: element({
          id: "firestore-data-boundary",
          name: "Firestore data boundary",
          category: "frame",
          filter: "data-security",
          status: "implemented",
          feature: "User-owned persistence",
          responsibility: "Centralizes client reads, subscriptions, writes, normalization, and error reporting for user-owned Firestore documents.",
          paths: ["src/lib/firestore.ts", "src/lib/types.ts", "firestore.rules"],
          dependencies: ["firebase-auth-boundary"],
          introduced: "2026-07-31",
          lastChanged: "2026-07-31",
          sourceRefs: [initialPr, rulesAuditPr],
          verification: [
            { label: "Rules audit", status: "present", path: "docs/project/CURRENT_STATE.md" },
            { label: "Emulator tests", status: "unknown", detail: "Dedicated rules tests had not shipped yet at this point." }
          ],
          position: { x: 680, y: 400, width: 245, height: 78 }
        })
      }
    ],
    knownLimitations: ["The audit was documented before automated Firestore Rules tests were added."]
  },
  {
    id: "2026-08-01-hardening-systems",
    date: "2026-08-01",
    title: "Foundation hardening systems",
    summary:
      "The app gained repository roadmap memory, pinned dependencies, a safer service worker, unit-test harness, and Daily Log bug fixes.",
    changeType: "reinforced",
    milestone: "Phase 0.5 hardening",
    sourceRefs: [hardeningPr, decision("D-008 - Dependencies are pinned; never latest"), decision("D-009 - Pure logic requires unit tests")],
    changes: [
      {
        operation: "added",
        elementId: "quality-gate-system",
        summary: "Added Vitest unit-test harness and CI quality workflow coverage for app checks.",
        element: element({
          id: "quality-gate-system",
          name: "Quality gate system",
          category: "safety",
          filter: "tests-quality",
          status: "implemented",
          feature: "Automated verification",
          responsibility: "Runs lint, typecheck, unit tests, rules tests, and production builds through portable npm scripts and GitHub Actions.",
          paths: ["package.json", ".github/workflows/quality.yml", "src/lib/*.test.ts", "tests/firestore.rules.test.ts"],
          dependencies: ["project-bedrock", "application-foundation"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-07",
          sourceRefs: [hardeningPr, rulesTestsPr, phaseZeroPr],
          verification: [
            { label: "npm test", status: "passed", detail: "Phase 0 closure verified unit tests." },
            { label: "Quality workflow", status: "passed", path: ".github/workflows/quality.yml" }
          ],
          position: { x: 165, y: 92, width: 240, height: 70 }
        })
      },
      {
        operation: "added",
        elementId: "pwa-delivery-shell",
        summary: "Reworked PWA delivery behavior, icon assets, and static installability assets.",
        element: element({
          id: "pwa-delivery-shell",
          name: "PWA delivery shell",
          category: "delivery",
          filter: "infrastructure",
          status: "implemented",
          feature: "Installable PWA",
          responsibility: "Provides manifest, icons, service worker update behavior, and production static assets for installed-app use.",
          paths: ["public/manifest.webmanifest", "public/sw.js", "public/icon-192.png", "public/icon-512.png", "public/apple-touch-icon.png", "src/components/pwa-register.tsx"],
          dependencies: ["application-foundation"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-07",
          sourceRefs: [hardeningPr, foundationClosurePr, phaseZeroPr],
          verification: [
            { label: "Manifest and icon HTTP 200", status: "passed", detail: "Verified against production on 2026-08-07." },
            { label: "Installed iOS PWA QA", status: "passed", detail: "Owner runtime QA passed during Phase 0 closure." }
          ],
          position: { x: 700, y: 66, width: 235, height: 72 }
        })
      },
      {
        operation: "added",
        elementId: "date-utilities",
        summary: "Kept local date handling and date-key validation in pure utility functions.",
        element: element({
          id: "date-utilities",
          name: "Date utilities",
          category: "utility",
          filter: "shared-architecture",
          status: "implemented",
          feature: "Local date keys",
          responsibility: "Formats, parses, shifts, compares, and labels local YYYY-MM-DD keys without spreading date logic through UI components.",
          paths: ["src/lib/dates.ts", "src/lib/dates.test.ts"],
          dependencies: ["daily-log-core"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-01",
          sourceRefs: [hardeningPr],
          verification: [{ label: "Date utility tests", status: "passed", path: "src/lib/dates.test.ts" }],
          position: { x: 335, y: 430, width: 165, height: 58 }
        })
      },
      {
        operation: "modified",
        elementId: "dashboard-wing",
        summary: "Reduced avoidable Firestore resubscriptions and corrected habit-streak display.",
        element: element({
          id: "dashboard-wing",
          name: "Dashboard wing",
          category: "product",
          filter: "interface",
          status: "implemented",
          feature: "Dashboard",
          responsibility: "Summarizes today's Daily Log, recent weight, goals, hydration, nutrition, and habit streak without becoming a second editor.",
          paths: ["src/app/dashboard/page.tsx", "src/components/dashboard-page.tsx"],
          dependencies: ["application-foundation", "daily-log-core", "settings-utilities"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-01",
          sourceRefs: [initialPr, hardeningPr],
          verification: [{ label: "Habit streak unit coverage", status: "passed", path: "src/lib/daily-log.test.ts" }],
          position: { x: 160, y: 250, width: 180, height: 78 }
        })
      }
    ],
    knownLimitations: []
  },
  {
    id: "2026-08-01-navigation-guard",
    date: "2026-08-01",
    title: "Navigation guard reinforcement",
    summary:
      "App-shell navigation began respecting dirty Daily Log edits through a shared navigation-guard context.",
    changeType: "repaired",
    milestone: "Phase 1A daily hardening",
    sourceRefs: [navGuardPr, githubIssue(12, "Protect unsaved Daily Log edits when navigating through app shell")],
    changes: [
      {
        operation: "added",
        elementId: "navigation-guard",
        summary: "Added a shared guard that lets editing surfaces intercept app-shell navigation.",
        element: element({
          id: "navigation-guard",
          name: "Navigation guard",
          category: "utility",
          filter: "interface",
          status: "implemented",
          feature: "Unsaved-change protection",
          responsibility: "Lets dirty editor screens present save, discard, or cancel choices before navigation changes route.",
          paths: ["src/components/navigation-guard.tsx", "src/components/authenticated-shell.tsx", "src/components/daily-log-page.tsx", "src/components/workout-page.tsx"],
          dependencies: ["application-foundation", "daily-log-core"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-05",
          sourceRefs: [navGuardPr, workoutPr],
          verification: [{ label: "Modified-click behavior preserved", status: "present", path: "src/components/authenticated-shell.tsx" }],
          limitations: ["Browser back/forward and sign-out dirty-edit interception are documented as unchanged behavior."],
          position: { x: 520, y: 430, width: 165, height: 58 }
        })
      },
      {
        operation: "repaired",
        elementId: "daily-log-core",
        summary: "Daily Log app-shell navigation no longer silently drops unsaved edits.",
        element: element({
          id: "daily-log-core",
          name: "Daily Log core",
          category: "core",
          filter: "product",
          status: "implemented",
          feature: "Daily Log",
          responsibility: "Stores and edits the dated source of truth that connects health behavior, outcomes, and linked workout sessions.",
          paths: ["src/app/log/page.tsx", "src/components/daily-log-page.tsx", "src/components/daily-log", "src/lib/daily-log.ts", "src/lib/types.ts"],
          dependencies: ["application-foundation", "firebase-auth-boundary", "firestore-data-boundary", "date-utilities", "unit-utilities", "navigation-guard"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-01",
          sourceRefs: [dailyLogPr, navGuardPr],
          verification: [{ label: "Unsaved-change guard", status: "present", path: "src/components/navigation-guard.tsx" }],
          position: { x: 390, y: 325, width: 240, height: 88 }
        })
      }
    ],
    knownLimitations: ["Back/forward browser history and sign-out dirty-edit behavior remained intentionally out of scope."]
  },
  {
    id: "2026-08-04-environment-split",
    date: "2026-08-04",
    title: "Firebase environment split and Tailwind v4",
    summary:
      "Development and production Firebase projects were separated, deployment scripts were added, and Tailwind moved to CSS-first v4 configuration.",
    changeType: "modified",
    milestone: "Phase 0 foundation hardening",
    sourceRefs: [firebaseSplitPr, decision("D-010 - Tailwind v4 with CSS-first configuration"), decision("D-013 - Separate dev and prod Firebase projects; rules deploy from the repo")],
    changes: [
      {
        operation: "modified",
        elementId: "application-foundation",
        summary: "Tailwind v4 CSS-first configuration replaced the previous config file.",
        element: element({
          id: "application-foundation",
          name: "Application foundation",
          category: "foundation",
          filter: "shared-architecture",
          status: "implemented",
          feature: "Core app setup",
          responsibility: "Hosts the App Router application, root layout, global styling, manifest metadata, and installed-app baseline.",
          paths: ["src/app/layout.tsx", "src/app/page.tsx", "src/app/globals.css", "public/manifest.webmanifest", "next.config.ts"],
          dependencies: [],
          introduced: "2026-07-31",
          lastChanged: "2026-08-04",
          sourceRefs: [initialPr, firebaseSplitPr],
          verification: [{ label: "Side-by-side render comparison", status: "passed", detail: "Recorded in CURRENT_STATE.md for Tailwind v4 upgrade." }],
          position: { x: 120, y: 500, width: 520, height: 62 }
        })
      },
      {
        operation: "added",
        elementId: "environment-boundary",
        summary: "Split Firebase dev and production projects and added explicit deploy scripts.",
        element: element({
          id: "environment-boundary",
          name: "Environment boundary",
          category: "safety",
          filter: "infrastructure",
          status: "implemented",
          feature: "Dev/prod separation",
          responsibility: "Prevents local, preview, and agent sessions from using production Firebase resources and routes Firestore Rules deploys through explicit npm scripts.",
          paths: [".firebaserc", ".env.example", "scripts/setup-env.mjs", "package.json", "docs/project/WORKFLOW.md"],
          dependencies: ["firebase-auth-boundary", "firestore-data-boundary"],
          introduced: "2026-08-04",
          lastChanged: "2026-08-05",
          sourceRefs: [firebaseSplitPr, envIdentityPr, decision("D-013 - Separate dev and prod Firebase projects; rules deploy from the repo")],
          verification: [
            { label: "Rules deploy scripts", status: "present", path: "package.json" },
            { label: "Production auth smoke test", status: "passed", detail: "Production repointed to project99live and verified." }
          ],
          position: { x: 425, y: 92, width: 245, height: 70 }
        })
      }
    ],
    knownLimitations: ["The superseded Firebase project still exists but nothing points at it."]
  },
  {
    id: "2026-08-05-workout-engine",
    date: "2026-08-05",
    title: "Workout engine foundation",
    summary:
      "The first workout-engine slice added active workout logging, exercise snapshots, previous-session context, volume, estimated 1RM, and Daily Log linking.",
    changeType: "added",
    milestone: "Phase 1B workout engine",
    sourceRefs: [workoutPr, githubIssue(21, "Phase 1B workout-engine foundation"), decision("D-014 - Workout sessions are immutable exercise snapshots with Epley estimates")],
    changes: [
      {
        operation: "added",
        elementId: "workout-wing",
        summary: "Added the active workout logger and workout domain logic.",
        element: element({
          id: "workout-wing",
          name: "Workout wing",
          category: "product",
          filter: "product",
          status: "implemented",
          feature: "Workout engine",
          responsibility: "Records active gym sessions with exercise snapshots, warm-up and working sets, RPE, previous context, volume, estimated 1RM, and completion flow.",
          paths: ["src/app/workouts/page.tsx", "src/components/workout-page.tsx", "src/lib/workout.ts", "src/lib/workout.test.ts"],
          dependencies: ["application-foundation", "firebase-auth-boundary", "firestore-data-boundary", "navigation-guard", "daily-log-core"],
          introduced: "2026-08-05",
          lastChanged: "2026-08-05",
          sourceRefs: [workoutPr, decision("D-014 - Workout sessions are immutable exercise snapshots with Epley estimates")],
          verification: [
            { label: "Workout domain tests", status: "passed", path: "src/lib/workout.test.ts" },
            { label: "Firestore Rules coverage", status: "passed", path: "tests/firestore.rules.test.ts" }
          ],
          position: { x: 420, y: 230, width: 220, height: 78 }
        })
      },
      {
        operation: "modified",
        elementId: "daily-log-core",
        summary: "Daily Logs gained a nullable workoutSessionId link to completed sessions.",
        element: element({
          id: "daily-log-core",
          name: "Daily Log core",
          category: "core",
          filter: "product",
          status: "implemented",
          feature: "Daily Log",
          responsibility: "Stores and edits the dated source of truth that connects health behavior, outcomes, and linked workout sessions.",
          paths: ["src/app/log/page.tsx", "src/components/daily-log-page.tsx", "src/components/daily-log", "src/lib/daily-log.ts", "src/lib/types.ts"],
          dependencies: ["application-foundation", "firebase-auth-boundary", "firestore-data-boundary", "date-utilities", "unit-utilities", "navigation-guard", "workout-wing"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-05",
          sourceRefs: [dailyLogPr, navGuardPr, workoutPr],
          verification: [
            { label: "Daily Log workout link rules", status: "passed", path: "tests/firestore.rules.test.ts" },
            { label: "Workout completion write", status: "present", path: "src/lib/firestore.ts" }
          ],
          position: { x: 390, y: 325, width: 240, height: 88 }
        })
      }
    ],
    knownLimitations: ["Custom exercises, templates, PR definitions, and rest timers remain later Phase 1B slices."]
  },
  {
    id: "2026-08-05-environment-identity",
    date: "2026-08-05",
    title: "Fail-closed environment identity",
    summary:
      "Build-time and runtime validation began rejecting complete but wrong Firebase configurations.",
    changeType: "reinforced",
    milestone: "Phase 0 foundation hardening",
    sourceRefs: [envIdentityPr, githubIssue(23, "Firebase environment identity guard"), decision("D-015 - Builds enforce Firebase environment identity")],
    changes: [
      {
        operation: "reinforced",
        elementId: "environment-boundary",
        summary: "Added NEXT_PUBLIC_APP_ENV validation and Vercel environment checks.",
        element: element({
          id: "environment-boundary",
          name: "Environment boundary",
          category: "safety",
          filter: "infrastructure",
          status: "implemented",
          feature: "Dev/prod separation",
          responsibility: "Prevents local, preview, and agent sessions from using production Firebase resources and routes Firestore Rules deploys through explicit npm scripts.",
          paths: [".firebaserc", ".env.example", "scripts/setup-env.mjs", "src/lib/firebase-config.ts", "next.config.ts", "package.json"],
          dependencies: ["firebase-auth-boundary", "firestore-data-boundary"],
          introduced: "2026-08-04",
          lastChanged: "2026-08-05",
          sourceRefs: [firebaseSplitPr, envIdentityPr, decision("D-015 - Builds enforce Firebase environment identity")],
          verification: [
            { label: "Firebase config unit tests", status: "passed", path: "src/lib/firebase-config.test.ts" },
            { label: "Production bundle smoke test", status: "passed", detail: "Redeployed without stale build cache and verified against project99live." }
          ],
          position: { x: 425, y: 92, width: 245, height: 70 }
        })
      },
      {
        operation: "modified",
        elementId: "firebase-auth-boundary",
        summary: "Auth configuration became tied to explicit dev or production environment identity.",
        element: element({
          id: "firebase-auth-boundary",
          name: "Authentication boundary",
          category: "foundation",
          filter: "data-security",
          status: "implemented",
          feature: "Google authentication",
          responsibility: "Keeps app data behind authenticated Firebase users and initializes Firebase client services from environment configuration.",
          paths: ["src/components/auth-provider.tsx", "src/lib/firebase.ts", "src/lib/firebase-config.ts"],
          dependencies: ["application-foundation", "environment-boundary"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-05",
          sourceRefs: [initialPr, envIdentityPr],
          verification: [{ label: "Environment identity tests", status: "passed", path: "src/lib/firebase-config.test.ts" }],
          position: { x: 670, y: 500, width: 310, height: 62 }
        })
      }
    ],
    knownLimitations: []
  },
  {
    id: "2026-08-07-rules-tests-and-foundation-closure",
    date: "2026-08-07",
    title: "Security tests and Phase 0 closure",
    summary:
      "Firestore Rules gained emulator-backed tests, pending foundation issues closed, monitoring shipped, installed PWA auth was verified, and Phase 0 closed.",
    changeType: "verified",
    milestone: "Phase 0 closed",
    sourceRefs: [rulesTestsPr, foundationClosurePr, phaseZeroPr, decision("D-016 - Optional Sentry monitoring without default PII"), decision("D-017 - Redirect authentication for installed PWAs")],
    changes: [
      {
        operation: "verified",
        elementId: "quality-gate-system",
        summary: "Rules tests joined the quality workflow and Phase 0 gates passed.",
        element: element({
          id: "quality-gate-system",
          name: "Quality gate system",
          category: "safety",
          filter: "tests-quality",
          status: "implemented",
          feature: "Automated verification",
          responsibility: "Runs lint, typecheck, unit tests, rules tests, and production builds through portable npm scripts and GitHub Actions.",
          paths: ["package.json", ".github/workflows/quality.yml", "src/lib/*.test.ts", "tests/firestore.rules.test.ts"],
          dependencies: ["project-bedrock", "application-foundation", "firestore-data-boundary"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-07",
          sourceRefs: [hardeningPr, rulesTestsPr, phaseZeroPr],
          verification: [
            { label: "npm run lint", status: "passed", detail: "Passed during Phase 0 verification." },
            { label: "npm run typecheck", status: "passed", detail: "Passed during Phase 0 verification." },
            { label: "npm test", status: "passed", detail: "Passed during Phase 0 verification." },
            { label: "npm run test:rules", status: "passed", detail: "Passed during Phase 0 verification." },
            { label: "npm run build", status: "passed", detail: "Passed during Phase 0 verification." }
          ],
          position: { x: 165, y: 92, width: 240, height: 70 }
        })
      },
      {
        operation: "reinforced",
        elementId: "firestore-data-boundary",
        summary: "Rules now validate profile, settings, Daily Log, and workout-session ownership and schemas.",
        element: element({
          id: "firestore-data-boundary",
          name: "Firestore data boundary",
          category: "frame",
          filter: "data-security",
          status: "implemented",
          feature: "User-owned persistence",
          responsibility: "Centralizes client reads, subscriptions, writes, normalization, and error reporting for user-owned Firestore documents.",
          paths: ["src/lib/firestore.ts", "src/lib/types.ts", "firestore.rules", "tests/firestore.rules.test.ts"],
          dependencies: ["firebase-auth-boundary", "environment-boundary"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-07",
          sourceRefs: [initialPr, rulesAuditPr, rulesTestsPr, foundationClosurePr],
          verification: [
            { label: "Cross-user denial tests", status: "passed", path: "tests/firestore.rules.test.ts" },
            { label: "Schema validation rules", status: "passed", path: "firestore.rules" }
          ],
          position: { x: 680, y: 400, width: 245, height: 78 }
        })
      },
      {
        operation: "added",
        elementId: "monitoring-reinforcement",
        summary: "Optional Sentry monitoring captures failures without default PII or health payloads.",
        element: element({
          id: "monitoring-reinforcement",
          name: "Monitoring reinforcement",
          category: "safety",
          filter: "infrastructure",
          status: "implemented",
          feature: "Operational visibility",
          responsibility: "Captures client, error-boundary, auth, and Firestore failures when a Sentry DSN is configured, without default PII or health-record payloads.",
          paths: ["src/lib/monitoring.ts", "src/app/error.tsx", "src/app/global-error.tsx", "src/instrumentation-client.ts"],
          dependencies: ["application-foundation", "firestore-data-boundary"],
          introduced: "2026-08-07",
          lastChanged: "2026-08-07",
          sourceRefs: [foundationClosurePr, decision("D-016 - Optional Sentry monitoring without default PII")],
          verification: [{ label: "Sentry delivery", status: "passed", detail: "Owner runtime QA verified Sentry delivery during Phase 0 closure." }],
          limitations: ["Monitoring is disabled when NEXT_PUBLIC_SENTRY_DSN is absent."],
          position: { x: 705, y: 155, width: 245, height: 58 }
        })
      },
      {
        operation: "verified",
        elementId: "pwa-delivery-shell",
        summary: "Installed iOS PWA auth, icon rendering, service-worker assets, and production reachability passed.",
        element: element({
          id: "pwa-delivery-shell",
          name: "PWA delivery shell",
          category: "delivery",
          filter: "infrastructure",
          status: "implemented",
          feature: "Installable PWA",
          responsibility: "Provides manifest, icons, service worker update behavior, and production static assets for installed-app use.",
          paths: ["public/manifest.webmanifest", "public/sw.js", "public/icon-192.png", "public/icon-512.png", "public/apple-touch-icon.png", "src/components/pwa-register.tsx", "src/lib/auth-mode.ts"],
          dependencies: ["application-foundation", "firebase-auth-boundary"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-07",
          sourceRefs: [hardeningPr, foundationClosurePr, phaseZeroPr, decision("D-017 - Redirect authentication for installed PWAs")],
          verification: [
            { label: "Auth mode tests", status: "passed", path: "src/lib/auth-mode.test.ts" },
            { label: "Installed iOS PWA QA", status: "passed", detail: "Sign-in, session restoration, and icon rendering passed on 2026-08-07." }
          ],
          position: { x: 700, y: 66, width: 235, height: 72 }
        })
      }
    ],
    knownLimitations: ["Agent workspaces still need local Firebase environment values before authenticated runtime behavior can be exercised there."]
  },
  {
    id: "2026-08-08-ios-pwa-auth-proxy",
    date: "2026-08-08",
    title: "Installed iOS PWA auth proxy repair",
    summary:
      "Production Google redirect auth was repaired for installed iOS PWAs by using the app host as the client auth domain and proxying Firebase auth helper routes through Next.js.",
    changeType: "repaired",
    milestone: "Phase 0 production auth repair",
    sourceRefs: [pwaAuthFixPr, decision("D-017 - Redirect authentication for installed PWAs")],
    changes: [
      {
        operation: "repaired",
        elementId: "pwa-delivery-shell",
        summary: "Installed PWA redirect auth now avoids third-party Firebase helper storage paths in production.",
        element: element({
          id: "pwa-delivery-shell",
          name: "PWA delivery shell",
          category: "delivery",
          filter: "infrastructure",
          status: "implemented",
          feature: "Installable PWA",
          responsibility: "Provides manifest, icons, service worker behavior, first-party auth helper routing, and production static assets for installed-app use.",
          paths: ["public/manifest.webmanifest", "public/sw.js", "public/icon-192.png", "public/icon-512.png", "public/apple-touch-icon.png", "src/components/pwa-register.tsx", "src/lib/auth-mode.ts", "next.config.ts"],
          dependencies: ["application-foundation", "firebase-auth-boundary", "environment-boundary"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-08",
          sourceRefs: [hardeningPr, foundationClosurePr, phaseZeroPr, pwaAuthFixPr, decision("D-017 - Redirect authentication for installed PWAs")],
          verification: [
            { label: "Auth mode tests", status: "passed", path: "src/lib/auth-mode.test.ts" },
            { label: "First-party auth proxy tests", status: "passed", path: "src/lib/firebase-config.test.ts" },
            { label: "Service worker auth bypass", status: "present", path: "public/sw.js" }
          ],
          position: { x: 700, y: 66, width: 235, height: 72 }
        })
      },
      {
        operation: "modified",
        elementId: "firebase-auth-boundary",
        summary: "Production client auth domain selection now uses the deployed HTTPS app host when appropriate.",
        element: element({
          id: "firebase-auth-boundary",
          name: "Authentication boundary",
          category: "foundation",
          filter: "data-security",
          status: "implemented",
          feature: "Google authentication",
          responsibility: "Keeps app data behind authenticated Firebase users and initializes Firebase client services from coherent environment configuration and first-party production auth routing.",
          paths: ["src/components/auth-provider.tsx", "src/lib/firebase.ts", "src/lib/firebase-config.ts", "next.config.ts"],
          dependencies: ["application-foundation", "environment-boundary"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-08",
          sourceRefs: [initialPr, envIdentityPr, pwaAuthFixPr],
          verification: [
            { label: "Firebase client auth-domain tests", status: "passed", path: "src/lib/firebase-config.test.ts" },
            { label: "Production redirect URI requirement", status: "present", path: "docs/project/CURRENT_STATE.md" }
          ],
          position: { x: 670, y: 500, width: 310, height: 62 }
        })
      }
    ],
    knownLimitations: ["Production Google OAuth settings must keep the assigned app-domain redirect URI authorized."]
  },
  {
    id: "2026-08-08-architecture-observatory",
    date: "2026-08-08",
    title: "Architecture Observatory",
    summary:
      "Project99 gained an internal architecture-history route, a strict event ledger, deterministic generation scripts, freshness checking, and update documentation.",
    changeType: "added",
    milestone: "Internal engineering tooling",
    sourceRefs: [githubIssue(35, "Build Project99 Architecture Observatory"), observatoryPr, decision("D-018 - Architecture history uses a versioned event ledger")],
    changes: [
      {
        operation: "added",
        elementId: "architecture-observatory",
        summary: "Added the internal building visualization and the reviewable ledger that drives it.",
        element: element({
          id: "architecture-observatory",
          name: "Architecture Observatory",
          category: "safety",
          filter: "tests-quality",
          status: "implemented",
          feature: "Architecture history",
          responsibility: "Shows Project99 architecture as a historical, evidence-backed building and checks that relevant future changes update the ledger or document an exception.",
          paths: [
            "src/app/architecture/page.tsx",
            "src/components/architecture-observatory.tsx",
            "src/data/architecture-events.ts",
            "src/lib/architecture-observatory.ts",
            "scripts/architecture",
            "docs/architecture/observatory.md"
          ],
          dependencies: ["project-bedrock", "quality-gate-system", "application-foundation"],
          introduced: "2026-08-08",
          lastChanged: "2026-08-08",
          sourceRefs: [githubIssue(35, "Build Project99 Architecture Observatory"), observatoryPr, decision("D-018 - Architecture history uses a versioned event ledger")],
          verification: [
            { label: "Architecture schema tests", status: "passed", path: "src/lib/architecture-observatory.test.ts" },
            { label: "Freshness check", status: "passed", detail: "npm run architecture:check validates generated data and watched-path updates." },
            { label: "Static internal route", status: "present", path: "src/app/architecture/page.tsx" }
          ],
          limitations: ["The final merge commit is unavailable until this branch is merged."],
          position: { x: 435, y: 20, width: 250, height: 58 }
        })
      },
      {
        operation: "reinforced",
        elementId: "quality-gate-system",
        summary: "Added observatory-specific generation and freshness scripts to the portable npm script interface.",
        element: element({
          id: "quality-gate-system",
          name: "Quality gate system",
          category: "safety",
          filter: "tests-quality",
          status: "implemented",
          feature: "Automated verification",
          responsibility: "Runs lint, typecheck, unit tests, rules tests, production builds, and architecture observatory checks through portable npm scripts and GitHub Actions.",
          paths: ["package.json", ".github/workflows/quality.yml", "src/lib/*.test.ts", "tests/firestore.rules.test.ts", "scripts/architecture"],
          dependencies: ["project-bedrock", "application-foundation", "firestore-data-boundary", "architecture-observatory"],
          introduced: "2026-08-01",
          lastChanged: "2026-08-08",
          sourceRefs: [hardeningPr, rulesTestsPr, phaseZeroPr, githubIssue(35, "Build Project99 Architecture Observatory"), observatoryPr, decision("D-018 - Architecture history uses a versioned event ledger")],
          verification: [
            { label: "npm run architecture:generate", status: "passed", detail: "Generated the deterministic observatory data artifact." },
            { label: "npm run architecture:check", status: "passed", detail: "Validated generated freshness and watched-path coverage." }
          ],
          position: { x: 165, y: 92, width: 240, height: 70 }
        })
      }
    ],
    knownLimitations: ["The final merge commit is unavailable until this branch is merged."]
  },
  {
    id: "2026-08-08-calm-daily-experience",
    date: "2026-08-08",
    title: "Calm daily experience model",
    summary:
      "The authenticated product shifted from a dashboard-plus-form structure to a focused Today surface, global Quick Log action, Progress destination, More destination, and transaction-safe Daily Log mutations.",
    changeType: "modified",
    milestone: "Phase 1A daily operating system",
    sourceRefs: [githubIssue(37, "Implement calm daily experience redesign"), decision("D-019 - Today and Quick Log are the primary daily interaction model")],
    changes: [
      {
        operation: "modified",
        elementId: "dashboard-wing",
        summary: "Dashboard became the Today experience with a single data-driven Up next action.",
        element: element({
          id: "dashboard-wing",
          name: "Today wing",
          category: "product",
          filter: "interface",
          status: "implemented",
          feature: "Today",
          responsibility: "Shows local date context, one adaptive focus action, compact daily progress, and truthful logged signals without exposing the complete Daily Log form.",
          paths: ["src/app/dashboard/page.tsx", "src/components/dashboard-page.tsx", "src/lib/today.ts"],
          dependencies: ["application-foundation", "daily-log-core", "settings-utilities", "workout-wing", "today-data-boundary", "quick-log-sheet"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-08",
          sourceRefs: [githubIssue(37, "Implement calm daily experience redesign"), decision("D-019 - Today and Quick Log are the primary daily interaction model")],
          verification: [
            { label: "Today focus tests", status: "passed", path: "src/lib/today.test.ts" },
            { label: "Production build", status: "passed", detail: "npm run build passed during issue #37 implementation." }
          ],
          position: { x: 160, y: 250, width: 180, height: 78 }
        })
      },
      {
        operation: "added",
        elementId: "today-data-boundary",
        summary: "Added a narrow shared client boundary for today's log, settings, and active workout.",
        element: element({
          id: "today-data-boundary",
          name: "Today data boundary",
          category: "frame",
          filter: "product",
          status: "implemented",
          feature: "Today and Quick Log shared reads",
          responsibility: "Shares today's Daily Log, settings, loading/error state, and active workout between Today and Quick Log without moving route-specific history into global state.",
          paths: ["src/components/today-data-provider.tsx", "src/components/authenticated-shell.tsx"],
          dependencies: ["firebase-auth-boundary", "firestore-data-boundary", "daily-log-core", "workout-wing"],
          introduced: "2026-08-08",
          lastChanged: "2026-08-08",
          sourceRefs: [githubIssue(37, "Implement calm daily experience redesign")],
          verification: [{ label: "Strict TypeScript", status: "passed", detail: "npm run typecheck passed during issue #37 implementation." }],
          position: { x: 380, y: 235, width: 230, height: 60 }
        })
      },
      {
        operation: "added",
        elementId: "quick-log-sheet",
        summary: "Added the global Quick Log action backed by validated Daily Log transactions.",
        element: element({
          id: "quick-log-sheet",
          name: "Quick Log sheet",
          category: "product",
          filter: "interface",
          status: "implemented",
          feature: "Quick Log",
          responsibility: "Lets authenticated users record frequent Daily Log fields through focused dialog editors and transaction-safe writes that preserve unrelated fields.",
          paths: ["src/components/quick-log/quick-log-provider.tsx", "src/lib/daily-log.ts", "src/lib/firestore.ts", "src/lib/daily-log.test.ts"],
          dependencies: ["today-data-boundary", "daily-log-core", "firestore-data-boundary", "navigation-guard"],
          introduced: "2026-08-08",
          lastChanged: "2026-08-08",
          sourceRefs: [githubIssue(37, "Implement calm daily experience redesign"), decision("D-019 - Today and Quick Log are the primary daily interaction model")],
          verification: [
            { label: "Daily Log mutation tests", status: "passed", path: "src/lib/daily-log.test.ts" },
            { label: "Firestore rules suite", status: "passed", path: "tests/firestore.rules.test.ts" }
          ],
          position: { x: 635, y: 235, width: 220, height: 60 }
        })
      },
      {
        operation: "modified",
        elementId: "firestore-data-boundary",
        summary: "Daily Log writes gained a focused transaction mutation path for Quick Log.",
        element: element({
          id: "firestore-data-boundary",
          name: "Firestore data boundary",
          category: "frame",
          filter: "data-security",
          status: "implemented",
          feature: "User-owned persistence",
          responsibility: "Centralizes client reads, subscriptions, writes, transactions, normalization, and error reporting for user-owned Firestore documents.",
          paths: ["src/lib/firestore.ts", "src/lib/daily-log.ts", "src/lib/types.ts", "firestore.rules"],
          dependencies: ["firebase-auth-boundary"],
          introduced: "2026-07-31",
          lastChanged: "2026-08-08",
          sourceRefs: [githubIssue(37, "Implement calm daily experience redesign"), decision("D-019 - Today and Quick Log are the primary daily interaction model")],
          verification: [
            { label: "Owner-only rules", status: "passed", path: "firestore.rules" },
            { label: "Rules emulator tests", status: "passed", path: "tests/firestore.rules.test.ts" }
          ],
          position: { x: 680, y: 400, width: 245, height: 78 }
        })
      }
    ],
    knownLimitations: ["Agent workspace screenshots were limited to unauthenticated/configuration states because local Firebase environment values were not present."]
  },
  {
    id: "2026-08-08-workout-nutrition-components",
    date: "2026-08-08",
    title: "Workout templates and first-party nutrition",
    summary: "Project99 gained owner-scoped reusable workout definitions/templates and fast, date-scoped nutrition logging that complements the Daily Log manual adjustment.",
    changeType: "added",
    milestone: "Phase 1B–1C components",
    sourceRefs: [decision("D-001 - Daily Log is the central dated record"), decision("D-004 - Internal food database")],
    changes: [
      {
        operation: "added",
        elementId: "nutrition-wing",
        summary: "Added date-scoped food logging with quantity edits, favourites, recents, saved meals, and snapshot-based copying.",
        element: element({
          id: "nutrition-wing", name: "Nutrition wing", category: "product", filter: "product", status: "implemented", feature: "First-party nutrition",
          responsibility: "Stores user-created food snapshots and dated meal entries, exposes fast per-meal capture and copying, then combines their derived values with the Daily Log manual nutrition adjustment.",
          paths: ["src/app/nutrition/page.tsx", "src/components/nutrition-page.tsx", "src/lib/nutrition.ts", "src/lib/types.ts"],
          dependencies: ["daily-log-core", "firestore-data-boundary", "today-data-boundary"], introduced: "2026-08-08", lastChanged: "2026-08-08",
          sourceRefs: [decision("D-001 - Daily Log is the central dated record"), decision("D-004 - Internal food database")],
          verification: [{ label: "Nutrition projection tests", status: "passed", path: "src/lib/nutrition.test.ts" }, { label: "Rules emulator tests", status: "passed", path: "tests/firestore.rules.test.ts" }],
          limitations: ["Curated foods, barcode scanning, imports, and recipe-builder workflows remain deferred."], position: { x: 960, y: 250, width: 210, height: 80 }
        })
      },
      {
        operation: "modified",
        elementId: "workout-wing",
        summary: "Extended active workouts with template snapshots, custom exercises, local rest timing, and recent history context.",
        element: element({
          id: "workout-wing", name: "Workout wing", category: "product", filter: "product", status: "implemented", feature: "Workout engine",
          responsibility: "Runs active sessions and reusable workout definitions while keeping each started session independent from future template edits.",
          paths: ["src/components/workout-page.tsx", "src/lib/workout.ts", "src/lib/types.ts"],
          dependencies: ["daily-log-core", "firestore-data-boundary"], introduced: "2026-08-05", lastChanged: "2026-08-08",
          sourceRefs: [workoutPr], verification: [{ label: "Workout unit tests", status: "passed", path: "src/lib/workout.test.ts" }],
          limitations: ["Workout template editing and full exercise-history routes remain incremental follow-up work."], position: { x: 160, y: 120, width: 210, height: 78 }
        })
      },
      {
        operation: "modified",
        elementId: "firestore-data-boundary",
        summary: "Extended owner-scoped Firestore collections and Rules for workout definitions, templates, foods, meals, and entries.",
        element: element({
          id: "firestore-data-boundary", name: "Firestore data boundary", category: "frame", filter: "data-security", status: "implemented", feature: "User-owned persistence",
          responsibility: "Centralizes persistence and owner-only validation for dated logs plus independent workout and nutrition definitions.",
          paths: ["src/lib/firestore.ts", "src/lib/types.ts", "firestore.rules", "tests/firestore.rules.test.ts"],
          dependencies: ["firebase-auth-boundary"], introduced: "2026-07-31", lastChanged: "2026-08-08",
          sourceRefs: [rulesTestsPr], verification: [{ label: "Rules emulator tests", status: "passed", path: "tests/firestore.rules.test.ts" }], position: { x: 680, y: 400, width: 245, height: 78 }
        })
      }
    ],
    knownLimitations: ["Authenticated runtime QA requires the project dev Firebase environment and is not available in this workspace."]
  }
];
