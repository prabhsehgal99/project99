"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ExternalLink,
  History,
  ListTree,
  RotateCcw,
  SearchX,
  ShieldCheck
} from "lucide-react";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  createArchitectureSnapshot,
  dependantsForElement,
  operationLabel,
  type ArchitectureCategory,
  type ArchitectureChangeOperation,
  type ArchitectureElement,
  type ArchitectureEvent,
  type ArchitectureFilter,
  type ArchitectureStatus
} from "@/lib/architecture-observatory";

type ArchitectureObservatoryProps = {
  events: ArchitectureEvent[];
  generatedAt: string;
};

const filterOptions: { value: ArchitectureFilter; label: string }[] = [
  { value: "product", label: "Product" },
  { value: "data-security", label: "Data and security" },
  { value: "shared-architecture", label: "Shared architecture" },
  { value: "interface", label: "Interface" },
  { value: "tests-quality", label: "Tests and quality" },
  { value: "infrastructure", label: "Infrastructure" }
];

const statusOptions: { value: ArchitectureStatus; label: string }[] = [
  { value: "implemented", label: "Implemented" },
  { value: "planned", label: "Planned" },
  { value: "incomplete", label: "Incomplete" },
  { value: "deprecated", label: "Deprecated" }
];

const categoryLabels: Record<ArchitectureCategory, string> = {
  bedrock: "Bedrock",
  foundation: "Foundation",
  frame: "Structural frame",
  core: "Central core",
  product: "Floor or wing",
  utility: "Utility",
  safety: "Safety system",
  delivery: "Exterior delivery"
};

const categoryFills: Record<ArchitectureCategory, string> = {
  bedrock: "#27272a",
  foundation: "#3f3f46",
  frame: "#52525b",
  core: "#164e63",
  product: "#18181b",
  utility: "#334155",
  safety: "#3b2f12",
  delivery: "#312e81"
};

const operationClasses: Record<ArchitectureChangeOperation, string> = {
  added: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  modified: "border-purple-400/40 bg-purple-400/10 text-purple-100",
  removed: "border-red-400/40 bg-red-400/10 text-red-100",
  reinforced: "border-sky-300/35 bg-sky-300/10 text-sky-100",
  repaired: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  verified: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
};

const statusClasses: Record<ArchitectureStatus, string> = {
  implemented: "border-zinc-700 bg-zinc-900 text-zinc-200",
  planned: "border-sky-300/40 bg-sky-300/10 text-sky-100",
  incomplete: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  deprecated: "border-red-400/40 bg-red-400/10 text-red-100"
};

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseHash(timeline: ArchitectureEvent[]) {
  if (typeof window === "undefined") {
    return { eventId: null as string | null, elementId: null as string | null };
  }

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const eventId = params.get("event");
  const elementId = params.get("element");
  const eventExists = eventId ? timeline.some((event) => event.id === eventId) : false;

  return {
    eventId: eventExists ? eventId : null,
    elementId
  };
}

function midpoint(element: ArchitectureElement) {
  return {
    x: element.position.x + element.position.width / 2,
    y: element.position.y + element.position.height / 2
  };
}

function elementMatchesFilters(
  element: ArchitectureElement,
  activeFilters: Set<ArchitectureFilter>,
  activeStatuses: Set<ArchitectureStatus>
) {
  return activeFilters.has(element.filter) && activeStatuses.has(element.status);
}

export function ArchitectureObservatory({ events, generatedAt }: ArchitectureObservatoryProps) {
  const snapshot = useMemo(() => createArchitectureSnapshot(events, generatedAt), [events, generatedAt]);
  const eventIds = useMemo(() => snapshot.timeline.map((point) => point.event.id), [snapshot.timeline]);
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, snapshot.timeline.length - 1));
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<ArchitectureFilter>>(
    () => new Set(filterOptions.map((option) => option.value))
  );
  const [activeStatuses, setActiveStatuses] = useState<Set<ArchitectureStatus>>(
    () => new Set(statusOptions.map((option) => option.value))
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const { eventId, elementId } = parseHash(events);
      if (eventId) {
        const hashIndex = eventIds.indexOf(eventId);
        if (hashIndex >= 0) {
          setSelectedIndex(hashIndex);
        }
      }
      if (elementId) {
        setSelectedElementId(elementId);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [eventIds, events]);

  useEffect(() => {
    const point = snapshot.timeline[selectedIndex];
    if (!point || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams();
    params.set("event", point.event.id);
    if (selectedElementId) {
      params.set("element", selectedElementId);
    }

    window.history.replaceState(null, "", `#${params.toString()}`);
  }, [selectedElementId, selectedIndex, snapshot.timeline]);

  if (snapshot.warnings.length > 0) {
    return <ArchitectureProblem warnings={snapshot.warnings} />;
  }

  if (snapshot.timeline.length === 0) {
    return <ArchitectureEmpty />;
  }

  const selectedPoint = snapshot.timeline[selectedIndex] ?? snapshot.timeline[snapshot.timeline.length - 1];
  const filteredElements = selectedPoint.elements.filter((element) =>
    elementMatchesFilters(element, activeFilters, activeStatuses)
  );
  const selectedElement =
    filteredElements.find((element) => element.id === selectedElementId) ??
    selectedPoint.elements.find((element) => element.id === selectedElementId) ??
    filteredElements[0] ??
    null;
  const visibleIds = new Set(filteredElements.map((element) => element.id));
  const changedIds = new Set(selectedPoint.changedElementIds);
  const elementById = new Map(selectedPoint.elements.map((element) => [element.id, element]));

  function setTimelineIndex(nextIndex: number) {
    const bounded = Math.max(0, Math.min(snapshot.timeline.length - 1, nextIndex));
    setSelectedIndex(bounded);
    const nextPoint = snapshot.timeline[bounded];
    if (selectedElementId && !nextPoint.elements.some((element) => element.id === selectedElementId)) {
      setSelectedElementId(null);
    }
  }

  function toggleFilter(value: ArchitectureFilter) {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function toggleStatus(value: ArchitectureStatus) {
    setActiveStatuses((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-[#050508] px-4 py-5 text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-5 border-b border-zinc-800 pb-5 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
              <Building2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Internal architecture
            </p>
            <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-normal text-zinc-50 sm:text-4xl">
              Project99 Architecture Observatory
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
              A versioned building view of the codebase, seeded from merged PRs, project memory, decisions, tests, and security evidence.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Latest release</p>
            <p className="mt-2 text-sm font-semibold text-zinc-100">{snapshot.timeline.at(-1)?.event.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{snapshot.elements.length} current elements</p>
          </div>
        </header>

        <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-5">
            <TimelineControls
              selectedIndex={selectedIndex}
              points={snapshot.timeline.map((point) => point.event)}
              onSelect={setTimelineIndex}
            />

            <FilterControls
              activeFilters={activeFilters}
              activeStatuses={activeStatuses}
              onToggleFilter={toggleFilter}
              onToggleStatus={toggleStatus}
            />

            <section className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">Current building view</p>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-50">{selectedPoint.event.title}</h2>
                </div>
                <span className={`w-fit rounded-md border px-3 py-2 text-xs font-medium ${operationClasses[selectedPoint.event.changeType]}`}>
                  {operationLabel(selectedPoint.event.changeType)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{selectedPoint.event.summary}</p>

              {filteredElements.length === 0 ? (
                <NoMatches />
              ) : (
                <BuildingElevation
                  elements={filteredElements}
                  elementById={elementById}
                  visibleIds={visibleIds}
                  changedIds={changedIds}
                  operationsByElementId={selectedPoint.operationsByElementId}
                  selectedElementId={selectedElement?.id ?? null}
                  onSelect={setSelectedElementId}
                />
              )}
            </section>

            <ChangeSummary event={selectedPoint.event} />
            <ArchitectureList
              elements={filteredElements}
              changedIds={changedIds}
              selectedElementId={selectedElement?.id ?? null}
              operationsByElementId={selectedPoint.operationsByElementId}
              onSelect={setSelectedElementId}
            />
          </div>

          <ElementInspector
            element={selectedElement}
            elements={selectedPoint.elements}
            operation={selectedElement ? selectedPoint.operationsByElementId[selectedElement.id] : undefined}
          />
        </section>
      </div>
    </main>
  );
}

function TimelineControls({
  selectedIndex,
  points,
  onSelect
}: {
  selectedIndex: number;
  points: ArchitectureEvent[];
  onSelect: (index: number) => void;
}) {
  const selected = points[selectedIndex];

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
            <History className="h-4 w-4 text-purple-300" aria-hidden="true" />
            Time travel timeline
          </p>
          <h2 className="mt-1 break-words text-lg font-semibold text-zinc-50">{selected.date} - {selected.milestone}</h2>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className="inline-flex min-h-11 w-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            onClick={() => onSelect(selectedIndex - 1)}
            disabled={selectedIndex === 0}
            aria-label="Previous architecture event"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            className="inline-flex min-h-11 w-11 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            onClick={() => onSelect(selectedIndex + 1)}
            disabled={selectedIndex === points.length - 1}
            aria-label="Next architecture event"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 text-sm font-medium text-emerald-100"
            type="button"
            onClick={() => onSelect(points.length - 1)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Latest
          </button>
        </div>
      </div>
      <label className="mt-4 block">
        <span className="sr-only">Selected architecture event</span>
        <input
          className="h-11 w-full accent-emerald-300"
          type="range"
          min={0}
          max={points.length - 1}
          value={selectedIndex}
          onChange={(event) => onSelect(Number(event.target.value))}
          aria-valuetext={`${selected.date}, ${selected.title}`}
        />
      </label>
      <div className="mt-2 flex justify-between gap-3 text-xs text-zinc-500">
        <span>{points[0].date}</span>
        <span className="min-w-0 break-words text-right">{selected.title}</span>
      </div>
    </section>
  );
}

function FilterControls({
  activeFilters,
  activeStatuses,
  onToggleFilter,
  onToggleStatus
}: {
  activeFilters: Set<ArchitectureFilter>;
  activeStatuses: Set<ArchitectureStatus>;
  onToggleFilter: (value: ArchitectureFilter) => void;
  onToggleStatus: (value: ArchitectureStatus) => void;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Filters</h2>
      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
        {filterOptions.map((option) => (
          <TogglePill
            key={option.value}
            active={activeFilters.has(option.value)}
            label={option.label}
            onClick={() => onToggleFilter(option.value)}
          />
        ))}
      </div>
      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
        {statusOptions.map((option) => (
          <TogglePill
            key={option.value}
            active={activeStatuses.has(option.value)}
            label={option.label}
            onClick={() => onToggleStatus(option.value)}
          />
        ))}
      </div>
    </section>
  );
}

function TogglePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border px-3 text-left text-sm font-medium transition ${
        active
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
          : "border-zinc-800 bg-zinc-950 text-zinc-500"
      }`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      {active ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
      <span className="min-w-0 break-words">{label}</span>
    </button>
  );
}

function BuildingElevation({
  elements,
  elementById,
  visibleIds,
  changedIds,
  operationsByElementId,
  selectedElementId,
  onSelect
}: {
  elements: ArchitectureElement[];
  elementById: Map<string, ArchitectureElement>;
  visibleIds: Set<string>;
  changedIds: Set<string>;
  operationsByElementId: Record<string, ArchitectureChangeOperation>;
  selectedElementId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-[#07070a] p-3">
      <svg
        className="min-h-[25rem] w-full min-w-[55rem]"
        viewBox="0 0 1100 690"
        role="img"
        aria-label="Project99 architecture building elevation"
      >
        <defs>
          <pattern id="blueprint-hatch" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 10L10 0" stroke="#7dd3fc" strokeWidth="1" opacity="0.5" />
          </pattern>
          <linearGradient id="glass-edge" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#111113" />
          </linearGradient>
        </defs>

        <rect x="55" y="40" width="990" height="610" rx="8" fill="#09090b" stroke="#27272a" />
        <path d="M95 585H1010L970 640H55Z" fill="#18181b" stroke="#3f3f46" />
        <path d="M120 500H985M120 415H985M120 330H985M120 245H985M120 165H985" stroke="#27272a" strokeDasharray="6 9" />
        <path d="M110 130L990 62V585H110Z" fill="url(#glass-edge)" opacity="0.28" />

        {elements.flatMap((element) =>
          element.dependencies
            .filter((dependencyId) => visibleIds.has(dependencyId))
            .flatMap((dependencyId) => {
              const dependency = elementById.get(dependencyId);
              if (!dependency) {
                return [];
              }
              const start = midpoint(dependency);
              const end = midpoint(element);
              return [
                <line
                  key={`${dependencyId}-${element.id}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#a78bfa"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                />
              ];
            })
        )}

        {elements.map((element) => {
          const changed = changedIds.has(element.id);
          const selected = selectedElementId === element.id;
          const operation = operationsByElementId[element.id];
          const fill = element.status === "planned" ? "url(#blueprint-hatch)" : changed ? "#34D399" : categoryFills[element.category];
          const stroke = selected ? "#f4f4f5" : changed ? "#34D399" : element.status === "planned" ? "#7dd3fc" : "#71717a";
          const textColor = changed && element.status !== "planned" ? "#042f2e" : "#f4f4f5";

          return (
            <g
              key={element.id}
              role="button"
              tabIndex={0}
              aria-label={`${element.name}, ${categoryLabels[element.category]}, ${operation ? operationLabel(operation) : "unchanged"}`}
              onClick={() => onSelect(element.id)}
              onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(element.id);
                }
              }}
              className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <rect
                x={element.position.x + 10}
                y={element.position.y - 8}
                width={element.position.width}
                height={element.position.height}
                rx="8"
                fill="#000"
                opacity="0.22"
              />
              <rect
                x={element.position.x}
                y={element.position.y}
                width={element.position.width}
                height={element.position.height}
                rx="8"
                fill={fill}
                fillOpacity={element.status === "planned" ? "0.25" : changed ? "0.95" : "0.82"}
                stroke={stroke}
                strokeWidth={selected ? "3" : "1.5"}
                strokeDasharray={element.status === "planned" ? "8 6" : undefined}
              />
              <text x={element.position.x + 14} y={element.position.y + 24} fill={textColor} fontSize="14" fontWeight="700">
                {element.name}
              </text>
              <text x={element.position.x + 14} y={element.position.y + 45} fill={textColor} opacity="0.8" fontSize="11">
                {categoryLabels[element.category]}
              </text>
              {operation ? (
                <text x={element.position.x + 14} y={element.position.y + element.position.height - 12} fill={textColor} opacity="0.82" fontSize="11">
                  {operationLabel(operation)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <Legend />
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Healthy implemented structure", sample: "bg-zinc-600" },
    { label: "Changed in selected release", sample: "bg-emerald-400" },
    { label: "Dependency connection", sample: "bg-purple-300" },
    { label: "Planned blueprint", sample: "border border-sky-300 bg-sky-300/10" },
    { label: "Incomplete or risk evidence", sample: "bg-amber-300" }
  ];

  return (
    <div className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-3 w-6 rounded-sm ${item.sample}`} aria-hidden="true" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChangeSummary({ event }: { event: ArchitectureEvent }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Change summary</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {event.changes.map((change) => (
          <article key={`${event.id}-${change.elementId}-${change.operation}`} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${operationClasses[change.operation]}`}>
              {operationLabel(change.operation)}
            </span>
            <h3 className="mt-2 text-sm font-semibold text-zinc-100">{change.element?.name ?? titleCase(change.elementId)}</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-400">{change.summary}</p>
          </article>
        ))}
      </div>
      {event.knownLimitations.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
          <p className="font-medium">Known limitations</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {event.knownLimitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ArchitectureList({
  elements,
  changedIds,
  selectedElementId,
  operationsByElementId,
  onSelect
}: {
  elements: ArchitectureElement[];
  changedIds: Set<string>;
  selectedElementId: string | null;
  operationsByElementId: Record<string, ArchitectureChangeOperation>;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
      <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
        <ListTree className="h-4 w-4 text-emerald-300" aria-hidden="true" />
        Architecture list
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {elements.map((element) => {
          const selected = selectedElementId === element.id;
          const operation = operationsByElementId[element.id];
          return (
            <button
              key={element.id}
              className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition ${
                selected ? "border-emerald-300 bg-emerald-300/10 text-emerald-50" : "border-zinc-800 bg-zinc-900/50 text-zinc-300"
              }`}
              type="button"
              onClick={() => onSelect(element.id)}
            >
              <span className="block font-medium">{element.name}</span>
              <span className="mt-1 block text-xs text-zinc-500">
                {categoryLabels[element.category]}{changedIds.has(element.id) && operation ? ` - ${operationLabel(operation)}` : ""}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ElementInspector({
  element,
  elements,
  operation
}: {
  element: ArchitectureElement | null;
  elements: ArchitectureElement[];
  operation?: ArchitectureChangeOperation;
}) {
  if (!element) {
    return (
      <aside className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 xl:sticky xl:top-5 xl:self-start">
        <h2 className="text-lg font-semibold text-zinc-50">Element inspector</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Select a building element or list item to inspect repository evidence.</p>
      </aside>
    );
  }

  const dependantIds = dependantsForElement(elements, element.id);

  return (
    <aside className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 xl:sticky xl:top-5 xl:self-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">Element inspector</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-50">{element.name}</h2>
        </div>
        {operation ? (
          <span className={`rounded-md border px-2 py-1 text-xs font-medium ${operationClasses[operation]}`}>
            {operationLabel(operation)}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-300">{element.responsibility}</p>

      <dl className="mt-4 grid gap-3 text-sm">
        <InspectorRow label="Category" value={categoryLabels[element.category]} />
        <InspectorRow label="Feature" value={element.feature} />
        <InspectorRow label="Status" value={titleCase(element.status)} valueClassName={statusClasses[element.status]} />
        <InspectorRow label="Introduced" value={element.introduced} />
        <InspectorRow label="Last changed" value={element.lastChanged} />
      </dl>

      <InspectorSection title="Repository paths" items={element.paths} />
      <InspectorSection title="Dependencies" items={element.dependencies.length > 0 ? element.dependencies.map(titleCase) : ["None recorded"]} />
      <InspectorSection title="Dependants" items={dependantIds.length > 0 ? dependantIds.map(titleCase) : ["None recorded"]} />

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-zinc-100">Source references</h3>
        <ul className="mt-2 space-y-2 text-sm text-zinc-400">
          {element.sourceRefs.map((reference) => (
            <li key={`${reference.label}-${reference.url ?? reference.commit ?? ""}`}>
              {reference.url?.startsWith("https://") ? (
                <a className="inline-flex items-center gap-1 text-emerald-100 underline-offset-4 hover:underline" href={reference.url}>
                  {reference.label}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <span>{reference.label}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Verification evidence
        </h3>
        <ul className="mt-2 space-y-2 text-sm">
          {element.verification.length > 0 ? (
            element.verification.map((item) => (
              <li key={`${item.label}-${item.path ?? item.detail ?? ""}`} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                <span className="font-medium text-zinc-100">{item.label}</span>
                <span className="ml-2 text-xs text-zinc-500">{titleCase(item.status)}</span>
                {item.path ? <span className="mt-1 block text-xs text-zinc-500">{item.path}</span> : null}
                {item.detail ? <span className="mt-1 block text-xs leading-5 text-zinc-400">{item.detail}</span> : null}
              </li>
            ))
          ) : (
            <li className="text-zinc-500">No direct verification recorded.</li>
          )}
        </ul>
      </section>

      {element.limitations.length > 0 ? (
        <section className="mt-5 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Known limitations
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {element.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

function InspectorRow({
  label,
  value,
  valueClassName
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd>
        {valueClassName ? (
          <span className={`rounded-md border px-2 py-1 text-xs font-medium ${valueClassName}`}>{value}</span>
        ) : (
          <span className="text-zinc-200">{value}</span>
        )}
      </dd>
    </div>
  );
}

function InspectorSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-zinc-400">
        {items.map((item) => (
          <li key={item} className="break-words rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function NoMatches() {
  return (
    <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-5 text-amber-100">
      <SearchX className="h-6 w-6" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold">No matching elements</h2>
      <p className="mt-2 text-sm leading-6">Change the filters to bring architecture elements back into the building view.</p>
    </div>
  );
}

function ArchitectureProblem({ warnings }: { warnings: string[] }) {
  return (
    <main className="min-h-screen bg-[#050508] px-4 py-8 text-zinc-50">
      <section className="mx-auto max-w-3xl rounded-lg border border-red-400/30 bg-red-400/10 p-5">
        <AlertTriangle className="h-6 w-6 text-red-100" aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-semibold">Architecture history is malformed</h1>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-red-100">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function ArchitectureEmpty() {
  return (
    <main className="min-h-screen bg-[#050508] px-4 py-8 text-zinc-50">
      <section className="mx-auto max-w-3xl rounded-lg border border-zinc-800 bg-zinc-950/80 p-5">
        <Building2 className="h-6 w-6 text-zinc-400" aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-semibold">No architecture history yet</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Add the first event to `src/data/architecture-events.ts`, then run `npm run architecture:generate`.</p>
      </section>
    </main>
  );
}
