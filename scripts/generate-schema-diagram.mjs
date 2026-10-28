#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0
// Part of the ai-assisted-architecture framework: https://github.com/dermot-obrien/ai-assisted-architecture
//
// generate-schema-diagram.mjs — draw the front matter schemas as one picture, docs/schema.svg,
// laid out where docs/continuum.drawio puts the same things, check the two agree, and write the
// tables of docs/schema.md that list every line and every difference.
//
// The kinds and the relationship fields are read from standards/schemas/v1.1.0/. The layout
// (where each box sits, how each line is routed) is declared below, because a readable picture
// needs it; what is drawn is not. Every relationship field in a schema must be drawn by exactly
// one line or listed as drawn otherwise, and every line must name only fields the schemas have,
// so the picture cannot drift from the schemas. The continuum's own picture is then compared
// line by line, and every difference must be one this file explains.
//
// Usage:
//   node scripts/generate-schema-diagram.mjs           write docs/schema.svg and the tables of docs/schema.md
//   node scripts/generate-schema-diagram.mjs --check   fail if either is stale or a difference is unexplained

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

if (process.argv.slice(2).some((a) => a === '-h' || a === '--help')) {
  console.log(`usage: node scripts/generate-schema-diagram.mjs [--check]

Draw the front matter schemas in standards/schemas/v1.1.0/ as docs/schema.svg, in the
layout of docs/continuum.drawio, compare the two pictures relationship by relationship,
and write the tables of docs/schema.md.

  --check     Write nothing. Exit 1 if docs/schema.svg or docs/schema.md is stale, if a
              schema field has no line, or if the pictures differ in a way not explained here
  -h, --help  Show this help`);
  process.exit(0);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMA_DIR = path.join(ROOT, 'standards', 'schemas', 'v1.1.0');
const OUT = path.join(ROOT, 'docs', 'schema.svg');
const PAGE = path.join(ROOT, 'docs', 'schema.md');
const CONTINUUM = path.join(ROOT, 'docs', 'continuum.drawio');
const CHECK = process.argv.includes('--check');

// ------------------------------------------------------------------ the schemas

const envelope = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, 'envelope.schema.json'), 'utf8'));
const KINDS = envelope.$defs.kindEnum.enum;

/** The $defs an identifier-valued schema node points at, through items and anyOf. */
function idRefs(node) {
  if (!node || typeof node !== 'object') return [];
  const out = [];
  if (node.$ref) {
    const m = /#\/\$defs\/(\w+Id)$/.exec(node.$ref);
    if (m) out.push(m[1]);
  }
  for (const k of ['items', 'anyOf', 'oneOf']) {
    const v = node[k];
    if (v) out.push(...(Array.isArray(v) ? v.flatMap(idRefs) : idRefs(v)));
  }
  return out;
}

/** Every field of every kind whose values are identifiers, as "kind.field" (nested as "kind.a.b"). */
function relationFields() {
  const fields = new Map();
  const walk = (node, kind, prefix) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, kind, prefix));
    for (const [f, v] of Object.entries(node.properties || {})) {
      if (f === 'id') continue;
      const refs = idRefs(v).filter((r) => r !== 'numericServiceId');
      // consideration.affects names identifiers by pattern rather than by $ref
      if (refs.length || (kind === 'consideration' && f === 'affects')) fields.set(`${kind}.${prefix}${f}`, [...new Set(refs)]);
      const inner = v.items || v;
      if (inner.properties) walk(inner, kind, `${prefix}${f}.`);
    }
    for (const k of ['allOf', 'anyOf', 'oneOf']) if (node[k]) walk(node[k], kind, prefix);
    if (node.then) walk(node.then, kind, prefix);
  };
  for (const file of fs.readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.schema.json') && f !== 'envelope.schema.json')) {
    const schema = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8'));
    const kind = schema.allOf?.[1]?.properties?.kind?.const;
    if (KINDS.includes(kind)) walk(schema, kind, '');
  }
  return fields;
}

// ------------------------------------------------------------------ the layout

// Boxes sit where docs/continuum.drawio puts the same thing (`continuum` names its cell).
// kind: a kind of the schemas. concept: on the continuum but recorded as a field, not a kind.
const BOXES = {
  landscape: { kind: 'landscape', title: 'Platform landscape', series: 'LS-NNN', text: 'layers: L0 upwards, each holding platforms', x: 480, y: 68, w: 400, h: 48, continuum: '6' },
  platform: { kind: 'platform', title: 'Platform', series: 'PL-NNN', text: 'strategic_owner, slos, self_service_interfaces', self: 'consumes, through landscape dependencies', x: 480, y: 149, w: 400, h: 52, continuum: '7' },
  capability: { kind: 'capability', title: 'Capability', series: 'CAP-NNN', text: 'level, components, maturity, flows', self: 'parent', x: 480, y: 224, w: 400, h: 52, continuum: '8' },
  'bounded-context': { kind: 'bounded-context', title: 'Bounded context', series: 'BC-NNN', text: 'ubiquitous_language, subdomain_kind', self: 'relationships.with', x: 480, y: 336, w: 400, h: 52, continuum: '9' },
  abb: { kind: 'abb', title: 'Architecture building block', series: 'ABB-NNN', text: 'interfaces, domains, mandatory_subabbs', self: 'requires.abb', x: 480, y: 408, w: 400, h: 52, continuum: '10' },
  sbb: { kind: 'sbb', title: 'Solution building block', series: 'SBB-NNN', text: 'technologies, product_mapping, ports, connectors', self: 'parts.sbb', x: 480, y: 480, w: 400, h: 52, continuum: '11' },
  service: { kind: 'service', title: 'Service', series: 'slug, SV-NNN', text: 'runtime_type, repo, module_path, packages', x: 480, y: 592, w: 400, h: 52, continuum: '12' },
  'deployment-node': { kind: 'deployment-node', title: 'Deployment node', series: 'DN-NNN', text: 'account, region, runtime, scaling_model, run_as', self: 'parent', x: 480, y: 674, w: 400, h: 52, continuum: '13' },
  outcome: { kind: 'outcome', title: 'Outcome', series: 'OC-NNN', text: 'kpi, kpi_target, measures', x: 70, y: 147, w: 340, h: 48, continuum: '21' },
  'use-case': { kind: 'use-case', title: 'Use case', series: 'UC-NNN', text: 'primary_actor, scenario, success_criteria', x: 70, y: 228, w: 340, h: 48, continuum: '22' },
  domain: { concept: true, title: 'Domain and subdomain', series: 'not a kind', text: 'recorded as subdomain_kind on the context', x: 120, y: 332, w: 290, h: 52, continuum: '23' },
  feature: { kind: 'feature', title: 'Feature', series: 'FE-NNN', text: 'what; a register row or a page', x: 70, y: 480, w: 340, h: 52, continuum: '46' },
  product: { kind: 'product', title: 'Product', series: 'PRD-NNN', text: 'team, product_state, requires_flows', x: 70, y: 592, w: 340, h: 52, continuum: '24' },
  module: { concept: true, title: 'Module and component', series: 'not a kind', text: 'recorded as module_path and packages', x: 70, y: 664, w: 340, h: 52, continuum: '25' },
  consideration: { kind: 'consideration', title: 'Consideration', series: 'CN-NNN', text: 'question, options, criteria', x: 950, y: 80, w: 165, h: 52, continuum: '32' },
  'decision-record': { kind: 'decision-record', title: 'Decision record', series: 'DR-NNN', text: 'y_statement, change_type', x: 1190, y: 80, w: 180, h: 52, continuum: '32' },
  'technical-debt': { kind: 'technical-debt', title: 'Technical debt', series: 'TD-NNN', text: 'debt_status, quadrant, interest', x: 1190, y: 158, w: 180, h: 48 },
  patterns: { group: true, kind: 'pattern', title: 'Pattern document', series: 'kind pattern', text: 'pattern_type, pattern_scope; abstraction is derived', x: 950, y: 336, w: 420, h: 210, continuum: '34' },
  'architecture-pattern': { kind: 'pattern', title: 'Architecture pattern', series: 'AP-NNN', text: 'ABBs and local roles; logical', x: 1030, y: 403, w: 324, h: 48, continuum: '35' },
  'reference-architecture': { kind: 'pattern', title: 'Reference architecture', series: 'RA-NNN', text: 'SBBs and technologies; physical', x: 1030, y: 482, w: 324, h: 48, continuum: '36' },
  api: { kind: 'api', placeholder: true, title: 'API', series: 'API-NNN, placeholder', text: 'the contracts a service provides and consumes', x: 1000, y: 588, w: 370, h: 48, continuum: '33' },
  store: { kind: 'store', title: 'Store', series: 'ST-NNN', text: 'store_type, technology; read_by, written_by', x: 1000, y: 673, w: 370, h: 52, continuum: '37' },
};

// One line per relationship, drawn from subject to object as the continuum reads it. `fields`
// are every schema field the line stands for, forward and inverse. `route` runs from the
// subject's edge to the object's edge. `continuum` names the matching edges of continuum.drawio
// as "source->target" cell ids.
const LINES = [
  { from: 'landscape', to: 'platform', label: 'holds, in layers', fields: ['landscape.layers.platforms', 'platform.layer', 'platform.landscape', 'landscape.dependencies.consumer', 'landscape.dependencies.provider'], route: [[680, 116], [680, 149]], at: [680, 133], continuum: ['6->7'] },
  { from: 'platform', to: 'capability', label: 'provides', fields: ['platform.provides_capabilities', 'capability.provided_by_platform'], route: [[680, 201], [680, 224]], at: [680, 212], continuum: ['7->8'] },
  { from: 'platform', to: 'bounded-context', label: 'contains', fields: ['platform.contains_bounded_contexts', 'bounded-context.part_of'], route: [[880, 190], [916, 190], [916, 350], [880, 350]], at: [916, 300], rotate: true },
  { from: 'capability', to: 'bounded-context', label: 'realised by', fields: ['bounded-context.realises_capabilities'], route: [[680, 276], [680, 336]], at: [680, 312], continuum: ['8->9'] },
  { from: 'capability', to: 'abb', label: 'realised by', fields: ['capability.realised_by_abbs', 'abb.realises_capabilities'], route: [[880, 266], [888, 266], [888, 420], [880, 420]], at: [888, 395], rotate: true },
  { from: 'bounded-context', to: 'abb', label: 'contains', fields: ['bounded-context.contains', 'abb.part_of'], route: [[680, 388], [680, 408]], at: [680, 398], continuum: ['9->10'] },
  { from: 'abb', to: 'sbb', label: 'realised by', fields: ['abb.realised_by', 'sbb.realises'], route: [[680, 460], [680, 480]], at: [680, 470], continuum: ['10->11'] },
  { from: 'sbb', to: 'service', label: 'realised by', fields: ['sbb.realised_by_services', 'service.realises'], route: [[680, 532], [680, 592]], at: [680, 562], continuum: ['11->12', '12->11'] },
  { from: 'service', to: 'bounded-context', label: 'part of', fields: ['service.part_of'], route: [[480, 598], [468, 598], [468, 378], [480, 378]], at: [468, 500], rotate: true },
  { from: 'service', to: 'deployment-node', label: 'deployed to', fields: ['service.deployed_to', 'deployment-node.hosts'], route: [[680, 644], [680, 674]], at: [680, 659], continuum: ['12->13'] },
  { from: 'outcome', to: 'platform', label: 'owned by', fields: ['outcome.owned_by_platform', 'platform.owns_outcomes'], route: [[410, 163], [480, 163]], at: [440, 163], continuum: ['21->7'] },
  { from: 'outcome', to: 'capability', label: 'requires', fields: ['outcome.requires_capabilities', 'capability.required_by_outcomes'], route: [[410, 183], [444, 183], [444, 238], [480, 238]], at: [444, 210], continuum: ['21->8'] },
  { from: 'use-case', to: 'outcome', label: 'supports', fields: ['use-case.supports_outcome', 'outcome.supported_by_use_cases'], route: [[240, 228], [240, 195]], at: [240, 211], continuum: ['22->21'] },
  { from: 'use-case', to: 'capability', label: 'requires', fields: ['use-case.requires_capabilities'], route: [[410, 256], [480, 256]], at: [433, 256], continuum: ['22->8'] },
  { from: 'use-case', to: 'patterns', label: 'realised by a pattern (serves)', fields: ['use-case.realised_by', 'pattern.serves'], route: [[410, 268], [424, 268], [424, 296], [972, 296], [972, 336]], at: [560, 296], continuum: ['34->22'] },
  { from: 'feature', to: 'use-case', label: 'fulfils', fields: ['feature.fulfils', 'use-case.fulfilled_by_features'], route: [[70, 496], [30, 496], [30, 250], [70, 250]], at: [30, 400], rotate: true, continuum: ['46->22'] },
  { from: 'feature', to: 'service', label: 'implemented by', fields: ['feature.implemented_by'], route: [[410, 512], [432, 512], [432, 606], [480, 606]], at: [432, 560], rotate: true, continuum: ['46->12'] },
  { from: 'product', to: 'feature', label: 'has', fields: ['product.features', 'feature.part_of'], route: [[240, 592], [240, 532]], at: [240, 562], continuum: ['24->46'] },
  { from: 'product', to: 'service', label: 'runs', fields: ['product.runs', 'service.run_by'], route: [[410, 622], [480, 622]], at: [445, 622], continuum: ['24->12'] },
  { from: 'product', to: 'platform', label: 'offered by', fields: ['product.platform'], route: [[70, 632], [16, 632], [16, 136], [456, 136], [456, 155], [480, 155]], at: [240, 136] },
  { from: 'product', to: 'capability', label: 'requires', fields: ['product.requires'], route: [[70, 608], [56, 608], [56, 286], [454, 286], [454, 270], [480, 270]], at: [300, 286] },
  { from: 'domain', to: 'bounded-context', label: 'maps to', concept: true, note: '`subdomain_kind` on the bounded context', fields: [], route: [[410, 360], [480, 360]], at: [445, 360], continuum: ['23->9'] },
  { from: 'service', to: 'module', label: 'contains', concept: true, note: '`module_path` and `packages` on the service', fields: [], route: [[480, 636], [450, 636], [450, 690], [410, 690]], at: [445, 663], continuum: ['12->25'] },
  { from: 'consideration', to: 'capability', label: 'affects', dashed: true, fields: ['consideration.affects'], route: [[950, 106], [902, 106], [902, 236], [880, 236]], at: [902, 170], rotate: true, continuum: ['32->8'] },
  { from: 'consideration', to: 'decision-record', label: 'resolved by', fields: ['consideration.resolved_by'], route: [[1115, 106], [1190, 106]], at: [1152, 106] },
  { from: 'decision-record', to: 'technical-debt', label: 'consequence, repays', fields: ['decision-record.consequences.technical_debt', 'technical-debt.consequence_of', 'decision-record.repays_debt', 'technical-debt.repaid_by'], route: [[1280, 132], [1280, 158]], at: [1280, 145] },
  { from: 'patterns', to: 'capability', label: 'realises', fields: ['pattern.realises'], route: [[950, 352], [930, 352], [930, 252], [880, 252]], at: [930, 300], rotate: true, continuum: ['34->8'] },
  { from: 'architecture-pattern', to: 'abb', label: 'composes', fields: ['pattern.composes', 'abb.composed_by'], route: [[1030, 427], [880, 427]], at: [990, 427], continuum: ['35->10'] },
  { from: 'reference-architecture', to: 'sbb', label: 'composes', fields: ['sbb.composed_by'], route: [[1030, 506], [880, 506]], at: [990, 506], continuum: ['36->11'] },
  { from: 'reference-architecture', to: 'architecture-pattern', label: 'applies', fields: ['pattern.implements', 'pattern.implemented_by'], route: [[1192, 482], [1192, 451]], at: [1192, 466], continuum: ['36->35'] },
  { from: 'service', to: 'api', label: 'provides, consumes', fields: ['service.provides_apis', 'service.consumes_apis'], route: [[880, 604], [1000, 604]], at: [940, 604] },
  { from: 'service', to: 'store', label: 'owns', fields: ['service.stores', 'store.owned_by', 'store.read_by', 'store.written_by'], route: [[880, 630], [920, 630], [920, 690], [1000, 690]], at: [960, 690], continuum: ['12->37'] },
  { from: 'store', to: 'deployment-node', label: 'hosted on', fields: ['store.hosted_on', 'deployment-node.hosts_stores'], route: [[1000, 712], [880, 712]], at: [940, 712], continuum: ['37->13'] },
  { from: 'store', to: 'bounded-context', label: 'part of', fields: ['store.part_of'], route: [[1360, 673], [1360, 646], [1385, 646], [1385, 556], [944, 556], [944, 372], [880, 372]], at: [1150, 556] },
];

// Fields drawn in a box rather than by a line: a relation of a kind to itself, or to any kind.
const IN_A_BOX = {
  'capability.parent': 'capability', 'bounded-context.relationships.with': 'bounded-context', 'abb.requires.abb': 'abb',
  'sbb.parts.sbb': 'sbb', 'deployment-node.parent': 'deployment-node',
  'decision-record.affects_artefacts': 'any kind', 'technical-debt.affects': 'any kind',
};

// Lines of the continuum's picture that the schemas draw differently, and why.
const CONTINUUM_ONLY = {
  '33->9': 'Contracts between contexts: the schemas record contracts on the services that provide and consume them (service to API), not on the bounded context.',
};
// Lines of this picture the continuum leaves out to stay readable, and why that is fine.
const SCHEMA_ONLY = {
  'platform->bounded-context': 'in the continuum\'s text and relationship table; left out of its picture to keep the spine readable',
  'capability->abb': 'the continuum shows the capability realised through the bounded context that contains the ABB; the schemas also record it directly',
  'service->bounded-context': 'stated in the continuum\'s text (a service lives in one bounded context)',
  'store->bounded-context': 'stated in the continuum\'s text (a store is owned by one context)',
  'product->platform': 'stated in the continuum\'s text (a platform offers products)',
  'product->capability': 'stated in the continuum\'s text and relationship table',
  'consideration->decision-record': 'one box in the continuum',
  'decision-record->technical-debt': 'beside the continuum, in its text and relationship table; the picture keeps decisions to one box',
  'service->api': 'the continuum draws contracts between contexts; see the continuum-only difference',
};

// ------------------------------------------------------------------ agreement

const problems = [];
const fields = relationFields();
const drawn = new Map();
for (const line of LINES) for (const f of line.fields) {
  if (!fields.has(f)) problems.push(`line ${line.from} -> ${line.to} names ${f}, which no schema has`);
  if (drawn.has(f)) problems.push(`${f} is drawn twice`);
  drawn.set(f, line);
}
for (const f of Object.keys(IN_A_BOX)) if (!fields.has(f)) problems.push(`${f} is listed as drawn in a box, but no schema has it`);
for (const f of fields.keys()) if (!drawn.has(f) && !IN_A_BOX[f]) problems.push(`${f} has no line: add one to LINES or list it in IN_A_BOX`);
// Placeholder kinds with no relationship fields yet, so nothing to draw.
const NO_BOX = { view: 'placeholder', event: 'placeholder', candidate: 'not an artefact: a possible pattern, noted until it is promoted' };
for (const k of KINDS) if (!NO_BOX[k] && !Object.values(BOXES).some((b) => b.kind === k)) problems.push(`kind ${k} has no box`);

const edges = [...fs.readFileSync(CONTINUUM, 'utf8').matchAll(/<mxCell\b[^>]*?\bedge="1"[^>]*>/g)].map((m) => {
  const a = (n) => (new RegExp(`\\b${n}="([^"]*)"`).exec(m[0]) || [])[1];
  return `${a('source')}->${a('target')}`;
});
const matched = new Set(LINES.flatMap((l) => l.continuum || []));
const continuumOnly = edges.filter((e) => !matched.has(e));
for (const e of continuumOnly) if (!CONTINUUM_ONLY[e]) problems.push(`continuum.drawio draws ${e}, which no line here matches or explains`);
for (const e of matched) if (!edges.includes(e)) problems.push(`a line here claims continuum.drawio draws ${e}, which it does not`);
const schemaOnly = LINES.filter((l) => !l.continuum).map((l) => `${l.from}->${l.to}`);
for (const k of schemaOnly) if (!SCHEMA_ONLY[k]) problems.push(`${k} is not drawn in continuum.drawio and is not explained`);

// ------------------------------------------------------------------ the picture

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textWidth = (s, size) => s.length * size * 0.56;

function box(id, b) {
  const cls = b.group ? 'group' : b.concept ? 'concept' : b.placeholder ? 'placeholder' : ['landscape', 'platform', 'capability', 'bounded-context', 'abb', 'sbb', 'service', 'deployment-node'].includes(id) ? 'spine' : 'side';
  const out = [`<g id="box-${id}">`, `<rect class="${cls}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6"/>`];
  const tx = b.x + 10;
  const ty = b.y + (b.group ? 20 : 20);
  out.push(`<text class="title" x="${tx}" y="${ty}">${esc(b.title)}<tspan class="series" dx="6">${esc(b.series)}</tspan></text>`);
  out.push(`<text class="note" x="${tx}" y="${ty + 17}">${esc(b.text)}</text>`);
  if (b.self) out.push(`<text class="self" x="${b.x + b.w - 8}" y="${b.selfBelow ? ty + 17 : ty}" text-anchor="end">↻ ${esc(b.self)}</text>`);
  out.push('</g>');
  return out.join('');
}

const tip = (l) => `<title>${esc(l.fields.join(', ') || 'not a field: ' + l.label)}</title>`;

function line(l) {
  const pts = l.route.map(([x, y]) => `${x},${y}`).join(' ');
  const cls = l.concept ? 'rel concept' : l.dashed ? 'rel dashed' : 'rel';
  return `<g id="line-${l.from}-${l.to}">${tip(l)}<polyline class="${cls}" points="${pts}" marker-end="url(#arrow)"/></g>`;
}

// Labels are drawn after the boxes, so none is hidden. A label on a vertical lane is turned to run along it.
function label(l) {
  const [lx, ly] = l.at;
  const w = textWidth(l.label, 11) + 8;
  const turn = l.rotate ? ` transform="rotate(-90 ${lx} ${ly})"` : '';
  return [
    `<g id="label-${l.from}-${l.to}"${turn}>${tip(l)}`,
    `<rect class="label-bg" x="${(lx - w / 2).toFixed(1)}" y="${ly - 7}" width="${w.toFixed(1)}" height="14" rx="3"/>`,
    `<text class="label" x="${lx}" y="${ly + 4}" text-anchor="middle">${esc(l.label)}</text></g>`,
  ].join('');
}

const W = 1400;
const H = 900;
const legend = [
  'Every box with a series is a kind of the front matter schemas in standards/schemas/v1.1.0; every line is one or more of their identifier fields, forward and inverse (hover a line for its fields).',
  'A dashed box is on the continuum but is recorded as a field, not a kind. ↻ marks a field that relates a kind to itself. Decision records and technical debt also name affected artefacts of any kind.',
  'Solid arrow: a relationship recorded in front matter. Dashed arrow: may point at more than one level. Boxes sit where the continuum puts them; its Contracts is the API placeholder here, and technical debt is added.',
  'Generated by scripts/generate-schema-diagram.mjs from the schemas, which also checks the picture against continuum.drawio. Do not edit by hand.',
];

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`,
  '<title>The front matter schemas on the continuum</title>',
  `<style>
  svg { --bg: #FFFFFF; --ink: #1B2A4A; --muted: #5A6A86; --series: #2F55D4; --line: #3A4A6B; --demand: #EEF2FA; --solution: #EEF6F2; --runtime: #FDF3E7; --group: #F6F7FA; --legend: #D6DAE3; }
  @media (prefers-color-scheme: dark) { svg { --bg: #121212; --ink: #BECBE6; --muted: #8F9CB8; --series: #8FA8FF; --line: #9AA8C4; --demand: #1A2030; --solution: #172420; --runtime: #2A2118; --group: #1C1F27; --legend: #3A4150; } }
  .bg { fill: var(--bg); }
  .band { stroke: none; } .band.demand { fill: var(--demand); } .band.solution { fill: var(--solution); } .band.runtime { fill: var(--runtime); }
  .band-title { fill: var(--muted); font-size: 12px; }
  .heading { fill: var(--ink); font-size: 18px; font-weight: bold; } .subheading { fill: var(--muted); font-size: 12px; }
  rect.spine { fill: var(--bg); stroke: var(--ink); stroke-width: 1.4; }
  rect.side { fill: var(--bg); stroke: var(--muted); stroke-width: 1.2; }
  rect.placeholder, rect.concept { fill: var(--bg); stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 5 3; }
  rect.group { fill: var(--group); stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 5 3; }
  .title { fill: var(--ink); font-size: 14px; font-weight: bold; } .series { fill: var(--series); font-size: 11px; font-weight: normal; font-family: 'Courier New', monospace; }
  .note { fill: var(--muted); font-size: 11px; } .self { fill: var(--muted); font-size: 10px; font-style: italic; }
  .rel { fill: none; stroke: var(--line); stroke-width: 1.2; } .rel.dashed { stroke-dasharray: 5 3; } .rel.concept { stroke-dasharray: 2 3; }
  .label-bg { fill: var(--bg); } .label { fill: var(--ink); font-size: 11px; }
  .arrowhead { fill: var(--line); }
  rect.legend { fill: var(--bg); stroke: var(--legend); } .legend-title { fill: var(--ink); font-size: 14px; font-weight: bold; } .legend-text { fill: var(--muted); font-size: 12px; }
</style>`,
  '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrowhead" d="M0,0 L10,5 L0,10 z"/></marker></defs>',
  `<rect class="bg" width="${W}" height="${H}"/>`,
  '<text class="heading" x="24" y="24">The front matter schemas on the continuum</text>',
  '<text class="subheading" x="24" y="41">Generated from standards/schemas/v1.1.0. Same places as the continuum picture: demand space, solution space, runtime.</text>',
  '<rect class="band demand" x="8" y="48" width="1384" height="240" rx="8"/><text class="band-title" x="20" y="66">DEMAND SPACE</text>',
  '<rect class="band solution" x="8" y="304" width="1384" height="248" rx="8"/><text class="band-title" x="20" y="322">SOLUTION SPACE</text>',
  '<rect class="band runtime" x="8" y="565" width="1384" height="173" rx="8"/><text class="band-title" x="20" y="583">RUNTIME</text>',
  ...Object.entries(BOXES).filter(([, b]) => b.group).map(([id, b]) => box(id, b)),
  ...LINES.map(line),
  ...Object.entries(BOXES).filter(([, b]) => !b.group).map(([id, b]) => box(id, b)),
  ...LINES.map(label),
  `<rect class="legend" x="8" y="750" width="1384" height="${H - 758}" rx="8"/>`,
  '<text class="legend-title" x="20" y="772">Reading the picture</text>',
  ...legend.map((t, i) => `<text class="legend-text" x="20" y="${794 + i * 20}">${esc(t)}</text>`),
  '</svg>',
  '',
].join('\n');

// ------------------------------------------------------------------ the page's tables

const name = (id) => BOXES[id].title;
const fieldList = (l) => (l.fields.length ? l.fields.map((f) => `\`${f}\``).join(', ') : `not a relationship: ${l.note}`);
const kindRows = Object.entries(BOXES).filter(([, b]) => b.kind && !b.group).map(([, b]) => {
  const file = `${b.kind}.schema.json`;
  const where = fs.existsSync(path.join(SCHEMA_DIR, file)) ? `[\`${file}\`](../standards/schemas/v1.1.0/${file})` : `[\`_placeholders/${file}\`](../standards/schemas/v1.1.0/_placeholders/${file})`;
  return `| ${b.title} | \`${b.series}\` | ${where} | ${b.self ? `↻ ${b.self}` : ''} |`;
});
const tables = [
  '<!-- generated: the tables below are written by scripts/generate-schema-diagram.mjs -->',
  '',
  '## The kinds',
  '',
  '| Kind | Identifier | Schema | Relates to itself through |',
  '|---|---|---|---|',
  ...[...new Set(kindRows)],
  '',
  `Not drawn: ${Object.keys(NO_BOX).filter((k) => NO_BOX[k] === 'placeholder').map((k) => `\`${k}\``).join(' and ')}, placeholders with no relationship fields yet${Object.entries(NO_BOX).filter(([, v]) => v !== 'placeholder').map(([k, v]) => `; \`${k}\`, ${v}`).join('')}. Two fields name artefacts of any kind and are not drawn as lines: ${Object.entries(IN_A_BOX).filter(([, v]) => v === 'any kind').map(([f]) => `\`${f}\``).join(' and ')}.`,
  '',
  '## The lines',
  '',
  'Each line, read from subject to object as the continuum reads it, with every field it stands for and whether the continuum picture draws it.',
  '',
  '| From | Relationship | To | Fields | In the continuum picture |',
  '|---|---|---|---|---|',
  ...LINES.map((l) => `| ${name(l.from)} | ${l.label} | ${name(l.to)} | ${fieldList(l)} | ${l.continuum ? 'Yes' : `No: ${SCHEMA_ONLY[`${l.from}->${l.to}`]}`} |`),
  '',
  '## Drawn in the continuum picture only',
  '',
  ...(continuumOnly.length ? continuumOnly.map((e) => `- ${CONTINUUM_ONLY[e]}`) : ['Nothing.']),
  '',
  '<!-- end generated -->',
].join('\n');
const pageNow = fs.readFileSync(PAGE, 'utf8');
const marked = /<!-- generated:[^]*?<!-- end generated -->/;
if (!marked.test(pageNow)) problems.push('docs/schema.md has no generated section to write');
const page = pageNow.replace(marked, () => tables);

if (problems.length) {
  for (const p of problems) console.error(`schema diagram: ${p}`);
  process.exit(1);
}
if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  const stale = [current !== svg && 'docs/schema.svg', page !== pageNow && 'docs/schema.md'].filter(Boolean);
  if (stale.length) {
    console.error(`schema diagram: ${stale.join(' and ')} not what the schemas draw; run node scripts/generate-schema-diagram.mjs`);
    process.exit(1);
  }
  console.log(`schema diagram: ${LINES.length} lines over ${fields.size} fields agree with the schemas and with continuum.drawio`);
} else {
  fs.writeFileSync(OUT, svg);
  fs.writeFileSync(PAGE, page);
  console.log(`schema diagram: wrote docs/schema.svg and the tables of docs/schema.md (${LINES.length} lines, ${fields.size} fields)`);
}
