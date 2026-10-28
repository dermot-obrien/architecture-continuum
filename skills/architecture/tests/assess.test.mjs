// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

// The assessment's tool check (src/assess.mjs) against the worked example the skill carries.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadModules, SKILL_DIR } from "../src/continuum.mjs";
import { CHECKS, changedPaths, check, criteriaToRecheck, lensesFor } from "../src/assess.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const modules = loadModules(path.resolve(here, "../../.."));
const yaml = modules?.yaml;
const assessment = path.join(SKILL_DIR, "references/standards/assessment");
const lenses = yaml ? readdirSync(path.join(assessment, "lenses")).filter(f => f.endsWith(".yaml")).map(f => yaml.load(readFileSync(path.join(assessment, "lenses", f), "utf8"))) : [];
const sd001 = () => yaml.load(readFileSync(path.join(assessment, "examples/SD-001-delivery-exception-agent.design.yaml"), "utf8"));

test("every check names a criterion a lens defines", { skip: !yaml }, () => {
  const ids = new Set(lenses.flatMap(l => l.criteria.map(c => c.id)));
  for (const id of Object.keys(CHECKS)) assert.ok(ids.has(id), `${id} is not in any lens`);
});

test("lenses follow the facets and the trigger", { skip: !yaml }, () => {
  const spec = sd001();
  assert.deepEqual(lensesFor(spec, "new-design", lenses).map(l => l.lens.id), ["core", "ai-solution", "ai-agent"]);
  assert.deepEqual(lensesFor(spec, "production-entry", lenses).map(l => l.lens.id), ["core", "ai-solution", "ai-agent", "production"]);
});

test("SD-001's irreversible email tool and missing cost limit are found", { skip: !yaml }, () => {
  const results = check(sd001(), lensesFor(sd001(), "new-design", lenses));
  const by = id => results.find(r => r.criterion === id);
  assert.equal(by("AGT-ACT-02").result, "not-met");
  assert.equal(by("AGT-CTL-01").result, "partly-met");
  assert.equal(by("CORE-DEM-01").result, "met");
  assert.ok(results.every(r => ["met", "partly-met", "not-met", "not-applicable", "not-assessed", "manual"].includes(r.result)));
});

test("target-state criteria wait for the triage record", { skip: !yaml }, () => {
  const results = check(sd001(), lensesFor(sd001(), "new-design", lenses));
  assert.equal(results.find(r => r.criterion === "CORE-TGT-05").result, "not-assessed");
});

test("a change re-checks only the criteria that read what changed", { skip: !yaml }, () => {
  const before = sd001();
  const after = sd001();
  after.connectors[0].authentication = "mutual TLS";
  const changed = changedPaths(before, after);
  assert.deepEqual(changed, ["connectors.authentication"]);
  const ids = criteriaToRecheck(changed, lensesFor(after, "new-design", lenses)).map(r => r.criterion);
  assert.ok(ids.includes("CORE-SEC-02"));
  assert.ok(!ids.includes("AIS-EVAL-01"));
});
