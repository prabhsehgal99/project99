import type { ArchitectureEvent } from "@/lib/architecture-observatory";

export const architectureObservatoryGeneratedAt = "generated-by-npm-run-architecture-generate";

export const architectureObservatoryEvents =
[
  {
    "changeType": "added",
    "changes": [
      {
        "element": {
          "category": "foundation",
          "dependencies": [],
          "feature": "Core app setup",
          "filter": "shared-architecture",
          "id": "application-foundation",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Application foundation",
          "paths": [
            "src/app/layout.tsx",
            "src/app/page.tsx",
            "src/app/globals.css",
            "public/manifest.webmanifest",
            "next.config.ts"
          ],
          "position": {
            "height": 62,
            "width": 520,
            "x": 120,
            "y": 500
          },
          "responsibility": "Hosts the App Router application, root layout, global styling, manifest metadata, and installed-app baseline.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Verified during Phase 0 closure.",
              "label": "Production build",
              "status": "passed"
            },
            {
              "detail": "Production site returned HTTP 200 on 2026-08-07.",
              "label": "Public production reachability",
              "status": "passed"
            }
          ]
        },
        "elementId": "application-foundation",
        "operation": "added",
        "summary": "Created the core Next.js App Router, React, strict TypeScript, Tailwind, and PWA shell."
      },
      {
        "element": {
          "category": "foundation",
          "dependencies": [
            "application-foundation"
          ],
          "feature": "Google authentication",
          "filter": "data-security",
          "id": "firebase-auth-boundary",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Authentication boundary",
          "paths": [
            "src/components/auth-provider.tsx",
            "src/lib/firebase.ts",
            "src/lib/firebase-config.ts"
          ],
          "position": {
            "height": 62,
            "width": 310,
            "x": 670,
            "y": 500
          },
          "responsibility": "Keeps app data behind authenticated Firebase users and initializes Firebase client services from environment configuration.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "905f5e7509a11c567ac9213b6492311596c7062d",
              "label": "PR #24: Enforce Firebase dev and production environment identity",
              "pullRequest": 24,
              "url": "https://github.com/prabhsehgal99/project99/pull/24"
            },
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Chrome, Safari, and installed iOS PWA sign-in passed during Phase 0 closure.",
              "label": "Google Sign-In runtime QA",
              "status": "passed"
            },
            {
              "label": "Google-only decision",
              "path": "docs/project/DECISIONS.md",
              "status": "present"
            }
          ]
        },
        "elementId": "firebase-auth-boundary",
        "operation": "added",
        "summary": "Added Google-authenticated access and Firebase client setup."
      },
      {
        "element": {
          "category": "product",
          "dependencies": [
            "application-foundation",
            "daily-log-core",
            "settings-utilities"
          ],
          "feature": "Dashboard",
          "filter": "interface",
          "id": "dashboard-wing",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-01",
          "limitations": [],
          "name": "Dashboard wing",
          "paths": [
            "src/app/dashboard/page.tsx",
            "src/components/dashboard-page.tsx"
          ],
          "position": {
            "height": 78,
            "width": 180,
            "x": 160,
            "y": 250
          },
          "responsibility": "Summarizes today's Daily Log, recent weight, goals, hydration, nutrition, and habit streak without becoming a second editor.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Covered by production build and Phase 0 runtime QA.",
              "label": "Dashboard rendering",
              "status": "passed"
            }
          ]
        },
        "elementId": "dashboard-wing",
        "operation": "added",
        "summary": "Introduced the dashboard as the first summary surface."
      }
    ],
    "date": "2026-07-31",
    "id": "2026-07-31-initial-pwa-foundation",
    "knownLimitations": [
      "Early repository history before PR #1 is unavailable beyond the initial commit and merged PR metadata."
    ],
    "milestone": "Phase 0 foundation",
    "sourceRefs": [
      {
        "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
        "label": "PR #1: Build Project 99 fitness PWA",
        "pullRequest": 1,
        "url": "https://github.com/prabhsehgal99/project99/pull/1"
      }
    ],
    "summary": "Project99 began as a mobile-first Next.js PWA with Google authentication, Firebase-backed user documents, a dashboard, and first Daily Log surface.",
    "title": "Initial authenticated PWA foundation"
  },
  {
    "changeType": "added",
    "changes": [
      {
        "element": {
          "category": "bedrock",
          "dependencies": [],
          "feature": "Engineering operating system",
          "filter": "shared-architecture",
          "id": "project-bedrock",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Project bedrock",
          "paths": [
            "AGENTS.md",
            "PROJECT_CONTEXT.md",
            "docs/project/CURRENT_STATE.md",
            "docs/project/DECISIONS.md",
            "docs/project/WORKFLOW.md",
            "docs/project/ROADMAP.md"
          ],
          "position": {
            "height": 50,
            "width": 940,
            "x": 80,
            "y": 585
          },
          "responsibility": "Defines Project99 principles, current state, accepted decisions, roadmap boundaries, and cross-agent workflow.",
          "sourceRefs": [
            {
              "commit": "8472279f608709cefa56816d7aa8181174ab2392",
              "label": "PR #3: Add clean cross-device workflow bundle",
              "pullRequest": 3,
              "url": "https://github.com/prabhsehgal99/project99/pull/3"
            },
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Required reading",
              "path": "AGENTS.md",
              "status": "present"
            }
          ]
        },
        "elementId": "project-bedrock",
        "operation": "added",
        "summary": "Established the repository rulebook, current-state memory, decision log, workflow, and roadmap."
      },
      {
        "element": {
          "category": "product",
          "dependencies": [
            "project-bedrock",
            "daily-log-core"
          ],
          "feature": "Nutrition, measurements, recovery, insights, engagement, community",
          "filter": "product",
          "id": "future-phase-blueprints",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-07",
          "limitations": [
            "Blueprint areas are roadmap intent only; they do not indicate shipped screens or data models."
          ],
          "name": "Future phase blueprints",
          "paths": [
            "docs/project/ROADMAP.md",
            "PROJECT_CONTEXT.md"
          ],
          "position": {
            "height": 110,
            "width": 220,
            "x": 735,
            "y": 225
          },
          "responsibility": "Keeps approved future product areas visible as plans while separating them from shipped architecture.",
          "sourceRefs": [
            {
              "commit": "8472279f608709cefa56816d7aa8181174ab2392",
              "label": "PR #3: Add clean cross-device workflow bundle",
              "pullRequest": 3,
              "url": "https://github.com/prabhsehgal99/project99/pull/3"
            },
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            }
          ],
          "status": "planned",
          "verification": [
            {
              "label": "Roadmap status",
              "path": "docs/project/ROADMAP.md",
              "status": "planned"
            }
          ]
        },
        "elementId": "future-phase-blueprints",
        "operation": "added",
        "summary": "Recorded planned product phases without presenting them as implemented features."
      }
    ],
    "date": "2026-07-31",
    "id": "2026-07-31-project-bedrock",
    "knownLimitations": [],
    "milestone": "Phase 0 foundation",
    "sourceRefs": [
      {
        "commit": "8472279f608709cefa56816d7aa8181174ab2392",
        "label": "PR #3: Add clean cross-device workflow bundle",
        "pullRequest": 3,
        "url": "https://github.com/prabhsehgal99/project99/pull/3"
      },
      {
        "label": "D-007 - GitHub is the cross-tool source of truth",
        "url": "docs/project/DECISIONS.md"
      },
      {
        "label": "D-012 - AGENTS.md is the only rulebook",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "Project memory and workflow files became the cross-tool source of truth for planning, ownership, review, and handoff.",
    "title": "Portable project workflow bedrock"
  },
  {
    "changeType": "added",
    "changes": [
      {
        "element": {
          "category": "core",
          "dependencies": [
            "application-foundation",
            "firebase-auth-boundary",
            "firestore-data-boundary",
            "date-utilities",
            "unit-utilities"
          ],
          "feature": "Daily Log",
          "filter": "product",
          "id": "daily-log-core",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Daily Log core",
          "paths": [
            "src/app/log/page.tsx",
            "src/components/daily-log-page.tsx",
            "src/components/daily-log",
            "src/lib/daily-log.ts",
            "src/lib/types.ts"
          ],
          "position": {
            "height": 88,
            "width": 240,
            "x": 390,
            "y": 325
          },
          "responsibility": "Stores and edits the dated source of truth that connects health behavior, outcomes, and linked workout sessions.",
          "sourceRefs": [
            {
              "commit": "6ba57ae52585cb74d0334651476cacd085d66b92",
              "label": "PR #9: Build Daily Log vertical slice",
              "pullRequest": 9,
              "url": "https://github.com/prabhsehgal99/project99/pull/9"
            },
            {
              "commit": "c6c4369225be835c1e6d193704c54996da84d508",
              "label": "PR #19: Guard unsaved Daily Log edits on app-shell navigation",
              "pullRequest": 19,
              "url": "https://github.com/prabhsehgal99/project99/pull/19"
            },
            {
              "commit": "e4be0295255655d881ee33d96278fee0b69cb625",
              "label": "PR #22: Start workout engine foundation",
              "pullRequest": 22,
              "url": "https://github.com/prabhsehgal99/project99/pull/22"
            },
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Daily Log unit tests",
              "path": "src/lib/daily-log.test.ts",
              "status": "passed"
            },
            {
              "detail": "Verified during Phase 0 closure.",
              "label": "Production Firestore write",
              "status": "passed"
            }
          ]
        },
        "elementId": "daily-log-core",
        "operation": "added",
        "summary": "Built the date-addressed Daily Log editor and pure validation/serialization logic."
      },
      {
        "element": {
          "category": "frame",
          "dependencies": [
            "firebase-auth-boundary"
          ],
          "feature": "User-owned persistence",
          "filter": "data-security",
          "id": "firestore-data-boundary",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Firestore data boundary",
          "paths": [
            "src/lib/firestore.ts",
            "src/lib/types.ts",
            "firestore.rules"
          ],
          "position": {
            "height": 78,
            "width": 245,
            "x": 680,
            "y": 400
          },
          "responsibility": "Centralizes client reads, subscriptions, writes, normalization, and error reporting for user-owned Firestore documents.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "3400506043d532672a351eb30b820c2cd30a347b",
              "label": "PR #6: Document Firestore user data rules audit",
              "pullRequest": 6,
              "url": "https://github.com/prabhsehgal99/project99/pull/6"
            },
            {
              "commit": "6ba57ae52585cb74d0334651476cacd085d66b92",
              "label": "PR #9: Build Daily Log vertical slice",
              "pullRequest": 9,
              "url": "https://github.com/prabhsehgal99/project99/pull/9"
            },
            {
              "commit": "e4be0295255655d881ee33d96278fee0b69cb625",
              "label": "PR #22: Start workout engine foundation",
              "pullRequest": 22,
              "url": "https://github.com/prabhsehgal99/project99/pull/22"
            },
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Owner-only rules",
              "path": "firestore.rules",
              "status": "passed"
            },
            {
              "label": "Rules emulator tests",
              "path": "tests/firestore.rules.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "firestore-data-boundary",
        "operation": "added",
        "summary": "Added owner-scoped Firestore persistence functions for user documents and Daily Logs."
      }
    ],
    "date": "2026-07-31",
    "id": "2026-07-31-daily-log-core",
    "knownLimitations": [
      "Historical details for the first Daily Log slice are limited to merged PR metadata and committed project memory."
    ],
    "milestone": "Phase 1A daily operating system",
    "sourceRefs": [
      {
        "commit": "6ba57ae52585cb74d0334651476cacd085d66b92",
        "label": "PR #9: Build Daily Log vertical slice",
        "pullRequest": 9,
        "url": "https://github.com/prabhsehgal99/project99/pull/9"
      },
      {
        "label": "D-001 - Daily Log is the central dated record",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "The dated Daily Log became the central entity for body, nutrition, activity, recovery, habit, and journal data.",
    "title": "Daily Log central core"
  },
  {
    "changeType": "reinforced",
    "changes": [
      {
        "element": {
          "category": "utility",
          "dependencies": [
            "daily-log-core"
          ],
          "feature": "Measurement units",
          "filter": "shared-architecture",
          "id": "unit-utilities",
          "introduced": "2026-07-31",
          "lastChanged": "2026-07-31",
          "limitations": [],
          "name": "Unit utilities",
          "paths": [
            "src/lib/units.ts",
            "src/lib/units.test.ts",
            "docs/project/DECISIONS.md"
          ],
          "position": {
            "height": 58,
            "width": 165,
            "x": 155,
            "y": 430
          },
          "responsibility": "Keeps water conversion centralized and aligns body, gym, height, water, and energy units with accepted decisions.",
          "sourceRefs": [
            {
              "commit": "6fb851a2597555e878bbd752cc36c0f3de68e573",
              "label": "PR #4: Display water in litres while storing millilitres",
              "pullRequest": 4,
              "url": "https://github.com/prabhsehgal99/project99/pull/4"
            },
            {
              "label": "D-006 - Current measurement units",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Unit conversion tests",
              "path": "src/lib/units.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "unit-utilities",
        "operation": "added",
        "summary": "Centralized litres-to-millilitres conversion and unit expectations."
      },
      {
        "element": {
          "category": "frame",
          "dependencies": [
            "firebase-auth-boundary"
          ],
          "feature": "User-owned persistence",
          "filter": "data-security",
          "id": "firestore-data-boundary",
          "introduced": "2026-07-31",
          "lastChanged": "2026-07-31",
          "limitations": [],
          "name": "Firestore data boundary",
          "paths": [
            "src/lib/firestore.ts",
            "src/lib/types.ts",
            "firestore.rules"
          ],
          "position": {
            "height": 78,
            "width": 245,
            "x": 680,
            "y": 400
          },
          "responsibility": "Centralizes client reads, subscriptions, writes, normalization, and error reporting for user-owned Firestore documents.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "3400506043d532672a351eb30b820c2cd30a347b",
              "label": "PR #6: Document Firestore user data rules audit",
              "pullRequest": 6,
              "url": "https://github.com/prabhsehgal99/project99/pull/6"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Rules audit",
              "path": "docs/project/CURRENT_STATE.md",
              "status": "present"
            },
            {
              "detail": "Dedicated rules tests had not shipped yet at this point.",
              "label": "Emulator tests",
              "status": "unknown"
            }
          ]
        },
        "elementId": "firestore-data-boundary",
        "operation": "reinforced",
        "summary": "Documented user-data rules expectations before emulator coverage existed."
      }
    ],
    "date": "2026-07-31",
    "id": "2026-07-31-units-and-rules-audit",
    "knownLimitations": [
      "The audit was documented before automated Firestore Rules tests were added."
    ],
    "milestone": "Phase 0 hardening",
    "sourceRefs": [
      {
        "commit": "6fb851a2597555e878bbd752cc36c0f3de68e573",
        "label": "PR #4: Display water in litres while storing millilitres",
        "pullRequest": 4,
        "url": "https://github.com/prabhsehgal99/project99/pull/4"
      },
      {
        "commit": "3400506043d532672a351eb30b820c2cd30a347b",
        "label": "PR #6: Document Firestore user data rules audit",
        "pullRequest": 6,
        "url": "https://github.com/prabhsehgal99/project99/pull/6"
      },
      {
        "label": "D-006 - Current measurement units",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "Water display/storage rules and Firestore authorization expectations were clarified and reinforced.",
    "title": "Units and security audit reinforcement"
  },
  {
    "changeType": "reinforced",
    "changes": [
      {
        "element": {
          "category": "safety",
          "dependencies": [
            "project-bedrock",
            "application-foundation"
          ],
          "feature": "Automated verification",
          "filter": "tests-quality",
          "id": "quality-gate-system",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Quality gate system",
          "paths": [
            "package.json",
            ".github/workflows/quality.yml",
            "src/lib/*.test.ts",
            "tests/firestore.rules.test.ts"
          ],
          "position": {
            "height": 70,
            "width": 240,
            "x": 165,
            "y": 92
          },
          "responsibility": "Runs lint, typecheck, unit tests, rules tests, and production builds through portable npm scripts and GitHub Actions.",
          "sourceRefs": [
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "81bb7ab34cf28428aa13c2fd5a82c922006cd6dc",
              "label": "PR #27: Add emulator-backed Firestore rules tests",
              "pullRequest": 27,
              "url": "https://github.com/prabhsehgal99/project99/pull/27"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Phase 0 closure verified unit tests.",
              "label": "npm test",
              "status": "passed"
            },
            {
              "label": "Quality workflow",
              "path": ".github/workflows/quality.yml",
              "status": "passed"
            }
          ]
        },
        "elementId": "quality-gate-system",
        "operation": "added",
        "summary": "Added Vitest unit-test harness and CI quality workflow coverage for app checks."
      },
      {
        "element": {
          "category": "delivery",
          "dependencies": [
            "application-foundation"
          ],
          "feature": "Installable PWA",
          "filter": "infrastructure",
          "id": "pwa-delivery-shell",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "PWA delivery shell",
          "paths": [
            "public/manifest.webmanifest",
            "public/sw.js",
            "public/icon-192.png",
            "public/icon-512.png",
            "public/apple-touch-icon.png",
            "src/components/pwa-register.tsx"
          ],
          "position": {
            "height": 72,
            "width": 235,
            "x": 700,
            "y": 66
          },
          "responsibility": "Provides manifest, icons, service worker update behavior, and production static assets for installed-app use.",
          "sourceRefs": [
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Verified against production on 2026-08-07.",
              "label": "Manifest and icon HTTP 200",
              "status": "passed"
            },
            {
              "detail": "Owner runtime QA passed during Phase 0 closure.",
              "label": "Installed iOS PWA QA",
              "status": "passed"
            }
          ]
        },
        "elementId": "pwa-delivery-shell",
        "operation": "added",
        "summary": "Reworked PWA delivery behavior, icon assets, and static installability assets."
      },
      {
        "element": {
          "category": "utility",
          "dependencies": [
            "daily-log-core"
          ],
          "feature": "Local date keys",
          "filter": "shared-architecture",
          "id": "date-utilities",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-01",
          "limitations": [],
          "name": "Date utilities",
          "paths": [
            "src/lib/dates.ts",
            "src/lib/dates.test.ts"
          ],
          "position": {
            "height": 58,
            "width": 165,
            "x": 335,
            "y": 430
          },
          "responsibility": "Formats, parses, shifts, compares, and labels local YYYY-MM-DD keys without spreading date logic through UI components.",
          "sourceRefs": [
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Date utility tests",
              "path": "src/lib/dates.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "date-utilities",
        "operation": "added",
        "summary": "Kept local date handling and date-key validation in pure utility functions."
      },
      {
        "element": {
          "category": "product",
          "dependencies": [
            "application-foundation",
            "daily-log-core",
            "settings-utilities"
          ],
          "feature": "Dashboard",
          "filter": "interface",
          "id": "dashboard-wing",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-01",
          "limitations": [],
          "name": "Dashboard wing",
          "paths": [
            "src/app/dashboard/page.tsx",
            "src/components/dashboard-page.tsx"
          ],
          "position": {
            "height": 78,
            "width": 180,
            "x": 160,
            "y": 250
          },
          "responsibility": "Summarizes today's Daily Log, recent weight, goals, hydration, nutrition, and habit streak without becoming a second editor.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Habit streak unit coverage",
              "path": "src/lib/daily-log.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "dashboard-wing",
        "operation": "modified",
        "summary": "Reduced avoidable Firestore resubscriptions and corrected habit-streak display."
      }
    ],
    "date": "2026-08-01",
    "id": "2026-08-01-hardening-systems",
    "knownLimitations": [],
    "milestone": "Phase 0.5 hardening",
    "sourceRefs": [
      {
        "commit": "3d16f45287c8d10541177ec030c55e510587acca",
        "label": "PR #18: Phase 0.5 setup hardening",
        "pullRequest": 18,
        "url": "https://github.com/prabhsehgal99/project99/pull/18"
      },
      {
        "label": "D-008 - Dependencies are pinned; never latest",
        "url": "docs/project/DECISIONS.md"
      },
      {
        "label": "D-009 - Pure logic requires unit tests",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "The app gained repository roadmap memory, pinned dependencies, a safer service worker, unit-test harness, and Daily Log bug fixes.",
    "title": "Foundation hardening systems"
  },
  {
    "changeType": "repaired",
    "changes": [
      {
        "element": {
          "category": "utility",
          "dependencies": [
            "application-foundation",
            "daily-log-core"
          ],
          "feature": "Unsaved-change protection",
          "filter": "interface",
          "id": "navigation-guard",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-05",
          "limitations": [
            "Browser back/forward and sign-out dirty-edit interception are documented as unchanged behavior."
          ],
          "name": "Navigation guard",
          "paths": [
            "src/components/navigation-guard.tsx",
            "src/components/authenticated-shell.tsx",
            "src/components/daily-log-page.tsx",
            "src/components/workout-page.tsx"
          ],
          "position": {
            "height": 58,
            "width": 165,
            "x": 520,
            "y": 430
          },
          "responsibility": "Lets dirty editor screens present save, discard, or cancel choices before navigation changes route.",
          "sourceRefs": [
            {
              "commit": "c6c4369225be835c1e6d193704c54996da84d508",
              "label": "PR #19: Guard unsaved Daily Log edits on app-shell navigation",
              "pullRequest": 19,
              "url": "https://github.com/prabhsehgal99/project99/pull/19"
            },
            {
              "commit": "e4be0295255655d881ee33d96278fee0b69cb625",
              "label": "PR #22: Start workout engine foundation",
              "pullRequest": 22,
              "url": "https://github.com/prabhsehgal99/project99/pull/22"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Modified-click behavior preserved",
              "path": "src/components/authenticated-shell.tsx",
              "status": "present"
            }
          ]
        },
        "elementId": "navigation-guard",
        "operation": "added",
        "summary": "Added a shared guard that lets editing surfaces intercept app-shell navigation."
      },
      {
        "element": {
          "category": "core",
          "dependencies": [
            "application-foundation",
            "firebase-auth-boundary",
            "firestore-data-boundary",
            "date-utilities",
            "unit-utilities",
            "navigation-guard"
          ],
          "feature": "Daily Log",
          "filter": "product",
          "id": "daily-log-core",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-01",
          "limitations": [],
          "name": "Daily Log core",
          "paths": [
            "src/app/log/page.tsx",
            "src/components/daily-log-page.tsx",
            "src/components/daily-log",
            "src/lib/daily-log.ts",
            "src/lib/types.ts"
          ],
          "position": {
            "height": 88,
            "width": 240,
            "x": 390,
            "y": 325
          },
          "responsibility": "Stores and edits the dated source of truth that connects health behavior, outcomes, and linked workout sessions.",
          "sourceRefs": [
            {
              "commit": "6ba57ae52585cb74d0334651476cacd085d66b92",
              "label": "PR #9: Build Daily Log vertical slice",
              "pullRequest": 9,
              "url": "https://github.com/prabhsehgal99/project99/pull/9"
            },
            {
              "commit": "c6c4369225be835c1e6d193704c54996da84d508",
              "label": "PR #19: Guard unsaved Daily Log edits on app-shell navigation",
              "pullRequest": 19,
              "url": "https://github.com/prabhsehgal99/project99/pull/19"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Unsaved-change guard",
              "path": "src/components/navigation-guard.tsx",
              "status": "present"
            }
          ]
        },
        "elementId": "daily-log-core",
        "operation": "repaired",
        "summary": "Daily Log app-shell navigation no longer silently drops unsaved edits."
      }
    ],
    "date": "2026-08-01",
    "id": "2026-08-01-navigation-guard",
    "knownLimitations": [
      "Back/forward browser history and sign-out dirty-edit behavior remained intentionally out of scope."
    ],
    "milestone": "Phase 1A daily hardening",
    "sourceRefs": [
      {
        "commit": "c6c4369225be835c1e6d193704c54996da84d508",
        "label": "PR #19: Guard unsaved Daily Log edits on app-shell navigation",
        "pullRequest": 19,
        "url": "https://github.com/prabhsehgal99/project99/pull/19"
      },
      {
        "issue": 12,
        "label": "Issue #12: Protect unsaved Daily Log edits when navigating through app shell",
        "url": "https://github.com/prabhsehgal99/project99/issues/12"
      }
    ],
    "summary": "App-shell navigation began respecting dirty Daily Log edits through a shared navigation-guard context.",
    "title": "Navigation guard reinforcement"
  },
  {
    "changeType": "modified",
    "changes": [
      {
        "element": {
          "category": "foundation",
          "dependencies": [],
          "feature": "Core app setup",
          "filter": "shared-architecture",
          "id": "application-foundation",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-04",
          "limitations": [],
          "name": "Application foundation",
          "paths": [
            "src/app/layout.tsx",
            "src/app/page.tsx",
            "src/app/globals.css",
            "public/manifest.webmanifest",
            "next.config.ts"
          ],
          "position": {
            "height": 62,
            "width": 520,
            "x": 120,
            "y": 500
          },
          "responsibility": "Hosts the App Router application, root layout, global styling, manifest metadata, and installed-app baseline.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "2a07ff5699bf2d1e850934facc8358935a39a982",
              "label": "PR #20: Upgrade Tailwind v4, split Firebase projects, harden environment setup",
              "pullRequest": 20,
              "url": "https://github.com/prabhsehgal99/project99/pull/20"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Recorded in CURRENT_STATE.md for Tailwind v4 upgrade.",
              "label": "Side-by-side render comparison",
              "status": "passed"
            }
          ]
        },
        "elementId": "application-foundation",
        "operation": "modified",
        "summary": "Tailwind v4 CSS-first configuration replaced the previous config file."
      },
      {
        "element": {
          "category": "safety",
          "dependencies": [
            "firebase-auth-boundary",
            "firestore-data-boundary"
          ],
          "feature": "Dev/prod separation",
          "filter": "infrastructure",
          "id": "environment-boundary",
          "introduced": "2026-08-04",
          "lastChanged": "2026-08-05",
          "limitations": [],
          "name": "Environment boundary",
          "paths": [
            ".firebaserc",
            ".env.example",
            "scripts/setup-env.mjs",
            "package.json",
            "docs/project/WORKFLOW.md"
          ],
          "position": {
            "height": 70,
            "width": 245,
            "x": 425,
            "y": 92
          },
          "responsibility": "Prevents local, preview, and agent sessions from using production Firebase resources and routes Firestore Rules deploys through explicit npm scripts.",
          "sourceRefs": [
            {
              "commit": "2a07ff5699bf2d1e850934facc8358935a39a982",
              "label": "PR #20: Upgrade Tailwind v4, split Firebase projects, harden environment setup",
              "pullRequest": 20,
              "url": "https://github.com/prabhsehgal99/project99/pull/20"
            },
            {
              "commit": "905f5e7509a11c567ac9213b6492311596c7062d",
              "label": "PR #24: Enforce Firebase dev and production environment identity",
              "pullRequest": 24,
              "url": "https://github.com/prabhsehgal99/project99/pull/24"
            },
            {
              "label": "D-013 - Separate dev and prod Firebase projects; rules deploy from the repo",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Rules deploy scripts",
              "path": "package.json",
              "status": "present"
            },
            {
              "detail": "Production repointed to project99live and verified.",
              "label": "Production auth smoke test",
              "status": "passed"
            }
          ]
        },
        "elementId": "environment-boundary",
        "operation": "added",
        "summary": "Split Firebase dev and production projects and added explicit deploy scripts."
      }
    ],
    "date": "2026-08-04",
    "id": "2026-08-04-environment-split",
    "knownLimitations": [
      "The superseded Firebase project still exists but nothing points at it."
    ],
    "milestone": "Phase 0 foundation hardening",
    "sourceRefs": [
      {
        "commit": "2a07ff5699bf2d1e850934facc8358935a39a982",
        "label": "PR #20: Upgrade Tailwind v4, split Firebase projects, harden environment setup",
        "pullRequest": 20,
        "url": "https://github.com/prabhsehgal99/project99/pull/20"
      },
      {
        "label": "D-010 - Tailwind v4 with CSS-first configuration",
        "url": "docs/project/DECISIONS.md"
      },
      {
        "label": "D-013 - Separate dev and prod Firebase projects; rules deploy from the repo",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "Development and production Firebase projects were separated, deployment scripts were added, and Tailwind moved to CSS-first v4 configuration.",
    "title": "Firebase environment split and Tailwind v4"
  },
  {
    "changeType": "added",
    "changes": [
      {
        "element": {
          "category": "product",
          "dependencies": [
            "application-foundation",
            "firebase-auth-boundary",
            "firestore-data-boundary",
            "navigation-guard",
            "daily-log-core"
          ],
          "feature": "Workout engine",
          "filter": "product",
          "id": "workout-wing",
          "introduced": "2026-08-05",
          "lastChanged": "2026-08-05",
          "limitations": [],
          "name": "Workout wing",
          "paths": [
            "src/app/workouts/page.tsx",
            "src/components/workout-page.tsx",
            "src/lib/workout.ts",
            "src/lib/workout.test.ts"
          ],
          "position": {
            "height": 78,
            "width": 220,
            "x": 420,
            "y": 230
          },
          "responsibility": "Records active gym sessions with exercise snapshots, warm-up and working sets, RPE, previous context, volume, estimated 1RM, and completion flow.",
          "sourceRefs": [
            {
              "commit": "e4be0295255655d881ee33d96278fee0b69cb625",
              "label": "PR #22: Start workout engine foundation",
              "pullRequest": 22,
              "url": "https://github.com/prabhsehgal99/project99/pull/22"
            },
            {
              "label": "D-014 - Workout sessions are immutable exercise snapshots with Epley estimates",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Workout domain tests",
              "path": "src/lib/workout.test.ts",
              "status": "passed"
            },
            {
              "label": "Firestore Rules coverage",
              "path": "tests/firestore.rules.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "workout-wing",
        "operation": "added",
        "summary": "Added the active workout logger and workout domain logic."
      },
      {
        "element": {
          "category": "core",
          "dependencies": [
            "application-foundation",
            "firebase-auth-boundary",
            "firestore-data-boundary",
            "date-utilities",
            "unit-utilities",
            "navigation-guard",
            "workout-wing"
          ],
          "feature": "Daily Log",
          "filter": "product",
          "id": "daily-log-core",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-05",
          "limitations": [],
          "name": "Daily Log core",
          "paths": [
            "src/app/log/page.tsx",
            "src/components/daily-log-page.tsx",
            "src/components/daily-log",
            "src/lib/daily-log.ts",
            "src/lib/types.ts"
          ],
          "position": {
            "height": 88,
            "width": 240,
            "x": 390,
            "y": 325
          },
          "responsibility": "Stores and edits the dated source of truth that connects health behavior, outcomes, and linked workout sessions.",
          "sourceRefs": [
            {
              "commit": "6ba57ae52585cb74d0334651476cacd085d66b92",
              "label": "PR #9: Build Daily Log vertical slice",
              "pullRequest": 9,
              "url": "https://github.com/prabhsehgal99/project99/pull/9"
            },
            {
              "commit": "c6c4369225be835c1e6d193704c54996da84d508",
              "label": "PR #19: Guard unsaved Daily Log edits on app-shell navigation",
              "pullRequest": 19,
              "url": "https://github.com/prabhsehgal99/project99/pull/19"
            },
            {
              "commit": "e4be0295255655d881ee33d96278fee0b69cb625",
              "label": "PR #22: Start workout engine foundation",
              "pullRequest": 22,
              "url": "https://github.com/prabhsehgal99/project99/pull/22"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Daily Log workout link rules",
              "path": "tests/firestore.rules.test.ts",
              "status": "passed"
            },
            {
              "label": "Workout completion write",
              "path": "src/lib/firestore.ts",
              "status": "present"
            }
          ]
        },
        "elementId": "daily-log-core",
        "operation": "modified",
        "summary": "Daily Logs gained a nullable workoutSessionId link to completed sessions."
      }
    ],
    "date": "2026-08-05",
    "id": "2026-08-05-workout-engine",
    "knownLimitations": [
      "Custom exercises, templates, PR definitions, and rest timers remain later Phase 1B slices."
    ],
    "milestone": "Phase 1B workout engine",
    "sourceRefs": [
      {
        "commit": "e4be0295255655d881ee33d96278fee0b69cb625",
        "label": "PR #22: Start workout engine foundation",
        "pullRequest": 22,
        "url": "https://github.com/prabhsehgal99/project99/pull/22"
      },
      {
        "issue": 21,
        "label": "Issue #21: Phase 1B workout-engine foundation",
        "url": "https://github.com/prabhsehgal99/project99/issues/21"
      },
      {
        "label": "D-014 - Workout sessions are immutable exercise snapshots with Epley estimates",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "The first workout-engine slice added active workout logging, exercise snapshots, previous-session context, volume, estimated 1RM, and Daily Log linking.",
    "title": "Workout engine foundation"
  },
  {
    "changeType": "reinforced",
    "changes": [
      {
        "element": {
          "category": "safety",
          "dependencies": [
            "firebase-auth-boundary",
            "firestore-data-boundary"
          ],
          "feature": "Dev/prod separation",
          "filter": "infrastructure",
          "id": "environment-boundary",
          "introduced": "2026-08-04",
          "lastChanged": "2026-08-05",
          "limitations": [],
          "name": "Environment boundary",
          "paths": [
            ".firebaserc",
            ".env.example",
            "scripts/setup-env.mjs",
            "src/lib/firebase-config.ts",
            "next.config.ts",
            "package.json"
          ],
          "position": {
            "height": 70,
            "width": 245,
            "x": 425,
            "y": 92
          },
          "responsibility": "Prevents local, preview, and agent sessions from using production Firebase resources and routes Firestore Rules deploys through explicit npm scripts.",
          "sourceRefs": [
            {
              "commit": "2a07ff5699bf2d1e850934facc8358935a39a982",
              "label": "PR #20: Upgrade Tailwind v4, split Firebase projects, harden environment setup",
              "pullRequest": 20,
              "url": "https://github.com/prabhsehgal99/project99/pull/20"
            },
            {
              "commit": "905f5e7509a11c567ac9213b6492311596c7062d",
              "label": "PR #24: Enforce Firebase dev and production environment identity",
              "pullRequest": 24,
              "url": "https://github.com/prabhsehgal99/project99/pull/24"
            },
            {
              "label": "D-015 - Builds enforce Firebase environment identity",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Firebase config unit tests",
              "path": "src/lib/firebase-config.test.ts",
              "status": "passed"
            },
            {
              "detail": "Redeployed without stale build cache and verified against project99live.",
              "label": "Production bundle smoke test",
              "status": "passed"
            }
          ]
        },
        "elementId": "environment-boundary",
        "operation": "reinforced",
        "summary": "Added NEXT_PUBLIC_APP_ENV validation and Vercel environment checks."
      },
      {
        "element": {
          "category": "foundation",
          "dependencies": [
            "application-foundation",
            "environment-boundary"
          ],
          "feature": "Google authentication",
          "filter": "data-security",
          "id": "firebase-auth-boundary",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-05",
          "limitations": [],
          "name": "Authentication boundary",
          "paths": [
            "src/components/auth-provider.tsx",
            "src/lib/firebase.ts",
            "src/lib/firebase-config.ts"
          ],
          "position": {
            "height": 62,
            "width": 310,
            "x": 670,
            "y": 500
          },
          "responsibility": "Keeps app data behind authenticated Firebase users and initializes Firebase client services from environment configuration.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "905f5e7509a11c567ac9213b6492311596c7062d",
              "label": "PR #24: Enforce Firebase dev and production environment identity",
              "pullRequest": 24,
              "url": "https://github.com/prabhsehgal99/project99/pull/24"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Environment identity tests",
              "path": "src/lib/firebase-config.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "firebase-auth-boundary",
        "operation": "modified",
        "summary": "Auth configuration became tied to explicit dev or production environment identity."
      }
    ],
    "date": "2026-08-05",
    "id": "2026-08-05-environment-identity",
    "knownLimitations": [],
    "milestone": "Phase 0 foundation hardening",
    "sourceRefs": [
      {
        "commit": "905f5e7509a11c567ac9213b6492311596c7062d",
        "label": "PR #24: Enforce Firebase dev and production environment identity",
        "pullRequest": 24,
        "url": "https://github.com/prabhsehgal99/project99/pull/24"
      },
      {
        "issue": 23,
        "label": "Issue #23: Firebase environment identity guard",
        "url": "https://github.com/prabhsehgal99/project99/issues/23"
      },
      {
        "label": "D-015 - Builds enforce Firebase environment identity",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "Build-time and runtime validation began rejecting complete but wrong Firebase configurations.",
    "title": "Fail-closed environment identity"
  },
  {
    "changeType": "verified",
    "changes": [
      {
        "element": {
          "category": "safety",
          "dependencies": [
            "project-bedrock",
            "application-foundation",
            "firestore-data-boundary"
          ],
          "feature": "Automated verification",
          "filter": "tests-quality",
          "id": "quality-gate-system",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Quality gate system",
          "paths": [
            "package.json",
            ".github/workflows/quality.yml",
            "src/lib/*.test.ts",
            "tests/firestore.rules.test.ts"
          ],
          "position": {
            "height": 70,
            "width": 240,
            "x": 165,
            "y": 92
          },
          "responsibility": "Runs lint, typecheck, unit tests, rules tests, and production builds through portable npm scripts and GitHub Actions.",
          "sourceRefs": [
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "81bb7ab34cf28428aa13c2fd5a82c922006cd6dc",
              "label": "PR #27: Add emulator-backed Firestore rules tests",
              "pullRequest": 27,
              "url": "https://github.com/prabhsehgal99/project99/pull/27"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Passed during Phase 0 verification.",
              "label": "npm run lint",
              "status": "passed"
            },
            {
              "detail": "Passed during Phase 0 verification.",
              "label": "npm run typecheck",
              "status": "passed"
            },
            {
              "detail": "Passed during Phase 0 verification.",
              "label": "npm test",
              "status": "passed"
            },
            {
              "detail": "Passed during Phase 0 verification.",
              "label": "npm run test:rules",
              "status": "passed"
            },
            {
              "detail": "Passed during Phase 0 verification.",
              "label": "npm run build",
              "status": "passed"
            }
          ]
        },
        "elementId": "quality-gate-system",
        "operation": "verified",
        "summary": "Rules tests joined the quality workflow and Phase 0 gates passed."
      },
      {
        "element": {
          "category": "frame",
          "dependencies": [
            "firebase-auth-boundary",
            "environment-boundary"
          ],
          "feature": "User-owned persistence",
          "filter": "data-security",
          "id": "firestore-data-boundary",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "Firestore data boundary",
          "paths": [
            "src/lib/firestore.ts",
            "src/lib/types.ts",
            "firestore.rules",
            "tests/firestore.rules.test.ts"
          ],
          "position": {
            "height": 78,
            "width": 245,
            "x": 680,
            "y": 400
          },
          "responsibility": "Centralizes client reads, subscriptions, writes, normalization, and error reporting for user-owned Firestore documents.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "3400506043d532672a351eb30b820c2cd30a347b",
              "label": "PR #6: Document Firestore user data rules audit",
              "pullRequest": 6,
              "url": "https://github.com/prabhsehgal99/project99/pull/6"
            },
            {
              "commit": "81bb7ab34cf28428aa13c2fd5a82c922006cd6dc",
              "label": "PR #27: Add emulator-backed Firestore rules tests",
              "pullRequest": 27,
              "url": "https://github.com/prabhsehgal99/project99/pull/27"
            },
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Cross-user denial tests",
              "path": "tests/firestore.rules.test.ts",
              "status": "passed"
            },
            {
              "label": "Schema validation rules",
              "path": "firestore.rules",
              "status": "passed"
            }
          ]
        },
        "elementId": "firestore-data-boundary",
        "operation": "reinforced",
        "summary": "Rules now validate profile, settings, Daily Log, and workout-session ownership and schemas."
      },
      {
        "element": {
          "category": "safety",
          "dependencies": [
            "application-foundation",
            "firestore-data-boundary"
          ],
          "feature": "Operational visibility",
          "filter": "infrastructure",
          "id": "monitoring-reinforcement",
          "introduced": "2026-08-07",
          "lastChanged": "2026-08-07",
          "limitations": [
            "Monitoring is disabled when NEXT_PUBLIC_SENTRY_DSN is absent."
          ],
          "name": "Monitoring reinforcement",
          "paths": [
            "src/lib/monitoring.ts",
            "src/app/error.tsx",
            "src/app/global-error.tsx",
            "src/instrumentation-client.ts"
          ],
          "position": {
            "height": 58,
            "width": 245,
            "x": 705,
            "y": 155
          },
          "responsibility": "Captures client, error-boundary, auth, and Firestore failures when a Sentry DSN is configured, without default PII or health-record payloads.",
          "sourceRefs": [
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            },
            {
              "label": "D-016 - Optional Sentry monitoring without default PII",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Owner runtime QA verified Sentry delivery during Phase 0 closure.",
              "label": "Sentry delivery",
              "status": "passed"
            }
          ]
        },
        "elementId": "monitoring-reinforcement",
        "operation": "added",
        "summary": "Optional Sentry monitoring captures failures without default PII or health payloads."
      },
      {
        "element": {
          "category": "delivery",
          "dependencies": [
            "application-foundation",
            "firebase-auth-boundary"
          ],
          "feature": "Installable PWA",
          "filter": "infrastructure",
          "id": "pwa-delivery-shell",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-07",
          "limitations": [],
          "name": "PWA delivery shell",
          "paths": [
            "public/manifest.webmanifest",
            "public/sw.js",
            "public/icon-192.png",
            "public/icon-512.png",
            "public/apple-touch-icon.png",
            "src/components/pwa-register.tsx",
            "src/lib/auth-mode.ts"
          ],
          "position": {
            "height": 72,
            "width": 235,
            "x": 700,
            "y": 66
          },
          "responsibility": "Provides manifest, icons, service worker update behavior, and production static assets for installed-app use.",
          "sourceRefs": [
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            },
            {
              "label": "D-017 - Redirect authentication for installed PWAs",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Auth mode tests",
              "path": "src/lib/auth-mode.test.ts",
              "status": "passed"
            },
            {
              "detail": "Sign-in, session restoration, and icon rendering passed on 2026-08-07.",
              "label": "Installed iOS PWA QA",
              "status": "passed"
            }
          ]
        },
        "elementId": "pwa-delivery-shell",
        "operation": "verified",
        "summary": "Installed iOS PWA auth, icon rendering, service-worker assets, and production reachability passed."
      }
    ],
    "date": "2026-08-07",
    "id": "2026-08-07-rules-tests-and-foundation-closure",
    "knownLimitations": [
      "Agent workspaces still need local Firebase environment values before authenticated runtime behavior can be exercised there."
    ],
    "milestone": "Phase 0 closed",
    "sourceRefs": [
      {
        "commit": "81bb7ab34cf28428aa13c2fd5a82c922006cd6dc",
        "label": "PR #27: Add emulator-backed Firestore rules tests",
        "pullRequest": 27,
        "url": "https://github.com/prabhsehgal99/project99/pull/27"
      },
      {
        "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
        "label": "PR #28: Close pending foundation issues",
        "pullRequest": 28,
        "url": "https://github.com/prabhsehgal99/project99/pull/28"
      },
      {
        "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
        "label": "PR #33: Record Phase 0 verification pass",
        "pullRequest": 33,
        "url": "https://github.com/prabhsehgal99/project99/pull/33"
      },
      {
        "label": "D-016 - Optional Sentry monitoring without default PII",
        "url": "docs/project/DECISIONS.md"
      },
      {
        "label": "D-017 - Redirect authentication for installed PWAs",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "Firestore Rules gained emulator-backed tests, pending foundation issues closed, monitoring shipped, installed PWA auth was verified, and Phase 0 closed.",
    "title": "Security tests and Phase 0 closure"
  },
  {
    "changeType": "repaired",
    "changes": [
      {
        "element": {
          "category": "delivery",
          "dependencies": [
            "application-foundation",
            "firebase-auth-boundary",
            "environment-boundary"
          ],
          "feature": "Installable PWA",
          "filter": "infrastructure",
          "id": "pwa-delivery-shell",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-08",
          "limitations": [],
          "name": "PWA delivery shell",
          "paths": [
            "public/manifest.webmanifest",
            "public/sw.js",
            "public/icon-192.png",
            "public/icon-512.png",
            "public/apple-touch-icon.png",
            "src/components/pwa-register.tsx",
            "src/lib/auth-mode.ts",
            "next.config.ts"
          ],
          "position": {
            "height": 72,
            "width": 235,
            "x": 700,
            "y": 66
          },
          "responsibility": "Provides manifest, icons, service worker behavior, first-party auth helper routing, and production static assets for installed-app use.",
          "sourceRefs": [
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "07d30a539dc7706b9e37af4288aed2cacf8fbb39",
              "label": "PR #28: Close pending foundation issues",
              "pullRequest": 28,
              "url": "https://github.com/prabhsehgal99/project99/pull/28"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            },
            {
              "commit": "4f8f776f3ae391b90117e5f2f04bc04d8acaffd8",
              "label": "PR #34: Fix installed iOS PWA Google sign-in loop",
              "pullRequest": 34,
              "url": "https://github.com/prabhsehgal99/project99/pull/34"
            },
            {
              "label": "D-017 - Redirect authentication for installed PWAs",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Auth mode tests",
              "path": "src/lib/auth-mode.test.ts",
              "status": "passed"
            },
            {
              "label": "First-party auth proxy tests",
              "path": "src/lib/firebase-config.test.ts",
              "status": "passed"
            },
            {
              "label": "Service worker auth bypass",
              "path": "public/sw.js",
              "status": "present"
            }
          ]
        },
        "elementId": "pwa-delivery-shell",
        "operation": "repaired",
        "summary": "Installed PWA redirect auth now avoids third-party Firebase helper storage paths in production."
      },
      {
        "element": {
          "category": "foundation",
          "dependencies": [
            "application-foundation",
            "environment-boundary"
          ],
          "feature": "Google authentication",
          "filter": "data-security",
          "id": "firebase-auth-boundary",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-08",
          "limitations": [],
          "name": "Authentication boundary",
          "paths": [
            "src/components/auth-provider.tsx",
            "src/lib/firebase.ts",
            "src/lib/firebase-config.ts",
            "next.config.ts"
          ],
          "position": {
            "height": 62,
            "width": 310,
            "x": 670,
            "y": 500
          },
          "responsibility": "Keeps app data behind authenticated Firebase users and initializes Firebase client services from coherent environment configuration and first-party production auth routing.",
          "sourceRefs": [
            {
              "commit": "98908d9a0fb80344456ec824a947ddfe7a6cdeca",
              "label": "PR #1: Build Project 99 fitness PWA",
              "pullRequest": 1,
              "url": "https://github.com/prabhsehgal99/project99/pull/1"
            },
            {
              "commit": "905f5e7509a11c567ac9213b6492311596c7062d",
              "label": "PR #24: Enforce Firebase dev and production environment identity",
              "pullRequest": 24,
              "url": "https://github.com/prabhsehgal99/project99/pull/24"
            },
            {
              "commit": "4f8f776f3ae391b90117e5f2f04bc04d8acaffd8",
              "label": "PR #34: Fix installed iOS PWA Google sign-in loop",
              "pullRequest": 34,
              "url": "https://github.com/prabhsehgal99/project99/pull/34"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Firebase client auth-domain tests",
              "path": "src/lib/firebase-config.test.ts",
              "status": "passed"
            },
            {
              "label": "Production redirect URI requirement",
              "path": "docs/project/CURRENT_STATE.md",
              "status": "present"
            }
          ]
        },
        "elementId": "firebase-auth-boundary",
        "operation": "modified",
        "summary": "Production client auth domain selection now uses the deployed HTTPS app host when appropriate."
      }
    ],
    "date": "2026-08-08",
    "id": "2026-08-08-ios-pwa-auth-proxy",
    "knownLimitations": [
      "Production Google OAuth settings must keep the assigned app-domain redirect URI authorized."
    ],
    "milestone": "Phase 0 production auth repair",
    "sourceRefs": [
      {
        "commit": "4f8f776f3ae391b90117e5f2f04bc04d8acaffd8",
        "label": "PR #34: Fix installed iOS PWA Google sign-in loop",
        "pullRequest": 34,
        "url": "https://github.com/prabhsehgal99/project99/pull/34"
      },
      {
        "label": "D-017 - Redirect authentication for installed PWAs",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "Production Google redirect auth was repaired for installed iOS PWAs by using the app host as the client auth domain and proxying Firebase auth helper routes through Next.js.",
    "title": "Installed iOS PWA auth proxy repair"
  },
  {
    "changeType": "added",
    "changes": [
      {
        "element": {
          "category": "safety",
          "dependencies": [
            "project-bedrock",
            "quality-gate-system",
            "application-foundation"
          ],
          "feature": "Architecture history",
          "filter": "tests-quality",
          "id": "architecture-observatory",
          "introduced": "2026-08-08",
          "lastChanged": "2026-08-08",
          "limitations": [
            "The final merge commit is unavailable until this branch is merged."
          ],
          "name": "Architecture Observatory",
          "paths": [
            "src/app/architecture/page.tsx",
            "src/components/architecture-observatory.tsx",
            "src/data/architecture-events.ts",
            "src/lib/architecture-observatory.ts",
            "scripts/architecture",
            "docs/architecture/observatory.md"
          ],
          "position": {
            "height": 58,
            "width": 250,
            "x": 435,
            "y": 20
          },
          "responsibility": "Shows Project99 architecture as a historical, evidence-backed building and checks that relevant future changes update the ledger or document an exception.",
          "sourceRefs": [
            {
              "issue": 35,
              "label": "Issue #35: Build Project99 Architecture Observatory",
              "url": "https://github.com/prabhsehgal99/project99/issues/35"
            },
            {
              "label": "PR #36: Build Project99 Architecture Observatory",
              "pullRequest": 36,
              "url": "https://github.com/prabhsehgal99/project99/pull/36"
            },
            {
              "label": "D-018 - Architecture history uses a versioned event ledger",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Architecture schema tests",
              "path": "src/lib/architecture-observatory.test.ts",
              "status": "passed"
            },
            {
              "detail": "npm run architecture:check validates generated data and watched-path updates.",
              "label": "Freshness check",
              "status": "passed"
            },
            {
              "label": "Static internal route",
              "path": "src/app/architecture/page.tsx",
              "status": "present"
            }
          ]
        },
        "elementId": "architecture-observatory",
        "operation": "added",
        "summary": "Added the internal building visualization and the reviewable ledger that drives it."
      },
      {
        "element": {
          "category": "safety",
          "dependencies": [
            "project-bedrock",
            "application-foundation",
            "firestore-data-boundary",
            "architecture-observatory"
          ],
          "feature": "Automated verification",
          "filter": "tests-quality",
          "id": "quality-gate-system",
          "introduced": "2026-08-01",
          "lastChanged": "2026-08-08",
          "limitations": [],
          "name": "Quality gate system",
          "paths": [
            "package.json",
            ".github/workflows/quality.yml",
            "src/lib/*.test.ts",
            "tests/firestore.rules.test.ts",
            "scripts/architecture"
          ],
          "position": {
            "height": 70,
            "width": 240,
            "x": 165,
            "y": 92
          },
          "responsibility": "Runs lint, typecheck, unit tests, rules tests, production builds, and architecture observatory checks through portable npm scripts and GitHub Actions.",
          "sourceRefs": [
            {
              "commit": "3d16f45287c8d10541177ec030c55e510587acca",
              "label": "PR #18: Phase 0.5 setup hardening",
              "pullRequest": 18,
              "url": "https://github.com/prabhsehgal99/project99/pull/18"
            },
            {
              "commit": "81bb7ab34cf28428aa13c2fd5a82c922006cd6dc",
              "label": "PR #27: Add emulator-backed Firestore rules tests",
              "pullRequest": 27,
              "url": "https://github.com/prabhsehgal99/project99/pull/27"
            },
            {
              "commit": "0aed964c4ba2f1f3c91f7f54571cb0cae6623f91",
              "label": "PR #33: Record Phase 0 verification pass",
              "pullRequest": 33,
              "url": "https://github.com/prabhsehgal99/project99/pull/33"
            },
            {
              "issue": 35,
              "label": "Issue #35: Build Project99 Architecture Observatory",
              "url": "https://github.com/prabhsehgal99/project99/issues/35"
            },
            {
              "label": "PR #36: Build Project99 Architecture Observatory",
              "pullRequest": 36,
              "url": "https://github.com/prabhsehgal99/project99/pull/36"
            },
            {
              "label": "D-018 - Architecture history uses a versioned event ledger",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "Generated the deterministic observatory data artifact.",
              "label": "npm run architecture:generate",
              "status": "passed"
            },
            {
              "detail": "Validated generated freshness and watched-path coverage.",
              "label": "npm run architecture:check",
              "status": "passed"
            }
          ]
        },
        "elementId": "quality-gate-system",
        "operation": "reinforced",
        "summary": "Added observatory-specific generation and freshness scripts to the portable npm script interface."
      }
    ],
    "date": "2026-08-08",
    "id": "2026-08-08-architecture-observatory",
    "knownLimitations": [
      "The final merge commit is unavailable until this branch is merged."
    ],
    "milestone": "Internal engineering tooling",
    "sourceRefs": [
      {
        "issue": 35,
        "label": "Issue #35: Build Project99 Architecture Observatory",
        "url": "https://github.com/prabhsehgal99/project99/issues/35"
      },
      {
        "label": "PR #36: Build Project99 Architecture Observatory",
        "pullRequest": 36,
        "url": "https://github.com/prabhsehgal99/project99/pull/36"
      },
      {
        "label": "D-018 - Architecture history uses a versioned event ledger",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "Project99 gained an internal architecture-history route, a strict event ledger, deterministic generation scripts, freshness checking, and update documentation.",
    "title": "Architecture Observatory"
  },
  {
    "changeType": "modified",
    "changes": [
      {
        "element": {
          "category": "product",
          "dependencies": [
            "application-foundation",
            "daily-log-core",
            "settings-utilities",
            "workout-wing",
            "today-data-boundary",
            "quick-log-sheet"
          ],
          "feature": "Today",
          "filter": "interface",
          "id": "dashboard-wing",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-08",
          "limitations": [],
          "name": "Today wing",
          "paths": [
            "src/app/dashboard/page.tsx",
            "src/components/dashboard-page.tsx",
            "src/lib/today.ts"
          ],
          "position": {
            "height": 78,
            "width": 180,
            "x": 160,
            "y": 250
          },
          "responsibility": "Shows local date context, one adaptive focus action, compact daily progress, and truthful logged signals without exposing the complete Daily Log form.",
          "sourceRefs": [
            {
              "issue": 37,
              "label": "Issue #37: Implement calm daily experience redesign",
              "url": "https://github.com/prabhsehgal99/project99/issues/37"
            },
            {
              "label": "D-019 - Today and Quick Log are the primary daily interaction model",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Today focus tests",
              "path": "src/lib/today.test.ts",
              "status": "passed"
            },
            {
              "detail": "npm run build passed during issue #37 implementation.",
              "label": "Production build",
              "status": "passed"
            }
          ]
        },
        "elementId": "dashboard-wing",
        "operation": "modified",
        "summary": "Dashboard became the Today experience with a single data-driven Up next action."
      },
      {
        "element": {
          "category": "frame",
          "dependencies": [
            "firebase-auth-boundary",
            "firestore-data-boundary",
            "daily-log-core",
            "workout-wing"
          ],
          "feature": "Today and Quick Log shared reads",
          "filter": "product",
          "id": "today-data-boundary",
          "introduced": "2026-08-08",
          "lastChanged": "2026-08-08",
          "limitations": [],
          "name": "Today data boundary",
          "paths": [
            "src/components/today-data-provider.tsx",
            "src/components/authenticated-shell.tsx"
          ],
          "position": {
            "height": 60,
            "width": 230,
            "x": 380,
            "y": 235
          },
          "responsibility": "Shares today's Daily Log, settings, loading/error state, and active workout between Today and Quick Log without moving route-specific history into global state.",
          "sourceRefs": [
            {
              "issue": 37,
              "label": "Issue #37: Implement calm daily experience redesign",
              "url": "https://github.com/prabhsehgal99/project99/issues/37"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "detail": "npm run typecheck passed during issue #37 implementation.",
              "label": "Strict TypeScript",
              "status": "passed"
            }
          ]
        },
        "elementId": "today-data-boundary",
        "operation": "added",
        "summary": "Added a narrow shared client boundary for today's log, settings, and active workout."
      },
      {
        "element": {
          "category": "product",
          "dependencies": [
            "today-data-boundary",
            "daily-log-core",
            "firestore-data-boundary",
            "navigation-guard"
          ],
          "feature": "Quick Log",
          "filter": "interface",
          "id": "quick-log-sheet",
          "introduced": "2026-08-08",
          "lastChanged": "2026-08-08",
          "limitations": [],
          "name": "Quick Log sheet",
          "paths": [
            "src/components/quick-log/quick-log-provider.tsx",
            "src/lib/daily-log.ts",
            "src/lib/firestore.ts",
            "src/lib/daily-log.test.ts"
          ],
          "position": {
            "height": 60,
            "width": 220,
            "x": 635,
            "y": 235
          },
          "responsibility": "Lets authenticated users record frequent Daily Log fields through focused dialog editors and transaction-safe writes that preserve unrelated fields.",
          "sourceRefs": [
            {
              "issue": 37,
              "label": "Issue #37: Implement calm daily experience redesign",
              "url": "https://github.com/prabhsehgal99/project99/issues/37"
            },
            {
              "label": "D-019 - Today and Quick Log are the primary daily interaction model",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Daily Log mutation tests",
              "path": "src/lib/daily-log.test.ts",
              "status": "passed"
            },
            {
              "label": "Firestore rules suite",
              "path": "tests/firestore.rules.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "quick-log-sheet",
        "operation": "added",
        "summary": "Added the global Quick Log action backed by validated Daily Log transactions."
      },
      {
        "element": {
          "category": "frame",
          "dependencies": [
            "firebase-auth-boundary"
          ],
          "feature": "User-owned persistence",
          "filter": "data-security",
          "id": "firestore-data-boundary",
          "introduced": "2026-07-31",
          "lastChanged": "2026-08-08",
          "limitations": [],
          "name": "Firestore data boundary",
          "paths": [
            "src/lib/firestore.ts",
            "src/lib/daily-log.ts",
            "src/lib/types.ts",
            "firestore.rules"
          ],
          "position": {
            "height": 78,
            "width": 245,
            "x": 680,
            "y": 400
          },
          "responsibility": "Centralizes client reads, subscriptions, writes, transactions, normalization, and error reporting for user-owned Firestore documents.",
          "sourceRefs": [
            {
              "issue": 37,
              "label": "Issue #37: Implement calm daily experience redesign",
              "url": "https://github.com/prabhsehgal99/project99/issues/37"
            },
            {
              "label": "D-019 - Today and Quick Log are the primary daily interaction model",
              "url": "docs/project/DECISIONS.md"
            }
          ],
          "status": "implemented",
          "verification": [
            {
              "label": "Owner-only rules",
              "path": "firestore.rules",
              "status": "passed"
            },
            {
              "label": "Rules emulator tests",
              "path": "tests/firestore.rules.test.ts",
              "status": "passed"
            }
          ]
        },
        "elementId": "firestore-data-boundary",
        "operation": "modified",
        "summary": "Daily Log writes gained a focused transaction mutation path for Quick Log."
      }
    ],
    "date": "2026-08-08",
    "id": "2026-08-08-calm-daily-experience",
    "knownLimitations": [
      "Agent workspace screenshots were limited to unauthenticated/configuration states because local Firebase environment values were not present."
    ],
    "milestone": "Phase 1A daily operating system",
    "sourceRefs": [
      {
        "issue": 37,
        "label": "Issue #37: Implement calm daily experience redesign",
        "url": "https://github.com/prabhsehgal99/project99/issues/37"
      },
      {
        "label": "D-019 - Today and Quick Log are the primary daily interaction model",
        "url": "docs/project/DECISIONS.md"
      }
    ],
    "summary": "The authenticated product shifted from a dashboard-plus-form structure to a focused Today surface, global Quick Log action, Progress destination, More destination, and transaction-safe Daily Log mutations.",
    "title": "Calm daily experience model"
  }
] satisfies ArchitectureEvent[];
