export type ArchitectureCategory =
  | "bedrock"
  | "foundation"
  | "frame"
  | "core"
  | "product"
  | "utility"
  | "safety"
  | "delivery";

export type ArchitectureStatus = "implemented" | "planned" | "incomplete" | "deprecated";

export type ArchitectureChangeOperation =
  | "added"
  | "modified"
  | "removed"
  | "reinforced"
  | "repaired"
  | "verified";

export type ArchitectureFilter =
  | "product"
  | "data-security"
  | "shared-architecture"
  | "interface"
  | "tests-quality"
  | "infrastructure";

export type ArchitectureEvidenceStatus = "present" | "passed" | "unknown" | "planned" | "risk";

export type ArchitectureReference = {
  label: string;
  url?: string;
  commit?: string;
  pullRequest?: number;
  issue?: number;
};

export type ArchitectureEvidence = {
  label: string;
  status: ArchitectureEvidenceStatus;
  path?: string;
  detail?: string;
};

export type ArchitectureElementPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ArchitectureElement = {
  id: string;
  name: string;
  category: ArchitectureCategory;
  filter: ArchitectureFilter;
  status: ArchitectureStatus;
  feature: string;
  responsibility: string;
  paths: string[];
  dependencies: string[];
  introduced: string;
  lastChanged: string;
  sourceRefs: ArchitectureReference[];
  verification: ArchitectureEvidence[];
  limitations: string[];
  position: ArchitectureElementPosition;
};

export type ArchitectureElementChange = {
  operation: ArchitectureChangeOperation;
  elementId: string;
  summary: string;
  element?: ArchitectureElement;
  paths?: string[];
  verification?: ArchitectureEvidence[];
};

export type ArchitectureEvent = {
  id: string;
  date: string;
  title: string;
  summary: string;
  changeType: ArchitectureChangeOperation;
  milestone: string;
  sourceRefs: ArchitectureReference[];
  changes: ArchitectureElementChange[];
  knownLimitations: string[];
};

export type ArchitectureTimelinePoint = {
  event: ArchitectureEvent;
  elements: ArchitectureElement[];
  changedElementIds: string[];
  operationsByElementId: Record<string, ArchitectureChangeOperation>;
};

export type ArchitectureSnapshot = {
  generatedAt: string;
  latestEventId: string | null;
  timeline: ArchitectureTimelinePoint[];
  elements: ArchitectureElement[];
  warnings: string[];
};

const categories: ArchitectureCategory[] = [
  "bedrock",
  "foundation",
  "frame",
  "core",
  "product",
  "utility",
  "safety",
  "delivery"
];

const statuses: ArchitectureStatus[] = ["implemented", "planned", "incomplete", "deprecated"];
const operations: ArchitectureChangeOperation[] = ["added", "modified", "removed", "reinforced", "repaired", "verified"];
const filters: ArchitectureFilter[] = [
  "product",
  "data-security",
  "shared-architecture",
  "interface",
  "tests-quality",
  "infrastructure"
];
const evidenceStatuses: ArchitectureEvidenceStatus[] = ["present", "passed", "unknown", "planned", "risk"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isReference(value: unknown) {
  if (!isRecord(value) || typeof value.label !== "string") {
    return false;
  }

  return (
    (value.url === undefined || typeof value.url === "string") &&
    (value.commit === undefined || typeof value.commit === "string") &&
    (value.pullRequest === undefined || typeof value.pullRequest === "number") &&
    (value.issue === undefined || typeof value.issue === "number")
  );
}

function isEvidence(value: unknown) {
  if (!isRecord(value) || typeof value.label !== "string" || typeof value.status !== "string") {
    return false;
  }

  return (
    evidenceStatuses.includes(value.status as ArchitectureEvidenceStatus) &&
    (value.path === undefined || typeof value.path === "string") &&
    (value.detail === undefined || typeof value.detail === "string")
  );
}

function validatePosition(value: unknown, context: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(`${context} position must be an object.`);
    return;
  }

  for (const key of ["x", "y", "width", "height"]) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key])) {
      errors.push(`${context} position.${key} must be a finite number.`);
    }
  }
}

export function validateArchitectureElement(value: unknown, context: string) {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return [`${context} must be an object.`];
  }

  for (const key of ["id", "name", "feature", "responsibility", "introduced", "lastChanged"]) {
    if (typeof value[key] !== "string" || value[key].trim().length === 0) {
      errors.push(`${context}.${key} must be a non-empty string.`);
    }
  }

  if (typeof value.category !== "string" || !categories.includes(value.category as ArchitectureCategory)) {
    errors.push(`${context}.category is not a supported category.`);
  }
  if (typeof value.filter !== "string" || !filters.includes(value.filter as ArchitectureFilter)) {
    errors.push(`${context}.filter is not a supported filter.`);
  }
  if (typeof value.status !== "string" || !statuses.includes(value.status as ArchitectureStatus)) {
    errors.push(`${context}.status is not a supported status.`);
  }
  if (!isStringArray(value.paths)) {
    errors.push(`${context}.paths must be a string array.`);
  }
  if (!isStringArray(value.dependencies)) {
    errors.push(`${context}.dependencies must be a string array.`);
  }
  if (!Array.isArray(value.sourceRefs) || !value.sourceRefs.every(isReference)) {
    errors.push(`${context}.sourceRefs must contain valid references.`);
  }
  if (!Array.isArray(value.verification) || !value.verification.every(isEvidence)) {
    errors.push(`${context}.verification must contain valid evidence.`);
  }
  if (!isStringArray(value.limitations)) {
    errors.push(`${context}.limitations must be a string array.`);
  }

  validatePosition(value.position, context, errors);
  return errors;
}

function validateChange(value: unknown, context: string) {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return [`${context} must be an object.`];
  }

  if (typeof value.operation !== "string" || !operations.includes(value.operation as ArchitectureChangeOperation)) {
    errors.push(`${context}.operation is not supported.`);
  }
  if (typeof value.elementId !== "string" || value.elementId.trim().length === 0) {
    errors.push(`${context}.elementId must be a non-empty string.`);
  }
  if (typeof value.summary !== "string" || value.summary.trim().length === 0) {
    errors.push(`${context}.summary must be a non-empty string.`);
  }
  if (value.paths !== undefined && !isStringArray(value.paths)) {
    errors.push(`${context}.paths must be a string array when present.`);
  }
  if (value.verification !== undefined && (!Array.isArray(value.verification) || !value.verification.every(isEvidence))) {
    errors.push(`${context}.verification must contain valid evidence when present.`);
  }

  if (value.operation !== "removed" && value.element === undefined) {
    errors.push(`${context}.element is required unless the operation is removed.`);
  }
  if (value.element !== undefined) {
    errors.push(...validateArchitectureElement(value.element, `${context}.element`));
  }

  return errors;
}

export function validateArchitectureEvents(events: unknown) {
  const errors: string[] = [];

  if (!Array.isArray(events)) {
    return ["Architecture history must be an array."];
  }

  const ids = new Set<string>();
  const elementIntroductions = new Set<string>();
  let previousDate = "";

  events.forEach((event, eventIndex) => {
    const context = `event[${eventIndex}]`;
    if (!isRecord(event)) {
      errors.push(`${context} must be an object.`);
      return;
    }

    for (const key of ["id", "date", "title", "summary", "milestone"]) {
      if (typeof event[key] !== "string" || event[key].trim().length === 0) {
        errors.push(`${context}.${key} must be a non-empty string.`);
      }
    }
    if (typeof event.id === "string") {
      if (ids.has(event.id)) {
        errors.push(`${context}.id duplicates an earlier event.`);
      }
      ids.add(event.id);
    }
    if (typeof event.date === "string" && previousDate && event.date < previousDate) {
      errors.push(`${context}.date must be chronological.`);
    }
    if (typeof event.date === "string") {
      previousDate = event.date;
    }
    if (typeof event.changeType !== "string" || !operations.includes(event.changeType as ArchitectureChangeOperation)) {
      errors.push(`${context}.changeType is not supported.`);
    }
    if (!Array.isArray(event.sourceRefs) || !event.sourceRefs.every(isReference)) {
      errors.push(`${context}.sourceRefs must contain valid references.`);
    }
    if (!Array.isArray(event.changes) || event.changes.length === 0) {
      errors.push(`${context}.changes must contain at least one change.`);
    } else {
      event.changes.forEach((change, changeIndex) => {
        errors.push(...validateChange(change, `${context}.changes[${changeIndex}]`));
        if (isRecord(change) && typeof change.elementId === "string" && change.operation === "added") {
          if (elementIntroductions.has(change.elementId)) {
            errors.push(`${context}.changes[${changeIndex}].elementId was already added.`);
          }
          elementIntroductions.add(change.elementId);
        }
      });
    }
    if (!isStringArray(event.knownLimitations)) {
      errors.push(`${context}.knownLimitations must be a string array.`);
    }
  });

  return errors;
}

export function reconstructArchitectureTimeline(events: ArchitectureEvent[]) {
  const validationErrors = validateArchitectureEvents(events);
  if (validationErrors.length > 0) {
    return { timeline: [] as ArchitectureTimelinePoint[], warnings: validationErrors };
  }

  const elementsById = new Map<string, ArchitectureElement>();
  const warnings: string[] = [];
  const timeline: ArchitectureTimelinePoint[] = [];

  for (const event of events) {
    const changedElementIds: string[] = [];
    const operationsByElementId: Record<string, ArchitectureChangeOperation> = {};

    for (const change of event.changes) {
      changedElementIds.push(change.elementId);
      operationsByElementId[change.elementId] = change.operation;

      if (change.operation === "removed") {
        if (!elementsById.has(change.elementId)) {
          warnings.push(`${event.id} removes unknown element ${change.elementId}.`);
        }
        elementsById.delete(change.elementId);
        continue;
      }

      if (!change.element) {
        warnings.push(`${event.id} has no element payload for ${change.elementId}.`);
        continue;
      }

      elementsById.set(change.elementId, change.element);
    }

    timeline.push({
      event,
      elements: Array.from(elementsById.values()).sort((left, right) => left.position.y - right.position.y || left.position.x - right.position.x),
      changedElementIds,
      operationsByElementId
    });
  }

  return { timeline, warnings };
}

export function createArchitectureSnapshot(events: ArchitectureEvent[], generatedAt: string): ArchitectureSnapshot {
  const { timeline, warnings } = reconstructArchitectureTimeline(events);
  const latestPoint = timeline.at(-1);

  return {
    generatedAt,
    latestEventId: latestPoint?.event.id ?? null,
    timeline,
    elements: latestPoint?.elements ?? [],
    warnings
  };
}

export function dependantsForElement(elements: ArchitectureElement[], elementId: string) {
  return elements.filter((element) => element.dependencies.includes(elementId)).map((element) => element.id);
}

export function operationLabel(operation: ArchitectureChangeOperation) {
  const labels: Record<ArchitectureChangeOperation, string> = {
    added: "Added",
    modified: "Modified",
    removed: "Removed",
    reinforced: "Reinforced",
    repaired: "Repaired",
    verified: "Verified"
  };
  return labels[operation];
}
