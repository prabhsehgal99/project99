#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const target = process.argv[2];

if (target !== "dev" && target !== "prod") {
  console.error("Usage: node scripts/dispatch-firestore-rules-deployment.mjs <dev|prod>");
  process.exit(1);
}

const workflow = "deploy-firestore-rules.yml";
const result = spawnSync(
  "gh",
  ["workflow", "run", workflow, "--ref", "main", "--field", `target=${target}`],
  { stdio: "inherit" }
);

if (result.error) {
  console.error(
    "\nCould not start the protected Rules deployment workflow. Install and authenticate the GitHub CLI, or run the workflow from GitHub Actions.\n"
  );
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(
  `\nRequested the ${target} Firestore Rules deployment from main. ` +
    "The workflow runs the emulator suite before it releases rules; follow its result in GitHub Actions.\n"
);
