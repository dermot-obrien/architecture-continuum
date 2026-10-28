---
document_type: standards
title: "Architecture Assessment Standard"
classification: internal
version: 0.1.0
status: draft
created: 2026-10-28
last_modified: 2026-10-28
owner: "Architecture Team"
triggers:
  - "Reviewing a design, an architecture pattern or a reference architecture before it is accepted"
  - "Gating a capability's move to R3 Decided or R4 Buildable"
  - "Assessing a design that uses AI models or AI agents"
  - "Writing a design as a specification that a review or a tool can read"
  - "Deciding what an architecture review covers and what it hands to a cybersecurity assessment"
---

# Architecture Assessment Standard

This standard says how a design on the continuum is assessed: what is read, against what, at what depth, by whom, and where each finding goes. It is general. Nothing in it is specific to a kind of solution; what is specific to AI solutions and AI agents lives in lenses that a design brings in by what it contains. It is a draft, written from the research in [Architecture assessment on the continuum](../../docs/architecture-assessment.md), and it is the contract a future `/architecture assess` flow will implement.

> **Cross-references:**
> - [The continuum](../../docs/continuum.md): the kinds every element of a design is typed by.
> - [Definition Ladder Standard](../capabilities/standard-definition-ladder.md): the stages an assessment can gate.
> - [Building Block Calibration Standard](../building-blocks/standard-building-block-calibration.md): the grain a review checks.
> - [Agent Operating Model](../agent-native/operating-model.md): the guardrail tiers the agent lens applies.
> - Schemas: [`design.schema.json`](schemas/design.schema.json), [`lens.schema.json`](schemas/lens.schema.json), [`assessment.schema.json`](schemas/assessment.schema.json).
> - Lenses: [`core`](lenses/core.yaml), [`ai-solution`](lenses/ai-solution.yaml), [`ai-agent`](lenses/ai-agent.yaml).
> - A worked example: [SD-001](examples/SD-001-delivery-exception-agent.design.yaml) and its assessment [AS-001](examples/AS-001-delivery-exception-agent.assessment.yaml).

## 1. What an assessment is, and what it is not

An architecture assessment judges whether a design is fit for its purpose: whether it answers its demand, sits correctly on the continuum, meets its quality attributes with stated measures, records its decisions, and can be operated, afforded and changed. It reads the design, not the running system, and it ends in findings and a verdict. The vocabulary is ISO/IEC/IEEE 42030's: analysis establishes facts about the design; assessment applies the stakeholders' values to those facts.

It is one of several judgements the bundle makes, and it is kept apart from the others because each answers a different question.

| Judgement | Question | Where it lives |
|---|---|---|
| Definition stage | How far has a capability been defined and built? | `/architecture stage`, derived from the artefacts |
| Catalogue conformance | Does the catalogue agree with the continuum's schemas, registers and relations? | `/architecture check`, mechanical |
| Architecture assessment | Is this design fit for purpose, and what does it trade? | This standard |
| Capability maturity | How well does a capability perform once it operates? | The capability's `maturity`, 0 to 5 |
| Cybersecurity assessment | Is security risk understood, are the controls implemented and effective, and is residual risk acceptable? | Outside the bundle; handed over to (section 9) |
| Regulatory conformity | Does the system meet an instrument's requirements, for a regulator or a certifier? | Outside the bundle; handed over to |

## 2. The three parts

An assessment reads two kinds of file and writes a third.

| Part | What it is | Schema |
|---|---|---|
| Design specification | The design written as data: its place on the continuum, its drivers, its elements and connectors typed by continuum kinds, its scenarios, decisions, considerations, operations and evidence. AI and agent characteristics are facets on elements | `design.schema.json`, `design/0.1.0` |
| Lens | A set of criteria, each with the question it asks, what it reads, whether a tool or a reviewer decides it, its default severity and its sources | `lens.schema.json`, `lens/0.1.0` |
| Assessment record | One assessment of one version of one design: depth, lenses, assessors, findings, dispositions, hand-overs and verdict | `assessment.schema.json`, `assessment/0.1.0` |

The specification is the data of a design document, not a second design. Where a design already has a Markdown document (an architecture pattern or a reference architecture written by the `pattern` skill), the specification names it in `design.source` and the two are kept in step; where the design is new, the specification can come first and the document be generated from it. In both cases the specification is what a tool reads, which is the agent-native rule that the catalogued artefact is the source of truth and machine-checkable beats human-readable.

### 2.1 Elements are continuum kinds

Every element has one `kind` from the continuum: `actor`, `external-system`, `local-role`, `abb`, `sbb`, `technology`, `service`, `store` or `deployment-node`. There is no kind for a model or an agent. A model is a technology or an SBB with an `ai` facet; a runtime agent is a service with an `ai` facet and an `agent` facet, which is what the [agent types](../agent-native/agent-types.md) standard already says. This keeps the continuum's levels intact and makes the AI lenses additive: remove the facets and the core lens still applies.

### 2.2 Profiles bring lenses in

A design declares `profiles`, and a tool also derives them: an element with an `ai` facet implies `ai-solution`, one with an `agent` facet implies `ai-agent`. The `core` lens always applies; each other lens applies when its profile does. A declared profile that the elements do not support, or a derived one that is not declared, is reported. New lenses (a data platform lens, a regulated-industry lens, a sovereign-hosting lens) are added the same way, with a profile of their own, and need no change to this standard.

## 3. Depths

An assessment is made at one of three depths. Each includes the one before it.

| Depth | What happens | Who | When |
|---|---|---|---|
| Check | Every criterion a tool can decide (`decided_by: tool`, and the presence half of `both`) is run against the specification | A tool, in CI or on request | On every change to a design specification |
| Review | Every applicable criterion is answered, the reviewer ones by a person or an agent reading the design and its evidence | A lead assessor, with a security architect where the design crosses trust zones | Before a design is accepted, and at the R3 and R4 gates |
| Evaluation | A review, plus scenario-based analysis with the stakeholders: a utility tree, sensitivity and trade-off points, risk themes linked to the drivers | A lead assessor, the architect and the stakeholders, in a workshop | For a design that is costly to reverse, high-risk, or contested |

The evaluation depth is the SEI's ATAM in the shape this bundle needs: the utility tree is built from the design's own quality scenarios, and the risks, sensitivity points and trade-off points are findings like any other. Lighter team-run methods (risk-storming over the design's diagrams, LASR, a decision-centric review of the design's decisions) are acceptable ways of doing a review, as long as their results are recorded as findings against criteria.

An assessor is independent when they did not author the design and are not accountable for delivering it. A review needs at least one independent assessor. An agent may be an assessor; its findings carry provenance like any other agent output, and it does not make the verdict alone.

## 4. Process

The steps follow the architecture evaluation process of ISO/IEC/IEEE 42020, clause 9, applied to a specification.

1. Prepare. Fix the subject (the design id, its version, and the digest of the specification), the trigger, the stage being gated if any, the depth and the assessors. Record what is out of scope.
2. Select lenses. Derive the profiles from the specification, compare them with the declared ones, and record the lenses and their versions.
3. Check. Validate the specification against `design.schema.json`, then run the tool criteria. A specification that does not validate is not assessed further; the finding is that it does not validate.
4. Review. Answer the remaining criteria, reading the design, its source document and its evidence. Every criterion gets a result; `not-assessed` is a result and must say why.
5. Evaluate, at that depth. Build the utility tree with the stakeholders, walk the high-importance scenarios through the design, and record sensitivity points, trade-off points, risks and non-risks.
6. Dispose. Give every `partly-met` or `not-met` finding a severity and a disposition (section 6). Group related risks into risk themes, each naming the goals or outcomes it threatens.
7. Decide. Reach the verdict by the rules in section 7, with conditions where needed.
8. Record and hand over. Write the assessment record beside the design, and open the hand-overs to the assessments this one does not make. The records beside a design are its history of assessments, the part TOGAF's Governance Repository keeps as compliance assessments.

## 5. Results and findings

| Result | Meaning |
|---|---|
| `met` | The design does what the criterion asks, with the evidence the criterion reads |
| `partly-met` | It does some of it, or does it without the evidence |
| `not-met` | It does not |
| `not-applicable` | The criterion's `applies_to` condition is false for this design |
| `not-assessed` | It applies but was not answered at this depth; the finding says why |

A finding has a type: `gap` (the design does not say what it must), `risk` and `non-risk` (a decision that is or is not problematic for the qualities it affects), `sensitivity-point` (a decision one quality's response turns on), `trade-off-point` (a decision that moves several qualities in opposite directions), or `observation`. The last four are ATAM's. Severity is `blocker`, `major`, `minor` or `advisory`; each criterion sets a default, and an assessor may move it with a reason in the statement.

A criterion found `met` need not be recorded at review depth unless the result is worth keeping, typically a non-risk or a sensitivity point. A tool run records every criterion.

## 6. Where findings go on the continuum

An assessment does not keep its own backlog. Every finding that is not met goes somewhere the continuum already has.

| Disposition | Goes to | Use when |
|---|---|---|
| `fix-design` | A new version of the design | The design is wrong or incomplete and the fix is clear |
| `raise-consideration` | A consideration, `CN-NNN` | The finding is an open question with more than one credible answer. At R2 this is how a missed question is added |
| `record-decision` | A decision record, `DR-NNN` | A choice the design made implicitly must be made explicitly, with its alternatives |
| `accept-as-debt` | A technical debt item, `TD-NNN`, as a consequence of a decision | The shortfall is known, its interest is acceptable for now, and someone owns repaying it |
| `accept-risk` | The design's `risks`, with an owner | The risk is understood and its owner accepts it; a blocker cannot be accepted this way |
| `hand-over` | Another assessment (section 9) | The question belongs to a cybersecurity, privacy, AI impact, safety or conformity assessment |

## 7. Verdict

| Outcome | Rule |
|---|---|
| `endorsed` | No finding is `not-met` or `partly-met` at blocker or major severity |
| `endorsed-with-conditions` | No open blocker; every major finding has a disposition other than `fix-design`, or a dated condition |
| `not-endorsed` | Any blocker is open |
| `deferred` | The assessment could not be completed: the specification does not validate, or the evidence it relies on is missing |

The verdict also records a conformance level against the continuum and its standards, using TOGAF's six levels (Enterprise Architecture Capability and Governance, 6.2, figure 6-1, as corrected by Technical Corrigendum 1) with the specification in the place of the implementation: `irrelevant` (nothing in common with the standards), `consistent` (what the design shares with the standards is in accordance, but some required features are missing and the design has features the standards do not cover), `compliant` (everything the design has is covered by the standards and in accordance, but some required features are missing), `conformant` (everything required is present and in accordance, with extra features beyond it), `fully-conformant` (full correspondence in both directions), and `non-conformant` (any of the above in which something the standards require is present but not in accordance). "In accordance" carries TOGAF's meaning: it supports the stated strategy, adheres to the stated standards and principles, and provides the stated functionality. Conformance answers whether the design follows the standards; the outcome answers whether it is fit for purpose. A design can be conformant and not endorsed.

## 8. Where assessment sits on the continuum

Assessment gates movement on the definition ladder rather than replacing it. The ladder's own checks stay mechanical; the reviewer column of each stage is what a review answers.

| Gate | Subject | Depth |
|---|---|---|
| R2 to R3 | The logical architecture pattern that realises the capability, and the decisions that settle its considerations | Review |
| R3 to R4 | The reference architecture, every box an SBB, with its cost model | Review, or evaluation for a costly or high-risk design |
| R4 to R5 | The evidence linked from the reference architecture: does it exercise the design end to end against the capability's criteria? | Review of the evidence, not the design |
| Any change | The changed elements of a design already assessed, and what they connect to | Check, then review of the change |
| Periodic | A design in service, against the current lens versions | Check; review when a lens has changed materially |

An assessment record is evidence. A stage whose reviewer column has been answered by an endorsed assessment can cite it, and a stage is lost, under the ladder's rule that evidence must stay true, when the design changes and the assessment no longer matches its digest.

## 9. The line with cybersecurity assessment

An architecture assessment asks whether the design is fit for purpose across every concern, security among them. A cybersecurity assessment asks whether security risk is understood and treated, whether controls are implemented and effective, and whether the residual risk is acceptable to the person who must accept it. The first reads a design; the second reads a system, its configuration, its controls and its tests. The first has no accreditation regime; the second often requires an independent, accredited assessor (an IRAP assessor, a FedRAMP 3PAO, a certification body, a CPA).

They overlap on one activity, threat modelling, because both analyse a representation of the system. The rule this standard sets is:

- The architecture assessment owns security architecture: trust zones, the authentication and authorisation of every connector that crosses one, the identity each service and agent runs as, where untrusted content enters and what it can reach, and where controls are placed. These are the `CORE-SEC` criteria and much of the agent lens.
- It requires a threat model for the version it assesses, and treats the threat model as part of the design's evidence.
- It does not judge whether controls are implemented, configured or effective, does not test, and does not accept residual security risk. Those are handed over, with the findings that motivated the hand-over, and the design is not accepted until the cybersecurity assessment's own outcome is recorded as evidence.

The same rule applies to privacy impact, AI impact and regulatory conformity assessments: the architecture assessment names the obligation and how the design classes under it, and hands the judgement over.

## 10. Writing a lens

A lens is a YAML file valid against `lens.schema.json`. Each criterion asks one question that a design can answer, reads named paths of the specification, and says whether a tool can decide it. A tool criterion carries a `rule` precise enough to implement without judgement; a reviewer criterion says what the reviewer should look for. Criteria ids are `<PREFIX>-<AREA>-NN` and never reused; a changed criterion keeps its id and the lens's minor version moves, a removed criterion's id is retired, and a change that would turn earlier results wrong moves the major version. Every criterion cites its sources by key, and the keys resolve in the lens's `sources`.

## 11. Open items

- The identifier series `SD-NNN` for a solution design and `AS-NNN` for an assessment are proposed here and not yet in the envelope or the frontmatter standard.
- The `pattern` skill's model is the natural source of a specification's elements, connectors and scenarios; the mapping between the two has not been written.
- The tool criteria are specified, not implemented.
