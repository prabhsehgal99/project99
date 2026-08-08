import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { architectureEvents } from "../../src/data/architecture-events";
import { validateArchitectureEvents } from "../../src/lib/architecture-observatory";

const outputPath = resolve(process.cwd(), "src/generated/architecture-observatory-data.ts");

function stableStringify(value: unknown, indent = 0): string {
  const spacing = "  ".repeat(indent);
  const childSpacing = "  ".repeat(indent + 1);

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    return `[\n${value.map((item) => `${childSpacing}${stableStringify(item, indent + 1)}`).join(",\n")}\n${spacing}]`;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();

    if (keys.length === 0) {
      return "{}";
    }

    return `{\n${keys.map((key) => `${childSpacing}${JSON.stringify(key)}: ${stableStringify(record[key], indent + 1)}`).join(",\n")}\n${spacing}}`;
  }

  return "null";
}

function main() {
  const warnings = validateArchitectureEvents(architectureEvents);

  if (warnings.length > 0) {
    throw new Error(`Architecture history is invalid:\n${warnings.map((warning) => `- ${warning}`).join("\n")}`);
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    [
      "import type { ArchitectureEvent } from \"@/lib/architecture-observatory\";",
      "",
      "export const architectureObservatoryGeneratedAt = \"generated-by-npm-run-architecture-generate\";",
      "",
      "export const architectureObservatoryEvents =",
      `${stableStringify(architectureEvents)} satisfies ArchitectureEvent[];`,
      ""
    ].join("\n")
  );

  console.log(`Generated ${relative(process.cwd(), outputPath)} from ${architectureEvents.length} architecture events.`);
}

main();
