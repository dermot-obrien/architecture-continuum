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
  assert.deepEqual(lensesFor(spec, "new-design", lenses).map(l => l.lens.id), ["core", "ai-solution", "ai-agent", "privacy"]);
  assert.deepEqual(lensesFor(spec, "production-entry", lenses).map(l => l.lens.id), ["core", "ai-solution", "ai-agent", "privacy", "production"]);
  const anonymous = sd001();
  for (const d of anonymous.data) d.personal = false;
  assert.ok(!lensesFor(anonymous, "new-design", lenses).some(l => l.lens.id === "privacy"));
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

test("every tool and shared criterion is automated", { skip: !yaml }, () => {
  const missing = lenses.flatMap(l => l.criteria.filter(c => c.decided_by !== "reviewer" && !CHECKS[c.id] && !c.check).map(c => c.id));
  assert.deepEqual(missing, []);
});

test("the lethal trifecta is caught, and lifting one leg clears it", { skip: !yaml }, () => {
  const spec = sd001();
  const agent = spec.elements.find(e => e.agent);
  agent.ai.input_trust = "untrusted";
  const sensitive = (spec.data || []).find(d => d.personal === true || ["confidential", "restricted"].includes(d.classification));
  agent.ai.grounding = { ...(agent.ai.grounding || {}), sources: [sensitive.id] };
  agent.agent.tools[0] = { ...agent.agent.tools[0], effect: "external-communication", approval: "autonomous" };
  const run = s => check(s, lensesFor(s, "new-design", lenses)).find(r => r.criterion === "AGT-INJ-01").result;
  assert.equal(run(spec), "not-met");
  agent.agent.tools = agent.agent.tools.map(t => ({ ...t, approval: "human-approved" }));
  assert.equal(run(spec), "met");
});

test("the privacy lens: a connector carrying personal data must authenticate and authorise", { skip: !yaml }, () => {
  const spec = sd001();
  const run = () => check(spec, lensesFor(spec, "new-design", lenses));
  const personal = spec.data.find(d => d.personal).id;
  spec.connectors[0] = { ...spec.connectors[0], data: [personal], authentication: "none", authorisation: "role-based" };
  const r = run().find(x => x.criterion === "PRV-SEC-02");
  assert.notEqual(r.result, "met");
  assert.ok(r.notes.some(n => n.includes("no authentication")));
  spec.connectors[0].authentication = "OAuth 2.0 client credentials";
  const anyPersonal = new Set(spec.data.filter(d => d.personal).map(d => d.id));
  for (const k of spec.connectors.filter(k => (k.data || []).some(d => anyPersonal.has(d)))) { k.authentication = "mTLS"; k.authorisation = "scoped token"; }
  assert.equal(run().find(x => x.criterion === "PRV-SEC-02").result, "met");
  const rights = run().find(x => x.criterion === "PRV-RGT-01");
  assert.ok(["met", "not-met"].includes(rights.result));
  spec.scenarios.push({ id: "sc-erase", type: "functional", name: "A customer asks for their data to be erased" });
  assert.equal(run().find(x => x.criterion === "PRV-RGT-01").result, "met");
});

test("target-state positions come from the triage record", { skip: !yaml }, () => {
  const spec = sd001();
  const block = spec.elements.find(e => ["sbb", "technology"].includes(e.kind));
  const triage = { target_state: spec.elements.filter(e => ["sbb", "technology", "deployment-node"].includes(e.kind)).map(e => ({ element: e.id, position: e.id === block.id ? "retired" : "target" })) };
  const r = check(spec, lensesFor(spec, "new-design", lenses), { triage }).find(x => x.criterion === "CORE-TGT-01");
  assert.notEqual(r.result, "met");
  assert.ok(r.notes.some(n => n.includes("retired")));
});
