#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * assess.mjs: the assessment's check depth as a tool, what a change must re-check, and the
 * criteria in force.
 *
 *   node bin/assess.mjs check <spec.design.yaml> [--triage <triage.yaml>] [--trigger <trigger>] [--json] [--fail-on blocker|major|none]
 *   node bin/assess.mjs changed <old.design.yaml> <new.design.yaml> [--trigger <trigger>] [--json]
 *   node bin/assess.mjs criteria [--json]
 *   node bin/assess.mjs pages --out <dir> [--check] [--title <title>]
 *
 * The criteria are the lenses this skill ships, unless [suite.architecture] of the workspace's
 * .agents/skill-bindings.toml binds assessment to an organisation's criteria folder (an
 * assessment.yaml and its lenses), or --assessment names one. Every command takes --assessment
 * and --bindings.
 *
 * check validates the specification against design.schema.json, then applies every criterion
 * decided by tool, and the presence half of every criterion decided by both, from the lenses the
 * design brings in (those that apply always, those its profiles bring in, and those the
 * --trigger brings in, such as production with production-entry). A shipped criterion has a
 * coded check; an organisation's has the declarative check its lens gives it; one with neither
 * is reported as manual. With --triage, the target-state criteria read the attested positions.
 * It exits 1 when a criterion at or above --fail-on (default blocker) is not met, so it can gate
 * a pull request.
 *
 * changed lists the fields that differ between two versions of a specification and the criteria
 * whose reads touch them: what a change assessment re-checks, rather than the whole design.
 *
 * criteria validates the criteria in force and lists them: the set, each lens and version, and
 * what each criterion is decided by. pages writes the criteria register as Markdown, one page per
 * criterion named by its id in lower case, for a Docusaurus site that criteriaUrl points at.
 *
 * Exit 0 ok, 1 a criterion failed at the --fail-on level (or, for pages --check, a page is out of
 * date), 2 usage, an invalid specification or criteria, or a missing module.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { INSTALL_HINT, loadConfig, loadModules } from "../src/continuum.mjs";
import { changedPaths, check, CHECKS, criteriaToRecheck, lensesFor } from "../src/assess.mjs";
import { ajvFor, loadCriteria, STANDARDS_DIR } from "../src/criteria.mjs";
import { criteriaPages, writePages } from "../src/pages.mjs";

const USAGE = `usage: assess.mjs check <spec.design.yaml> [--triage <triage.yaml>] [--trigger <trigger>] [--json] [--fail-on blocker|major|none]
       assess.mjs changed <old.design.yaml> <new.design.yaml> [--trigger <trigger>] [--json]
       assess.mjs criteria [--json]
       assess.mjs pages --out <dir> [--check] [--title <title>]
Every command also takes --assessment <folder> and --bindings <skill-bindings.toml>.
Exit 0 ok, 1 a criterion failed at the --fail-on level (or a page is out of date), 2 usage, invalid input or a missing module.`;

const argv = process.argv.slice(2);
const command = argv.shift();
const flags = {};
const files = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (["--json", "--help", "--check"].includes(a)) flags[a.slice(2)] = true;
  else if (a.startsWith("--")) flags[a.slice(2)] = argv[++i];
  else files.push(a);
}
if (flags.help || !["check", "changed", "criteria", "pages"].includes(command)) { console.log(USAGE); process.exit(flags.help ? 0 : 2); }

const config = loadConfig({ cwd: process.cwd(), bindings: flags.bindings });
const modules = loadModules(config.workspace);
if (!modules) { console.error(INSTALL_HINT); process.exit(2); }
const { yaml } = modules;

const folder = flags.assessment ? path.resolve(process.cwd(), flags.assessment) : config.assessment;
const criteria = loadCriteria(folder, modules);
for (const w of criteria.warnings) console.error(`warning: ${w}`);
if (criteria.problems.length) {
  console.error(`The assessment criteria${folder ? ` in ${folder}` : ""} are not valid, so nothing is assessed:`);
  for (const p of criteria.problems) console.error(`  ${p}`);
  process.exit(2);
}
const lenses = criteria.lenses;
const setLabel = `${criteria.set.id}${criteria.set.version ? ` ${criteria.set.version}` : ""}`;
const load = f => yaml.load(readFileSync(f, "utf8"));

function validate(spec, file) {
  const v = ajvFor(modules).compile(JSON.parse(readFileSync(path.join(STANDARDS_DIR, "assessment/schemas/design.schema.json"), "utf8")));
  if (v(spec)) return true;
  console.error(`${file} does not validate against design.schema.json, so the assessment is deferred:`);
  for (const e of v.errors.slice(0, 20)) console.error(`  ${e.instancePath || "/"} ${e.message}`);
  return false;
}

if (command === "check") {
  if (files.length !== 1) { console.log(USAGE); process.exit(2); }
  const spec = load(files[0]);
  if (!validate(spec, files[0])) process.exit(2);
  const triage = flags.triage ? load(flags.triage) : undefined;
  const applied = lensesFor(spec, flags.trigger, lenses);
  const results = check(spec, applied, { triage });
  const rank = { blocker: 3, major: 2, minor: 1, advisory: 0 };
  const failOn = flags["fail-on"] || "blocker";
  const failing = results.filter(r => ["not-met", "partly-met"].includes(r.result) && failOn !== "none" && rank[r.severity] >= rank[failOn]);
  const { source, ...set } = criteria.set;
  if (flags.json) {
    console.log(JSON.stringify({ specification: files[0], design: spec.design?.id, version: spec.design?.version, criteria_set: set, lenses: applied.map(l => `${l.lens.id} ${l.lens.version}`), results }, null, 2));
  } else {
    const count = k => results.filter(r => r.result === k).length;
    console.log(`${spec.design?.id} ${spec.design?.version}: criteria ${setLabel}; lenses ${applied.map(l => `${l.lens.id} ${l.lens.version}`).join(", ")}`);
    console.log(`  met ${count("met")}, partly-met ${count("partly-met")}, not-met ${count("not-met")}, not-applicable ${count("not-applicable")}, not-assessed ${count("not-assessed")}, manual ${count("manual")}`);
    for (const r of results.filter(r => !["met", "not-applicable"].includes(r.result))) {
      const tag = r.decided_by === "both" ? " (presence half; a reviewer judges the rest)" : "";
      const was = r.default_severity ? ` (lens: ${r.default_severity})` : "";
      console.log(`${r.result.padEnd(14)} ${r.criterion.padEnd(12)} ${r.severity}${was}${tag}`);
      for (const n of r.notes) console.log(`    ${n}`);
    }
  }
  process.exit(failing.length ? 1 : 0);
}

if (command === "changed") {
  if (files.length !== 2) { console.log(USAGE); process.exit(2); }
  const [before, after] = files.map(load);
  if (!validate(after, files[1])) process.exit(2);
  const changed = changedPaths(before, after);
  const applied = lensesFor(after, flags.trigger, lenses);
  const recheck = criteriaToRecheck(changed, applied);
  if (flags.json) console.log(JSON.stringify({ changed, recheck }, null, 2));
  else {
    console.log(`${changed.length} changed field paths; ${recheck.length} criteria to re-check:`);
    for (const p of changed) console.log(`  changed  ${p}`);
    for (const r of recheck) console.log(`  re-check ${r.criterion.padEnd(12)} ${r.severity.padEnd(8)} ${r.decided_by.padEnd(8)} reads ${r.because.join(", ")}`);
  }
  process.exit(0);
}

if (command === "criteria") {
  const how = (l, c) => c.decided_by === "reviewer" ? "reviewer" : c.check ? "declarative check" : l.builtin !== false && CHECKS[c.id] ? "coded check" : "manual";
  const rows = lenses.flatMap(l => l.criteria.map(c => ({ criterion: c.id, lens: l.lens.id, severity: c.severity, ...(c.default_severity ? { default_severity: c.default_severity } : {}), decided_by: c.decided_by, checked_by: how(l, c) })));
  if (flags.json) {
    console.log(JSON.stringify({ criteria_set: criteria.set, standards: criteria.standards, lenses: lenses.map(l => ({ id: l.lens.id, version: l.lens.version, applies_when: l.lens.applies_when, file: l.file, shipped: l.builtin !== false })), criteria: rows }, null, 2));
  } else {
    console.log(`criteria ${setLabel} (${criteria.set.source}): ${rows.length} criteria in ${lenses.length} lenses`);
    for (const l of lenses) {
      const w = l.lens.applies_when;
      console.log(`  ${l.lens.id.padEnd(16)} ${l.lens.version.padEnd(8)} ${w === "always" ? "always" : w.profile ? `profile ${w.profile}` : `trigger ${w.trigger}`}${l.builtin === false ? "" : " (shipped)"}  ${l.criteria.length} criteria`);
    }
    const manual = rows.filter(r => r.checked_by === "manual");
    if (manual.length) console.log(`  manual (decided by tool or both, with no check): ${manual.map(r => r.criterion).join(", ")}`);
    const changed = rows.filter(r => r.default_severity);
    if (changed.length) console.log(`  severities changed: ${changed.map(r => `${r.criterion} ${r.default_severity} -> ${r.severity}`).join(", ")}`);
    console.log(`  standards: ${criteria.standards.assessment}, ${criteria.standards.triage}`);
  }
  process.exit(0);
}

if (command === "pages") {
  if (!flags.out) { console.log(USAGE); process.exit(2); }
  const outDir = path.resolve(process.cwd(), flags.out);
  const own = criteria.set.source !== "shipped";
  const standardHref = own && criteria.standards.assessment && !criteria.standards.assessment.startsWith(STANDARDS_DIR)
    ? path.relative(outDir, criteria.standards.assessment).split(path.sep).join("/") : undefined;
  const pages = criteriaPages(lenses, {
    outDir,
    standardHref,
    dump: v => yaml.dump(v),
    title: flags.title,
    ...(own ? { intro: `Every criterion ${criteria.set.title || criteria.set.id} ${criteria.set.version} applies`, registerNote: "The lens files and `assessment.yaml` are the register; these pages are generated from them by `assess.mjs pages`." } : {}),
  });
  const problems = writePages(pages, outDir, { check: flags.check });
  if (flags.check) {
    if (problems.length) { console.error(problems.join("\n") + `\nRun assess.mjs pages --out ${flags.out} and commit the pages.`); process.exit(1); }
    console.log(`criteria pages are up to date (${pages.size} pages)`);
  } else console.log(`wrote ${pages.size} pages to ${flags.out}`);
  process.exit(0);
}
