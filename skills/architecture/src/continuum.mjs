// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * The checks and the scaffold behind bin/continuum.mjs.
 *
 * A repository on the architecture continuum keeps its architecture under one root: pages with
 * front matter, one per element, in folders named after the identifier; CSV registers, one per
 * kind; and two registers of identifiers, the schemes (which series exist, where each kind's
 * pages live and which register lists them) and the namespaces (which other catalogues it
 * cites). `check` reads all of that and reports what disagrees. `scaffold` writes the layout
 * for a new repository.
 *
 * The front matter schemas are the continuum's (standards/schemas/v1.1.0), carried in this
 * skill's references/standards/. Validating against them needs ajv, ajv-formats and js-yaml,
 * which `npm install` in the skill directory or the workspace provides; without them the check
 * stops with the install command and exit 2.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL = "architecture";
// The table this check was answered in before the ten skills became one; read for one release.
export const LEGACY_SKILL = "aaa-continuum";
export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_DIR = path.join(SKILL_DIR, "references", "standards", "schemas", "v1.1.0");

/** The identifier of a catalogue element: a series, a dash and three digits. */
export const ID = /^[A-Z][A-Z0-9]*-\d{3}$/;
/** A service's slug, the one kind whose identifier is a name. */
const SLUG = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
/** A citation of another catalogue's identifier: the namespace, a colon, the identifier. */
const CITATION = /^([a-z][a-z0-9-]*):([A-Za-z][A-Za-z0-9-]*)$/;
/** Kinds the standard reserves with a placeholder schema only. */
const PLACEHOLDER_KINDS = new Set(["api", "view", "event"]);

/** The scheme names the schemes register may use, and the front matter kind each one is. */
export const SCHEME_KIND = {
  platform: "platform",
  outcome: "outcome",
  "use-case": "use-case",
  capability: "capability",
  landscape: "landscape",
  product: "product",
  feature: "feature",
  "bounded-context": "bounded-context",
  context: "bounded-context",
  abb: "abb",
  sbb: "sbb",
  pattern: "pattern",
  "architecture-pattern": "pattern",
  "reference-architecture": "pattern",
  collaboration: "pattern",
  candidate: "candidate",
  service: "service",
  "decision-record": "decision-record",
  adr: "decision-record",
  consideration: "consideration",
  "technical-debt": "technical-debt",
  api: "api",
  view: "view",
  event: "event",
  "deployment-node": "deployment-node",
  store: "store",
};

/**
 * Front matter fields whose values are identifiers of other elements. Every value is resolved:
 * an identifier must be a page or a register row, a namespaced citation must name a registered
 * namespace, and a slug (where the field names services) must be a service page.
 */
export const RELATION_FIELDS = new Set([
  "part_of", "contains", "realises", "realised_by", "depends_on", "depended_on_by", "applies_to",
  "governed_by", "realises_capabilities", "requires", "parent", "provided_by_platform",
  "required_by_outcomes", "realised_by_abbs", "resolved_by", "resolves", "affects",
  "affects_artefacts", "owned_by_platform", "requires_capabilities", "realised_by_use_cases",
  "implements", "implemented_by", "serves", "owns_outcomes", "provides_capabilities",
  "contains_bounded_contexts", "platform", "runs", "features", "realised_by_services", "parts",
  "deployed_to", "provides_apis", "consumes_apis", "supports_outcome", "fulfilled_by_features",
  "composes_contexts", "supersedes", "superseded_by", "supported_by_use_cases", "fulfils",
  "consequences.technical_debt", "repays_debt", "consequence_of", "repaid_by",
  "implemented_by", "composes", "composed_by", "run_by", "stores", "owned_by", "hosted_on", "hosts",
  "hosts_stores", "read_by", "written_by", "landscape", "dependencies",
]);
/** Fields whose values name services, which are listed by slug rather than by identifier. */
const SERVICE_FIELDS = new Set(["realised_by_services", "runs", "implemented_by", "hosts", "owned_by", "read_by", "written_by"]);

/**
 * Relations with an inverse. When A's field lists B and B's page exists, B's inverse field
 * should list A; the check warns when it does not. Services are listed by slug on the other side.
 */
export const INVERSES = [
  ["abb", "realised_by", "sbb", "realises"],
  ["sbb", "realises", "abb", "realised_by"],
  ["abb", "part_of", "bounded-context", "contains"],
  ["bounded-context", "contains", "abb", "part_of"],
  ["capability", "realised_by_abbs", "abb", "realises_capabilities"],
  ["abb", "realises_capabilities", "capability", "realised_by_abbs"],
  ["bounded-context", "part_of", "platform", "contains_bounded_contexts"],
  ["platform", "contains_bounded_contexts", "bounded-context", "part_of"],
  ["platform", "provides_capabilities", "capability", "provided_by_platform"],
  ["capability", "provided_by_platform", "platform", "provides_capabilities"],
  ["platform", "owns_outcomes", "outcome", "owned_by_platform"],
  ["outcome", "owned_by_platform", "platform", "owns_outcomes"],
  ["consideration", "resolved_by", "decision-record", "resolves"],
  ["decision-record", "resolves", "consideration", "resolved_by"],
  ["pattern", "implements", "pattern", "implemented_by"],
  ["pattern", "implemented_by", "pattern", "implements"],
  ["service", "realises", "sbb", "realised_by_services"],
  ["sbb", "realised_by_services", "service", "realises"],
  ["use-case", "supports_outcome", "outcome", "supported_by_use_cases"],
  ["outcome", "supported_by_use_cases", "use-case", "supports_outcome"],
  ["decision-record", "consequences.technical_debt", "technical-debt", "consequence_of"],
  ["technical-debt", "consequence_of", "decision-record", "consequences.technical_debt"],
  ["decision-record", "repays_debt", "technical-debt", "repaid_by"],
  ["technical-debt", "repaid_by", "decision-record", "repays_debt"],
  ["use-case", "realised_by", "pattern", "serves"],
  ["pattern", "serves", "use-case", "realised_by"],
  ["use-case", "fulfilled_by_features", "feature", "fulfils"],
  ["feature", "fulfils", "use-case", "fulfilled_by_features"],
  ["product", "features", "feature", "part_of"],
  ["feature", "part_of", "product", "features"],
  ["product", "runs", "service", "run_by"],
  ["service", "run_by", "product", "runs"],
  ["pattern", "composes", "abb", "composed_by"],
  ["pattern", "composes", "sbb", "composed_by"],
  ["abb", "composed_by", "pattern", "composes"],
  ["sbb", "composed_by", "pattern", "composes"],
  ["service", "stores", "store", "owned_by"],
  ["store", "owned_by", "service", "stores"],
  ["service", "deployed_to", "deployment-node", "hosts"],
  ["deployment-node", "hosts", "service", "deployed_to"],
  ["store", "hosted_on", "deployment-node", "hosts_stores"],
  ["deployment-node", "hosts_stores", "store", "hosted_on"],
];

// ------------------------------------------------------------------------------ small parsers

/** The tables of a TOML file as { "a.b": { key: value } }, for the flat values bindings use. */
export function toml(text) {
  const out = {};
  let table = (out[""] = {});
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("#")) continue;
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
    if (v[0] === '"' || v[0] === "'") v = v.slice(1, v.indexOf(v[0], 1));
    else {
      v = v.replace(/\s+#.*$/, "");
      v = v === "true" ? true : v === "false" ? false : v;
    }
    table[m[1]] = v;
  }
  return out;
}

/** RFC 4180 CSV: rows of objects keyed by the header row. Quoted fields may hold commas and newlines. */
export function csv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const header = (rows.shift() || []).map((h) => h.trim());
  return {
    header,
    rows: rows.filter((r) => r.some((v) => v.trim() !== "")).map((r, n) => {
      const o = { _line: n + 2 };
      header.forEach((h, j) => { o[h] = (r[j] ?? "").trim(); });
      return o;
    }),
  };
}

/** The YAML front matter of a Markdown file as text, or null when the file has none. */
export function frontMatterText(raw) {
  let text = raw.replace(/^﻿/, "");
  text = text.replace(/^\s*<!--[\s\S]*?-->\s*/, "");
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---" || lines[i].trim() === "...") return lines.slice(1, i).join("\n");
  }
  return null;
}

/** A glob with {id}, * and ** as a regular expression over a relative path. */
function homeToRegExp(home, id) {
  const esc = home.replace(/[.+^${}()|[\]\\]/g, (c) => (c === "{" || c === "}" ? c : "\\" + c));
  const body = esc
    .replace(/\{id\}/g, id ? id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "[A-Za-z][A-Za-z0-9-]*")
    .replace(/\*\*/g, "\u0000")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0000/g, ".*");
  return new RegExp("^" + body + "$");
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const rel = (root, p) => path.relative(root, p).split(path.sep).join("/");
const list = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === "" ? [] : [v]);

// ------------------------------------------------------------------------------ configuration

/**
 * Where the architecture is: [suite.architecture] of .agents/skill-bindings.toml, found upward
 * from `cwd`, with `root` overriding the bound root. A key that table lacks is read from the old
 * [suite.aaa-continuum], with a warning. Returns { root, schemes, namespaces,
 * schemas, assessment, bindingsFile, workspace, problems }: assessment is the organisation's
 * criteria folder, or null for the criteria the skill ships.
 */
export function loadConfig({ cwd = process.cwd(), root, bindings, schemas } = {}) {
  const problems = [];
  let bindingsFile = bindings ? path.resolve(cwd, bindings) : null;
  if (!bindingsFile) {
    for (let d = path.resolve(cwd); ; d = path.dirname(d)) {
      for (const n of [path.join(".agents", "skill-bindings.toml"), "skill-bindings.toml"]) {
        if (!bindingsFile && existsSync(path.join(d, n))) bindingsFile = path.join(d, n);
      }
      if (bindingsFile || path.dirname(d) === d) break;
    }
  }
  const tables = bindingsFile && existsSync(bindingsFile) ? toml(readFileSync(bindingsFile, "utf8")) : {};
  const legacy = tables[`suite.${LEGACY_SKILL}`] ?? {};
  const section = { ...legacy, ...(tables[`suite.${SKILL}`] ?? {}) };
  const warnings = [];
  const old = Object.keys(legacy).filter((k) => !(k in (tables[`suite.${SKILL}`] ?? {})));
  if (old.length) warnings.push(`${bindingsFile}: ${old.join(", ")} read from the old table [suite.${LEGACY_SKILL}]; move them to [suite.${SKILL}], which this release still falls back from`);
  const base = bindingsFile ? path.dirname(bindingsFile) : path.resolve(cwd);
  const workspace = bindingsFile ? path.dirname(path.dirname(bindingsFile)) : path.resolve(cwd);
  let rootDir = root ? path.resolve(cwd, root) : section.root ? path.resolve(base, section.root) : null;
  if (!rootDir) {
    problems.push(
      bindingsFile
        ? `${bindingsFile}: [suite.${SKILL}] does not declare root. Name the folder the architecture lives in, such as root = "../docs/architecture"; it has no default.`
        : `.agents/skill-bindings.toml: not found at or above ${cwd}. Create it with [suite.${SKILL}] declaring root, or pass --root.`,
    );
  } else if (!existsSync(rootDir) || !statSync(rootDir).isDirectory()) {
    problems.push(`[suite.${SKILL}] root resolves to ${rootDir}, which is not a folder. Create it, or correct root.`);
  }
  const opt = (key, fallback) => {
    if (section[key]) return path.resolve(base, section[key]);
    return rootDir && existsSync(path.join(rootDir, fallback)) ? path.join(rootDir, fallback) : null;
  };
  return {
    root: rootDir,
    schemes: opt("schemes", path.join("registers", "identifier-schemes.csv")),
    namespaces: opt("namespaces", path.join("registers", "identifier-namespaces.csv")),
    schemas: schemas ? path.resolve(cwd, schemas) : section.schemas ? path.resolve(base, section.schemas) : SCHEMA_DIR,
    assessment: section.assessment ? path.resolve(base, section.assessment) : null,
    bindingsFile,
    workspace,
    problems,
    warnings,
  };
}

/** ajv, ajv-formats and js-yaml, from the skill's own node_modules, then the workspace's. */
export function loadModules(workspace) {
  const tries = [path.join(SKILL_DIR, "package.json"), path.join(workspace, "package.json"), path.join(process.cwd(), "package.json")];
  for (const t of tries) {
    try {
      const r = createRequire(t);
      return { Ajv: r("ajv/dist/2020.js"), addFormats: r("ajv-formats"), yaml: r("js-yaml") };
    } catch (e) {
      if (e.code !== "MODULE_NOT_FOUND") throw e;
    }
  }
  return null;
}

export const INSTALL_HINT = `the check needs ajv, ajv-formats and js-yaml: run npm install in ${SKILL_DIR}, or add the three to the workspace's package.json and install`;

// ------------------------------------------------------------------------------ the check

class Report {
  constructor(root) { this.root = root; this.findings = []; }
  add(level, code, file, message) {
    this.findings.push({ level, code, file: file ? (path.isAbsolute(file) ? rel(this.root, file) : file) : "", message });
  }
  error(code, file, message) { this.add("error", code, file, message); }
  warn(code, file, message) { this.add("warn", code, file, message); }
  get errors() { return this.findings.filter((f) => f.level === "error").length; }
  get warnings() { return this.findings.filter((f) => f.level === "warn").length; }
}

function walkMarkdown(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "dist") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMarkdown(full, out);
    else if (e.isFile() && e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function walkCsv(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "dist") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkCsv(full, out);
    else if (e.isFile() && e.name.endsWith(".csv")) out.push(full);
  }
  return out;
}

/** Compile the per-kind validators from a schemas folder: { validators: Map<kind, fn>, problems }. */
function loadSchemas(dir, Ajv, addFormats) {
  const problems = [];
  const validators = new Map();
  const envelopeFile = path.join(dir, "envelope.schema.json");
  if (!existsSync(envelopeFile)) return { validators, problems: [`${dir}: no envelope.schema.json, so no front matter can be validated`] };
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const envelope = JSON.parse(readFileSync(envelopeFile, "utf8"));
  ajv.addSchema(envelope);
  const kinds = envelope.$defs?.kindEnum?.enum ?? [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".schema.json") && n !== "envelope.schema.json").sort()) {
    try {
      const s = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
      const kind = (s.allOf ?? []).map((a) => a.properties?.kind?.const).find(Boolean) ?? s.properties?.kind?.const;
      if (!kind) continue;
      validators.set(kind, ajv.compile(s));
    } catch (e) {
      problems.push(`${path.join(dir, f)}: ${e.message}`);
    }
  }
  return { validators, kinds, problems };
}

/**
 * Run every check over the architecture `config` names. Returns { findings, summary }.
 * `modules` is what loadModules returned; the caller decides what to do when it is null.
 */
export function check(config, modules) {
  const { root } = config;
  const R = new Report(root);
  const { Ajv, addFormats, yaml } = modules;

  // --- the layout
  if (!existsSync(path.join(root, "README.md"))) R.warn("CONT-002", "README.md", "no README.md at the root: the map of the architecture, saying where each kind lives, is what a reader opens first");
  for (const space of ["demand", "solution", "runtime", "decisions"]) {
    if (!existsSync(path.join(root, space))) R.warn("CONT-003", space, `no ${space}/ folder: the continuum's layout keeps the ${space === "decisions" ? "decision records and considerations" : space + " space"} there`);
  }

  // --- the registers of identifiers
  let schemes = [];
  if (config.schemes && existsSync(config.schemes)) {
    const t = csv(readFileSync(config.schemes, "utf8"));
    for (const col of ["scheme", "prefix", "pattern", "home"]) {
      if (!t.header.includes(col)) R.error("CONT-005", config.schemes, `the schemes register has no ${col} column; it needs scheme, prefix, pattern, entity, home and, to be checked against its pages, register`);
    }
    if (t.header.includes("scheme") && t.header.includes("pattern")) {
      for (const row of t.rows) {
        let re = null;
        try { re = new RegExp("^(?:" + row.pattern + ")$"); } catch { R.error("CONT-006", config.schemes, `line ${row._line}: pattern ${row.pattern} is not a regular expression`); }
        schemes.push({ ...row, re, kind: row.kind || SCHEME_KIND[row.scheme] || null });
      }
    }
  } else {
    R.warn("CONT-004", "registers/identifier-schemes.csv", "no schemes register, so identifiers are not checked against their series, their homes or their registers; scaffold writes one");
  }
  const namespaces = new Map();
  if (config.namespaces && existsSync(config.namespaces)) {
    for (const row of csv(readFileSync(config.namespaces, "utf8")).rows) if (row.namespace) namespaces.set(row.namespace, row);
  } else {
    R.warn("CONT-004", "registers/identifier-namespaces.csv", "no namespaces register, so citations of other catalogues (ns:ID) are not checked");
  }
  const selfNamespaces = new Set([...namespaces.values()].filter((r) => /^(yes|true|self)$/i.test(r.self ?? "")).map((r) => r.namespace));

  // --- the schemas
  const { validators, kinds: kindEnum, problems: schemaProblems } = loadSchemas(config.schemas, Ajv, addFormats);
  for (const p of schemaProblems) R.error("CONT-007", "", p);

  // --- the pages
  const pages = [];
  const byId = new Map();
  for (const file of walkMarkdown(root).sort()) {
    const raw = readFileSync(file, "utf8");
    const fmText = frontMatterText(raw);
    const isIndex = path.basename(file) === "index.md";
    if (fmText === null) {
      if (isIndex) R.error("FM-001", file, "index.md has no front matter: every element's page opens with the standard's front matter, kind and id first");
      continue;
    }
    let fm;
    try { fm = yaml.load(fmText, { schema: yaml.JSON_SCHEMA }) ?? {}; } catch (e) {
      R.error("FM-001", file, `front matter does not parse as YAML: ${e.message.split("\n")[0]}`);
      continue;
    }
    if (typeof fm !== "object" || Array.isArray(fm)) { R.error("FM-001", file, "front matter is not a mapping"); continue; }
    // A stub left where an archived page was says where it went, and is not an artefact.
    if (!fm.kind && fm.moved_to) continue;
    if (!fm.kind) {
      if (isIndex) R.error("FM-001", file, "index.md front matter has no kind: name the kind so the page can be validated against its schema");
      continue;
    }
    const page = { file, rel: rel(root, file), dir: path.dirname(file), fm, kind: fm.kind, id: fm.id, ids: [fm.id, fm.numeric_id].filter(Boolean) };
    pages.push(page);
    for (const id of page.ids) {
      if (byId.has(id)) R.error("FM-005", file, `${id} is also the id of ${byId.get(id).rel}: an identifier names one element`);
      else byId.set(id, page);
    }
    const v = validators.get(fm.kind);
    if (!v) {
      if (PLACEHOLDER_KINDS.has(fm.kind)) R.warn("FM-002", file, `kind ${fm.kind} has a placeholder schema only, so the page is not validated`);
      else R.error("FM-002", file, `no schema for kind '${fm.kind}'${kindEnum?.length ? `: the standard's kinds are ${kindEnum.join(", ")}` : ""}`);
      continue;
    }
    if (!v(fm)) {
      for (const e of v.errors) {
        const where = e.instancePath || "/";
        const params = e.params && Object.keys(e.params).length ? " " + JSON.stringify(e.params) : "";
        R.error("FM-003", file, `${where} ${e.message}${params}`);
      }
    }
  }

  // --- identifiers against the schemes: a known series, and the page where the scheme says
  const schemeOf = (id) => schemes.find((s) => s.re && s.re.test(id)) ?? null;
  if (schemes.length) {
    for (const p of pages) {
      const id = p.ids.find((i) => ID.test(i)) ?? p.id;
      // A candidate mints no identifier; an id it carries is a slug in no series.
      if (!id || p.kind === "candidate") continue;
      const s = schemeOf(id);
      if (!s) { R.error("ID-001", p.file, `${id} matches no scheme in the schemes register: add the series, or correct the identifier`); continue; }
      if (s.kind && s.kind !== p.kind) R.error("ID-002", p.file, `${id} is in the ${s.scheme} series, whose pages are kind ${s.kind}, but the page is kind ${p.kind}`);
      // An archived page keeps its place in the tree under the archive folder, not the scheme's home.
      const archived = p.fm.portfolio?.state === "archived";
      if (s.home) {
        if (!archived && !homeToRegExp(s.home, id).test(p.rel)) R.error("ID-003", p.file, `${id} should live at ${s.home.replace("{id}", id)} according to the schemes register, not ${p.rel}`);
      } else {
        R.error("ID-003", p.file, `${id} is in the ${s.scheme} series, which the schemes register says has no pages of its own; give the scheme a home, or keep ${s.scheme} to register rows`);
      }
    }
  }

  // --- the registers: every row a page where the scheme has a home, every page a row
  const registerIds = new Map(); // id -> { file, row }
  const registerFiles = new Map(); // abs path -> parsed
  const readRegister = (abs) => {
    if (!registerFiles.has(abs)) registerFiles.set(abs, existsSync(abs) ? csv(readFileSync(abs, "utf8")) : null);
    return registerFiles.get(abs);
  };
  for (const f of walkCsv(root)) {
    if (f === config.schemes || f === config.namespaces) continue;
    const t = readRegister(f);
    if (!t || !t.header.includes("id")) continue;
    for (const row of t.rows) {
      if (!row.id) continue;
      if (registerIds.has(row.id) && registerIds.get(row.id).file !== f) R.error("REG-005", f, `line ${row._line}: ${row.id} is also a row of ${rel(root, registerIds.get(row.id).file)}: one register per kind`);
      registerIds.set(row.id, { file: f, row });
      if (row.path) {
        const target = path.resolve(path.dirname(f), row.path);
        if (!existsSync(target)) R.error("REG-004", f, `line ${row._line}: ${row.id} path ${row.path} does not exist`);
      }
    }
  }
  for (const s of schemes) {
    if (!s.register) continue;
    const abs = path.resolve(root, s.register);
    const t = readRegister(abs);
    if (!t) { R.error("REG-001", config.schemes, `${s.scheme}: register ${s.register} does not exist`); continue; }
    if (!t.header.includes("id")) { R.error("REG-001", abs, `the register has no id column`); continue; }
    const rowIds = new Set();
    for (const row of t.rows) {
      if (!row.id) { R.error("REG-001", abs, `line ${row._line}: a row with no id`); continue; }
      rowIds.add(row.id);
      if (s.re && !s.re.test(row.id)) R.error("REG-001", abs, `line ${row._line}: ${row.id} is not in the ${s.scheme} series (${s.pattern})`);
      const retired = /^(retired|superseded|deprecated|folded)$/i.test(row.status ?? "");
      const page = byId.get(row.id);
      if (s.home && !page && !retired) R.error("REG-002", abs, `line ${row._line}: ${row.id} has no page at ${s.home.replace("{id}", row.id)}; write the page, or mark the row retired`);
      if (page && row.status && page.fm.status && String(row.status).toLowerCase() !== String(page.fm.status).toLowerCase()) {
        R.warn("REG-003", page.file, `status ${page.fm.status} on the page, ${row.status} in ${rel(root, abs)} line ${row._line}: keep the register and the page in step`);
      }
    }
    for (const p of pages) {
      const id = p.ids.find((i) => s.re && s.re.test(i));
      if (id && !rowIds.has(id)) R.error("REG-002", p.file, `${id} has no row in ${s.register}: every page of the ${s.scheme} series is registered there`);
    }
  }

  // --- relations resolve, and their inverses agree
  const known = (token) => byId.has(token) || registerIds.has(token);
  // A field may be a path into the front matter, as consequences.technical_debt is.
  const at = (fm, field) => field.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), fm);
  const targetsOf = (fm, field) => {
    const out = [];
    for (const v of list(at(fm, field))) {
      if (typeof v === "string") out.push(v.trim());
      else if (v && typeof v === "object") for (const k of ["id", "with", "sbb", "abb", "artefact", "ref", "service", "consumer", "provider"]) if (typeof v[k] === "string") out.push(v[k].trim());
    }
    return out;
  };
  for (const p of pages) {
    for (const field of RELATION_FIELDS) {
      if (at(p.fm, field) === undefined) continue;
      for (const token of targetsOf(p.fm, field)) {
        const c = CITATION.exec(token);
        if (c) {
          if (!namespaces.size) continue;
          if (!namespaces.has(c[1])) R.error("REL-003", p.file, `${field} cites ${token}, but ${c[1]} is not in the namespaces register`);
          else if (selfNamespaces.has(c[1]) && !known(c[2])) R.error("REL-001", p.file, `${field} cites ${token}, this catalogue's own namespace, but ${c[2]} is not a page or a register row`);
          continue;
        }
        if (ID.test(token)) {
          if (!known(token)) R.error("REL-001", p.file, `${field} names ${token}, which is not a page or a register row here`);
        } else if (SLUG.test(token) && SERVICE_FIELDS.has(field)) {
          if (!byId.has(token)) R.error("REL-001", p.file, `${field} names service ${token}, which has no page`);
        }
      }
    }
  }
  for (const [kindA, fieldA, kindB, fieldB] of INVERSES) {
    for (const a of pages.filter((p) => p.kind === kindA && at(p.fm, fieldA) !== undefined)) {
      const aNames = new Set(a.ids);
      for (const token of targetsOf(a.fm, fieldA)) {
        const b = byId.get(token);
        if (!b || b.kind !== kindB) continue;
        const back = targetsOf(b.fm, fieldB);
        if (!back.some((t) => aNames.has(t))) R.warn("REL-002", b.file, `${a.id} ${fieldA} ${token}, but ${fieldB} here does not list ${a.id}: the two sides of a relation agree`);
      }
    }
  }

  // --- the two kinds of pattern document
  for (const p of pages.filter((p) => p.kind === "pattern")) {
    for (const t of targetsOf(p.fm, "implements")) {
      const q = byId.get(t);
      if (q && !(q.kind === "pattern" && q.fm.pattern_type === "architecture-pattern")) R.error("PAT-001", p.file, `implements ${t}, which is not an architecture pattern: a reference architecture applies architecture patterns`);
    }
    for (const t of targetsOf(p.fm, "implemented_by")) {
      const q = byId.get(t);
      if (q && !(q.kind === "pattern" && q.fm.pattern_type === "reference-architecture")) R.error("PAT-001", p.file, `implemented_by ${t}, which is not a reference architecture`);
    }
  }

  // --- models: the diagram exists, and every committed view was rendered from it as it is now
  for (const p of pages) {
    const diagram = p.fm.model?.diagram;
    if (typeof diagram === "string" && !existsSync(path.resolve(p.dir, diagram))) R.error("MOD-001", p.file, `model.diagram ${diagram} does not exist beside the page`);
    if (!p.rel.endsWith("/index.md")) continue;
    const entries = readdirSync(p.dir);
    for (const n of entries.filter((n) => n.endsWith(".render.json"))) {
      let rec;
      try { rec = JSON.parse(readFileSync(path.join(p.dir, n), "utf8")); } catch (e) { R.error("MOD-002", path.join(p.dir, n), `not JSON: ${e.message}`); continue; }
      const image = n.slice(0, -".render.json".length);
      if (!entries.includes(image)) R.error("MOD-002", path.join(p.dir, n), `records a render of ${image}, which is not beside it`);
      const source = rec.source ? path.resolve(p.dir, rec.source) : null;
      if (!source || !existsSync(source)) { R.error("MOD-002", path.join(p.dir, n), `source ${rec.source ?? "(none)"} does not exist`); continue; }
      if (rec.sha256 && sha256(readFileSync(source)) !== rec.sha256) R.error("MOD-002", path.join(p.dir, image), `stale: ${rec.source} changed since this view was rendered; export it again and stamp it (model stamp)`);
    }
    for (const n of entries.filter((n) => n.endsWith(".drawio"))) {
      const stem = n.slice(0, -".drawio".length);
      if (!entries.some((e) => e.startsWith(stem + ".") && /\.(svg|png)$/.test(e))) R.warn("MOD-003", path.join(p.dir, n), `no exported view (${stem}.svg) beside the diagram, so the page shows nothing of it`);
    }
  }

  // --- decisions
  const decisions = pages.filter((p) => p.kind === "decision-record");
  for (const c of pages.filter((p) => p.kind === "consideration")) {
    const status = c.fm.consideration_status;
    const d = c.fm.resolved_by ? byId.get(c.fm.resolved_by) : null;
    if (status === "resolved" && d && !/^(accepted|active)$/.test(d.fm.status ?? "")) R.warn("DEC-001", c.file, `resolved by ${c.fm.resolved_by}, whose status is ${d.fm.status}: a consideration is resolved by an accepted or active decision`);
    if (status === "open") {
      const r = decisions.find((d) => targetsOf(d.fm, "resolves").includes(c.id));
      if (r) R.warn("DEC-002", c.file, `still open, but ${r.id} resolves it: set consideration_status resolved and resolved_by ${r.id}`);
    }
  }

  // --- calibration: a block in use is realised, so the ladder can reach R4
  for (const a of pages.filter((p) => p.kind === "abb" && !/^(retired|superseded|deprecated)$/.test(p.fm.status ?? ""))) {
    if (!targetsOf(a.fm, "realised_by").length) R.warn("CAL-001", a.file, `no SBB realises ${a.id}: the capability it serves cannot pass R4 until one does`);
  }

  const order = { error: 0, warn: 1 };
  R.findings.sort((x, y) => order[x.level] - order[y.level] || x.file.localeCompare(y.file) || x.code.localeCompare(y.code));
  return {
    findings: R.findings,
    summary: { pages: pages.length, registers: registerFiles.size, schemes: schemes.length, errors: R.errors, warnings: R.warnings },
  };
}

// ------------------------------------------------------------------------------ the scaffold

const SCHEMES_HEADER = "scheme,prefix,pattern,entity,home,register,deliverable_type,auto_link,notes";
const SCHEMES_ROWS = [
  ["platform", "PL", "PL-[0-9]{3}", "Platform", "platform.md", "", "", "linked", "One platform: this component"],
  ["outcome", "OC", "OC-[0-9]{3}", "Outcome", "demand/outcomes/{id}-*/index.md", "demand/outcomes.csv", "", "linked", ""],
  ["use-case", "UC", "UC-[0-9]{3}", "Use case", "demand/use-cases/{id}-*/index.md", "demand/use-cases.csv", "", "linked", "UML sense: a set of behaviours that gives an actor an observable result of value"],
  ["capability", "CAP", "CAP-[0-9]{3}", "Capability", "demand/capabilities/{id}-*/index.md", "demand/capabilities.csv", "", "linked", ""],
  ["product", "PRD", "PRD-[0-9]{3}", "Product", "demand/product.md", "", "", "linked", "One product: this component as shipped"],
  ["feature", "FE", "FE-[0-9]{3}", "Product feature", "", "demand/features.csv", "", "off", "A row of demand/features.csv with no page of its own"],
  ["bounded-context", "BC", "BC-[0-9]{3}", "Bounded context", "solution/contexts/{id}-*/index.md", "solution/contexts.csv", "", "linked", ""],
  ["abb", "ABB", "ABB-[0-9]{3}", "Architecture building block", "solution/abbs/{id}-*/index.md", "solution/abbs.csv", "", "linked", "One C4 container each (the calibration standard)"],
  ["sbb", "SBB", "SBB-[0-9]{3}", "Solution building block", "solution/sbbs/{id}-*/index.md", "solution/sbbs.csv", "", "linked", "One C4 container each"],
  ["architecture-pattern", "AP", "AP-[0-9]{3}", "Architecture pattern (conceptual or logical; technology-agnostic)", "solution/patterns/{id}-*/index.md", "", "pattern-logical", "linked", "The continuum's series for the kind"],
  ["reference-architecture", "RA", "RA-[0-9]{3}", "Reference architecture (physical; technology-specific; applies architecture patterns)", "solution/patterns/{id}-*/index.md", "", "pattern-physical", "linked", "The continuum's series for the kind"],
  ["collaboration", "CL", "CL-[0-9]{3}", "Collaboration (participants working together, with lighter rules than an architecture pattern)", "solution/patterns/{id}-*/index.md", "", "", "linked", "The continuum's series for the kind"],
  ["contract", "CT", "CT-[0-9]{3}", "Contract: an interface, API, event or published artefact", "", "solution/contracts.csv", "", "off", "A row of solution/contracts.csv with no page of its own"],
  ["service", "SV", "SV-[0-9]{3}", "Service (a deployable unit)", "runtime/services/{id}-*/index.md", "runtime/services.csv", "", "linked", "The page's id is the service's slug; SV-NNN is its numeric_id"],
  ["deployment-node", "DN", "DN-[0-9]{3}", "Deployment node", "", "runtime/nodes.csv", "", "off", "A row of runtime/nodes.csv"],
  ["store", "ST", "ST-[0-9]{3}", "Store", "", "runtime/stores.csv", "", "off", "A row of runtime/stores.csv: a database, bucket, table, index or secret owned by one context"],
  ["consideration", "CN", "CN-[0-9]{3}", "Consideration", "decisions/{id}-*/index.md", "decisions/considerations.csv", "", "linked", "An open question with more than one credible answer"],
  ["adr", "ADR", "ADR-[0-9]{3}", "Architecture decision record", "decisions/{id}-*.md", "decisions/decisions.csv", "adr", "linked", ""],
  ["technical-debt", "TD", "TD-[0-9]{3}", "Technical debt item", "decisions/{id}-*/index.md", "decisions/technical-debt.csv", "", "linked", "A consequence of a decision, attached to it and to the decision that repays it"],
];
const REGISTERS = {
  "demand/outcomes.csv": "id,name,kpi,target,owned_by,required_capabilities,status",
  "demand/use-cases.csv": "id,name,actor,outcome,requires_capabilities,realised_by,fulfilled_by_features,frequency,status,path",
  "demand/capabilities.csv": "id,name,level,parent,realised_by_abbs,maturity,status,path",
  "demand/features.csv": "id,name,what,fulfils,implemented_by,product",
  "solution/contexts.csv": "id,name,subdomain_kind,realises_capabilities,contains,owner,stores_owned,status,path",
  "solution/abbs.csv": "id,name,short_name,status,category,part_of,realises_capabilities,realised_by,requires,folded_into,path",
  "solution/sbbs.csv": "id,name,status,realises,realised_by_services,technologies,cloud_provider,deployment_model,path",
  "solution/contracts.csv": "id,name,kind,provider,consumers,definition,versioning,notes",
  "runtime/services.csv": "id,slug,name,kind,runtime_type,context,composes,realises,nodes,code,run_by,status,path",
  "runtime/nodes.csv": "id,name,cloud,module,hosts,sizing,optional,identity,notes",
  "runtime/stores.csv": "id,name,technology,node,owned_by,written_by,read_by,layout,retention,notes",
  "decisions/decisions.csv": "id,title,status,affects,resolves,path",
  "decisions/considerations.csv": "id,title,consideration_status,resolved_by,affects,path",
  "decisions/technical-debt.csv": "id,title,debt_status,quadrant,consequence_of,repaid_by,affects,interest,principal,path",
};
const FOLDERS = ["demand/outcomes", "demand/use-cases", "demand/capabilities", "solution/contexts", "solution/abbs", "solution/sbbs", "solution/patterns", "runtime/services", "decisions", "registers"];

const quote = (v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);

function readmeMap(name) {
  return `# The architecture of ${name}

The architecture of ${name}, expressed with the [architecture continuum](https://github.com/dermot-obrien/architecture-continuum/blob/main/docs/continuum.md): the demand space (what must be possible and for whom), the solution space (what realises it) and the runtime (what runs where), with the decisions that shaped them. A register (CSV) is the index of each kind; a page is the record of each element. Identifiers are this catalogue's, in the series the schemes register lists.

## The map

| Where | What | Identifiers |
|---|---|---|
| [platform.md](platform.md) | The platform: what it provides, owns and contains | PL |
| [demand/](demand/) | The demand space: [outcomes](demand/outcomes.csv), [use cases](demand/use-cases/), [capabilities](demand/capabilities/), the [product](demand/product.md) and its [features](demand/features.csv) | OC, UC, CAP, PRD, FE |
| [solution/](solution/) | The solution space: [bounded contexts](solution/contexts/), [architecture building blocks](solution/abbs/), [solution building blocks](solution/sbbs/), [architecture patterns and reference architectures](solution/patterns/), [contracts](solution/contracts.csv) | BC, ABB, SBB, AP, RA, CT |
| [runtime/](runtime/) | What runs where: [services](runtime/services.csv), [nodes](runtime/nodes.csv) and [stores](runtime/stores.csv) | SV, DN, ST |
| [decisions/](decisions/) | Decision records and open considerations | ADR, CN |
| [registers/](registers/) | The identifier series and the namespaces this catalogue cites | |

## Checking it

\`node .agents/skills/architecture/bin/continuum.mjs check\` reads every page and register here and reports what disagrees with the continuum's standards.
`;
}

/**
 * Write the layout for a new architecture root. Never overwrites a file that exists. Returns the
 * paths written and the bindings snippet the repository should add.
 */
export function scaffold({ root, namespace, name, url = "", workspace }) {
  const written = [];
  const skipped = [];
  const put = (relPath, content) => {
    const abs = path.join(root, relPath);
    if (existsSync(abs)) { skipped.push(relPath); return; }
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
    written.push(relPath);
  };
  mkdirSync(root, { recursive: true });
  for (const f of FOLDERS) mkdirSync(path.join(root, f), { recursive: true });
  put("README.md", readmeMap(name));
  put("registers/identifier-schemes.csv", [SCHEMES_HEADER, ...SCHEMES_ROWS.map((r) => r.map(quote).join(","))].join("\n") + "\n");
  put("registers/identifier-namespaces.csv", "namespace,name,self,base_url,url_template,manifest,owner,notes\n" +
    [namespace, name, "yes", url, "", "", "", `This catalogue. Another catalogue cites its identifiers as ${namespace}:ABB-001`].map(quote).join(",") + "\n");
  for (const [f, header] of Object.entries(REGISTERS)) put(f, header + "\n");
  for (const f of ["demand/use-cases", "demand/capabilities", "solution/contexts", "solution/abbs", "solution/sbbs", "solution/patterns", "runtime/services", "decisions"]) {
    const title = f.split("/").pop().replace(/-/g, " ");
    put(`${f}/README.md`, `# ${title[0].toUpperCase()}${title.slice(1)}\n\nOne folder per element, named after its identifier, with the page at index.md.\n`);
  }
  const bindingsDir = workspace ? path.join(workspace, ".agents") : null;
  const relRoot = bindingsDir ? path.relative(bindingsDir, root).split(path.sep).join("/") : "../docs/architecture";
  const snippet = `[suite.${SKILL}]
root             = "${relRoot}"
platformDir      = "${relRoot}"
outcomeDir       = "${relRoot}/demand/outcomes"
useCaseDir       = "${relRoot}/demand/use-cases"
capabilityDir    = "${relRoot}/demand/capabilities"
contextDir       = "${relRoot}/solution/contexts"
abbDir           = "${relRoot}/solution/abbs"
sbbDir           = "${relRoot}/solution/sbbs"
serviceDir       = "${relRoot}/runtime/services"
decisionDir      = "${relRoot}/decisions"
considerationDir = "${relRoot}/decisions"
patternDir       = "${relRoot}/solution/patterns"

[suite.pattern]
outputDir = "${relRoot}/solution/patterns"
idSeries  = "AP"

[suite.pattern.types.architecture-pattern]
label    = "Architecture pattern"
idSeries = "AP"

[suite.pattern.types.reference-architecture]
label    = "Reference architecture"
idSeries = "RA"

[suite.pattern.types.collaboration]
label    = "Collaboration"
idSeries = "CL"

[suite.use-case]
outputDir = "${relRoot}/demand/use-cases"
idSeries  = "UC"

[suite.cross-reference]
namespaces = "${relRoot}/registers/identifier-namespaces.csv"
schemes    = "${relRoot}/registers/identifier-schemes.csv"
`;
  return { written, skipped, snippet };
}
