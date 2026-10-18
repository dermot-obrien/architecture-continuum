#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0
// Written by the workspace skill (architecture-continuum). Re-run its install to update it; do not edit here.
//
// The repository's door to its architecture skills. The skills are optional tooling: when the
// workspace skill is installed this runs its command, and when it is not it says so in one line
// and exits 0, so a clone without the skills still checks and builds from what is committed.
//
//   node scripts/architecture.mjs check        the continuum and cross-reference checks
//   node scripts/architecture.mjs regenerate   diagrams and decks from the pages (npm's prebuild)
//   node scripts/architecture.mjs doctor       what is declared, installed and left over
//   node scripts/architecture.mjs reinit       clear out what is left over, install the skills, build
//
// reinit is the one command that installs the skills first when they are missing.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const INSTALLER = "__INSTALLER__";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tool = path.join(root, ".agents", "skills", "workspace", "bin", "workspace.mjs");
const [cmd = "doctor", ...rest] = process.argv.slice(2);
const node = (args) => spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" }).status ?? 1;

if (cmd === "reinit") {
  if (!existsSync(tool) && rest.includes("--dry-run")) {
    console.error("reinit --dry-run: the skills are not installed, and a dry run installs nothing; run reinit without --dry-run, or npm run skills first to see the plan");
    process.exit(0);
  }
  if (!existsSync(tool)) {
    const installer = path.join(root, INSTALLER);
    const locked = existsSync(path.join(root, ".agents", "skills.lock.json")) ? ["--locked"] : [];
    const at = rest.indexOf("--from");
    const from = at >= 0 && rest[at + 1] ? ["--from", path.resolve(rest[at + 1])] : [];
    let status = node([installer, "sync", ...locked, "--copy", ...from]);
    // A lock written for an older declaration may not hold the workspace skill: install what is declared.
    if (status === 0 && !existsSync(tool) && locked.length) status = node([installer, "sync", "--copy", ...from]);
    if (status !== 0 || !existsSync(tool)) {
      console.error("reinit stopped: the skills did not install, or .agents/skills.json does not declare workspace");
      process.exit(status || 1);
    }
  }
  process.exit(node([tool, "init", "--repo", root, ...rest]));
}
if (!existsSync(tool)) {
  console.error(`${cmd} skipped: the workspace skill is not installed (npm run skills installs the architecture skills)`);
  process.exit(0);
}
process.exit(node([tool, cmd, "--repo", root, ...rest]));
