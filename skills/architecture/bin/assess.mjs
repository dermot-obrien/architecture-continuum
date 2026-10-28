#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * assess.mjs: the assessment's check depth as a tool, and what a change must re-check.
 *
 *   node bin/assess.mjs check <spec.design.yaml> [--triage <triage.yaml>] [--trigger <trigger>] [--json] [--fail-on blocker|major|none]
 *   node bin/assess.mjs changed <old.design.yaml> <new.design.yaml> [--trigger <trigger>] [--json]
 *
 * check validates the specification against design.schema.json, then applies every criterion
 * decided by tool, and the presence half of every criterion decided by both, from the lenses the
 * design brings in (core always; ai-solution and ai-agent by facet; production with
 * --trigger production-entry). A criterion not yet automated is reported as manual. With
 * --triage, the target-state criteria read the attested positions. It exits 1 when a criterion at
 * or above --fail-on (default blocker) is not met, so it can gate a pull request.
 *
 * changed lists the fields that differ between two versions of a specification and the criteria
 * whose reads touch them: what a change assessment re-checks, rather than the whole design.
 *
 * Exit 0 ok, 1 a criterion failed at the --fail-on level, 2 usage, an invalid specification or a
 * missing module.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { INSTALL_HINT, loadModules, SKILL_DIR } from "../src/continuum.mjs";
import { changedPaths, check, criteriaToRecheck, lensesFor } from "../src/assess.mjs";

const USAGE = `usage: assess.mjs check <spec.design.yaml> [--triage <triage.yaml>] [--trigger <trigger>] [--json] [--fail-on blocker|major|none]
       assess.mjs changed <old.design.yaml> <new.design.yaml> [--trigger <trigger>] [--json]
Exit 0 ok, 1 a criterion failed at the --fail-on level, 2 usage, an invalid specification or a missing module.`;

const argv = process.argv.slice(2);
const command = argv.shift();
const flags = {};
const files = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--json" || a === "--help") flags[a.slice(2)] = true;
  else if (a.startsWith("--")) flags[a.slice(2)] = argv[++i];
  else files.push(a);
}
if (flags.help || !["check", "changed"].includes(command)) { console.log(USAGE); process.exit(flags.help ? 0 : 2); }

const modules = loadModules(process.cwd());
if (!modules) { console.error(INSTALL_HINT); process.exit(2); }
const { Ajv, addFormats, yaml } = modules;

const standards = path.join(SKILL_DIR, "references/standards");
const lensDir = path.join(standards, "assessment/lenses");
const lenses = readdirSync(lensDir).filter(f => f.endsWith(".yaml")).map(f => yaml.load(readFileSync(path.join(lensDir, f), "utf8")));
const load = f => yaml.load(readFileSync(f, "utf8"));

function validate(spec, file) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(JSON.parse(readFileSync(path.join(standards, "schemas/v1.1.0/envelope.schema.json"), "utf8")), "envelope.schema.json");
  const v = ajv.compile(JSON.parse(readFileSync(path.join(standards, "assessment/schemas/design.schema.json"), "utf8")));
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
  if (flags.json) {
    console.log(JSON.stringify({ specification: files[0], design: spec.design?.id, version: spec.design?.version, lenses: applied.map(l => `${l.lens.id} ${l.lens.version}`), results }, null, 2));
  } else {
    const count = k => results.filter(r => r.result === k).length;
    console.log(`${spec.design?.id} ${spec.design?.version}: lenses ${applied.map(l => `${l.lens.id} ${l.lens.version}`).join(", ")}`);
    console.log(`  met ${count("met")}, partly-met ${count("partly-met")}, not-met ${count("not-met")}, not-applicable ${count("not-applicable")}, not-assessed ${count("not-assessed")}, manual ${count("manual")}`);
    for (const r of results.filter(r => !["met", "not-applicable"].includes(r.result))) {
      const tag = r.decided_by === "both" ? " (presence half; a reviewer judges the rest)" : "";
      console.log(`${r.result.padEnd(14)} ${r.criterion.padEnd(12)} ${r.severity}${tag}`);
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
