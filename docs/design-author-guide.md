# Preparing a design for assessment

A guide for the author of a design that is about to be assessed, whether as a design or as a solution going into production, under the draft [Architecture Assessment Standard](../standards/assessment/standard-architecture-assessment.md): the architect, the team, or the agent that wrote an architecture pattern, a reference architecture or a solution design. It says what the assessment will read, how to write it so that the review spends its time on judgement rather than on finding what is missing, what to clear before you ask for a review, and what to do with the findings. The standard is the rule; this guide is the practical reading of it, and where the two differ the standard wins. The reasoning behind both is in [Architecture assessment on the continuum](architecture-assessment.md).

## What the assessment is, from your side

An assessment asks one question of your design: is it fit for its purpose, and what does it trade? It does not ask whether you worked hard, whether the design is the one the assessor would have drawn, or whether the system has been built. It reads what you wrote, and only what you wrote: a quality you meet but did not state is, to the assessment, a quality you do not meet. That is the single most useful thing to know before you start.

It is not an audit and it is not adversarial. Practice has moved from boards that approve designs to reviews that help a team see its own risks; the standard follows that, and its findings go into the same considerations, decision records and debt items you already keep. Most findings end as a change you make, a decision you record or a risk someone accepts, not as a refusal.

Three things are outside it, and you should plan for them separately: whether security controls are implemented and effective, whether privacy and AI impacts are acceptable, and whether the system conforms to a regulation. The assessment names those obligations and hands them over (section 9 of the standard). Start the cybersecurity assessment early; a design is not accepted until its outcome is recorded as evidence.

## Before you start

Ask for triage first. A few questions about what you are building (what it can reach, how far it acts on its own, what data it sees, who uses it, whether anything in it is new to the landscape) fix the assessment type and the risk tier, AT1 Light to AT4 Critical, and the tier decides everything else: how deep the assessment goes, whether an independent assessor is needed, what evidence you must bring, who approves and how often it is assessed again. The [Assessment Triage Standard](../standards/assessment/standard-assessment-triage.md) has the questions and three worked examples. Answer them honestly: once your specification is complete the check derives the tier again from it, and the derived tier wins. The cheapest way to a lighter assessment is a design change that removes a driver, such as a person approving each consequential action, or keeping untrusted content out of a session that can act.


| Ask | Why it matters | Where to find it |
|---|---|---|
| What type is my design? | An architecture pattern is conceptual or logical, its boxes local roles or ABBs; a reference architecture or a solution design is physical, every box an SBB, a technology, a service, a store or a node. A design whose boxes do not fit its type is reported (`CORE-TRC-02`) | [The continuum](continuum.md) |
| Which gate is it for? | R2 to R3 assesses the logical pattern and its decisions; R3 to R4 the reference architecture with its cost model; R4 to R5 the evidence, not the design; production entry the solution as built, formally | Section 8 of the standard; [definition ladder](../standards/capabilities/standard-definition-ladder.md) |
| At what depth? | A check is a tool run; a review answers every criterion; an evaluation adds a workshop with your stakeholders. Expect an evaluation if a decision is costly to reverse, the design is high-risk, or people disagree about it | Section 3 of the standard |
| Which lenses? | `core` always. Any element that uses a model brings in `ai-solution`; any element whose model chooses its own steps and calls tools brings in `ai-agent`. Declare the profiles; a tool also derives them and reports a mismatch. A production entry assessment adds `production` | Section 2.2; the [lenses](../standards/assessment/lenses/) |

Read the lenses that apply before you write, not after. Each criterion says what it reads, so the lens is also a list of what to write.

## Write the specification

The assessment reads a design specification: the design as YAML, valid against [`design.schema.json`](../standards/assessment/schemas/design.schema.json). If your design already has a Markdown document, the specification is its data, not a second design: name the document in `design.source` and keep the two in step. [SD-001](../standards/assessment/examples/SD-001-delivery-exception-agent.design.yaml) is a complete example, with deliberate gaps, and [AS-001](../standards/assessment/examples/AS-001-delivery-exception-agent.assessment.yaml) is what a review made of it. The easiest start is the pattern skill's solution design template: write the design document from it and each table becomes a part of the specification, which the specify flow translates table by table.

Write for the assessor that is a tool or an agent as much as for a person. Every fact a criterion reads must be a field, not a sentence in a description: a trust boundary the specification does not declare cannot be checked, and an eval whose errors are not named cannot be judged against `AIS-EVAL-06`. Cite catalogue identifiers so a criterion that reads the catalogue can follow them, give every piece of evidence its `design_version`, and keep prose for the why. The `/architecture triage` and `/architecture assess` flows of the `architecture` skill read exactly these fields. `/architecture specify` drafts a specification from your design document and lists what the document does not say; the gaps it lists are your questions to answer, and it never fills them with guesses.

Cite the catalogue, never copy it. Where a thing is catalogued (a capability, a bounded context, a building block, an API, a decision record), use its identifier; where it is not, give it a kebab-case local id. Every reference must resolve (`CORE-STR-05`, a blocker).

| Section | What to write | What it answers | Common gaps |
|---|---|---|---|
| `design` | Id, type, version, status, owner, and what a reference architecture or solution design implements | `CORE-TRC-02`, `CORE-TRC-03` | A solution design that does not name its reference architecture |
| `context` | The capabilities it realises, its platform, bounded contexts, outcomes, use cases, products | `CORE-TRC-01`, `CORE-DEM-02`, `CORE-TRC-04` | Realising nothing, so the design counts toward no capability's stage |
| `drivers` | Goals and non-goals; every stakeholder with their concerns; constraints and assumptions with sources; obligations with how the instrument classes the design | `CORE-DEM-01` (blocker), `CORE-DEM-03`, `CORE-RSK-02` | No non-goals; stakeholders listed without concerns; an obligation named without its classification |
| `trust_zones` | Each zone and how far it is trusted | `CORE-SEC-01` | Zones declared but elements left unplaced |
| `data` | Every significant data set with owner and classification; residency, retention and lineage for personal or restricted data; whether it feeds a model | `CORE-DAT-01` to `03`, `AIS-DATA-*` | Two writers to one data set; lineage left to "the usual sources" |
| `elements` | Every box, typed by continuum kind, with the bounded context it lives in, what it realises, where it is deployed, its trust zone and its owning team | `CORE-STR-01` to `07` | Building blocks at component or whole-system grain; services with no owner |
| `connectors` | Every interaction: style, protocol, the versioned contract it carries, the context-map relationship across contexts, authentication and authorisation, and whether the payload can carry untrusted content | `CORE-INT-01` to `03`, `CORE-SEC-02` (blocker), `CORE-SEC-03` | A connector across a trust boundary with `authentication: none`; untrusted content not marked |
| `scenarios` | Functional scenarios tied to the use cases you serve; quality, failure and misuse scenarios with stimulus, response, a measurable response measure, importance and difficulty | `CORE-QA-01` (blocker) to `05`, `CORE-TRC-04` | "Fast" or "highly available" with no number; no failure scenario for a dependency you do not control |
| `fitness_functions` | The checks that keep the important characteristics true after build: measure, threshold, when they run, and which scenarios they protect | `CORE-EVO-01` | A high-importance scenario no fitness function protects |
| `decisions` | Each significant decision with what was chosen, the alternatives, the rationale, what it affects, how reversible it is and the debt it took on; a `departure` on any decision that departs from the target state, with an expiry and a path back when it is time-bound | `CORE-DEC-01`, `04`, `05`, `CORE-QA-05`, `CORE-TGT-01`, `02` | A decision with no alternative; a one-way door not marked as one; a non-standard technology used with no departure recorded |
| `considerations` | Every open question, with its options; none open on an accepted design | `CORE-DEC-02`, `03` | Open questions left in prose, where no tool can see them |
| `risks` | Risks you already know of, each with likelihood, impact, mitigation and owner | `CORE-RSK-01` | A risk with no owner; a mitigation that only moves the risk |
| `operations` | SLOs, observability (logs, metrics, traces, audit trail, conventions), deployment and rollback, recovery objectives and degraded mode, cost model with unit cost and budget, runbook | `CORE-OPS-01` to `04`, `CORE-CST-01` | A reference architecture with no cost model, which also blocks R4 |
| `evidence` | Each piece of evidence with its type, a reference, a date and what it covers: threat model, cost model, load test, eval report, red-team report, impact assessments, prior assessments | `CORE-SEC-04`, `CORE-RSK-03` | Evidence from an earlier version of the design; a threat model of a different boundary |

Know where your design stands against the target state before you write it. You don't decide that: the architect responsible for the target architecture attests the position of each building block you use, at triage or in the catalogue. A retired one should not appear in a new design, and one at baseline or retiring needs a decision with a departure naming what it moves to (`CORE-TGT-01`). Two positions block a design until an exception is approved through escalation to the exception authority (`CORE-TGT-05`): `not-target`, technology neither in use nor planned, and `contained`, technology in use today that the target state holds where it is, which a new design or a new use extends. Where you depart from the target on purpose, say so as a departure; where you think the target is wrong, raise a consideration to change it rather than working around it (`CORE-TGT-04`). The verdict's conformance level is judged against the target state, so an unrecorded departure costs you twice.

Write the risks you know about. A risk you record with an owner is a finding the assessor does not have to make, and it shows the design was thought about; a risk the assessor finds that you had seen and left out is worse than one nobody saw.

## If the design uses a model

Put an `ai` facet on every element that uses a model to produce its output: the model itself, a retrieval pipeline, a judge, a guard, an agent. A model is a technology or an SBB with the facet, never a kind of its own. The [`ai-solution` lens](../standards/assessment/lenses/ai-solution.yaml) then asks, among other things:

- Why a model at all, and what a deterministic alternative would cost (`AIS-FIT-01`). The simplest design that works is assessed first.
- Which model, pinned to which version, with a model card, a route to change it and a fallback (`AIS-MOD-*`).
- Evals for every model-backed element, each with a metric and a threshold, at least one gating release, covering your quality and misuse scenarios and the populations you serve, with any LLM judge calibrated against human labels (`AIS-EVAL-*`; `AIS-EVAL-01` is a blocker). For an AI solution the eval report is the main evidence; write the scenarios first and the evals from them.
- For every eval that classifies (retrieval, answer or abstain, a guard), the positive class and a separate ceiling on false positives and on false negatives, set by what each costs (`AIS-EVAL-06`). F1 weighs the two equally and accuracy hides both; a grounded assistant that answers wrongly does more harm than one that declines. Put unanswerable questions in the test set so abstention can be measured (`AIS-EVAL-07`), test permission trimming as users with different access with zero tolerance for a leak (`AIS-EVAL-08`), and size each test set so its threshold means something (`AIS-EVAL-09`).
- Grounding sources that are named, owned data sets, with retrieval trimmed to what the caller may see (`AIS-DATA-02`, a blocker), and data used for training or evaluation licensed for that use.
- Every model that receives untrusted input identified, and its output constrained and validated before it reaches a tool, a store, a query, code or a user (`AIS-IO-02`, a blocker). Do not rely on a secret system prompt for security.
- Token, rate, cost and time limits on every call, tracing to the GenAI conventions at a pinned version, a latency and quality budget per scenario with a degraded mode, the level of human oversight, how users are told, and the design's class under the AI rules that apply.

## If the design contains an agent

Add an `agent` facet, as well as the `ai` facet, to every element whose model chooses its own steps and calls tools. The [`ai-agent` lens](../standards/assessment/lenses/ai-agent.yaml) is the strictest of the three, because its failures are incidents rather than defects. Before you write the facet, list every action the agent can take in the world, with its effect and whether it can be undone; most of the lens follows from that list. Then make sure that:

- No single agent session combines untrusted input, access to sensitive data and the ability to change state or communicate externally (`AGT-INJ-01`). If it must, it does not run unattended. This is the finding that most often decides an agent design; in AS-001 it is the first blocker.
- Every irreversible, financial, destructive or outbound action needs a person's approval or sits behind a T0 or T1 limit, and those limits are enforced outside anything the agent can edit (`AGT-ACT-02`, `AGT-ACT-03`).
- The agent has its own workload identity, and it is clear whether it acts as itself or for a user (`AGT-ID-01`); it never runs as a shared service account.
- Step, cost and time limits are set, and a kill switch works without the agent's cooperation (`AGT-CTL-01`).
- Generated code runs in a sandbox with no standing credentials, and agent-to-agent traffic is authenticated (`AGT-ACT-04`, `AGT-MAS-01`).
- The autonomy level is declared and proportionate to what the agent can do (`AGT-JUS-02`), and trajectories, not only outcomes, are evaluated and logged.

The agent-native standards hold the mechanisms the lens asks for: the guardrail tiers in the [operating model](../standards/agent-native/operating-model.md), [provenance](../standards/agent-native/provenance.md), [reconciliation](../standards/agent-native/reconciliation.md) and the [agent specification](../standards/agent-native/agent-specification.md). `/architecture runtime-agent` writes an agent meant to pass the lens; use it rather than starting from nothing.

## Check your own design first

Write what your tier needs: the fields the tier's criteria read, no more (section 3.1 of the standard). At AT1 that is what the blockers and the tool check read. Run the check depth yourself before you ask for a review: `node .agents/skills/architecture/bin/assess.mjs check <your spec>` applies every automated tool rule and names what is missing. Until the tool criteria are implemented, that means validating the specification against the schema with any JSON Schema 2020-12 validator and then walking the criteria marked `decided_by: tool` by hand, using each one's `rule`, which is written to be applied without judgement. The 53 tool criteria and the presence half of the 39 marked `both` are things you can settle alone, and every one you settle is review time spent on judgement instead.

Then clear the blockers. A review with an open blocker ends `not-endorsed` whatever else is true, and a blocker cannot be accepted as a risk.

| Lens | Blockers |
|---|---|
| `core` | `CORE-DEM-01` goals, non-goals and stakeholders with concerns; `CORE-STR-05` every reference resolves; `CORE-QA-01` measurable quality scenarios; `CORE-SEC-02` every trust-boundary connector authenticated and authorised; `CORE-TGT-05` technology the target does not plan for, or a new use of contained technology, only under an exception approved through escalation |
| `ai-solution` | `AIS-EVAL-01` evals with metric and threshold; `AIS-DATA-02` retrieval trimmed to the caller; `AIS-IO-02` model output constrained and validated |
| `ai-agent` | `AGT-JUS-02` autonomy proportionate; `AGT-ACT-01` every action listed; `AGT-ACT-02` dangerous actions approved or limited; `AGT-ACT-03` limits outside the agent; `AGT-ACT-04` sandboxed code; `AGT-INJ-01` no lethal trifecta; `AGT-ID-01` its own identity; `AGT-MAS-01` authenticated agent-to-agent traffic; `AGT-CTL-01` limits and a kill switch |
| `production` | `PRD-BLD-01` accepted design with an endorsed review of this version; `PRD-BLD-02` as-built record; `PRD-EVD-01` evidence for this version; `PRD-HND-01` hand-overs returned and not failed; `PRD-OPS-01` a support team; `PRD-REL-01` rollback tested; `PRD-RSK-01` residual risk owned; `PRD-AI-01` gating evals pass; `PRD-AI-03` agent controls tested |

Finally, read the reviewer criteria and answer them for yourself, briefly, as a draft. Where you cannot answer one, raise it as a consideration in the design rather than hoping it is not asked; a known open question is a sign of a design that has been thought about, an unlisted one is a finding.

## During the review

Send the assessor the specification, its source document, and the evidence it cites, and fix the version: the assessment records the digest of the specification, and a design that changes during the review is assessed again.

Your role is to explain, not to defend. Answer what the design does and why, point to where the specification says it, and say so plainly when it does not. At least one assessor must be independent of the design, and even if you take part as an assessor you cannot be that one. If you think a finding is wrong, say so with evidence before the verdict; the lead assessor decides, and the finding's statement can record why.

At evaluation depth you also bring the stakeholders. The utility tree is built from your quality scenarios with them in the room, and the high-importance, high-difficulty scenarios are walked through the design; prepare those scenarios as carefully as anything else in the specification. Lighter team-run methods (risk-storming over your diagrams, a LASR session, a decision-centric review) are acceptable ways of doing a review, provided their results are recorded as findings against criteria.

## After the review

Every finding that is not met carries a severity and a disposition. Each disposition asks something different of you.

| Disposition | What you do |
|---|---|
| `fix-design` | Change the design and issue a new version. The fix is assessed in the next check, and a review of the change if it is material |
| `raise-consideration` | Add the open question as a consideration, with its options. At R2 this is how a missed question joins the list |
| `record-decision` | Make the implicit choice explicit as a decision record, with its alternatives and rationale |
| `accept-as-debt` | Record a technical debt item against the decision that took it on, with an owner and an expectation of repayment |
| `accept-risk` | The risk's owner, not you unless you own it, accepts it in the design's `risks`. Not available for a blocker |
| `hand-over` | Another assessment takes the question; its outcome comes back as evidence |

The outcome summarises the dispositions, by rules applied in order: `deferred` if the assessment cannot be carried out at all (the specification does not validate, or it derives a higher tier than the triage); `not-endorsed` while any blocker is open, or any major is a design fix with no due date; `endorsed-with-conditions` while any major remains open, each either disposed of other than by fixing the design or carrying a due date; `endorsed` when no blocker or major is open. Missing evidence is not a deferral: it is a finding against the criterion that asks for it, and at a design review evidence that only a built solution can produce is judged by its plan. A conformance level is recorded beside it, saying how far the design follows the continuum's standards; a design can conform and still not be endorsed, because conformance and fitness are different questions.

An endorsed assessment is evidence that a stage on the definition ladder can cite, and it holds only while the design matches the digest it assessed. Change the design and the stage that relied on it is lost until the change is checked and, if material, reviewed. Keep each assessment record beside the design; together they are its history.

## When the solution is going into production

Before a solution first goes into production, and before a change goes live that alters a one-way-door decision, a trust boundary, an agent's actions or the data a model sees, it has a production entry assessment (section 8.1 of the standard). It is formal: the lead assessor is always independent, the service owner approves or declines in the record, and a check alone is never enough. It does not review your design again. It needs an endorsed review of the version you are releasing, with its conditions closed, and asks whether what was built is that design and whether it can be run.

Prepare it as evidence, not as prose. Every piece of evidence must name the version of the design it was produced against (`design_version`); anything from an earlier version does not count. The [`production` lens](../standards/assessment/lenses/production.yaml) reads:

| Evidence or field | What it shows | Criteria |
|---|---|---|
| `as-built-record` | What was built, against this version, with every departure. A departure is a new version of the design, assessed, or a decision record; it is never a condition | `PRD-BLD-02` |
| `acceptance-test`, `load-test` | The functional scenarios work end to end; the high-importance performance and reliability scenarios hold at the stated peak | `PRD-EVD-02`, `PRD-REL-03` |
| `rollback-test`, `recovery-test` | Rollback and recovery have been done, not only written down, against your RTO and RPO | `PRD-REL-01`, `PRD-REL-02` |
| `operational-readiness`, `operations.runbook` | An operational or production readiness review of this version passed, and the runbook exists | `PRD-OPS-03` |
| `operations.support`, `slos.alerting` | A named team with hours, on-call cover and escalation; every SLO alerts that team | `PRD-OPS-01`, `PRD-OPS-02` |
| `operations.transition` | Cutover, data migration and its point of no return, and the retirement of what the solution replaces | `PRD-REL-01`, `PRD-REL-04` |
| `security-assessment`, `privacy-impact-assessment`, `ai-impact-assessment`, `conformity-assessment` | The assessments the design handed over have returned for this version, each with its `outcome`. A failed outcome is a blocker | `PRD-HND-01`, `PRD-HND-02` |
| `eval-report`, `control-test` | Gating evals pass on the release candidate; an agent's limits, approval gates and kill switch work without its cooperation | `PRD-AI-01`, `PRD-AI-03` |
| `risks`, debt items | Everything carried into production is owned by someone entitled to accept it, with a date | `PRD-RSK-01` |

Start the hand-over assessments early. They are not lenses and the production entry assessment does not do their work: a cybersecurity assessment reads the running system and its controls, and its outcome, with the residual risk it reports, has to be in the evidence before the production entry assessment can be endorsed. The verdict adds `as_built`, the same conformance scale applied to what you built against your design; only full conformance, or conformance with every extra feature recorded as a decision, can be endorsed. Conditions are allowed only with an owner and a due date, never on a blocker, and the record schedules the first periodic assessment.

## A short list to finish with

- The specification validates, every reference resolves, and the source document says the same thing.
- Goals, non-goals and stakeholders with their concerns are stated.
- Every quality you care about has a scenario with a number, and the important ones have a fitness function.
- Every dependency you do not control has a failure scenario.
- Every connector across a trust boundary is authenticated and authorised, and untrusted content is marked.
- Every significant decision has its alternatives and reversibility; every open question is a consideration.
- Nothing retired is used, every baseline artefact has a decision naming what it moves to, and every departure from the target state is recorded, with an expiry and a path back when it is time-bound.
- Risks you know of have owners; obligations you are under are named with how they class the design.
- A reference architecture or solution design has SLOs, observability, recovery and a cost model.
- The threat model is for this version, and the cybersecurity assessment has been asked for.
- For a model: evals with thresholds gate release, retrieval is trimmed to the caller, output is validated.
- For an agent: every action is listed, dangerous ones are approved or limited outside the agent, no session holds the trifecta, it has its own identity, and a kill switch works without it.
- Going into production: an endorsed review of this version, an as-built record, rollback and recovery tested, a support team with alerting, every hand-over returned with an outcome, and every residual risk owned, all as evidence for the version being released.
