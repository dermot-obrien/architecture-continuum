#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * Post-install check and binding resolver for an AI-Assisted Architecture skill.
 *
 * Run from the workspace root. SKILL_DIR names the installed skill's directory, and
 * defaults to the folder this file is in. Checks that the ontology schema
 * .aaa-config.yaml names exists (the file is optional), and that [suite.<skill>] of
 * .agents/skill-bindings.toml answers the skill's inputs.toml: every required binding
 * declared, and every declared directory or file present. Paths resolve against the
 * binding file's directory.
 *
 * A skill with flows declares, per option, the flows that need it (required_by). With
 * --flow <name> the check requires exactly those; without it, it requires the options
 * marked required, and with requires_any in [inputs], at least one binding. A flow's former
 * name, mapped to its current one in [inputs.flow_aliases], selects the same flow. A key missing
 * from [suite.<skill>] is read from the tables [inputs] legacy_suites names, with a
 * warning, so a workspace answering the old tables keeps working while it moves.
 *
 * With --json it prints what the skill needs before it starts: each binding resolved to
 * an absolute path (null when not declared), the bindings file, and the problems and
 * warnings, as one JSON object.
 *
 * Exit 0: correct (warnings may be printed). Exit 1: problems, one line each.
 * Exit 2: usage or environment error. Offline and read-only.
 *
 * The same file ships in every AI-Assisted Architecture skill, so each skill is complete on its own;
 * CI checks the copies are identical.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (Number(process.versions.node.split(".")[0]) < 18) {
  console.error(`Node.js ${process.versions.node} is too old: this check needs 18 or newer.`);
  process.exit(2);
}
const USAGE = "usage: check.mjs [--json] [--flow <name>]   (run from the workspace root; exit 0 ok, 1 problems, 2 usage or environment)";
const args = process.argv.slice(2);
if (args.length === 1 && ["-h", "--help"].includes(args[0])) {
  console.log(USAGE);
  process.exit(0);
}
let json = false;
let flow = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--json") json = true;
  else if (args[i] === "--flow" && args[i + 1]) flow = args[++i];
  else {
    console.error(USAGE);
    process.exit(2);
  }
}

const skillDir = path.resolve(process.env.SKILL_DIR || path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const skill = path.basename(skillDir);
const root = process.cwd();
const problems = [];
const warnings = [];

/**
 * The tables of a TOML file as { "a.b": { key: value } }, for the flat string, boolean,
 * number and one-line string-array values these files use. A multi-line string is
 * skipped, since only descriptions are written that way.
 */
function toml(text) {
  const out = {};
  let table = (out[""] = {});
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("#")) continue;
    if (t.startsWith("[[")) {
      table = {};
      continue;
    }
    const h = /^\[\s*([^\]]+?)\s*\]$/.exec(t);
    if (h) {
      table = out[h[1]] ??= {};
      continue;
    }
    const m = /^([A-Za-z0-9_-]+)\s*=\s*(.*)$/.exec(t);
    if (!m) continue;
    let v = m[2];
    if (v.startsWith('"""') || v.startsWith("'''")) {
      const q = v.slice(0, 3);
      if (!v.slice(3).includes(q)) while (i + 1 < lines.length && !lines[++i].includes(q));
      continue;
    }
    if (v.startsWith("[")) {
      table[m[1]] = [...v.matchAll(/"([^"]*)"|'([^']*)'/g)].map((x) => x[1] ?? x[2]);
      continue;
    }
    if (v[0] === '"' || v[0] === "'") v = v.slice(1, v.indexOf(v[0], 1));
    else {
      v = v.replace(/\s+#.*$/, "");
      v = v === "true" ? true : v === "false" ? false : v;
    }
    table[m[1]] = v;
  }
  return out;
}

// .aaa-config.yaml, optional, and the ontology schema it names.
const config = path.join(root, ".aaa-config.yaml");
if (!existsSync(config)) {
  warnings.push(
    `.aaa-config.yaml: not found in ${root}, so no workspace ontology schema is set. To set one, copy references/standards/workspace/aaa-config.yaml from this skill to the workspace root.`,
  );
} else {
  const text = readFileSync(config, "utf8").replace(/\r\n/g, "\n");
  const block = /^ontology:\s*\n((?:[ \t]+.*\n?)*)/m.exec(text)?.[1] ?? "";
  const schema = /^\s+schema:\s*["']?([^"'#\n]+?)["']?\s*(#.*)?$/m.exec(block)?.[1];
  if (schema && !existsSync(path.resolve(root, schema))) {
    warnings.push(
      `.aaa-config.yaml: ontology.schema ${schema} does not exist, so nothing can be validated against the ontology. Put the schema there, or correct the path.`,
    );
  }
}

// The skill's inputs.toml, answered in [suite.<skill>] of the bindings.
const inputsFile = path.join(skillDir, "inputs.toml");
const options = {};
let inputs = {};
let aliases = {};
if (existsSync(inputsFile)) {
  const parsed = toml(readFileSync(inputsFile, "utf8"));
  inputs = parsed.inputs ?? {};
  aliases = parsed["inputs.flow_aliases"] ?? {};
  for (const [name, table] of Object.entries(parsed)) {
    const m = /^inputs\.options\.(.+)$/.exec(name);
    if (m) options[m[1]] = table;
  }
}
const flows = Array.isArray(inputs.flows) ? inputs.flows : [];
if (flow !== null && !flows.includes(flow) && typeof aliases[flow] === "string") flow = aliases[flow];
if (flow !== null && !flows.includes(flow)) {
  console.error(`${skill} has no flow ${flow}${flows.length ? `; its flows are ${flows.join(", ")}` : ""}`);
  process.exit(2);
}
const needed = (o) => (flow !== null ? Array.isArray(o.required_by) && o.required_by.includes(flow) : o.required === true);
const resolved = Object.fromEntries(Object.keys(options).map((k) => [k, null]));
let bindingsFile = null;
for (let d = root; ; d = path.dirname(d)) {
  for (const n of [path.join(".agents", "skill-bindings.toml"), "skill-bindings.toml"]) {
    if (!bindingsFile && existsSync(path.join(d, n))) bindingsFile = path.join(d, n);
  }
  if (bindingsFile || path.dirname(d) === d) break;
}
const required = Object.entries(options).filter(([, o]) => needed(o)).map(([k]) => k);
if (!bindingsFile) {
  if (required.length || inputs.requires_any === true) {
    problems.push(
      `.agents/skill-bindings.toml: not found at or above ${root}. Create it with [suite.${skill}] declaring ${required.length ? required.join(", ") : "the folders the flows you use need"}.`,
    );
  }
} else {
  const tables = toml(readFileSync(bindingsFile, "utf8"));
  const section = { ...(tables[`suite.${skill}`] ?? {}) };
  // Keys the old tables still answer, for one release.
  const legacy = Array.isArray(inputs.legacy_suites) ? inputs.legacy_suites : [];
  const fromLegacy = {};
  for (const old of legacy) {
    for (const [k, v] of Object.entries(tables[`suite.${old}`] ?? {})) {
      if (!(k in options) || k in section && !(k in fromLegacy)) continue;
      if (k in fromLegacy) {
        if (section[k] !== v) warnings.push(`${bindingsFile}: ${k} is "${section[k]}" in [suite.${fromLegacy[k]}] and "${v}" in [suite.${old}]; the first is used`);
        continue;
      }
      section[k] = v;
      fromLegacy[k] = old;
    }
  }
  const moved = [...new Set(Object.values(fromLegacy))];
  if (moved.length) {
    warnings.push(`${bindingsFile}: ${Object.keys(fromLegacy).join(", ")} read from the old table(s) ${moved.map((t) => `[suite.${t}]`).join(", ")}; move them to [suite.${skill}], which this release still falls back from`);
  }
  const base = path.dirname(bindingsFile);
  for (const k of required) {
    if (section[k] === undefined || section[k] === "") {
      problems.push(`${bindingsFile}: [suite.${skill}] does not declare ${k}${flow ? `, which the ${flow} flow needs` : ""}. ${options[k].type === "dir" ? "Name the folder" : "Name it"}; it has no default.`);
    }
  }
  if (inputs.requires_any === true && !Object.keys(section).some((k) => k in options)) {
    problems.push(`${bindingsFile}: [suite.${skill}] binds nothing, so no flow can run. Bind the folders the flows you use need (see inputs.toml in ${skillDir}).`);
  }
  for (const [k, v] of Object.entries(section)) {
    const type = options[k]?.type;
    if (!["dir", "file", "path"].includes(type) || typeof v !== "string") continue;
    const cut = v.indexOf("{");
    const p = path.resolve(base, cut >= 0 ? v.slice(0, cut) : v);
    const target = cut >= 0 ? path.dirname(p + "x") : p;
    if (k in resolved) resolved[k] = cut >= 0 ? path.resolve(base, v) : p;
    if (!existsSync(target)) {
      problems.push(`${bindingsFile}: [suite.${fromLegacy[k] ?? skill}] ${k} = "${v}" resolves to ${target}, which does not exist. Create it, or correct ${k}.`);
    } else if (type === "dir" && cut < 0 && !statSync(target).isDirectory()) {
      problems.push(`${bindingsFile}: [suite.${fromLegacy[k] ?? skill}] ${k} = "${v}" is a file; it should name a folder.`);
    }
  }
}

if (json) {
  console.log(JSON.stringify({ skill, ...(flow ? { flow } : {}), status: problems.length ? "error" : "ok", bindingsFile, bindings: resolved, problems, warnings }, null, 2));
  process.exit(problems.length ? 1 : 0);
}
for (const w of warnings) console.log(`warning: ${w}`);
for (const p of problems) console.log(p);
if (problems.length === 0) console.log(`${skill}${flow ? ` ${flow}` : ""}: ok`);
process.exit(problems.length ? 1 : 0);
