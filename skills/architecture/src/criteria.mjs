// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * Which criteria an assessment applies: the lenses this skill ships, or an organisation's own, or
 * both. The [suite.architecture] binding `assessment` names a folder in the workspace holding an
 * assessment.yaml, valid against assessment-config.schema.json, which says whether the
 * organisation's lenses extend the shipped ones or replace them, which shipped criteria it does
 * not use, and which severities it changes. Unbound, the shipped lenses apply unchanged.
 *
 * Every lens, shipped or not, is validated against the lens schema this skill carries, so a
 * malformed criterion is reported before an assessment runs, not in the middle of one. The method
 * (results, findings, outcomes and the record schemas) stays the skill's; an organisation chooses
 * the criteria, not how they are applied.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { SKILL_DIR } from "./continuum.mjs";

export const STANDARDS_DIR = path.join(SKILL_DIR, "references/standards");
export const ASSESSMENT_DIR = path.join(STANDARDS_DIR, "assessment");
export const BUILTIN_LENS_DIR = path.join(ASSESSMENT_DIR, "lenses");
const SCHEMA_DIR = path.join(ASSESSMENT_DIR, "schemas");
const ENVELOPE = path.join(STANDARDS_DIR, "schemas/v1.1.0/envelope.schema.json");

const why = e => `${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? `: ${e.params.additionalProperty}` : e.params?.allowedValues ? `: ${e.params.allowedValues.join(", ")}` : ""}`;
const list = v => (Array.isArray(v) ? v : v == null ? [] : [v]);
const yamlFiles = dir => existsSync(dir) ? readdirSync(dir).filter(f => /\.ya?ml$/.test(f)).sort().map(f => path.join(dir, f)) : [];

/** An Ajv instance that knows the envelope schema the lens and record schemas refer to. */
export function ajvFor({ Ajv, addFormats }) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(JSON.parse(readFileSync(ENVELOPE, "utf8")), "envelope.schema.json");
  return ajv;
}
const schema = name => JSON.parse(readFileSync(path.join(SCHEMA_DIR, name), "utf8"));

/**
 * The criteria in force. `folder` is the bound assessment folder, or null for the shipped lenses.
 * Returns { lenses, set, problems, warnings, standards } where each lens carries `file` (where it
 * was read from) and `builtin`, each criterion that an override changed carries `default_severity`,
 * `set` names the criteria set for the record ({ id, version, source }), and `standards` gives the
 * assessment and triage standards an organisation supplied, else the shipped ones.
 */
export function loadCriteria(folder, modules) {
  const { yaml } = modules;
  const ajv = ajvFor(modules);
  const validLens = ajv.compile(schema("lens.schema.json"));
  const problems = [];
  const warnings = [];
  const readLens = (file, builtin) => {
    let doc;
    try { doc = yaml.load(readFileSync(file, "utf8")); } catch (e) { problems.push(`${file}: not YAML: ${e.message.split("\n")[0]}`); return null; }
    if (!validLens(doc)) {
      for (const e of validLens.errors.slice(0, 10)) problems.push(`${file}: ${why(e)}`);
      return null;
    }
    return { ...doc, file, builtin };
  };
  const shipped = () => yamlFiles(BUILTIN_LENS_DIR).map(f => readLens(f, true)).filter(Boolean);
  const standards = {
    assessment: path.join(ASSESSMENT_DIR, "standard-architecture-assessment.md"),
    triage: path.join(ASSESSMENT_DIR, "standard-assessment-triage.md"),
  };

  if (!folder) return { lenses: shipped(), set: { id: "architecture-continuum", source: "shipped" }, problems, warnings, standards };

  if (!existsSync(folder) || !statSync(folder).isDirectory()) {
    problems.push(`[suite.architecture] assessment resolves to ${folder}, which is not a folder. Create it with an assessment.yaml, or remove the binding to use the shipped criteria.`);
    return { lenses: [], set: null, problems, warnings, standards };
  }
  const configFile = path.join(folder, "assessment.yaml");
  if (!existsSync(configFile)) {
    problems.push(`${folder}: no assessment.yaml. It says which criteria the organisation uses; see the skill's references/organisation-criteria.md.`);
    return { lenses: [], set: null, problems, warnings, standards };
  }
  const cfg = yaml.load(readFileSync(configFile, "utf8")) ?? {};
  const validConfig = ajv.compile(schema("assessment-config.schema.json"));
  if (!validConfig(cfg)) {
    for (const e of validConfig.errors.slice(0, 10)) problems.push(`${configFile}: ${why(e)}`);
    return { lenses: [], set: null, problems, warnings, standards };
  }

  const builtinMode = cfg.builtin ?? "extend";
  const ownFiles = cfg.lenses ? cfg.lenses.map(f => path.resolve(folder, f)) : yamlFiles(path.join(folder, "lenses"));
  for (const f of ownFiles) if (!existsSync(f)) problems.push(`${configFile}: lens ${path.relative(folder, f)} does not exist`);
  const own = ownFiles.filter(existsSync).map(f => readLens(f, false)).filter(Boolean);
  let lenses = [...(builtinMode === "extend" ? shipped() : []), ...own];

  // One id, one lens and one criterion, across shipped and own.
  const seenLens = new Map();
  const seenCrit = new Map();
  for (const l of lenses) {
    if (seenLens.has(l.lens.id)) problems.push(`lens ${l.lens.id} is defined twice: ${seenLens.get(l.lens.id)} and ${l.file}. Give the organisation's lens its own id.`);
    seenLens.set(l.lens.id, l.file);
    for (const c of l.criteria) {
      if (seenCrit.has(c.id)) problems.push(`criterion ${c.id} is defined twice: ${seenCrit.get(c.id)} and ${l.file}. Override a shipped criterion in assessment.yaml rather than redefining it.`);
      seenCrit.set(c.id, l.file);
    }
  }

  const exclude = new Set(list(cfg.exclude));
  for (const x of exclude) if (!seenLens.has(x) && !seenCrit.has(x)) warnings.push(`${configFile}: exclude names ${x}, which is neither a lens nor a criterion in force`);
  lenses = lenses.filter(l => !exclude.has(l.lens.id))
    .map(l => ({ ...l, criteria: l.criteria.filter(c => !exclude.has(c.id)) }))
    .filter(l => l.criteria.length);

  const overrides = cfg.overrides ?? {};
  for (const id of Object.keys(overrides)) if (!lenses.some(l => l.criteria.some(c => c.id === id))) warnings.push(`${configFile}: overrides names ${id}, which is not a criterion in force`);
  lenses = lenses.map(l => ({
    ...l,
    criteria: l.criteria.map(c => {
      const o = overrides[c.id];
      if (!o) return c;
      return { ...c, ...(o.severity && o.severity !== c.severity ? { severity: o.severity, default_severity: c.severity } : {}), ...(o.note ? { organisation_note: o.note } : {}) };
    }),
  }));

  if (!lenses.some(l => l.lens.applies_when === "always")) warnings.push(`${configFile}: no lens applies always, so a design with no profile is assessed against nothing`);

  for (const k of ["assessment", "triage"]) {
    const f = cfg.standards?.[k];
    if (!f) continue;
    const p = path.resolve(folder, f);
    if (existsSync(p)) standards[k] = p;
    else problems.push(`${configFile}: standards.${k} ${f} does not exist`);
  }

  return {
    lenses,
    set: { id: cfg.id, version: cfg.version, ...(cfg.title ? { title: cfg.title } : {}), builtin: builtinMode, source: configFile },
    problems,
    warnings,
    standards,
  };
}

// ------------------------------------------------------------------------------ declarative rules

/**
 * The values at a dotted path, stepping into every item of each list on the way, so
 * elements.ai.evals is every eval of every element.
 */
export function valuesAt(obj, dotted) {
  let cur = [obj];
  for (const key of dotted ? dotted.split(".") : []) {
    cur = cur.flatMap(v => (Array.isArray(v) ? v : [v])).filter(v => v && typeof v === "object").map(v => v[key]).filter(v => v !== undefined);
  }
  return cur.flatMap(v => (Array.isArray(v) && dotted ? v : [v]));
}

const present = v => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);

/** Whether the values at one field meet one matcher. A bare scalar or list means equals or in. */
function matches(values, m) {
  if (m === null || typeof m !== "object" || Array.isArray(m)) m = Array.isArray(m) ? { in: m } : { equals: m };
  const vals = values.filter(present);
  if ("present" in m && (vals.length > 0) !== m.present) return false;
  if ("equals" in m && !(vals.length && vals.every(v => v === m.equals))) return false;
  if ("in" in m && !(vals.length && vals.every(v => m.in.includes(v)))) return false;
  if ("not_in" in m && vals.some(v => m.not_in.includes(v))) return false;
  if ("matches" in m && !(vals.length && vals.every(v => new RegExp(m.matches, "i").test(typeof v === "object" ? JSON.stringify(v) : String(v))))) return false;
  if ("min_items" in m && vals.length < m.min_items) return false;
  if ("max_items" in m && vals.length > m.max_items) return false;
  return true;
}
const meets = (item, conditions = {}) => Object.entries(conditions).every(([field, m]) => matches(field === "." ? [item] : valuesAt(item, field), m));

const label = (item, i) => item && typeof item === "object" ? item.id ?? item.name ?? item.role ?? `#${i + 1}` : `#${i + 1}`;
const fill = (template, item, field) => template.replace(/\{([a-z_.]+)\}/gi, (_, k) => k === "field" ? field : String(valuesAt(item, k)[0] ?? "none stated"));

/**
 * Apply a criterion's `check`: one rule, or a list of rules, each over the specification or over
 * every item at `for_each`, filtered by `where`. Each required field of each item is a clause;
 * `count` makes the number of matching items one clause instead. Returns { result, notes } as the
 * coded checks do: every clause holds is met, some partly-met, none not-met, and no item to check
 * not-applicable.
 */
export function evaluateCheck(spec, check) {
  const clauses = [];
  for (const rule of list(check)) {
    const items = rule.for_each ? valuesAt(spec, rule.for_each) : [spec];
    const chosen = items.filter(it => meets(it, rule.where));
    if (rule.count) {
      const n = chosen.length;
      const ok = (rule.count.min === undefined || n >= rule.count.min) && (rule.count.max === undefined || n <= rule.count.max);
      clauses.push([ok, rule.message ? fill(rule.message, spec, rule.for_each) : `${n} ${rule.for_each || "items"} match, wanted ${rule.count.min ?? 0} to ${rule.count.max ?? "any"}`]);
      continue;
    }
    chosen.forEach((it, i) => {
      for (const [field, m] of Object.entries(rule.require ?? {})) {
        const where = rule.for_each ? `${rule.for_each} ${label(it, i)}` : "the specification";
        clauses.push([meets(it, { [field]: m }), rule.message ? fill(rule.message, it, field) : `${where}: ${field} does not meet ${JSON.stringify(m)}`]);
      }
    });
  }
  if (!clauses.length) return { result: "not-applicable", notes: ["nothing in the design matches the rule's for_each and where"] };
  const failed = clauses.filter(([ok]) => !ok).map(([, msg]) => msg);
  return { result: failed.length === 0 ? "met" : failed.length === clauses.length ? "not-met" : "partly-met", notes: [...new Set(failed)] };
}
