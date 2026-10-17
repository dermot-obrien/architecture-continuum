---
document_type: standards
title: "Metamodel Standard (working draft)"
classification: internal
version: 0.1.0
status: draft
created: 2026-05-08
last_modified: 2026-05-08
owner: "Architecture Team"
triggers:
  - "Defining or evolving the framework's entity inventory"
  - "Adding or removing a grouping (Strategy/Motivation, Capability, Building Blocks, Governance, Demand, Roadmap, etc.)"
  - "Reconciling against external sources (TOGAF, ArchiMate, BMM, BIZBOK)"
---

# Metamodel Standard (working draft)

> **Status:** Iterative consolidation in progress.
>
> This file is the merged metamodel for the AI-Assisted Architecture framework. It supersedes the earlier `standard-frontmatter.md` draft and a prior enterprise-architecture `governance/schema.json` schema.
>
> The merge proceeds **grouping by grouping**. Each grouping draws on canonical external sources (TOGAF, ArchiMate, BMM, BIZBOK, DDD, C4) and is consolidated against actual usage. Groupings are listed in [§1 Groupings](#1-groupings); each has its own section once consolidated.
>
> Foundational decisions (entity inventory, ID conventions, universal envelope, status/lifecycle modelling, relations vocabulary, source-of-truth rules) **are made progressively** as groupings consolidate. They are summarised in [§9 Cross-cutting decisions](#9-cross-cutting-decisions).

---

## 1. Groupings

The framework's metamodel is partitioned into groupings — each is a top-level folder in a workspace and a section in this standard. The current target inventory:

| # | Grouping | Folder | Status | Sources of inspiration |
|---|---|---|---|---|
| 1 | **Strategy / Motivation** | `motivation/` | **In consolidation** (this iteration) | BMM (Ends/Means/Influencers/Assessments), TOGAF Phase A artefacts, ArchiMate Motivation Layer |
| 2 | Organisation / Platform | `platforms/` | Pending | Team Topologies, CNCF Platforms WP, BIZBOK |
| 3 | Capability | `capabilities/` | Pending | TOGAF G189, BIZBOK |
| 4 | Building Blocks (Logical / Physical) | `building-blocks/` | Pending | TOGAF Architecture Content (ABB/SBB) |
| 5 | Solution Boundary (Bounded Context, optional) | `contexts/` | Pending | DDD strategic design |
| 6 | Runtime / Code (optional) | `runtime/` | Pending | C4 Container/Component, framework v1.0.0 |
| 7 | Demand | `demand/` | Pending | Value Stream + Use Case (BIZBOK / TOGAF) |
| 8 | Guidance (Architecture pattern and Reference architecture, at any scope; Profile) | `guidance/` | Pending | TOGAF Architecture Continuum, pattern catalogues |
| 9 | Governance (Principle, Standard, Consideration, ADR, Technical debt) | `governance/` | Pending | TOGAF Principles + MADR + framework v1.0.0 ADRs |
| 10 | Roadmap | `roadmap/` | Pending | TOGAF Implementation & Migration roadmap |
| 11 | Technology Tracking | `radar/` | Pending | ThoughtWorks Tech Radar |
| 12 | Inter-platform Contracts | `dependencies/` | Pending | Team Topologies (platform dependencies) |
| 13 | Lifecycle / Change | (cross-cutting) | Pending | Framework `lifecycle_state` on each artefact (baseline, in-flight, target, retired); no snapshot or transition kinds |

Each grouping has: (a) external sources, (b) candidate entity inventory drawn from those sources, (c) a recommended subset, (d) entity field shapes, (e) relations to other groupings.

---

## 2. Strategy / Motivation

### 2.1 Purpose

The **Motivation** grouping captures *why* the architecture exists — the stakeholders it serves, the drivers pushing change, the goals it pursues, the outcomes it must produce, the principles and constraints it operates under, and the values it delivers. It sits above the Capability and Architecture layers in the Golden Thread.

This grouping is the framework's analogue of TOGAF Phase A (Architecture Vision) artefacts and the ArchiMate Motivation Layer. It draws on three canonical sources:

- **OMG Business Motivation Model (BMM)** — Ends / Means / Influencers / Assessments / Organization Units.
- **TOGAF 10 Architecture Vision** — Stakeholders, Drivers, Goals, Objectives, Constraints, Architecture Principles.
- **ArchiMate 3.2 Motivation Layer** — Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint, Meaning, Value.

### 2.2 Source-by-source element inventory

The full element set across the three canonical sources:

| Element | BMM | TOGAF Phase A | ArchiMate 3.2 | Notes |
|---|:---:|:---:|:---:|---|
| **Vision** | ✓ (one per enterprise) | ✓ ("Architecture Vision") | — | BMM: aspirational; one per enterprise. |
| **Mission** | ✓ | — | — | What the enterprise *does*; complement to Vision. |
| **Stakeholder** | (Organization Unit) | ✓ ("Stakeholder Map") | ✓ | Role with concerns. Universal across sources. |
| **Driver** | (External / Internal Influencer) | ✓ | ✓ | A force motivating change (regulatory, market, technology, internal). |
| **Assessment** | ✓ (SWOT) | ✓ | ✓ | Analysis of a Driver — strength / weakness / opportunity / threat. |
| **Goal** | ✓ (general intention) | ✓ | ✓ | High-level aim. |
| **Objective** | ✓ (specific, measurable) | ✓ | (subsumed by Outcome) | BMM: specific, time-bounded, quantitative. |
| **Outcome** | ✓ ("Desired Result") | ✓ | ✓ | Measurable end-state evidencing a Goal. |
| **Principle** | (within Directive: Policy) | ✓ ("Architecture Principle") | ✓ | Qualitative architectural commitment. |
| **Requirement** | (within Directive: Business Rule) | ✓ | ✓ | Quantitative statement of need. |
| **Constraint** | — | ✓ | ✓ | Limit on a means or end. |
| **Strategy** | ✓ (Course of Action) | — | (Strategy layer 3.1+) | Broad approach to achieving Goals. |
| **Tactic** | ✓ (Course of Action) | — | (Strategy layer 3.1+) | Specific approach within a Strategy. |
| **Policy** | ✓ (Directive) | (covered by Principle) | (covered by Principle) | General behavioural directive. |
| **Business Rule** | ✓ (Directive) | (covered by Requirement) | (covered by Requirement) | Specific, actionable rule. |
| **Value** | — | — | ✓ | Benefit to a stakeholder. |
| **Meaning** | — | — | ✓ | Interpretation / definition. |

### 2.3 Convergent core (present in all three sources)

Six elements show up in every source:

1. **Stakeholder**
2. **Driver**
3. **Assessment**
4. **Goal**
5. **Outcome** (= BMM "Desired Result" / "Objective" measurement)
6. **Principle**

Plus two near-universal:

7. **Constraint** (TOGAF + ArchiMate; implicit in BMM as a Directive)
8. **Requirement** (TOGAF + ArchiMate; implicit in BMM as a Directive)

ArchiMate adds two:

9. **Value** — explicitly modelled
10. **Meaning** — explicitly modelled

BMM adds four (means-side) that TOGAF/ArchiMate don't formalise as motivation:

11. **Vision** (treated by TOGAF as the *output* of Phase A — "Architecture Vision document" — not a metamodel element)
12. **Mission**
13. **Strategy / Tactic** (ArchiMate added these in 3.1 to a separate Strategy layer, not Motivation)
14. **Policy / Business Rule** (treated by TOGAF/ArchiMate as Principle + Requirement)

### 2.4 Candidate entity sets for the framework

Three candidate "starting subsets" — pick one or modify:

#### Subset A — ArchiMate-aligned core (10 entities)

```
motivation/
  stakeholders/<slug>/index.md      ← role with concerns
  drivers/<slug>/index.md           ← force motivating change
  assessments/<slug>/index.md       ← SWOT-style analysis of a driver
  goals/<slug>/index.md             ← high-level aim
  outcomes/OUT-NNN/index.md         ← measurable result evidencing a goal
  principles/PRIN-NNN/index.md      ← qualitative architectural commitment
  requirements/REQ-NNN/index.md     ← quantitative need
  constraints/CON-NNN/index.md      ← limit on means or end
  values/<slug>/index.md            ← benefit to stakeholder
  meanings/<slug>/index.md          ← interpretation / definition
```

#### Subset B — TOGAF-aligned core (8 entities; drops Value and Meaning)

Same as A but without `values/` and `meanings/`. Sufficient for most enterprise architecture programmes.

#### Subset C — BMM-aligned core (8 entities; adds Mission and Vision)

```
motivation/
  vision/index.md                   ← one per workspace; aspirational
  missions/<slug>/index.md          ← what we do
  stakeholders/<slug>/index.md
  drivers/<slug>/index.md
  assessments/<slug>/index.md
  goals/<slug>/index.md
  outcomes/OUT-NNN/index.md
  principles/PRIN-NNN/index.md
```

(Drops Value, Meaning, Requirement, Constraint — BMM rolls Requirement and Constraint into "Directive" via Policy/BusinessRule.)

#### Subset D — Practical maximum (12 entities; everything that's clearly distinct)

Subset A + Vision + Mission + (optionally) Policy + BusinessRule.

### 2.5 Relations within Motivation

Common to all subsets:

```
Stakeholder ──has-concern──► Driver
Driver ─────analysed-by────► Assessment
Assessment ─influences─► Goal
Goal ──realised-by──► Outcome
Goal ──constrained-by──► Principle / Constraint
Goal ──refined-by──► Requirement
Outcome ──delivers──► Value (ArchiMate-only)
Driver / Goal / Outcome ──gives-meaning-to──► Meaning (ArchiMate-only)
```

External relations (linking Motivation downward to other groupings — these get formalised when downstream groupings are consolidated):

```
Outcome ──owned-by──► Platform                       [Org grouping]
Outcome ──requires──► Capability                     [Capability grouping]
Goal ──realised-through──► Capability                [Capability grouping]
Principle ──constrains──► Architecture pattern, Reference architecture   [Guidance grouping]
Principle ──constrains──► ADR                        [Governance grouping]
Requirement ──met-by──► ABB                          [Building Blocks grouping]
```

### 2.6 Frontmatter — example shape (to refine after entity set is chosen)

For an Outcome:

```yaml
---
id: OUT-001
title: "Reduce credential-related incidents to zero"
status: Draft
version: "0.1"
last_modified: 2026-05-08
author: "Architecture Team"
provenance: { origin: ai-generated, review_state: ai-raw }
# Per-kind
kpi: "Number of credential-related security incidents per quarter"
kpi_target: { value: 0, unit: incidents-per-quarter }
target_date: 2027-03-31
business_rationale: "Eliminate standing credentials per zero-trust mandate from CISO."
time_horizon: short | medium | long
# Relations within Motivation
realises_goals: [GL-001, GL-005]
delivers_value: [VAL-007]                    # if Subset A or D
constrained_by: [PRIN-002, CON-003]
# Outbound relations (downstream)
owned_by_platform: PL-001                    # populated when Org grouping lands
requires_capabilities: [CAP-004, CAP-005]    # populated when Capability grouping lands
---
```

Universal envelope shape (`status`, `version`, `last_modified`, `author`, `provenance`, etc.) is being aligned across the consolidated groupings; final form decided in §9.

### 2.7 Open decisions on this grouping

- **M1** Which subset (A / B / C / D) — or a custom set — defines the framework's Motivation entity inventory?
- **M2** Folder name: `motivation/` (TOGAF/ArchiMate idiom) or `strategy/` (a demand-led idiom for ValueStream/UseCase) or `strategy-and-motivation/` (explicit)?
- **M3** Where does **ValueStream** sit? (some enterprise models put it in `demand/`; ArchiMate 3.1+ has a Strategy layer that includes it; could be Motivation or a separate Demand grouping.)
- **M4** Where do **UseCases** sit? (some enterprise models put it in `demand/`; framework v1.0.0 had UC realised by ABB. Probably *not* Motivation — they're operational, not motivational.)
- **M5** Should Vision be a single document per workspace, or multiple Visions (e.g. per ValueStream)?
- **M6** ID conventions for slug-based vs `<TYPE>-NNN` — e.g. is Stakeholder a slug or `STK-NNN`? Defer to §9 once cross-cutting envelope is decided.

---

## 3. Organisation / Platform

*Pending — to be consolidated next.*

## 4. Capability

*Pending consolidation.* Two parts are settled ahead of the rest of the grouping.

### 4.1 Definition ladder

A capability's progress through definition is a definition stage on the [definition ladder](./capabilities/standard-definition-ladder.md): R0 Unrecognised, R1 Named, R2 Bounded, R3 Decided, R4 Buildable, R5 Proven, R6 In service. The stage is derived from the artefacts in other groupings (ABBs, SBBs, considerations, decision records, architecture patterns, reference architectures and linked implementation evidence), so it adds no entity of its own. It is recorded per flow in the capability's optional `flows[]`, and it is a separate axis from maturity (0 to 5), which measures a capability once it operates.

| Field | On | Purpose |
|---|---|---|
| `flows[]` | Capability | Named paths through the capability, each with an optional recorded `stage` |
| `open_questions: none` | Capability | States that the capability has no open question to list as a consideration |
| `demand_assumption` | Capability | Demand recorded as an explicit assumption where no outcome is linked yet |
| `realises` | Architecture pattern, reference architecture | The capabilities the document realises, so it counts toward their stages |

### 4.2 Consideration (Governance grouping)

The ladder needs an artefact for an open question, which no existing kind provides. A consideration (`CN-NNN`, `kind: consideration`) records one question with more than one credible answer: its options, the criteria that decide it, the capabilities, ABBs, SBBs, architecture patterns or reference architectures it `affects`, and its `consideration_status` (open, resolved, withdrawn). A resolved consideration names the Decision Record that settled it in `resolved_by`.

```
Consideration ──affects──► Capability / ABB / SBB / Architecture pattern / Reference architecture
Consideration ──resolved_by──► Decision Record
```

It belongs to the Governance grouping beside the ADR: a consideration is the question, and the decision record is the answer. Listing considerations is part of stage R2, and resolving each by an accepted decision record is part of R3. Field reference: [Frontmatter Standard §6.16](./standard-frontmatter.md#616-consideration-cn-nnn).

## 5. Building Blocks (ABB / SBB)

*Pending.*

## 6. Solution Boundary (Bounded Context, optional)

*Pending.*

## 7. Runtime / Code (optional)

*Pending.*

## 8. Demand (Value Stream, Use Case)

*Pending.*

## 9. Cross-cutting Decisions

*Decisions made progressively as groupings consolidate. Initial commitments:*

| | Commitment | Source / rationale |
|---|---|---|
| C1 | **Platform is first-class** — owns Capabilities. | User direction (this session). |
| C2 | This file is the merged metamodel; supersedes earlier `standard-frontmatter.md` draft. | This session. |
| C3 | Universal envelope shape — TBD; will be finalised once 3+ groupings are consolidated. | — |
| C4 | Status enum, ID conventions, lifecycle modelling — TBD. | — |
| C5 | Source-of-truth (markdown + optional CSV bulk import) — TBD. | — |

---

## 10. References

- **OMG BMM** (Business Motivation Model) — https://www.omg.org/spec/BMM/.
- **TOGAF Standard, 10th Edition** — Architecture Vision (Phase A); Architecture Content Framework.
- **ArchiMate 3.2** — Motivation Layer specification, https://www.opengroup.org/archimate-forum/archimate-overview.
- BIZBOK Guide v10 — capability mapping; relevant for the Capability grouping.
- DDD strategic design — Bounded Context, Context Maps; relevant for §6.
- C4 Model — Container / Component zoom; relevant for §7.
- A prior enterprise `governance/schema.json` (v3.3) — practical reference, particularly for ValueStream, Profile, ADR, Standard, Principle, RoadmapItem, TechnologyRadarEntry shapes.
- AI-Assisted Architecture v1.0.0 — Platform, ABB-inside-BC, Capability four-component model.
