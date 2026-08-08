import { describe, expect, it } from "vitest";
import { architectureEvents } from "@/data/architecture-events";
import {
  createArchitectureSnapshot,
  reconstructArchitectureTimeline,
  validateArchitectureEvents,
  type ArchitectureEvent
} from "@/lib/architecture-observatory";

describe("architecture observatory history", () => {
  it("validates the seeded event ledger", () => {
    expect(validateArchitectureEvents(architectureEvents)).toEqual([]);
  });

  it("reconstructs the latest building state from chronological events", () => {
    const snapshot = createArchitectureSnapshot(architectureEvents, "2026-08-08T00:00:00.000Z");

    expect(snapshot.warnings).toEqual([]);
    expect(snapshot.latestEventId).toBe("2026-08-08-calm-daily-experience");
    expect(snapshot.elements.map((element) => element.id)).toContain("daily-log-core");
    expect(snapshot.elements.map((element) => element.id)).toContain("workout-wing");
    expect(snapshot.elements.map((element) => element.id)).toContain("quality-gate-system");
    expect(snapshot.elements.map((element) => element.id)).toContain("architecture-observatory");
    expect(snapshot.elements.map((element) => element.id)).toContain("quick-log-sheet");
    expect(snapshot.elements.find((element) => element.id === "future-phase-blueprints")?.status).toBe("planned");
  });

  it("records changed elements and operations for each timeline point", () => {
    const { timeline } = reconstructArchitectureTimeline(architectureEvents);
    const workoutPoint = timeline.find((point) => point.event.id === "2026-08-05-workout-engine");

    expect(workoutPoint?.changedElementIds).toContain("workout-wing");
    expect(workoutPoint?.operationsByElementId["workout-wing"]).toBe("added");
    expect(workoutPoint?.operationsByElementId["daily-log-core"]).toBe("modified");
  });

  it("supports removing elements from later historical states", () => {
    const events: ArchitectureEvent[] = [
      {
        id: "add-core",
        date: "2026-01-01",
        title: "Add core",
        summary: "Adds a test element.",
        changeType: "added",
        milestone: "Test",
        sourceRefs: [{ label: "test" }],
        knownLimitations: [],
        changes: [
          {
            operation: "added",
            elementId: "test-core",
            summary: "Add.",
            element: {
              id: "test-core",
              name: "Test core",
              category: "core",
              filter: "product",
              status: "implemented",
              feature: "Test",
              responsibility: "Test element.",
              paths: ["src/lib/test.ts"],
              dependencies: [],
              introduced: "2026-01-01",
              lastChanged: "2026-01-01",
              sourceRefs: [{ label: "test" }],
              verification: [],
              limitations: [],
              position: { x: 1, y: 1, width: 1, height: 1 }
            }
          }
        ]
      },
      {
        id: "remove-core",
        date: "2026-01-02",
        title: "Remove core",
        summary: "Removes a test element.",
        changeType: "removed",
        milestone: "Test",
        sourceRefs: [{ label: "test" }],
        knownLimitations: [],
        changes: [{ operation: "removed", elementId: "test-core", summary: "Remove." }]
      }
    ];

    const { timeline, warnings } = reconstructArchitectureTimeline(events);

    expect(warnings).toEqual([]);
    expect(timeline[0].elements).toHaveLength(1);
    expect(timeline[1].elements).toHaveLength(0);
    expect(timeline[1].operationsByElementId["test-core"]).toBe("removed");
  });

  it("rejects malformed event data", () => {
    expect(validateArchitectureEvents({})).toEqual(["Architecture history must be an array."]);
    expect(validateArchitectureEvents([{ id: "broken", changes: [] }])).toContain("event[0].date must be a non-empty string.");
    expect(validateArchitectureEvents([{ id: "broken", changes: [] }])).toContain("event[0].changes must contain at least one change.");
  });
});
