// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0

/**
 * The assessment's check depth, as a tool: applies every criterion decided by `tool`, and the
 * presence half of every criterion decided by `both`, to a design specification, exactly as
 * the lenses write their rules (standards/assessment/lenses/). Every shipped criterion is coded here; an
 * organisation's criterion is checked by the declarative `check` its lens gives it (src/criteria.mjs),
 * and one with neither is reported as `manual`, never guessed. With a previous version of the
 * specification, it also lists the criteria a change must re-check: those whose `reads` touch a
 * field that changed.
 *
 * Results follow the standard (section 5): every clause holds is met, some is partly-met, none
 * is not-met, and a criterion whose condition the design does not trigger is not-applicable.
 */

import { evaluateCheck } from "./criteria.mjs";

const list = v => (Array.isArray(v) ? v : v == null ? [] : [v]);
const has = v => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);

/** Tally clauses: each a [ok, message] pair. No clauses means the rule did not apply. */
function tally(clauses, notApplicableWhy = "nothing in the design triggers this rule") {
  if (!clauses.length) return { result: "not-applicable", notes: [notApplicableWhy] };
  const failed = clauses.filter(([ok]) => !ok).map(([, m]) => m);
  const result = failed.length === 0 ? "met" : failed.length === clauses.length ? "not-met" : "partly-met";
  return { result, notes: failed };
}
const na = why => ({ result: "not-applicable", notes: [why] });

function context(spec, triage) {
  const els = list(spec.elements);
  const byId = new Map(els.map(e => [e.id, e]));
  const zones = new Map(list(spec.trust_zones).map(z => [z.id, z]));
  const ai = els.filter(e => e.ai);
  const agents = els.filter(e => e.agent);
  const evals = ai.flatMap(e => list(e.ai.evals).map(v => ({ ...v, element: e.id })));
  const evidence = list(spec.evidence);
  const ver = spec.design?.version;
  const evOf = (type, thisVersion = false) => evidence.filter(x => x.type === type && (!thisVersion || x.design_version === ver));
  const type = spec.design?.type;
  const status = spec.design?.status;
  const positions = new Map(list(triage?.target_state).map(t => [t.element, t]));
  return { spec, els, byId, zones, ai, agents, evals, evidence, evOf, ver, type, status, positions, triage };
}

const physicalKinds = new Set(["sbb", "technology", "service", "store", "deployment-node"]);
function abstraction(c) {
  const kinds = c.els.filter(e => !["actor", "external-system"].includes(e.kind)).map(e => e.kind);
  if (!kinds.length) return "unknown";
  if (kinds.every(k => k === "local-role")) return "conceptual";
  if (kinds.every(k => k === "abb" || k === "local-role")) return "logical";
  if (kinds.every(k => physicalKinds.has(k))) return "physical";
  return "mixed";
}
const crossesZones = (c, k) => {
  const a = c.byId.get(k.from), b = c.byId.get(k.to);
  return a && b && a.trust_zone && b.trust_zone && a.trust_zone !== b.trust_zone;
};
const outerEnd = (c, id) => {
  const e = c.byId.get(id);
  if (!e) return false;
  if (["actor", "external-system"].includes(e.kind)) return true;
  const z = c.zones.get(e.trust_zone);
  return z && ["partially-trusted", "untrusted"].includes(z.trust);
};
const solutionLike = c => ["reference-architecture", "solution-design"].includes(c.type);

/** One function per automated criterion: returns { result, notes }. */
export const CHECKS = {
  "CORE-DEM-01": ({ spec }) => tally([
    [list(spec.drivers?.goals).length > 0, "drivers.goals is empty"],
    [spec.drivers?.non_goals !== undefined, "drivers.non_goals is missing"],
    ...list(spec.drivers?.stakeholders).map(s => [list(s.concerns).length > 0, `stakeholder ${s.role} has no concern`]),
  ]),
  "CORE-DEM-02": ({ spec }) => tally([[has(spec.context?.outcomes) || has(spec.context?.serves) || has(spec.context?.realises) || list(spec.drivers?.assumptions).length > 0,
    "no outcome, use case or capability, and no assumption naming the demand"]]),
  "CORE-TRC-01": (c) => tally([
    [has(c.spec.context?.realises), "context.realises is empty"],
    [has(c.spec.context?.platform), "context.platform is not set"],
    [has(c.spec.context?.bounded_contexts) || (c.type === "architecture-pattern" && abstraction(c) === "conceptual"), "context.bounded_contexts is empty"],
  ]),
  "CORE-TRC-03": (c) => solutionLike(c) ? tally([[has(c.spec.design?.implements), "design.implements is empty"]]) : na("not a reference architecture or solution design"),
  "CORE-TRC-04": (c) => {
    const sc = list(c.spec.scenarios);
    const uses = new Set(sc.map(s => s.use_case).filter(Boolean));
    return tally([
      ...sc.filter(s => s.type === "functional").map(s => [has(s.use_case), `functional scenario ${s.id} names no use case`]),
      ...list(c.spec.context?.serves).map(u => [uses.has(u), `use case ${u} has no scenario`]),
    ]);
  },
  "CORE-TGT-02": (c) => {
    const deps = list(c.spec.decisions).filter(d => d.departure);
    if (!deps.length) return na("no decision has a departure; the reviewer half decides");
    return tally(deps.flatMap(d => [
      [d.status === "accepted" && has(d.chosen) && has(d.rationale) && has(d.departure.from), `decision ${d.id}: departure needs status accepted, chosen, rationale and departure.from`],
      ...(d.departure.kind === "time-bound" ? [[has(d.departure.expires) && has(d.departure.path_back), `decision ${d.id}: a time-bound departure needs expires and path_back`]] : []),
    ]));
  },
  "CORE-TGT-05": (c) => {
    if (!c.triage) return { result: "not-assessed", notes: ["needs the triage record's target-state positions: pass --triage"] };
    const flagged = [...c.positions.values()].filter(p => p.position === "not-target" || p.position === "contained");
    if (!flagged.length) return na("no element is attested not-target or contained");
    const decs = list(c.spec.decisions);
    return tally(flagged.map(p => {
      const ok = decs.some(d => d.status === "accepted" && d.departure && list(d.affects).includes(p.element) && has(d.departure.escalation) && has(d.departure.approved_by));
      return [ok, `${p.element} is ${p.position} with no accepted decision whose departure records escalation and approval by the exception authority`];
    }));
  },
  "CORE-STR-02": (c) => tally(c.els.filter(e => ["abb", "sbb", "service", "store"].includes(e.kind)).map(e => [has(e.part_of), `${e.id} has no part_of`])),
  "CORE-STR-04": (c) => c.type !== "solution-design" ? na("not a solution design") : tally([
    ...c.els.filter(e => e.kind === "service").map(e => [list(e.deployed_to).some(n => c.byId.get(n)?.kind === "deployment-node"), `service ${e.id} is not deployed to a deployment node`]),
    ...list(c.spec.data).map(d => [c.byId.has(d.owner), `data set ${d.id}: owner ${d.owner} is not an element`]),
  ]),
  "CORE-STR-05": (c) => {
    const ids = [...c.els, ...list(c.spec.connectors), ...list(c.spec.trust_zones), ...list(c.spec.data), ...list(c.spec.scenarios)].map(x => x.id);
    const known = new Set(ids);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    const refs = [
      ...list(c.spec.connectors).flatMap(k => [[k.from, `connector ${k.id}.from`], [k.to, `connector ${k.id}.to`], ...list(k.data).map(d => [d, `connector ${k.id}.data`])]),
      ...c.els.flatMap(e => [[e.trust_zone, `${e.id}.trust_zone`], ...list(e.deployed_to).map(d => [d, `${e.id}.deployed_to`])].filter(([v]) => v)),
      ...c.ai.flatMap(e => list(e.ai.grounding?.sources).map(s => [s, `${e.id}.ai.grounding.sources`])),
    ];
    return tally([[dupes.length === 0, `duplicate ids: ${[...new Set(dupes)].join(", ")}`], ...refs.map(([v, where]) => [known.has(v), `${where} names ${v}, which is not in the specification`])]);
  },
  "CORE-STR-06": (c) => tally(c.els.filter(e => ["service", "store", "sbb", "deployment-node"].includes(e.kind)).map(e => [has(e.owner), `${e.id} has no owner`])),
  "CORE-QA-01": (c) => {
    const sc = list(c.spec.scenarios).filter(s => ["quality", "failure", "misuse"].includes(s.type));
    return tally([[sc.some(s => s.type === "quality"), "no quality scenario"],
      ...sc.map(s => [has(s.stimulus) && has(s.response) && has(s.response_measure) && has(s.importance), `scenario ${s.id} lacks a stimulus, response, measure or importance`])]);
  },
  "CORE-QA-02": (c) => {
    const covered = new Set(list(c.spec.scenarios).filter(s => ["quality", "failure", "misuse"].includes(s.type)).map(s => s.quality_attribute));
    return tally(["reliability", "security", "performance-efficiency", "maintainability", "interaction-capability", "safety", "cost"].map(q => [covered.has(q), `no scenario covers ${q} (a deliberate omission must be stated; a reviewer judges)`]));
  },
  "CORE-QA-03": (c) => tally(list(c.spec.scenarios).filter(s => s.type === "quality").map(s => [has(s.importance) && has(s.difficulty), `quality scenario ${s.id} lacks importance or difficulty`])),
  "CORE-QA-04": (c) => c.els.some(e => ["external-system", "technology"].includes(e.kind))
    ? tally([[list(c.spec.scenarios).some(s => s.type === "failure"), "no failure scenario, though the design depends on an external system or technology"]])
    : na("no external system or technology"),
  "CORE-DEC-01": (c) => tally(list(c.spec.decisions).filter(d => d.status === "accepted").map(d => [has(d.chosen) && list(d.alternatives).length > 0 && has(d.rationale), `decision ${d.id} lacks chosen, an alternative or rationale`])),
  "CORE-DEC-03": (c) => ["accepted", "active"].includes(c.status)
    ? tally(list(c.spec.considerations).map(q => [q.status !== "open", `consideration ${q.id} is open`]), "no considerations")
    : na("design.status is not accepted or active"),
  "CORE-DEC-04": (c) => tally(list(c.spec.decisions).filter(d => d.status === "accepted").map(d => [has(d.reversibility), `decision ${d.id} has no reversibility`])),
  "CORE-INT-01": (c) => tally(list(c.spec.connectors).filter(k => {
    const a = c.byId.get(k.from), b = c.byId.get(k.to);
    const outside = e => !e || ["actor", "external-system", "technology"].includes(e.kind);
    return outside(a) || outside(b) || (a.part_of || null) !== (b.part_of || null);
  }).map(k => [has(k.contract), `connector ${k.id} crosses a boundary with no contract`])),
  "CORE-INT-02": (c) => {
    const cross = list(c.spec.connectors).filter(k => { const a = c.byId.get(k.from), b = c.byId.get(k.to); return a?.part_of && b?.part_of && a.part_of !== b.part_of; });
    return cross.length ? tally(cross.map(k => [has(k.context_relationship), `connector ${k.id} crosses contexts with no context_relationship`])) : na("no connector crosses between bounded contexts");
  },
  "CORE-DAT-02": (c) => tally(list(c.spec.data).filter(d => d.personal === true || ["confidential", "restricted"].includes(d.classification))
    .map(d => [has(d.residency) && has(d.retention) && has(d.lineage), `data set ${d.id} lacks residency, retention or lineage`])),
  "CORE-SEC-01": (c) => tally([[list(c.spec.trust_zones).length > 0, "no trust zones"], ...c.els.filter(e => e.kind !== "actor").map(e => [has(e.trust_zone), `${e.id} has no trust_zone`])]),
  "CORE-SEC-02": (c) => tally(list(c.spec.connectors).filter(k => crossesZones(c, k)).map(k => [has(k.authentication) && k.authentication !== "none" && has(k.authorisation) && k.authorisation !== "none", `connector ${k.id} crosses trust zones without authentication and authorisation`]), "no connector crosses trust zones"),
  "CORE-SEC-03": (c) => tally(list(c.spec.connectors).filter(k => outerEnd(c, k.from) || outerEnd(c, k.to)).map(k => [typeof k.carries_untrusted_content === "boolean", `connector ${k.id} does not state carries_untrusted_content`])),
  "CORE-SEC-04": (c) => tally([
    [c.evOf("threat-model").length > 0, "no threat-model evidence"],
    ...(["accepted", "active"].includes(c.status) ? [[c.evOf("security-assessment").length > 0, "no security-assessment evidence (or record a hand-over to cybersecurity)"]] : []),
  ]),
  "CORE-OPS-01": (c) => solutionLike(c) ? tally([[list(c.spec.operations?.slos).length > 0, "operations.slos is empty"]]) : na("not a reference architecture or solution design"),
  "CORE-OPS-02": (c) => {
    if (!solutionLike(c)) return na("not a reference architecture or solution design");
    const o = c.spec.operations?.observability || {};
    return tally([[o.logs === true, "logs is not true"], [o.metrics === true, "metrics is not true"], [o.traces === true, "traces is not true"],
      [has(o.conventions), "conventions is not set (whether it names real conventions is judged by a reviewer)"]]);
  },
  "CORE-OPS-03": (c) => {
    if (c.type !== "solution-design") return na("not a solution design");
    const o = c.spec.operations || {};
    return tally([[has(o.deployment?.strategy), "deployment.strategy"], [has(o.deployment?.rollback), "deployment.rollback"], [has(o.recovery?.rto), "recovery.rto"], [has(o.recovery?.rpo), "recovery.rpo"], [has(o.recovery?.degraded_mode), "recovery.degraded_mode"]].map(([ok, f]) => [ok, `${f} is not set`]));
  },
  "CORE-OPS-04": (c) => c.status === "active" ? tally([[has(c.spec.operations?.runbook) || c.evOf("runbook").length > 0, "no runbook"]]) : na("design.status is not active"),
  "CORE-CST-01": (c) => solutionLike(c) ? tally([[c.evOf("cost-model").length > 0, "no cost-model evidence"], [has(c.spec.operations?.cost?.unit_cost), "operations.cost.unit_cost is not set"], [has(c.spec.operations?.cost?.budget), "operations.cost.budget is not set"]]) : na("not a reference architecture or solution design"),
  "CORE-EVO-01": (c) => {
    const ff = list(c.spec.fitness_functions);
    const named = new Set(ff.flatMap(f => list(f.scenarios)));
    return tally([[ff.length > 0, "no fitness functions"], ...list(c.spec.scenarios).filter(s => ["quality", "failure", "misuse"].includes(s.type) && s.importance === "high").map(s => [named.has(s.id), `high-importance scenario ${s.id} has no fitness function`])]);
  },
  "CORE-RSK-01": (c) => tally(list(c.spec.risks).map(r => [has(r.mitigation) && has(r.owner) && has(r.residual), `risk ${r.id} lacks mitigation, owner or residual`]), "no risks recorded"),

  "AIS-FIT-02": (c) => tally(c.ai.map(e => [has(e.ai.role) && list(e.responsibilities).length > 0, `${e.id} lacks an ai role or a responsibility`])),
  "AIS-MOD-01": (c) => tally(c.ai.map(e => {
    const m = e.ai.model || {};
    const accepted = m.hosting === "managed-platform" && list(c.spec.decisions).some(d => d.status === "accepted" && list(d.affects).includes(e.id));
    return [(m.version_pinned === true && has(m.version)) || accepted, `${e.id}: model not pinned, and no accepted decision affecting it (a reviewer checks that decision accepts the platform-managed model)`];
  })),
  "AIS-MOD-02": (c) => tally(c.ai.map(e => [has(e.ai.model?.card), `${e.id} has no model card`])),
  "AIS-MOD-03": (c) => tally(c.ai.filter(e => e.ai.role === "generative").map(e => [has(e.ai.fallback), `${e.id} has no fallback`])),
  "AIS-EVAL-01": (c) => tally(c.ai.map(e => [list(e.ai.evals).length > 0, `${e.id} has no eval`])),
  "AIS-EVAL-02": (c) => tally(c.ai.map(e => [list(e.ai.evals).some(v => v.kind === "offline" && v.gating === true), `${e.id} has no gating offline eval`])),
  "AIS-EVAL-04": (c) => tally(c.evals.filter(v => v.kind === "llm-judge").map(v => {
    const j = v.judge_calibration;
    return [j && typeof j.agreement === "number" && typeof j.min_agreement === "number" && j.agreement >= j.min_agreement, `eval ${v.id}: no judge_calibration reaching its min_agreement`];
  })),
  "AIS-EVAL-05": (c) => c.ai.some(e => ["mixed", "untrusted"].includes(e.ai.input_trust))
    ? tally([[c.evals.some(v => v.kind === "red-team") || c.evOf("red-team-report").length > 0, "input is mixed or untrusted, and there is no red-team eval or report"]])
    : na("no ai facet takes mixed or untrusted input"),
  "AIS-EVAL-06": (c) => tally(c.evals.filter(v => /\b(f1|f-beta|f0\.5|f2|accuracy|precision|recall)\b/i.test(String(v.metric || ""))).map(v => {
    const fp = v.errors?.false_positive, fn = v.errors?.false_negative;
    return [has(v.positive_class) && fp?.meaning && fp?.max_rate && fn?.meaning && fn?.max_rate, `eval ${v.id} lacks a positive class, or a false positive or negative with meaning and max_rate`];
  })),
  "AIS-EVAL-08": (c) => tally(c.ai.filter(e => ["document-level", "caller-permission-trimmed"].includes(e.ai.grounding?.access_control)).map(e => [list(e.ai.evals).some(v => v.zero_tolerance === true && v.gating === true), `${e.id} has no gating zero-tolerance eval for permission leakage`])),
  "AIS-EVAL-10": (c) => tally(c.evals.filter(v => v.gating === true).map(v => [Number(v.repeats) >= 3 && has(v.dataset_version), `gating eval ${v.id} lacks repeats of at least 3 or a dataset_version`])),
  "AIS-DATA-01": (c) => {
    const data = new Map(list(c.spec.data).map(d => [d.id, d]));
    return tally(c.ai.flatMap(e => list(e.ai.grounding?.sources).map(s => [data.get(s)?.used_for_ai === "grounding", `${e.id}: grounding source ${s} is not a data set used for grounding`])));
  },
  "AIS-DATA-02": (c) => {
    const data = new Map(list(c.spec.data).map(d => [d.id, d]));
    return tally(c.ai.filter(e => list(e.ai.grounding?.sources).some(s => { const d = data.get(s); return d && (d.personal === true || ["confidential", "restricted"].includes(d.classification)); }))
      .map(e => [["document-level", "caller-permission-trimmed"].includes(e.ai.grounding?.access_control), `${e.id} grounds on sensitive data without document-level or caller-permission-trimmed access control`]));
  },
  "AIS-DATA-03": (c) => tally(c.ai.flatMap(e => [[has(e.ai.drift_monitoring), `${e.id} has no drift_monitoring`], ...(e.ai.grounding ? [[has(e.ai.grounding.freshness), `${e.id} grounding has no freshness`]] : [])])),
  "AIS-IO-01": (c) => tally(c.ai.flatMap(e => [
    [has(e.ai.input_trust), `${e.id} has no input_trust`],
    ...list(c.spec.connectors).filter(k => (k.to === e.id || k.from === e.id) && k.carries_untrusted_content === true).map(k => [e.ai.input_trust !== "trusted", `${e.id} receives untrusted content on ${k.id} but declares input_trust trusted`]),
  ])),
  "AIS-IO-02": (c) => tally(c.ai.filter(e => e.ai.output_handling && !/^displayed text/i.test(String(e.ai.output_handling.rendered_as || ""))).map(e => [e.ai.output_handling.validated === true, `${e.id}: output is not only displayed text and is not validated`])),
  "AIS-OPS-01": (c) => tally(c.ai.map(e => {
    const l = e.ai.limits || {};
    const platform = e.ai.model?.hosting === "managed-platform" && has(l.budget) && list(c.spec.decisions).some(d => d.status === "accepted" && list(d.affects).includes(e.id));
    return [(has(l.budget) && has(l.timeout)) || platform, `${e.id} lacks limits.budget and timeout (or, on a managed platform, a budget and a decision accepting the platform's limits)`];
  })),
  "AIS-HUM-01": (c) => tally(c.ai.map(e => [has(e.ai.human_oversight), `${e.id} has no human_oversight`])),
  "AIS-HUM-03": (c) => {
    const obl = list(c.spec.drivers?.obligations).filter(o => /\bAI\b|AI Act|42001|artificial intelligence/i.test(`${o.source} ${o.statement || ""}`));
    return tally([[obl.length > 0, "no obligation names an AI instrument"], ...obl.map(o => [has(o.role), `obligation ${o.id} does not record the organisation's role`]),
      [c.evOf("ai-impact-assessment").length > 0 || obl.some(o => /no .*impact assessment|not required/i.test(o.statement || "")), "no ai-impact-assessment evidence, and no obligation says why none is needed"]]);
  },

  "AGT-JUS-02": (c) => tally(c.agents.flatMap(e => [[has(e.agent.autonomy_level), `${e.id} has no autonomy_level`],
    ...(["approver", "observer"].includes(e.agent.autonomy_level) ? list(e.agent.tools).map(t => [!(t.reversible === false && t.approval === "autonomous"), `${e.id}: tool ${t.name} is irreversible and autonomous`]) : [])])),
  "AGT-ACT-01": (c) => tally(c.agents.flatMap(e => [[list(e.agent.tools).length > 0, `${e.id} has no tools`], ...list(e.agent.tools).map(t => [has(t.effect) && typeof t.reversible === "boolean" && has(t.tier) && has(t.approval), `${e.id}: tool ${t.name} lacks effect, reversible, tier or approval`])])),
  "AGT-ACT-02": (c) => tally(c.agents.flatMap(e => list(e.agent.tools).filter(t => t.reversible === false || ["financial", "destructive", "external-communication"].includes(t.effect))
    .map(t => [["human-approved", "forbidden"].includes(t.approval) || ["T0", "T1"].includes(t.tier), `${e.id}: tool ${t.name} is consequential with no approval or T0/T1 tier`]))),
  "AGT-ACT-03": (c) => tally(c.agents.flatMap(e => list(e.agent.guardrails).filter(g => ["T0", "T1"].includes(g.tier)).map(g => [g.enforced === "outside-agent", `${e.id}: guardrail ${g.id} is T0/T1 but enforced inside the agent`]))),
  "AGT-INJ-02": (c) => tally(c.agents.filter(e => ["mixed", "untrusted"].includes(e.ai?.input_trust)).map(e => {
    const d = list(e.agent.injection_defence).filter(x => x !== "none");
    return [d.length > 0 && !(d.length === 1 && d[0] === "classifier"), `${e.id} has no injection defence beyond a classifier`];
  })),
  "AGT-ID-01": (c) => tally(c.agents.flatMap(e => { const i = e.agent.identity || {}; return [[has(i.scheme) && i.scheme !== "none", `${e.id}: identity scheme is none or missing`], [i.acts_as !== "shared-service-account", `${e.id} acts as a shared service account`], [has(i.workload_identity), `${e.id} has no workload_identity`]]; })),
  "AGT-ID-02": (c) => tally(c.agents.flatMap(e => list(e.agent.tools).map(t => [has(t.scope), `${e.id}: tool ${t.name} has no scope`]))),
  "AGT-MEM-02": (c) => tally(c.agents.filter(e => e.agent.memory?.long_term_store).map(e => [e.agent.memory.isolation && e.agent.memory.isolation !== "shared" && has(e.agent.memory.retention), `${e.id}: long-term memory needs isolation other than shared, and retention`])),
  "AGT-MAS-01": (c) => tally([...c.agents.flatMap(e => list(e.agent.peers).map(p => [p.authenticated === true && has(p.trust), `${e.id}: peer ${p.agent} is not authenticated or has no trust`])),
    ...list(c.spec.connectors).filter(k => k.style === "agent-to-agent").map(k => [has(k.authentication) && k.authentication !== "none", `connector ${k.id} is agent-to-agent with no authentication`])]),
  "AGT-MAS-03": (c) => tally(list(c.spec.connectors).filter(k => ["tool-call", "agent-to-agent"].includes(k.style)).map(k => [/\d/.test(String(k.protocol || "")), `connector ${k.id} names no protocol version`])),
  "AGT-CTL-01": (c) => tally(c.agents.flatMap(e => { const l = e.agent.limits || {}; return [[has(l.max_steps), `${e.id} has no max_steps`], [has(l.max_cost), `${e.id} has no max_cost`], [has(l.timeout), `${e.id} has no timeout`], [l.kill_switch === true, `${e.id} has no kill switch`]]; })),
  "AGT-CTL-02": (c) => tally([...c.agents.map(e => [e.agent.trajectory_logging === true, `${e.id} has no trajectory logging`]), ...(c.agents.length ? [[c.spec.operations?.observability?.audit_trail === true, "operations.observability.audit_trail is not true"]] : [])]),
  "AGT-EVAL-01": (c) => tally(c.agents.map(e => [list(e.ai?.evals).some(v => v.kind === "trajectory"), `${e.id} has no trajectory eval`])),

  "PRD-BLD-01": (c) => tally([[c.type === "solution-design", "design.type is not solution-design"], [c.status === "accepted", "design.status is not accepted"],
    [!list(c.spec.considerations).some(q => q.status === "open"), "a consideration is open"], [c.evOf("prior-assessment", true).length > 0, "no prior-assessment evidence for this design version"]]),
  "PRD-BLD-02": (c) => tally([[c.evOf("as-built-record", true).length > 0, "no as-built-record for this design version"]]),
  "PRD-BLD-03": (c) => tally(list(c.spec.fitness_functions).filter(f => f.automated === true).map(f => [f.runs && f.runs !== "manual", `fitness function ${f.id} is automated but runs manually`])),
  "PRD-EVD-01": (c) => tally(c.evidence.map(x => [x.design_version === c.ver, `evidence ${x.id} is for design version ${x.design_version}, not ${c.ver}`]), "no evidence"),
  "PRD-HND-01": (c) => tally([
    [c.evOf("security-assessment", true).length > 0, "no security-assessment for this version"],
    ...(list(c.spec.data).some(d => d.personal === true) ? [[c.evOf("privacy-impact-assessment", true).length > 0, "personal data, and no privacy-impact-assessment for this version"]] : []),
  ]),
  "PRD-OPS-01": (c) => { const s = c.spec.operations?.support || {}; return tally([[has(s.team), "support.team"], [has(s.hours), "support.hours"], [has(s.escalation), "support.escalation"]].map(([ok, f]) => [ok, `${f} is not set`])); },
  "PRD-OPS-02": (c) => { const o = c.spec.operations?.observability || {}; return tally([...list(c.spec.operations?.slos).map(s => [s.alerting === true, `SLO ${s.name} does not alert`]), [o.logs && o.metrics && o.traces && o.audit_trail, "observability lacks logs, metrics, traces or audit_trail"]]); },
  "PRD-OPS-03": (c) => tally([[has(c.spec.operations?.runbook), "operations.runbook is not set"], [c.evOf("operational-readiness", true).some(x => ["passed", "passed-with-conditions"].includes(x.outcome)), "no passed operational-readiness for this version"]]),
  "PRD-REL-01": (c) => tally([[has(c.spec.operations?.deployment?.rollback), "deployment.rollback is not set"], [c.evOf("rollback-test", true).some(x => x.outcome === "passed"), "no passed rollback-test for this version"],
    ...(has(c.spec.operations?.transition?.data_migration) ? [[has(c.spec.operations.transition.point_of_no_return), "data migration with no point_of_no_return"]] : [])]),
  "PRD-REL-02": (c) => tally([[has(c.spec.operations?.recovery?.rto) && has(c.spec.operations?.recovery?.rpo), "recovery rto or rpo is not set"], [c.evOf("recovery-test", true).some(x => x.outcome === "passed"), "no passed recovery-test for this version"]]),
  "PRD-RSK-01": (c) => tally(list(c.spec.risks).map(r => [has(r.owner) && has(r.mitigation) && has(r.residual), `risk ${r.id} lacks owner, mitigation or residual`]), "no risks recorded"),
  "PRD-AI-01": (c) => !c.ai.length ? na("no ai facet") : tally(c.evals.filter(v => v.gating === true).map(v => [c.evidence.some(x => x.type === "eval-report" && x.design_version === c.ver && x.outcome === "passed" && list(x.covers).includes(v.id)), `gating eval ${v.id} has no passed eval-report for this version`])),
  "PRD-AI-02": (c) => !c.ai.length ? na("no ai facet") : tally(c.ai.map(e => [has(e.ai.drift_monitoring) && list(e.ai.evals).some(v => v.kind === "online"), `${e.id} lacks drift_monitoring or an online eval`])),
  "PRD-AI-03": (c) => !c.agents.length ? na("no agent facet") : tally(c.agents.map(e => [c.evidence.some(x => x.type === "control-test" && x.design_version === c.ver && x.outcome === "passed" && list(x.covers).includes(e.id)), `${e.id} has no passed control-test for this version`])),
};

// The remaining criteria, added once the first set was proven against the worked examples.
const reachesActor = (c, id) => {
  const seen = new Set([id]);
  const queue = [id];
  while (queue.length) {
    const cur = queue.shift();
    for (const k of list(c.spec.connectors)) {
      const next = k.from === cur ? k.to : k.to === cur ? k.from : null;
      if (!next || seen.has(next)) continue;
      if (c.byId.get(next)?.kind === "actor") return true;
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
};
const sensitiveData = (c, ids) => list(c.spec.data).filter(d => ids.includes(d.id)).some(d => d.personal === true || ["confidential", "restricted"].includes(d.classification));

Object.assign(CHECKS, {
  "CORE-TRC-02": (c) => {
    const a = abstraction(c);
    if (a === "unknown") return na("no in-scope elements");
    if (c.type === "architecture-pattern") return tally([[["conceptual", "logical"].includes(a), `an architecture pattern derives as ${a}; it must be conceptual or logical`]]);
    if (solutionLike(c)) return tally([[a === "physical", `a ${c.type} derives as ${a}; it must be physical`]]);
    return na("design.type has no abstraction rule");
  },
  "CORE-TGT-01": (c) => {
    if (!c.triage) return { result: "not-assessed", notes: ["needs the triage record's target-state positions: pass --triage"] };
    const blocks = c.els.filter(e => ["sbb", "technology", "deployment-node"].includes(e.kind));
    const unattested = blocks.filter(e => !c.positions.has(e.id)).map(e => e.id);
    const decs = list(c.spec.decisions);
    const clauses = blocks.filter(e => c.positions.has(e.id)).map(e => {
      const p = c.positions.get(e.id);
      if (p.position === "retired") return [false, `${e.id} is retired`];
      if (["baseline", "retiring", "contained", "not-target"].includes(p.position))
        return [decs.some(d => d.departure && list(d.affects).includes(e.id)), `${e.id} is ${p.position} with no decision whose departure names it`];
      return [true, ""];
    });
    const r = tally(clauses, "no attested building blocks");
    const notes = [...r.notes];
    if (unattested.length) notes.push(`no attested position for ${unattested.join(", ")}: a condition for the responsible architect`);
    const limited = [...c.positions.values()].filter(p => p.permitted_use).map(p => p.element);
    if (limited.length) notes.push(`a reviewer judges the use of ${limited.join(", ")} against its permitted use`);
    return { result: unattested.length && r.result === "met" ? "partly-met" : r.result, notes };
  },
  "CORE-STR-03": (c) => {
    if (!solutionLike(c)) return na("not a reference architecture or solution design");
    if (abstraction(c) !== "physical") return na("the design does not derive as physical");
    const find = v => c.byId.get(v) || c.els.find(e => e.ref === v);
    return tally([
      ...c.els.filter(e => e.kind === "service").map(e => [list(e.realises).map(find).filter(Boolean).some(x => ["sbb", "technology"].includes(x.kind)), `service ${e.id} realises no sbb or technology`]),
      ...c.els.flatMap(e => list(e.realises).map(v => [Boolean(find(v)), `${e.id} realises ${v}, which is not an element of the design`])),
    ]);
  },
  "CORE-DAT-01": (c) => tally([[list(c.spec.data).length > 0, "no data sets"], ...list(c.spec.data).map(d => [has(d.owner) && has(d.classification), `data set ${d.id} lacks owner or classification`])]),
  "AIS-EVAL-07": (c) => tally(c.ai.filter(e => e.ai.role === "generative" && e.ai.grounding).map(e => [
    list(e.ai.evals).some(v => /answer/i.test(String(v.positive_class || "")) && has(v.errors?.false_positive?.meaning)),
    `${e.id} has no eval whose positive class is answering, with a false positive for unsupported answers`])),
  "AIS-OPS-02": (c) => {
    if (!c.ai.length) return na("no ai facet");
    const o = c.spec.operations?.observability || {};
    const conv = String(o.conventions || "");
    const genai = /gen.?ai/i.test(conv) && /\d/.test(conv);
    const managed = c.ai.every(e => e.ai.model?.hosting === "managed-platform") && has(o.conventions)
      && list(c.spec.decisions).some(d => d.status === "accepted" && c.ai.some(e => list(d.affects).includes(e.id)));
    return tally([[o.traces === true, "traces is not true"], [genai || managed, "conventions does not name the GenAI conventions and version (or, on a managed platform, the platform's telemetry with a decision recording the gap)"]]);
  },
  "AIS-HUM-02": (c) => tally(c.ai.filter(e => e.ai.role === "generative" && reachesActor(c, e.id)).map(e => [has(e.ai.disclosure), `${e.id}'s output reaches people with no disclosure`])),
  "AGT-ACT-04": (c) => {
    const coders = c.agents.filter(e => list(e.agent.tools).some(t => t.effect === "code-execution"));
    if (!coders.length) return na("no tool executes code");
    return tally(coders.map(e => {
      const z = c.zones.get(e.trust_zone);
      return [/isolat|sandbox/i.test(`${e.trust_zone} ${z?.name || ""}`), `${e.id} executes code outside a trust zone named for isolation (a reviewer confirms the sandbox)`];
    }));
  },
  "AGT-INJ-01": (c) => tally(c.agents.map(e => {
    const tools = list(e.agent.tools);
    const untrusted = ["mixed", "untrusted"].includes(e.ai?.input_trust) || tools.some(t => t.reads_untrusted === true);
    const sensitive = sensitiveData(c, list(e.ai?.grounding?.sources))
      || tools.some(t => t.via && list(c.spec.connectors).some(k => k.id === t.via && sensitiveData(c, list(k.data))));
    const consequential = tools.some(t => ["write", "external-communication", "financial", "destructive", "code-execution"].includes(t.effect) && t.approval === "autonomous");
    return [!(untrusted && sensitive && consequential), `${e.id} holds the lethal trifecta: untrusted input, sensitive data and an autonomous consequential tool`];
  })),
  "AGT-MEM-01": (c) => tally(c.agents.filter(e => e.agent.memory?.long_term_store).flatMap(e => {
    const m = e.agent.memory;
    const addressed = list(e.agent.guardrails).some(g => /memory|poison/i.test(String(g.invariant || "")))
      || list(c.spec.decisions).some(d => list(d.affects).includes(e.id) && /memory|poison/i.test(`${d.title} ${d.rationale || ""}`));
    return [[typeof m.written_from_untrusted === "boolean", `${e.id}: long-term memory does not state written_from_untrusted`],
      ...(m.written_from_untrusted === true ? [[addressed, `${e.id}: memory is written from untrusted content and no guardrail or decision addresses poisoning`]] : [])];
  })),
  "AGT-MAS-02": (c) => c.agents.some(e => list(e.agent.peers).length)
    ? tally([[list(c.spec.scenarios).some(s => ["failure", "misuse"].includes(s.type) && /peer|agent/i.test(`${s.name} ${s.stimulus || ""}`)), "no failure or misuse scenario exercises a peer agent failing or being compromised"]])
    : na("no agent has peers"),
  "AGT-EVAL-02": (c) => !c.agents.length ? na("no agent facet")
    : tally([[c.evals.some(v => /pass\^?k|repeated|trials/i.test(String(v.metric || ""))), "no eval measures repeated trials (pass^k)"], [c.evals.some(v => v.kind === "red-team"), "no red-team eval"]]),
  "PRD-EVD-02": (c) => {
    const fn = list(c.spec.scenarios).filter(s => s.type === "functional").map(s => s.id);
    const ok = c.evidence.filter(x => x.type === "acceptance-test" && ["passed", "passed-with-conditions"].includes(x.outcome));
    return tally(fn.map(id => [ok.some(x => list(x.covers).includes(id)), `functional scenario ${id} is covered by no passed acceptance test`]), "no functional scenarios");
  },
  "PRV-SEC-02": (c) => {
    const personal = new Set(list(c.spec.data).filter(d => d.personal === true).map(d => d.id));
    const named = v => has(v) && !/^none$/i.test(String(v).trim());
    return tally(list(c.spec.connectors).filter(k => list(k.data).some(d => personal.has(d))).flatMap(k => [
      [named(k.authentication), `connector ${k.id} carries personal data with no authentication`],
      [named(k.authorisation), `connector ${k.id} carries personal data with no authorisation`],
    ]), "no connector carries personal data");
  },
  "PRD-REL-03": (c) => {
    const need = list(c.spec.scenarios).filter(s => s.type === "quality" && s.importance === "high" && ["performance-efficiency", "reliability"].includes(s.quality_attribute)).map(s => s.id);
    const tests = c.evOf("load-test", true);
    return tally(need.map(id => [tests.some(x => list(x.covers).includes(id)), `high-importance scenario ${id} is covered by no load test for this version`]), "no high-importance performance or reliability scenario");
  },
});

/** Which lenses apply: core always; ai-solution and ai-agent by facet; production by trigger. */
/** The profiles a design has: those it declares, those its facets imply (ai, agent), and personal-data when a data set is personal. */
export function profilesOf(spec) {
  const els = list(spec.elements);
  const out = new Set(list(spec.profiles));
  if (els.some(e => e.ai)) out.add("ai-solution");
  if (els.some(e => e.agent)) out.add("ai-agent");
  if (list(spec.data).some(d => d.personal === true)) out.add("personal-data");
  return out;
}

const SHIPPED_ORDER = ["core", "ai-solution", "ai-agent", "privacy", "production"];
const group = l => l.lens.applies_when === "always" ? 0 : l.lens.applies_when.profile ? 1 : 2;

/**
 * Which lenses apply: those that apply always, those a profile of the design brings in, and those
 * the assessment's trigger brings in. Lenses that apply always come first, then profile lenses,
 * then trigger lenses; the shipped ones keep their order within each, ahead of an organisation's.
 */
export function lensesFor(spec, trigger, lenses) {
  const profiles = profilesOf(spec);
  const applies = l => {
    const w = l.lens.applies_when;
    return w === "always" || (w.profile && profiles.has(w.profile)) || (w.trigger && w.trigger === trigger);
  };
  const rank = l => { const i = SHIPPED_ORDER.indexOf(l.lens.id); return i < 0 ? 99 : i; };
  return lenses.map((l, i) => [l, i]).filter(([l]) => applies(l))
    .sort(([x, i], [y, j]) => group(x) - group(y) || rank(x) - rank(y) || i - j).map(([l]) => l);
}

/**
 * Apply the lenses' tool and both criteria: a criterion's declarative `check` when it has one, else
 * the coded check for its id, else `manual`.
 */
export function check(spec, lenses, { triage } = {}) {
  const c = context(spec, triage);
  const results = [];
  for (const l of lenses) {
    for (const crit of l.criteria) {
      if (crit.decided_by === "reviewer") continue;
      // A coded check answers only the shipped criterion of that id, never an organisation's namesake.
      const fn = l.builtin === false ? undefined : CHECKS[crit.id];
      const r = crit.check ? evaluateCheck(spec, crit.check)
        : fn ? fn(c) : { result: "manual", notes: ["not automated: apply the rule by hand, or give the criterion a check"] };
      results.push({ criterion: crit.id, lens: l.lens.id, decided_by: crit.decided_by, severity: crit.severity, ...(crit.default_severity ? { default_severity: crit.default_severity } : {}), ...r });
    }
  }
  return results;
}

/**
 * Dotted field paths that differ between two specifications. A list of things with ids
 * (elements, connectors, evals) is compared item by item, and its ids are left out of the path,
 * so a changed eval of any element reads as elements.ai.evals, the form a criterion's reads use.
 */
export function changedPaths(a, b) {
  const out = new Set();
  const keyed = v => Array.isArray(v) && v.length > 0 && v.every(i => i && typeof i === "object" && "id" in i);
  const diff = (x, y, p) => {
    if (JSON.stringify(x) === JSON.stringify(y)) return;
    if (keyed(x) || keyed(y)) {
      const mx = new Map(list(x).map(i => [i.id, i])), my = new Map(list(y).map(i => [i.id, i]));
      for (const id of new Set([...mx.keys(), ...my.keys()])) {
        const ix = mx.get(id), iy = my.get(id);
        if (!ix || !iy) out.add(p);
        else diff(ix, iy, p);
      }
      return;
    }
    const objects = x && y && typeof x === "object" && typeof y === "object" && !Array.isArray(x) && !Array.isArray(y);
    if (!objects) { out.add(p); return; }
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) diff(x[k], y[k], p ? `${p}.${k}` : k);
  };
  diff(a, b, "");
  out.delete("");
  return [...out].sort();
}

/** The criteria a change must re-check: those whose reads overlap a changed path. */
export function criteriaToRecheck(changed, lenses) {
  const touches = (read, p) => p === read || p.startsWith(read + ".") || read.startsWith(p + ".");
  return lenses.flatMap(l => l.criteria.filter(c => list(c.reads).some(r => changed.some(p => touches(r, p))))
    .map(c => ({ criterion: c.id, lens: l.lens.id, decided_by: c.decided_by, severity: c.severity, because: list(c.reads).filter(r => changed.some(p => touches(r, p))) })));
}
