---
document_type: standards
title: "Assessment Triage Standard"
classification: internal
version: 0.2.0
status: draft
created: 2026-10-28
last_modified: 2026-10-28
owner: "Architecture Team"
triggers:
  - "Deciding what kind of assessment a design, solution, agent or new component needs before it starts"
  - "Tiering an AI agent or AI solution by what it can reach and how far it acts on its own"
  - "Bringing a new component, platform or tool into the landscape"
  - "Re-assessing after a change that widens what a solution or agent can do"
---

# Assessment Triage Standard

This standard says how the right assessment is chosen before any assessment starts. One size does not fit: a knowledge assistant that answers staff questions from a curated set of documents and an agent that reads inbound customer email and calls a carrier's API do not deserve the same assessment, and giving them the same one either buries the first or under-examines the second. Triage answers a short set of questions about the subject, and the answers fix two things: the assessment type, from what is being assessed, and the risk tier, from what could go wrong. Together they set the depth, the assessors, the evidence, the hand-overs, who approves, and how often the subject is assessed again. It is a draft, and it is the front door of the [Architecture Assessment Standard](standard-architecture-assessment.md).

> **Cross-references:**
> - [Architecture Assessment Standard](standard-architecture-assessment.md): the method every assessment type uses.
> - Lenses: [`core`](lenses/core.yaml), [`ai-solution`](lenses/ai-solution.yaml), [`ai-agent`](lenses/ai-agent.yaml), [`production`](lenses/production.yaml).
> - Schemas: [`triage.schema.json`](schemas/triage.schema.json) for the triage record; [`design.schema.json`](schemas/design.schema.json), from which the tier is derived again.
> - [Agent Operating Model](../agent-native/operating-model.md): the guardrail tiers T0 to T3, which are limits on actions. The assessment tiers AT1 to AT4 here are something else: how much assessment a subject gets.

## 1. Two questions, asked first

| Question | Settles | Answered by |
|---|---|---|
| What is being assessed? | The assessment type (section 2): a new component, a platform, a design, a solution, an AI solution, an agent, a change, or entry to production | The kind of subject, and whether it is new |
| How much could go wrong, and how badly? | The risk tier, AT1 Light to AT4 Critical (section 4) | The highest tier any one risk driver gives (section 3) |

Triage is recorded before the assessment starts, as a triage record valid against `triage.schema.json`, and the assessment record cites it. It takes minutes, not days: the questions are about facts the requester already knows, such as what the agent can call, what data it sees and who uses it.

## 2. Assessment types

The type follows from the subject. Each one uses the method of the assessment standard, with the lenses its profile brings in, but each asks a different first question and produces something different.

| Type | Subject | First question | Produces |
|---|---|---|---|
| Component onboarding | A technology, SBB, model, platform service, MCP server or tool, or agent platform new to the landscape | Should this enter the catalogue, and on what terms? | A catalogue entry with its `lifecycle_state`, and a permitted-use envelope: the highest tier, reach, agency and data classification it may be used at |
| Platform | A platform that will host many solutions or agents: an agent platform, an AI gateway, an integration platform | What may run on it, and which controls do its tenants inherit? | An envelope and a list of inherited controls (section 6), assessed at the highest tier the platform will host |
| Architecture design | An architecture pattern or reference architecture at a definition-ladder gate | Is the design fit for purpose, and does it move toward the target state? | The design review already defined in the assessment standard |
| Solution | A solution design with no model-backed elements | Is it fit for purpose, as designed and as built? | A design review, then a production entry assessment |
| AI solution | A solution with model-backed elements, including one where an agent is a component calling the solution's own APIs | As for a solution, and what the models and agents in it can reach and do | As for a solution, with the AI lenses its facets bring in, tiered by its most capable element |
| Agent | A single agent that is a product in its own right, configured on a platform or built | What can it reach, how far does it act alone, and what bounds it? | An agent assessment, lighter where it runs inside an assessed platform's envelope |
| Change | A change to a subject already assessed | Does the change move the subject to a higher tier? | A re-triage; a review of the change at the current tier, or a full assessment at the new one |
| Production entry | A solution, AI solution or agent about to go live | Is what was built the design that was assessed, and can it be run? | The production entry assessment of section 8.1 of the assessment standard, scaled by tier |

Periodic and incident assessments are not types of their own. They are re-runs of the subject's type at its current tier, on the cadence in section 5 or after an incident.

What a vendor calls an agent is not always an agent here. A configured assistant that answers only from knowledge loaded into its configuration, with no tools, does not choose steps or act: it is an AI solution with reach `knowledge`, and the agent lens does not apply to it. The agent lens begins when the model calls a tool.

## 3. Risk drivers

Each driver gives a tier. The subject's tier is the highest of them, the high-water mark used by FIPS 199 for security categorisation: a subject with one critical driver is critical however benign the rest. Points are never added up, because a sum lets several low answers hide one high one.

### 3.1 Reach and agency, for AI solutions and agents

An agent is placed on two axes. Reach is what it can touch, which is the tiering most organisations start from. Agency is how far it acts without a person, after the four scopes of AWS's Agentic AI Security Scoping Matrix. Neither alone is enough: an agent that can only read but runs unattended on untrusted input, and an agent that can pay invoices but only proposes payments for a person to approve, are both mis-tiered by one axis.

| Reach | What the model-backed element can touch | Read from the specification |
|---|---|---|
| `knowledge` | Only curated knowledge loaded into its configuration; no tools | An `ai` facet with grounding and no `agent` facet |
| `read` | Live internal data, through retrieval or read-only tools, trimmed to the caller | Every tool's `effect` is `read`, or retrieval with no tools |
| `write` | State in internal systems, through internal APIs | Any tool with `effect: write` |
| `external` | Systems or people outside the organisation: external APIs, outbound messages, or untrusted external content read into its context | Any tool with `effect: external-communication`, or `reads_untrusted` on a tool, or `input_trust: untrusted` |
| `consequential` | Money, deletion, irreversible change, code execution, or other agents | Any tool with `effect` `financial`, `destructive` or `code-execution`, any irreversible tool, or `peers` |

| Agency | How far it acts alone | Read from the specification |
|---|---|---|
| `none` | It answers or recommends; a person takes every action | No tools, or only read tools |
| `prescribed` | It prepares actions; a person approves each one before it runs, whoever or whatever started it | Every non-read tool has `approval: human-approved` |
| `supervised` | A person starts it, then it acts within set bounds without further approval | `initiation: user`, and any non-read tool with `approval: autonomous` |
| `full` | It starts itself, on events or a schedule, and nothing it does waits for a person | `initiation` is `event`, `schedule` or `self`, and no non-read tool needs approval |

| Reach, by agency | `none` | `prescribed` | `supervised` | `full` |
|---|---|---|---|---|
| `knowledge` | AT1 | n/a | n/a | AT2 |
| `read` | AT2 | AT2 | AT2 | AT3 |
| `write` | n/a | AT2 | AT3 | AT3 |
| `external` | AT3 | AT3 | AT3 | AT4 |
| `consequential` | n/a | AT3 | AT4 | AT4 |

`n/a` marks combinations that cannot occur: writing needs some agency, and a knowledge-only assistant has nothing to approve. An AI solution takes the reach and agency of its most capable model-backed element.

### 3.2 The other drivers

| Driver | AT1 | AT2 | AT3 | AT4 |
|---|---|---|---|---|
| Data: the highest classification the subject reads or writes | `public`, `internal` | `confidential` | `restricted`, or customers' personal data | Special-category personal data at scale |
| Exposure: who uses it or reaches it | Staff | Authenticated customers or partners | The public, unauthenticated, or other organisations' agents | |
| Untrusted content in a model's context | None | Present, with no tool that writes or reaches outside | Present in a session that also holds sensitive data and can write or reach outside, where each such action waits for a person's approval | Present in a session that also holds sensitive data and can write or reach outside without approval: the lethal trifecta, run unattended |
| Effect on people and regulatory class | No decision about people; minimal risk, or limited risk where the only duty is to tell people they deal with AI (EU AI Act, Article 50), which `AIS-HUM-02` checks | | Supports decisions about people that a person makes | Makes or materially shapes decisions with legal or similar effect on people; high-risk under the EU AI Act |
| Novelty | Every component catalogued at target | A component at baseline, or a recorded departure | A component new to the landscape, onboarded for this use | |
| Reversibility | Two-way doors only | A costly decision | A one-way-door decision | |

A prohibited practice under the EU AI Act is not tiered. Triage stops, and the subject is not assessed for approval.

### 3.3 Target-state positions are attested

Whether a building block belongs to the target state is a judgement about where the organisation is going, not a property of the design. It is made by the architect responsible for the target architecture the block belongs to (an enterprise architect, or the domain architect for a platform), never by the design's author and never by an assessing agent. Triage asks that architect for the position of every building block the subject uses, and records it in the triage record's `target_state`: the element, its catalogue identifier if it has one, its position (`target`, `in-flight`, `baseline`, `retiring`, `retired`, or `not-target` for technology neither in use today nor planned), its successor when the architect has named one, the use it is limited to when the architect limits it (`permitted_use`: a platform may be target only for running one kind of workload), who attested it and when. Where an architect maintains `lifecycle_state` in the catalogue, that is the same attestation, kept once for every design that uses the block.

The positions feed two things. The novelty driver: a block at `baseline` or `retiring` is a departure, AT2; a block at `not-target` is new to the landscape and outside the plan, AT3. And the core lens's target-state criteria (`CORE-TGT-01` to `05`), which read the attestation rather than guess at it. A block at `not-target` is a blocker until an exception for it is approved through escalation (`CORE-TGT-05`). The responsible architect cannot approve it alone: they recommend, and the exception authority the organisation names, such as the architecture board, decides. Technology the target does not plan for comes in by that decision, or the design is changed onto the target state; it is never a gap closed later. A block with no attested position is a question for that architect; the assessment can proceed, but reports the gap as a condition.

### 3.4 Overrides and derivation

An owner or the architecture function may raise a tier, with a reason recorded in the triage record. Nobody may lower one; a driver that seems to overstate the risk is answered by changing the design (removing a leg of the trifecta, adding human approval, narrowing the data), and triaging again.

Triage is declared before the specification is complete, and it is checked once it is. The check depth derives reach, agency, data, exposure and untrusted content from the specification (the columns headed "Read from the specification" above, `data.classification`, `data.personal` and `design.exposure`) and reports any driver that derives higher than declared. The derived tier wins, as derived stages win on the definition ladder: an assessment under way at too low a tier stops and resumes at the right one. Novelty is derived from the elements and the attested positions: an `sbb` or `technology` with no `ref` is new to the landscape, one attested at `baseline` or `retiring` is a departure, one attested at `not-target` is new to the landscape, and a subject inherits from a platform, and avoids the novelty driver for it, only when the platform's element names the assessment that admitted it in `assessed_by`. A novelty answer with nothing to cite is a question for the requester, not an assumption.

## 4. The tiers

| | AT1 Light | AT2 Standard | AT3 Enhanced | AT4 Critical |
|---|---|---|---|---|
| Typical subject | A staff knowledge assistant on internal documents; a conventional internal solution on target components | A read-only agent over internal systems; a customer-facing solution on catalogued components | An agent that writes to internal systems without per-action approval; anything reaching outside the organisation; restricted data | A trifecta session; an agent that acts unattended on external systems or with money; a high-risk AI system |
| Depth | Check, and the team answers the blocker criteria itself | Review | Review, or evaluation for a one-way door | Evaluation |
| Assessors | The team, with the tool | One independent assessor | Independent lead and a security architect | Independent lead, security architect, an AI or agent specialist, and the stakeholders |
| Reviewer criteria | Blockers only | All that apply | All that apply | All that apply, with the utility tree |
| Evidence, beyond the specification | A threat-model checklist; evals for every model-backed element | A threat model; a cost model where one is required | Injection tests where untrusted content is read; a load test | A red-team report; control tests for every agent; the AI impact assessment |
| Hand-overs | Only those an obligation requires | A baseline security assessment | A full security assessment; a privacy impact assessment when personal data is held | As AT3, with the AI impact assessment, and conformity assessment when high-risk |
| Approval | The subject's owner | The architecture lead | The architecture board or its delegate, with the service owner | The architecture board and the accountable executive who owns the risk |
| Into production | The team runs the production lens's tool criteria and the owner approves | Production entry assessment | Production entry assessment | Production entry assessment, and a staged rollout: a run in shadow or with every action approved, before autonomy is raised |
| Assessed again | On a material change | Yearly and on a change | Every six months and on a change | Every quarter, and on any change to its tools, model, data or autonomy |

The evidence row is what the tier requires by the time the subject enters production. At a design review, evidence that can exist only once the solution is built (eval reports, test results, hand-over outcomes) is not yet due: the assessment judges its plan instead, and the production entry assessment requires the evidence (assessment standard, section 5). The lenses in a plan are those of the assessment about to run; the `production` lens joins only the production entry assessment.

The lenses do not change with the tier; the profile brings them in, as the assessment standard says. What the tier changes is how much of each lens a person must answer, who that person is, and what evidence they need. AT1 is the only tier with no independent assessor, which is what the assessment standard's design review requires; at AT1 there is no design review, only a check that the team owns.

## 5. Changes and re-triage

A change is triaged again before it is assessed. A change that leaves every driver where it was is reviewed at the current tier, against the changed elements and what they connect to. A change that raises any driver to a higher tier is a new assessment at that tier, not a review of a change. These always count as raising a driver until triage shows otherwise: a new tool, a tool whose effect changes, a step up in agency (from prescribed to supervised, or from user-initiated to self-initiated), a new data set or a higher classification, a new kind of user, a new source of untrusted content, and a change of model or model provider. Raising an agent's autonomy is therefore never a configuration change: it is a change to the subject, triaged and assessed before it is made.

## 6. Platforms and inherited controls

A platform assessment is made once, at the highest tier the platform will host, and it produces two things its tenants use. The first is an envelope: the highest reach, agency, data classification, exposure and tier a tenant may have and still run on the platform. The second is a list of inherited controls: criteria the platform answers for every tenant, such as the agent's identity (`AGT-ID-01`), limits held outside the agent (`AGT-ACT-03`), the kill switch (`AGT-CTL-01`), trajectory logging and the tracing of model calls.

A subject inside the envelope of an assessed platform records those criteria as `met` by inheritance, citing the platform's assessment record, and its assessors answer only the rest. The subject's specification shows the inheritance through the platform's element, whose `assessed_by` names that record. Inheritance lowers the effort of an assessment, never its tier: an agent at AT3 on an assessed platform is still assessed and approved as AT3. A subject outside the envelope inherits nothing, and its triage says so. When the platform's assessment lapses or its envelope shrinks, its tenants are triaged again.

This is how a configured agent on an approved agent platform gets a light assessment and a custom-built agent does not: the controls that matter most for agents are assessed once, where they are implemented.

## 7. Component onboarding

A component new to the landscape is assessed before any solution may depend on it, because every later assessment will cite it. Its assessment is shorter than a solution's, and asks:

1. Does the target state need it? Name the capability it serves, the catalogued alternatives considered, and why they were not enough; a component that duplicates one at target is a departure (`CORE-TGT-02`).
2. Is the supplier viable, with an exit? Stability, roadmap, licensing, and what happens to data and dependants if the supplier fails or is acquired.
3. Is it mature enough for the use proposed? Evidence of use at similar scale, and for a model or agent platform its evaluation results.
4. What data may it hold, and where? Classification, residency, retention, and for a model provider what it does with prompts and outputs.
5. What security baseline does it meet? Handed over to the cybersecurity assessment; certifications cited as evidence, not as the assessment.
6. How will it be run and retired? An owning team, support, the upgrade path and decommissioning.
7. On what terms may it be used? The permitted-use envelope recorded with its catalogue entry: the highest tier, reach, agency, data classification and exposure it is approved for.

These questions answer three of the five gaps that comparing G253 with the core lens still leaves open (whole-life cost and life expectancy, supplier viability with an exit, and the maturity of technology new to the enterprise); they belong here because they are asked once of a component, not of every design that uses it. A component lens holding them as criteria is an open item.

## 8. Three worked triages

| | A staff knowledge assistant | A delivery exception agent | An inbox triage agent |
|---|---|---|---|
| Subject | Answers staff questions about HR policy from documents loaded into its configuration; runs on the approved agent platform | Reads carrier events, reschedules deliveries through internal APIs without approval, emails customers | Reads inbound customer email, looks up orders, issues refunds up to a limit, replies, runs on every new message |
| Reach and agency | `knowledge`, `none`: AT1 | `external` (outbound email, carrier text), `supervised`: AT3 | `consequential` (refunds), `full`: AT4 |
| Data | Internal: AT1 | Confidential, customers' personal data: AT3 | Customers' personal data: AT3 |
| Exposure | Staff: AT1 | Customers: AT2 | Public, since anyone can send an email: AT3 |
| Untrusted content | None: AT1 | Carrier free text in a session that holds personal data and emails out: AT4 | Inbound email in a session that holds personal data and pays out: AT4 |
| Effect on people | Limited, it must say it is AI: AT1 | Limited: AT1 | Limited: AT1 |
| Tier | AT1 Light | AT4 Critical | AT4 Critical |
| What changes it | On the approved platform it inherits identity and logging; the team runs the check and its owner approves. Letting it read live HR records through a tool makes its reach `read`, and the data confidential: AT2 | Removing a leg of the trifecta (a fixed email template, or a quarantined model reading carrier text) brings it to AT3, which is what AS-001 recommends | It stays AT4 while one session reads email and pays unattended. A person approving every refund and every reply makes its agency `prescribed` and its trifecta supervised: AT3 |

The middle column is the subject of the worked example [SD-001](examples/SD-001-delivery-exception-agent.design.yaml); its assessment [AS-001](examples/AS-001-delivery-exception-agent.assessment.yaml) found the trifecta that sets its tier.

## 9. Open items

- The tier boundaries and the drivers' thresholds (what counts as "at scale", which data is special-category in each jurisdiction) are a first proposal, to be calibrated on the first assessments.
- A component lens holding the onboarding questions as criteria has not been written.
- The check that derives the tier from a specification is specified here, not implemented.
- The approvers named for each tier are roles; each organisation maps them to its own governance bodies.
