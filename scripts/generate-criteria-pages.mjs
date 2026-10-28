#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * The shipped assessment criteria register, published: generated from standards/assessment/lenses/*.yaml
 * into docs/assessment-criteria/ by the architecture skill's page generator (skills/architecture/src/pages.mjs),
 * which an organisation runs over its own criteria as `assess.mjs pages`. Each page's file name is its
 * criterion id in lower case, so a Docusaurus site gives every criterion a stable URL,
 * <site>/<docs path>/assessment-criteria/core-tgt-05, that reports and readouts link to (the report
 * flow's criteriaUrl binding). The lens files are the register and stay the source; the pages are
 * never edited by hand.
 *
 *   node scripts/generate-criteria-pages.mjs           write the pages
 *   node scripts/generate-criteria-pages.mjs --check   fail if any page is missing, stale or orphaned
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { criteriaPages, writePages } from "../skills/architecture/src/pages.mjs";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lensDir = join(root, "standards/assessment/lenses");
const outDir = join(root, "docs/assessment-criteria");
const check = process.argv.includes("--check");
if (process.argv.some(a => a === "--help" || a === "-h")) {
  console.log("usage: node scripts/generate-criteria-pages.mjs [--check]");
  process.exit(0);
}

const lenses = readdirSync(lensDir).filter(f => f.endsWith(".yaml")).map(f => yaml.load(readFileSync(join(lensDir, f), "utf8")));
const standard = "../../standards/assessment/standard-architecture-assessment.md";
const pages = criteriaPages(lenses, {
  outDir,
  lensLink: l => ({ href: `../../standards/assessment/lenses/${l.lens.id}.yaml`, label: `standards/assessment/lenses/${l.lens.id}.yaml` }),
  standardHref: standard,
  generatedBy: "scripts/generate-criteria-pages.mjs from standards/assessment/lenses/",
  registerNote: "The lens files in `standards/assessment/lenses/` are the register, valid against `lens.schema.json`; these pages are generated from them.",
  dump: v => yaml.dump(v),
});

const problems = writePages(pages, outDir, { check });
if (check) {
  if (problems.length) {
    console.error(problems.join("\n") + `\nRun node scripts/generate-criteria-pages.mjs and commit docs/assessment-criteria/.`);
    process.exit(1);
  }
  console.log(`criteria pages are up to date (${pages.size} pages)`);
} else {
  console.log(`wrote ${pages.size} pages to docs/assessment-criteria/`);
}
