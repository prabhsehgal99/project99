import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { architectureEvents } from "../../src/data/architecture-events";
import { validateArchitectureEvents } from "../../src/lib/architecture-observatory";

const baseRef = process.env.ARCHITECTURE_OBSERVATORY_BASE_REF ?? "origin/main";
const ledgerPath = "src/data/architecture-events.ts";
const generatedPath = "src/generated/architecture-observatory-data.ts";
const exceptionPath = "docs/architecture/observatory-exceptions.md";

const relevantPrefixes = [
  ".github/workflows/",
  "public/",
  "src/app/",
  "src/components/",
  "src/lib/",
  "tests/",
  "docs/project/"
];

const relevantExactPaths = [
  "AGENTS.md",
  "PROJECT_CONTEXT.md",
  "firestore.rules",
  "next.config.ts",
  "package.json",
  "package-lock.json"
];

const ignoredRelevantPaths = new Set<string>([
  "src/generated/architecture-observatory-data.ts",
  "src/lib/architecture-observatory.ts",
  "src/lib/architecture-observatory.test.ts"
]);

function runGit(args: string[]) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function changedFiles() {
  const committed = runGit(["diff", "--name-only", `${baseRef}...HEAD`]);
  const staged = runGit(["diff", "--name-only", "--cached"]);
  const unstaged = runGit(["diff", "--name-only"]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  const paths = [
    ...committed.split("\n"),
    ...staged.split("\n"),
    ...unstaged.split("\n"),
    ...untracked.split("\n")
  ].filter(Boolean);
  return Array.from(new Set(paths)).sort();
}

function isRelevant(path: string) {
  if (ignoredRelevantPaths.has(path)) {
    return false;
  }

  return relevantExactPaths.includes(path) || relevantPrefixes.some((prefix) => path.startsWith(prefix));
}

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
    return value.length === 0
      ? "[]"
      : `[\n${value.map((item) => `${childSpacing}${stableStringify(item, indent + 1)}`).join(",\n")}\n${spacing}]`;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return keys.length === 0
      ? "{}"
      : `{\n${keys.map((key) => `${childSpacing}${JSON.stringify(key)}: ${stableStringify(record[key], indent + 1)}`).join(",\n")}\n${spacing}}`;
  }

  return "null";
}

function generatedContent() {
  const warnings = validateArchitectureEvents(architectureEvents);

  if (warnings.length > 0) {
    throw new Error(`Architecture history is invalid:\n${warnings.map((warning) => `- ${warning}`).join("\n")}`);
  }

  return [
    "import type { ArchitectureEvent } from \"@/lib/architecture-observatory\";",
    "",
    "export const architectureObservatoryGeneratedAt = \"generated-by-npm-run-architecture-generate\";",
    "",
    "export const architectureObservatoryEvents =",
    `${stableStringify(architectureEvents)} satisfies ArchitectureEvent[];`,
    ""
  ].join("\n");
}

function assertGeneratedArtifactFresh() {
  if (!existsSync(generatedPath)) {
    throw new Error(`Missing ${generatedPath}. Run npm run architecture:generate.`);
  }

  const expected = generatedContent();
  const actual = readFileSync(generatedPath, "utf8");

  if (actual !== expected) {
    const tempDir = mkdtempSync(resolve(tmpdir(), "project99-architecture-"));
    const expectedPath = resolve(tempDir, "architecture-observatory-data.ts");
    writeFileSync(expectedPath, expected);
    throw new Error(
      [
        `${generatedPath} is stale. Run npm run architecture:generate.`,
        `Expected output was written to ${expectedPath} for inspection.`
      ].join("\n")
    );
  }
}

function main() {
  assertGeneratedArtifactFresh();

  const files = changedFiles();
  const relevantFiles = files.filter(isRelevant);
  const ledgerChanged = files.includes(ledgerPath);
  const generatedChanged = files.includes(generatedPath);
  const exceptionChanged = files.includes(exceptionPath);

  if (relevantFiles.length > 0 && !ledgerChanged && !exceptionChanged) {
    throw new Error(
      [
        "Architecture Observatory history may be stale.",
        "",
        `Relevant files changed relative to ${baseRef}:`,
        ...relevantFiles.map((file) => `- ${file}`),
        "",
        `Update ${ledgerPath} and run npm run architecture:generate.`,
        `If the change has no architectural effect, add a dated entry to ${exceptionPath} and explain why.`
      ].join("\n")
    );
  }

  if (ledgerChanged && !generatedChanged) {
    throw new Error(`${ledgerPath} changed without ${generatedPath}. Run npm run architecture:generate.`);
  }

  if (exceptionChanged && !existsSync(exceptionPath)) {
    throw new Error(`${exceptionPath} was referenced but does not exist.`);
  }

  console.log(
    relevantFiles.length === 0
      ? "Architecture Observatory freshness check passed: no relevant architecture files changed."
      : "Architecture Observatory freshness check passed."
  );

}

main();
