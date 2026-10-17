---
document_type: standards
title: "Capability — Document Standard"
classification: internal
version: 1.0
status: draft
created: 2026-03-07
last_modified: 2026-09-26
owner: "Architecture Team"
triggers:
  - "Creating or modifying capability documents (index.md)"
  - "Defining business capabilities and their hierarchy"
  - "Mapping capabilities to Architecture Building Blocks"
  - "Assessing capability maturity"
---

# Capability — Document Standard

This standard defines the structure, sections, and conventions for a Capability document. Capabilities describe **what** an organisation must be able to do, expressed in business terms, independent of **how** it is implemented. They sit above Architecture Building Blocks (ABBs) in the traceability chain and provide the bridge between strategic motivation and architecture.

Following The Open Group's definition, a capability encompasses four components: **organisation**, **people**, **processes**, and **technology**. The technology dimension is realised by ABBs and SBBs — the capability itself remains technology-agnostic.


## Traceability Chain

```
Goal / Outcome
  |  evidenced by
  v
Use Case
  |  requires
  v
Capability  (L1 -> L2 -> L3)       <-- this standard
  |  realised by
  v
Architecture Building Block (ABB)
  |  implemented by
  v
Solution Building Block (SBB)
```

Only **L3 capabilities** map directly to ABBs. L1 and L2 are organisational groupings.


## File Structure

Each capability is a folder named by its identifier, placed under `capabilities/` in the workspace:

```
capabilities/
  capability-model.md             # Master taxonomy: one flat registry table (L1/L2/L3)
  capability-hierarchy.csv        # Derived from the registry
  capability-abb-mapping.csv      # Derived from the traceability matrix
  CAP-001/
    index.md                      # The capability document (this standard)
  CAP-002/
    index.md
```

### Identifier Assignment

- Capability identifiers use the format `CAP-NNN` (zero-padded to 3 digits).
- When creating a new capability, use the next available sequential number.
- The folder name MUST match the capability identifier exactly (e.g. `CAP-012/`).


## Document Structure

### Front Matter

YAML front matter with Docusaurus-compatible metadata:

```yaml
---
title: "CAP-NNN <Capability Name>"
sidebar_label: "CAP-NNN <Capability Name>"
sidebar_position: <integer>
---
```

A capability catalogued under the [Frontmatter Standard](../standard-frontmatter.md#64-capability-cap-nnn) carries the full envelope instead, including the optional `flows[]`, `open_questions` and `demand_assumption` fields that the [definition ladder](./standard-definition-ladder.md) reads.

### Heading

```markdown
# CAP-NNN <Capability Name>
```

### Document Control

A metadata table immediately after the heading:

| Property | Value | Notes |
|----------|-------|-------|
| **Capability ID** | `CAP-NNN` | Unique identifier. Sequential numbering, zero-padded to 3 digits. |
| **Capability Name** | Full name | Human-readable name of the capability. |
| **Level** | `L1` / `L2` / `L3` | Position in the capability hierarchy. |
| **Parent** | `CAP-NNN` or `—` | Parent capability ID (for L2 and L3). L1 capabilities have no parent. |
| **Version** | `MAJOR.MINOR.PATCH` | Semantic versioning. |
| **Status** | `draft`| Current lifecycle status. |
| **Platform** | Platform name | The L1 platform this capability belongs to (e.g. `Models`, `Agents`, `Governance`). |

### Description

A single paragraph immediately after Document Control that defines the capability in business terms. State what the organisation must be able to do and the scope boundary. This MUST be technology-agnostic — no product names.


### Section 1 — Purpose

**Heading:** `## 1  Purpose`

Explain *why* this capability is needed. Describe the business need it addresses, the value it provides, and any strategic drivers. Reference linked Goals if they exist.


### Section 2 — Capability Definition

**Heading:** `## 2  Capability Definition`

#### 2.1 Organisation

**Heading:** `### 2.1  Organisation`

Describe the governance structures, roles, and organisational units required to sustain this capability:

```markdown
- **<Role or Structure>.** <How it contributes to the capability.>
```

#### 2.2 People

**Heading:** `### 2.2  People`

List the skills, knowledge, and competencies needed:

```markdown
- **<Skill or Role>.** <What they contribute and why they are needed.>
```

#### 2.3 Processes

**Heading:** `### 2.3  Processes`

Describe the methods, procedures, and workflows that make this capability operational:

```markdown
- **<Process Name>.** <What it does and how it supports the capability.>
```

#### 2.4 Technology

**Heading:** `### 2.4  Technology`

Describe the technology requirements in **technology-agnostic** terms. This section bridges to the ABB layer — state what technology capabilities are needed, not which products deliver them. Specific products belong in SBBs.

```markdown
- **<Technology Need>.** <What it must provide.>
```


### Section 3 — Maturity

**Heading:** `## 3  Maturity`

#### 3.1 Maturity Model

**Heading:** `### 3.1  Maturity Model`

Assess the capability against the following maturity scale:

| Level | Name | Description |
|-------|------|-------------|
| **0** | None | Capability does not exist. |
| **1** | Initial | Ad-hoc, manual, inconsistent. |
| **2** | Developing | Some automation, documented processes, repeatable. |
| **3** | Defined | Standardised, consistent, proactive. |
| **4** | Managed | Quantitatively managed, SLAs tracked, measured. |
| **5** | Optimising | Continuous improvement, data-driven optimisation, innovation. |

#### 3.2 Current Assessment

**Heading:** `### 3.2  Current Assessment`

| Property | Value |
|----------|-------|
| **Current Maturity** | `0` – `5` |
| **Target Maturity** | `0` – `5` |
| **Assessment Date** | `YYYY-MM-DD` |
| **Assessor** | Name or team |

Provide a brief narrative explaining the current maturity rating — what evidence supports the assessment and what gaps exist.

#### 3.3 Maturity Roadmap

**Heading:** `### 3.3  Maturity Roadmap`

Describe the key steps needed to move from the current maturity level to the target. Each step should be a bullet:

```markdown
- **<Current> → <Target>.** <What must change to advance.>
```

This section is optional for L1 and L2 capabilities. It is REQUIRED for L3 capabilities.

#### 3.4 Definition Stage

**Heading:** `### 3.4  Definition Stage`

State how far the capability has been defined, as a stage on the [definition ladder](./standard-definition-ladder.md), per flow where the capability has more than one. The table mirrors `flows[]` in the front matter:

| Flow | Name | Stage | Blocking the next stage |
|------|------|------|------------------------|
| `take-order` | Take an order | `R2` | CN-004 has no accepted decision record |

A flow is a named path through the capability that someone would recognise as a job being done. The capability as a whole sits at the stage of its lowest flow. Where `/architecture stage` is available, copy the derived stage and blocker rather than asserting them. A capability with no declared flows states one stage for the whole capability.

This section is optional until the capability is being planned as stage movements, and RECOMMENDED from then on.


### Section 4 — ABB Realisation

**Heading:** `## 4  ABB Realisation`

This section defines the relationship between this capability and the Architecture Building Blocks that realise it. This is the critical traceability link in the meta-model.

#### 4.1 Relationship Model

**Heading:** `### 4.1  Relationship Model`

The capability-to-ABB relationship follows these rules:

- The relationship is **many-to-many**: a single L3 capability may be realised by multiple ABBs, and a single ABB may contribute to multiple capabilities.
- Only **L3 capabilities** map directly to ABBs. L1 and L2 capabilities aggregate their children's mappings.
- **Cross-cutting ABBs** (e.g. IAM, Observability, Governance) are referenced by most capabilities but are not "owned" by any single capability. Mark these as `cross-cutting` in the mapping table.
- A capability that has no ABB realisation yet is a **gap** — the architecture does not yet support this business need.

#### 4.2 ABB Mapping

**Heading:** `### 4.2  ABB Mapping`

A table mapping this capability to its realising ABBs:

| ABB ID | ABB Name | Relationship | Coverage | Notes |
|--------|----------|-------------|----------|-------|
| [ABB-NNN](https://github.com/dermot-obrien/ai-assisted-architecture/tree/main/building-blocks/architecture-building-blocks/ABB-NNN/) | Name | `primary` / `supporting` / `cross-cutting` | `full` / `partial` | Optional notes |

**Relationship types:**

- **Primary.** The ABB directly realises a core aspect of this capability. Removing it would eliminate the capability.
- **Supporting.** The ABB provides functionality that enhances or enables the capability but is not its primary purpose.
- **Cross-cutting.** The ABB is a shared concern (IAM, Observability, Governance) that applies to this capability as it does to most others.

**Coverage:**

- **Full.** The ABB covers all of the technology needs described in Section 2.4 for this mapping.
- **Partial.** The ABB covers some but not all of the technology needs. Other ABBs or future work are needed.

#### 4.3 Gaps

**Heading:** `### 4.3  Gaps`

List any technology needs from Section 2.4 that are not yet realised by an ABB:

```markdown
- **<Technology Need>.** <What is missing and what the impact is.>
```

If there are no gaps, state "All technology needs are realised by the mapped ABBs."


### Section 5 — Sub-Capabilities

**Heading:** `## 5  Sub-Capabilities`

For L1 and L2 capabilities only. List the child capabilities:

| Capability ID | Name | Level | Maturity |
|---------------|------|-------|----------|
| [CAP-NNN](https://github.com/dermot-obrien/ai-assisted-architecture/tree/main/standards/CAP-NNN/) | Name | L2 / L3 | 0–5 |

For L3 capabilities, this section is omitted.


### Section 6 — Revision History

**Heading:** `## 6  Revision History`

A table tracking all changes:

| Version | Date | Change Type | Description |
|---------|------|-------------|-------------|
| 0.1 | YYYY-MM-DD | Initial Draft | Placeholder definition created. |

**Change Type** values: `Initial Draft`, `Initial Review`, `Architecture Review`, `Approved`, `Deprecated`.

Entries are listed in reverse chronological order (newest first).


## Definition Stage and Maturity

A capability carries two measures that are easy to confuse. They are different axes and they are never combined into one score.

| | Definition stage | Maturity |
|---|---|---|
| Measures | How completely the capability has been defined and made ready | How well the capability performs once it operates |
| Scale | R0 Unrecognised to R6 In service | 0 None to 5 Optimising |
| Evidence | The artefacts that exist: capability, ABBs, considerations, decision records, SBBs, patterns, and linked implementation evidence | An assessment of the running capability by an assessor |
| Recorded in | `flows[].stage`, and derivable by `/architecture stage` | `maturity.current` and `maturity.target` |
| Moves | While the capability is defined and built | Once the capability is in service |

The two meet at R6. Maturity only means something for a capability that is in service, and before that the ladder is the measure that moves. Where something already operates for a capability below R6 (built ahead of its definition), its maturity can be assessed, but that does not raise the stage: the running system is latent evidence until the stages beneath it exist.

Neither is `lifecycle_state`, which says which version of the capability document is meant (baseline, in-flight, target or retired). See the [Definition Ladder Standard](./standard-definition-ladder.md#4-what-the-ladder-is-not).


## Capability Model File (`capability-model.md`)

The workspace MUST contain a `capability-model.md` file in its capability directory that provides the complete capability taxonomy. This is the master index of all capabilities.

The taxonomy is one flat registry table, not a tree of nested headings. The hierarchy is carried by an explicit `Parent ID` column, so re-parenting a capability edits one cell, the whole model reads and sorts as a single table, and the derived CSVs are a direct projection of it. The foundation seed's `capability-model.md` is the reference example of this form.

### Structure

```markdown
# Capability Model

## Canonical Capability Registry

| Capability ID | Name | Level | Parent ID | Platform | Current Maturity | Target Maturity |
|---------------|------|-------|-----------|----------|------------------|-----------------|
| [CAP-001](./CAP-001/) | Name | L1 | `-` | — | 0–5 | 0–5 |
| [CAP-002](./CAP-002/) | Name | L2 | `CAP-001` | PL-NNN Name | 0–5 | 0–5 |
| [CAP-004](./CAP-004/) | Name | L3 | `CAP-002` | PL-NNN Name | 0–5 | 0–5 |

### Hierarchy rules

1. Capability depth is capped at three levels: L1 -> L2 -> L3.
2. `CAP-NNN` identifiers are stable and non-semantic. They do not encode hierarchy.
3. Re-parenting a capability updates `Parent ID` and links only; it does not require renumbering.
4. Only L3 capabilities map directly to ABBs.

## Capability-to-ABB Traceability Matrix

| Capability | ABB-NNN Name | ABB-NNN Name |
|------------|--------------|--------------|
| **CAP-004** Name | **Primary** | Cross-cutting |
```

Rows are ordered by level, then by identifier. `Parent ID` is `-` for an L1 capability. `Platform` is the providing Platform (`PL-NNN` and its name), `—` where the capability spans platforms. The traceability matrix has one row per L3 capability and one column per ABB, with each cell `Primary`, `Supporting`, `Cross-cutting` or `-`.

### Derived CSVs

Two CSVs sit beside `capability-model.md` for tools. They are derived from it and never edited by hand:

| File | Columns | Derived from |
|---|---|---|
| `capability-hierarchy.csv` | `capability_id,capability_name,level,parent_id,domain,path,status,current_maturity,target_maturity` | The registry table, one row per capability |
| `capability-abb-mapping.csv` | `capability_id,capability_name,abb_id,abb_name,relationship,coverage,scope_relevance,source_capability_path,source_section,last_verified` | The traceability matrix, one row per non-empty cell |

In the mapping CSV, coverage and scope follow the relationship by a fixed rule: `primary` is `full` and `core`, `supporting` is `partial` and `core`, `cross-cutting` is `full` and `context`. The framework's own seed is regenerated with `scripts/gen-capability-csvs.mjs`; a workspace regenerates its copy after every change to the registry or the matrix.

### Rules

- Every capability folder MUST have a corresponding row in the registry table of `capability-model.md`.
- The registry table is the authoritative source for the hierarchy (parent-child relationships). A capability document's `parent` MUST match its `Parent ID`.
- Maturity values in the registry MUST match the values in individual capability documents.
- The CSVs MUST match the registry and the matrix. A CSV that disagrees with `capability-model.md` is stale, and the Markdown wins.
- Do not group the registry under per-L1 or per-L2 headings. A view grouped by hierarchy, such as a capability map, is a diagram generated from the registry (see the [Capability Diagram Standard](./standard-capability-diagram.md)), not a second copy of it.


## Conventions

- **Language:** Use British English spelling (e.g. "organisation", "optimisation", "behaviour").
- **Tone:** Technology-agnostic. No product or vendor names in capability documents; those belong in SBBs.
- **Horizontal rules:** Do not use `---` horizontal rules between sections. Markdown headings provide sufficient visual separation.
- **Cross-references:** All links to ABBs MUST use relative folder paths (e.g. `../../building-blocks/architecture-building-blocks/ABB-001/`). All links to sibling capabilities use `../CAP-NNN/`. See the [Traceability & Hierarchy Standard](../standard-traceability.md) for full rules.
- **Bullet lead-ins:** When a bullet starts with a bold term, follow it with a full stop and a space, not a dash. Write `**Name.** Description text.` not `**Name** — Description text.`
- **L3 granularity:** An L3 capability should be specific enough that it maps to 1–5 ABBs. If an L3 maps to more than 5 ABBs, consider splitting it into multiple L3 capabilities. If it maps to zero ABBs, it is either a gap (document in Section 4.3) or too abstract (demote to L2 and create L3 children).


## AI Agent Self-Verification Checklist

Before finalising a capability document, verify:

1. [ ] **Folder-Relative Links**: Did you use folder-relative paths for all links? (No `index.md` in links).
2. [ ] **Technology-Agnostic**: Is the language free of specific product or vendor names?
3. [ ] **Correct Identifier**: Does the `CAP-NNN` identifier follow the sequential order and match the folder name?
4. [ ] **Level Correct**: Is the capability level (L1/L2/L3) consistent with its position in the hierarchy?
5. [ ] **Parent Set**: For L2/L3 capabilities, is the parent capability ID set correctly?
6. [ ] **ABB Mapping (L3)**: Does Section 4.2 list all ABBs that realise this capability?
7. [ ] **Gaps Documented**: Are unmet technology needs listed in Section 4.3?
8. [ ] **Maturity Assessed**: Does Section 3.2 contain a current maturity assessment?
9. [ ] **Taxonomy Updated**: Does the capability have a row in the registry table of `capability-model.md`, and do the derived CSVs match it?
10. [ ] **British English**: Did you use British English spelling?
11. [ ] **Sub-Capabilities (L1/L2)**: Does Section 5 list all child capabilities?
12. [ ] **Stage Not Maturity**: If a definition stage is stated, is it kept separate from the maturity score, and does the capability sit at its lowest flow's stage?


## Quick Reference Sections

1. **Purpose**: Why this capability is needed (business-driven).
2. **Capability Definition**: Organisation + People + Processes + Technology.
3. **Maturity**: Current assessment, target, and roadmap, plus the definition stage per flow.
4. **ABB Realisation**: Mapping table, relationship types, coverage, and gaps.
5. **Sub-Capabilities**: Children (L1/L2 only).
6. **Revision History**: Semantic versioning log.
