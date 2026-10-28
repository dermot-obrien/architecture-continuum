# Preparing a design for assessment

A guide for the author of a design that is about to be assessed under the draft [Architecture Assessment Standard](../standards/assessment/standard-architecture-assessment.md): the architect, the team, or the agent that wrote an architecture pattern, a reference architecture or a solution design. It says what the assessment will read, how to write it so that the review spends its time on judgement rather than on finding what is missing, what to clear before you ask for a review, and what to do with the findings. The standard is the rule; this guide is the practical reading of it, and where the two differ the standard wins. The reasoning behind both is in [Architecture assessment on the continuum](architecture-assessment.md).

## What the assessment is, from your side

An assessment asks one question of your design: is it fit for its purpose, and what does it trade? It does not ask whether you worked hard, whether the design is the one the assessor would have drawn, or whether the system has been built. It reads what you wrote, and only what you wrote: a quality you meet but did not state is, to the assessment, a quality you do not meet. That is the single most useful thing to know before you start.

It is not an audit and it is not adversarial. Practice has moved from boards that approve designs to reviews that help a team see its own risks; the standard follows that, and its findings go into the same considerations, decision records and debt items you already keep. Most findings end as a change you make, a decision you record or a risk someone accepts, not as a refusal.

Three things are outside it, and you should plan for them separately: whether security controls are implemented and effective, whether privacy and AI impacts are acceptable, and whether the system conforms to a regulation. The assessment names those obligations and hands them over (section 9 of the standard). Start the cybersecurity assessment early; a design is not accepted until its outcome is recorded as evidence.

## Before you start

| Ask | Why it matters | Where to find it |
|---|---|---|
| What type is my design? | An architecture pattern is conceptual or logical, its boxes local roles or ABBs; a reference architecture or a solution design is physical, every box an SBB, a technology, a service, a store or a node. A design whose boxes do not fit its type is reported (`CORE-TRC-02`) | [The continuum](continuum.md) |
| Which gate is it for? | R2 to R3 assesses the logical pattern and its decisions; R3 to R4 the reference architecture with its cost model; R4 to R5 the evidence, not the design | Section 8 of the standard; [definition ladder](../standards/capabilities/standard-definition-ladder.md) |
| At what depth? | A check is a tool run; a review answers every criterion; an evaluation adds a workshop with your stakeholders. Expect an evaluation if a decision is costly to reverse, the design is high-risk, or people disagree about it | Section 3 of the standard |
| Which lenses? | `core` always. Any element that uses a model brings in `ai-solution`; any element whose model chooses its own steps and calls tools brings in `ai-agent`. Declare the profiles; a tool also derives them and reports a mismatch | Section 2.2; the [lenses](../standards/assessment/lenses/) |

Read the lenses that apply before you write, not after. Each criterion says what it reads, so the lens is also a list of what to write.

## Write the specification

The assessment reads a design specification: the design as YAML, valid against [`design.schema.json`](../standards/assessment/schemas/design.schema.json). If your design already has a Markdown document, the specification is its data, not a second design: name the document in `design.source` and keep the two in step. [SD-001](../standards/assessment/examples/SD-001-delivery-exception-agent.design.yaml) is a complete example, with deliberate gaps, and [AS-001](../standards/assessment/examples/AS-001-delivery-exception-agent.assessment.yaml) is what a review made of it.

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
| `decisions` | Each significant decision with what was chosen, the alternatives, the rationale, what it affects, how reversible it is and the debt it took on | `CORE-DEC-01`, `04`, `05`, `CORE-QA-05` | A decision with no alternative; a one-way door not marked as one |
| `considerations` | Every open question, with its options; none open on an accepted design | `CORE-DEC-02`, `03` | Open questions left in prose, where no tool can see them |
| `risks` | Risks you already know of, each with likelihood, impact, mitigation and owner | `CORE-RSK-01` | A risk with no owner; a mitigation that only moves the risk |
| `operations` | SLOs, observability (logs, metrics, traces, audit trail, conventions), deployment and rollback, recovery objectives and degraded mode, cost model with unit cost and budget, runbook | `CORE-OPS-01` to `04`, `CORE-CST-01` | A reference architecture with no cost model, which also blocks R4 |
| `evidence` | Each piece of evidence with its type, a reference, a date and what it covers: threat model, cost model, load test, eval report, red-team report, impact assessments, prior assessments | `CORE-SEC-04`, `CORE-RSK-03` | Evidence from an earlier version of the design; a threat model of a different boundary |

Write the risks you know about. A risk you record with an owner is a finding the assessor does not have to make, and it shows the design was thought about; a risk the assessor finds that you had seen and left out is worse than one nobody saw.

## If the design uses a model

Put an `ai` facet on every element that uses a model to produce its output: the model itself, a retrieval pipeline, a judge, a guard, an agent. A model is a technology or an SBB with the facet, never a kind of its own. The [`ai-solution` lens](../standards/assessment/lenses/ai-solution.yaml) then asks, among other things:

- Why a model at all, and what a deterministic alternative would cost (`AIS-FIT-01`). The simplest design that works is assessed first.
- Which model, pinned to which version, with a model card, a route to change it and a fallback (`AIS-MOD-*`).
- Evals for every model-backed element, each with a metric and a threshold, at least one gating release, covering your quality and misuse scenarios and the populations you serve, with any LLM judge calibrated against human labels (`AIS-EVAL-*`; `AIS-EVAL-01` is a blocker). For an AI solution the eval report is the main evidence; write the scenarios first and the evals from them.
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

Run the check depth yourself before you ask for a review. Until the tool criteria are implemented, that means validating the specification against the schema with any JSON Schema 2020-12 validator and then walking the criteria marked `decided_by: tool` by hand, using each one's `rule`, which is written to be applied without judgement. The 39 tool criteria and the presence half of the 30 marked `both` are things you can settle alone, and every one you settle is review time spent on judgement instead.

Then clear the blockers. A review with an open blocker ends `not-endorsed` whatever else is true, and a blocker cannot be accepted as a risk.

| Lens | Blockers |
|---|---|
| `core` | `CORE-DEM-01` goals, non-goals and stakeholders with concerns; `CORE-STR-05` every reference resolves; `CORE-QA-01` measurable quality scenarios; `CORE-SEC-02` every trust-boundary connector authenticated and authorised |
| `ai-solution` | `AIS-EVAL-01` evals with metric and threshold; `AIS-DATA-02` retrieval trimmed to the caller; `AIS-IO-02` model output constrained and validated |
| `ai-agent` | `AGT-JUS-02` autonomy proportionate; `AGT-ACT-01` every action listed; `AGT-ACT-02` dangerous actions approved or limited; `AGT-ACT-03` limits outside the agent; `AGT-ACT-04` sandboxed code; `AGT-INJ-01` no lethal trifecta; `AGT-ID-01` its own identity; `AGT-MAS-01` authenticated agent-to-agent traffic; `AGT-CTL-01` limits and a kill switch |

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

The outcome summarises the dispositions: `endorsed` when no blocker or major finding is open, `endorsed-with-conditions` when no blocker is open and every open major finding either has a disposition other than fixing the design or carries a dated condition, `not-endorsed` while any blocker is open, `deferred` when the specification did not validate or its evidence was missing. A conformance level is recorded beside it, saying how far the design follows the continuum's standards; a design can conform and still not be endorsed, because conformance and fitness are different questions.

An endorsed assessment is evidence that a stage on the definition ladder can cite, and it holds only while the design matches the digest it assessed. Change the design and the stage that relied on it is lost until the change is checked and, if material, reviewed. Keep each assessment record beside the design; together they are its history.

## A short list to finish with

- The specification validates, every reference resolves, and the source document says the same thing.
- Goals, non-goals and stakeholders with their concerns are stated.
- Every quality you care about has a scenario with a number, and the important ones have a fitness function.
- Every dependency you do not control has a failure scenario.
- Every connector across a trust boundary is authenticated and authorised, and untrusted content is marked.
- Every significant decision has its alternatives and reversibility; every open question is a consideration.
- Risks you know of have owners; obligations you are under are named with how they class the design.
- A reference architecture or solution design has SLOs, observability, recovery and a cost model.
- The threat model is for this version, and the cybersecurity assessment has been asked for.
- For a model: evals with thresholds gate release, retrieval is trimmed to the caller, output is validated.
- For an agent: every action is listed, dangerous ones are approved or limited outside the agent, no session holds the trifecta, it has its own identity, and a kill switch works without it.
