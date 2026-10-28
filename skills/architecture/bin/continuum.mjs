#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * continuum.mjs: check an architecture repository against the continuum, or scaffold one.
 *
 *   node bin/continuum.mjs doctor                 resolve the bindings and the modules, and stop
 *   node bin/continuum.mjs check [--json] [--quiet] [--strict] [--root <dir>]
 *   node bin/continuum.mjs scaffold --root <dir> --namespace <code> --name "<Name>" [--url <base>] [--bind]
 *
 * Run from the workspace root. The architecture root comes from [suite.architecture] (or, for one release, the old [suite.aaa-continuum]) of
 * .agents/skill-bindings.toml, or from --root. Exit 0: no errors (warnings may print).
 * Exit 1: errors, one line each, or warnings with --strict. Exit 2: usage or environment.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { check, INSTALL_HINT, loadConfig, loadModules, scaffold, SKILL, SKILL_DIR } from "../src/continuum.mjs";
import { loadCriteria } from "../src/criteria.mjs";

if (Number(process.versions.node.split(".")[0]) < 18) {
  console.error(`Node.js ${process.versions.node} is too old: ${SKILL} needs 18 or newer.`);
  process.exit(2);
}

const USAGE = `usage: continuum.mjs doctor
       continuum.mjs check [--json] [--quiet] [--strict] [--root <dir>] [--bindings <file>] [--schemas <dir>]
       continuum.mjs scaffold --root <dir> --namespace <code> --name "<Name>" [--url <base>] [--bind]
Run from the workspace root. Exit 0 ok, 1 errors (or warnings with --strict), 2 usage or environment.`;

const argv = process.argv.slice(2);
const command = argv.shift();
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    if (["json", "quiet", "strict", "bind", "help"].includes(key)) flags[key] = true;
    else if (i + 1 < argv.length) flags[key] = argv[++i];
    else { console.error(`${a} needs a value\n${USAGE}`); process.exit(2); }
  } else positional.push(a);
}
if (!command || command === "--help" || command === "-h" || flags.help) {
  console.log(USAGE);
  process.exit(command ? 0 : 2);
}
if (positional.length) { console.error(`unexpected argument ${positional[0]}\n${USAGE}`); process.exit(2); }

function configOrExit() {
  const config = loadConfig({ cwd: process.cwd(), root: flags.root, bindings: flags.bindings, schemas: flags.schemas });
  for (const w of config.warnings) console.error(`warning: ${w}`);
  if (config.problems.length) {
    for (const p of config.problems) console.error(p);
    process.exit(2);
  }
  return config;
}

if (command === "doctor") {
  const config = loadConfig({ cwd: process.cwd(), root: flags.root, bindings: flags.bindings, schemas: flags.schemas });
  for (const w of config.warnings) console.error(`warning: ${w}`);
  const modules = loadModules(config.workspace);
  const criteria = modules ? loadCriteria(config.assessment, modules) : null;
  for (const w of criteria?.warnings ?? []) console.error(`warning: ${w}`);
  const out = {
    skill: SKILL,
    skillDir: SKILL_DIR,
    bindingsFile: config.bindingsFile,
    root: config.root,
    schemes: config.schemes,
    namespaces: config.namespaces,
    schemas: config.schemas,
    assessment: config.assessment ?? "(shipped criteria)",
    criteria: criteria?.set ? `${criteria.set.id}${criteria.set.version ? " " + criteria.set.version : ""}: ${criteria.lenses.map(l => `${l.lens.id} ${l.lens.version}`).join(", ")}` : null,
    modules: modules ? "ok" : "missing",
    problems: [...config.problems, ...(criteria?.problems ?? []), ...(modules ? [] : [INSTALL_HINT])],
  };
  if (flags.json) console.log(JSON.stringify(out, null, 2));
  else {
    for (const [k, v] of Object.entries(out)) if (k !== "problems") console.log(`${k.padEnd(13)} ${v ?? "(none)"}`);
    for (const p of out.problems) console.log(`problem       ${p}`);
  }
  process.exit(out.problems.length ? 2 : 0);
}

if (command === "check") {
  const config = configOrExit();
  const modules = loadModules(config.workspace);
  if (!modules) { console.error(INSTALL_HINT); process.exit(2); }
  const { findings, summary } = check(config, modules);
  const failed = summary.errors > 0 || (flags.strict && summary.warnings > 0);
  if (flags.json) {
    console.log(JSON.stringify({ skill: SKILL, root: config.root, status: failed ? "error" : "ok", summary, findings }, null, 2));
    process.exit(failed ? 1 : 0);
  }
  for (const f of findings) {
    if (flags.quiet && f.level !== "error") continue;
    console.log(`${f.level.padEnd(5)} ${f.code.padEnd(8)} ${f.file ? f.file + ": " : ""}${f.message}`);
  }
  const root = path.relative(process.cwd(), config.root) || ".";
  console.log(`${SKILL} check: ${summary.pages} page(s), ${summary.registers} register(s), ${summary.schemes} scheme(s) under ${root}; ${summary.errors} error(s), ${summary.warnings} warning(s)`);
  process.exit(failed ? 1 : 0);
}

if (command === "scaffold") {
  for (const k of ["root", "namespace", "name"]) if (!flags[k]) { console.error(`scaffold needs --${k}\n${USAGE}`); process.exit(2); }
  if (!/^[a-z][a-z0-9-]*$/.test(flags.namespace)) { console.error(`--namespace ${flags.namespace}: a namespace is lowercase letters, digits and dashes, such as ks`); process.exit(2); }
  const root = path.resolve(process.cwd(), flags.root);
  const workspace = process.cwd();
  const { written, skipped, snippet } = scaffold({ root, namespace: flags.namespace, name: flags.name, url: flags.url, workspace });
  for (const w of written) console.log(`wrote    ${path.relative(workspace, path.join(root, w))}`);
  for (const s of skipped) console.log(`kept     ${path.relative(workspace, path.join(root, s))} (exists)`);
  const bindings = path.join(workspace, ".agents", "skill-bindings.toml");
  if (flags.bind) {
    const current = existsSync(bindings) ? readFileSync(bindings, "utf8") : "";
    if (current.includes(`[suite.${SKILL}]`)) console.log(`kept     ${path.relative(workspace, bindings)} ([suite.${SKILL}] is already there)`);
    else {
      mkdirSync(path.dirname(bindings), { recursive: true });
      if (!current) writeFileSync(bindings, 'bindingsVersion = "1.0"\n\n' + snippet, "utf8");
      else appendFileSync(bindings, (current.endsWith("\n") ? "\n" : "\n\n") + snippet, "utf8");
      console.log(`bound    ${path.relative(workspace, bindings)}`);
    }
  } else {
    console.log(`\nAdd to ${path.relative(workspace, bindings)} (or run again with --bind):\n`);
    console.log(snippet);
  }
  process.exit(0);
}

console.error(`unknown command ${command}\n${USAGE}`);
process.exit(2);
