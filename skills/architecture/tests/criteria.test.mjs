// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

// An organisation's own criteria (src/criteria.mjs): the binding, the merge with the shipped
// lenses, declarative checks and the published pages, against the example the skill carries.

import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, loadModules, SKILL_DIR } from "../src/continuum.mjs";
import { check, lensesFor } from "../src/assess.mjs";
import { ajvFor, evaluateCheck, loadCriteria } from "../src/criteria.mjs";
import { criteriaPages } from "../src/pages.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const modules = loadModules(path.resolve(here, "../../.."));
const yaml = modules?.yaml;
const examples = path.join(SKILL_DIR, "references/standards/assessment/examples");
const acme = path.join(examples, "organisation-criteria");
const sd001 = () => yaml.load(readFileSync(path.join(examples, "SD-001-delivery-exception-agent.design.yaml"), "utf8"));
const resultOf = (spec, lenses, id, trigger) => check(spec, lensesFor(spec, trigger, lenses)).find(r => r.criterion === id);

/** A copy of the example folder to change, removed after the test. */
function scratch(t) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "criteria-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(acme, dir, { recursive: true });
  return dir;
}
const rewrite = (file, f) => writeFileSync(file, yaml.dump(f(yaml.load(readFileSync(file, "utf8")))));

test("unbound, the shipped lenses apply unchanged", { skip: !yaml }, () => {
  const c = loadCriteria(null, modules);
  assert.deepEqual(c.problems, []);
  assert.equal(c.set.id, "architecture-continuum");
  assert.deepEqual(c.lenses.map(l => l.lens.id).sort(), ["ai-agent", "ai-solution", "core", "privacy", "production"]);
  assert.ok(c.lenses.every(l => l.builtin));
});

test("the binding names the folder, relative to the bindings file", { skip: !yaml }, (t) => {
  const ws = mkdtempSync(path.join(os.tmpdir(), "workspace-"));
  t.after(() => rmSync(ws, { recursive: true, force: true }));
  mkdirSync(path.join(ws, ".agents"));
  writeFileSync(path.join(ws, ".agents/skill-bindings.toml"), `[suite.architecture]\nroot = "../docs"\nassessment = "../governance/assessment"\n`);
  assert.equal(loadConfig({ cwd: ws }).assessment, path.join(ws, "governance", "assessment"));
  writeFileSync(path.join(ws, ".agents/skill-bindings.toml"), `[suite.architecture]\nroot = "../docs"\n`);
  assert.equal(loadConfig({ cwd: ws }).assessment, null);
});

test("an organisation extends the shipped lenses, excludes and overrides", { skip: !yaml }, () => {
  const c = loadCriteria(acme, modules);
  assert.deepEqual(c.problems, []);
  assert.deepEqual({ id: c.set.id, version: c.set.version, builtin: c.set.builtin }, { id: "acme", version: "1.0.0", builtin: "extend" });
  const ids = c.lenses.flatMap(l => l.criteria.map(x => x.id));
  assert.ok(!ids.includes("CORE-CST-02"));
  assert.ok(ids.includes("ACME-DAT-01") && ids.includes("CORE-QA-01"));
  const cst = c.lenses.flatMap(l => l.criteria).find(x => x.id === "CORE-CST-01");
  assert.equal(cst.severity, "minor");
  assert.equal(cst.default_severity, "major");
  const spec = sd001();
  assert.deepEqual(lensesFor(spec, "new-design", c.lenses).map(l => l.lens.id), ["core", "acme-data", "ai-solution", "ai-agent", "privacy"]);
  assert.equal(resultOf(spec, c.lenses, "CORE-CST-01").severity, "minor");
});

test("a declarative check is met, partly met, not met or not applicable", { skip: !yaml }, () => {
  const { lenses } = loadCriteria(acme, modules);
  const spec = sd001();
  for (const d of spec.data) d.residency = "EU";
  assert.equal(resultOf(spec, lenses, "ACME-DAT-01").result, "met");
  spec.data.find(d => d.personal).residency = "US";
  const r = resultOf(spec, lenses, "ACME-DAT-01");
  assert.notEqual(r.result, "met");
  assert.ok(r.notes.some(n => n.includes("residency: US")));
  for (const d of spec.data) d.personal = false;
  assert.equal(resultOf(spec, lenses, "ACME-DAT-01").result, "not-applicable");
  assert.equal(resultOf(spec, lenses, "ACME-DAT-02").result, "partly-met");
});

test("count and min_items rules, and the reviewer half left to a person", { skip: !yaml }, () => {
  const { lenses } = loadCriteria(acme, modules);
  const spec = sd001();
  assert.equal(resultOf(spec, lenses, "ACME-GOV-01").result, "met");
  for (const d of spec.decisions) { d.status = "proposed"; d.alternatives = []; }
  assert.equal(resultOf(spec, lenses, "ACME-GOV-01").result, "not-met");
  assert.equal(resultOf(spec, lenses, "ACME-GOV-02"), undefined);
});

test("the matchers", () => {
  const spec = { items: [{ id: "a", tags: ["x", "y"], n: 3 }, { id: "b", tags: [], n: 0 }] };
  const run = require => evaluateCheck(spec, { for_each: "items", require }).result;
  assert.equal(run({ tags: { min_items: 1 } }), "partly-met");
  assert.equal(run({ "tags": { not_in: ["z"] } }), "met");
  assert.equal(run({ id: { matches: "^[ab]$" } }), "met");
  assert.equal(run({ n: { equals: 3 } }), "partly-met");
  assert.equal(run({ tags: { present: true } }), "partly-met");
  assert.equal(evaluateCheck(spec, { for_each: "items", where: { n: 0 }, count: { max: 0 } }).result, "not-met");
  assert.equal(evaluateCheck(spec, { require: { "items.id": ["a", "b"] } }).result, "met");
});

test("a profile lens applies only to a design that declares the profile", { skip: !yaml }, () => {
  const { lenses } = loadCriteria(acme, modules);
  const spec = sd001();
  assert.ok(!lensesFor(spec, "new-design", lenses).some(l => l.lens.id === "acme-payments"));
  spec.profiles = [...(spec.profiles || []), "payments"];
  const v = ajvFor(modules).compile(JSON.parse(readFileSync(path.join(SKILL_DIR, "references/standards/assessment/schemas/design.schema.json"), "utf8")));
  assert.ok(v(spec), JSON.stringify(v.errors));
  assert.ok(lensesFor(spec, "new-design", lenses).some(l => l.lens.id === "acme-payments"));
  assert.ok(resultOf(spec, lenses, "ACMEPAY-SEC-01"));
});

test("replace leaves only the organisation's lenses, and a namesake gets no coded check", { skip: !yaml }, (t) => {
  const dir = scratch(t);
  rewrite(path.join(dir, "assessment.yaml"), c => ({ ...c, builtin: "replace", exclude: undefined, overrides: undefined }));
  rewrite(path.join(dir, "lenses/acme-data.yaml"), l => ({ ...l, criteria: [...l.criteria, { id: "CORE-DEM-01", area: "GOV", question: "Acme's own", reads: ["design"], decided_by: "tool", severity: "minor" }] }));
  const c = loadCriteria(dir, modules);
  assert.deepEqual(c.problems, []);
  assert.deepEqual(c.lenses.map(l => l.lens.id), ["acme-data", "acme-payments"]);
  assert.ok(!c.warnings.some(w => w.includes("no lens applies always")));
  assert.equal(resultOf(sd001(), c.lenses, "CORE-DEM-01").result, "manual");
});

test("a malformed lens, a clash and a bad config are problems, not guesses", { skip: !yaml }, (t) => {
  const dir = scratch(t);
  rewrite(path.join(dir, "lenses/acme-payments.yaml"), l => ({ ...l, criteria: [{ ...l.criteria[0], severity: "fatal" }] }));
  assert.ok(loadCriteria(dir, modules).problems.some(p => p.includes("acme-payments.yaml") && p.includes("severity")));

  const dir2 = scratch(t);
  rewrite(path.join(dir2, "lenses/acme-payments.yaml"), l => ({ ...l, criteria: [{ ...l.criteria[0], id: "CORE-QA-01" }] }));
  assert.ok(loadCriteria(dir2, modules).problems.some(p => p.includes("CORE-QA-01 is defined twice")));

  const dir3 = scratch(t);
  rewrite(path.join(dir3, "assessment.yaml"), c => ({ ...c, builtin: "merge" }));
  assert.ok(loadCriteria(dir3, modules).problems.some(p => p.includes("builtin")));

  assert.ok(loadCriteria(path.join(dir3, "missing"), modules).problems.length);
});

test("the pages show the organisation's severity, its checks and none for an excluded criterion", { skip: !yaml }, () => {
  const { lenses } = loadCriteria(acme, modules);
  const pages = criteriaPages(lenses, { outDir: path.join(acme, "site"), dump: v => yaml.dump(v) });
  assert.ok(!pages.has("core-cst-02.md"));
  assert.match(pages.get("core-cst-01.md"), /minor \(the organisation's; the lens says major: Cost is governed/);
  assert.match(pages.get("acme-dat-01.md"), /## Check[\s\S]*for_each: data/);
  assert.match(pages.get("acme-dat-01.md"), /\]\(\.\.\/lenses\/acme-data\.yaml\)/);
  assert.match(pages.get("core-qa-01.md"), /github\.com\/dermot-obrien\/architecture-continuum\/blob\/main\/standards\/assessment\/lenses\/core\.yaml/);
});
