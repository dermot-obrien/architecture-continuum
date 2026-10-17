# AAW Work Seam — Decisions & Interventions ↔ Architecture

This document defines how AI-Assisted Architecture (**AAA**) connects to the
[AI-Assisted Work](https://github.com/dermot-obrien/ai-assisted-work) **work-classification
standard** (`work-classification.md`). It lets architecture artefacts and work items share
one vocabulary without drift.

## The seam in one line

> **Architecturally significant work surfaces in AAA as artefacts.** A *decision* becomes a
> Decision Record; a cross-cutting *intervention* becomes (or revises) a Capability / ABB / SBB.

AAW classifies every unit of work (chore · change · intervention · inquiry). Most never
touch architecture. The two that do:

- a **decision** deliverable (produced by any class of work, or by an AAR inquiry), and
- an **intervention** whose blast radius is *cross-cutting* and touches the architecture.

## Decisions → Decision Records (ADRs)

Any AAW work that makes an architecturally significant choice produces a **decision**
deliverable. That decision seams to AAA as a **Decision Record (`DR-NNN`)** — the
first-class metamodel element for architectural decisions (MADR body + Y-statement
frontmatter, with `change_type` and `affects_artefacts` relations).

```
AAW work (any class) → decision deliverable → AAA Decision Record (DR-NNN)
```

The work item records *what was done*; the Decision Record records *what was decided and
why*, and links to the artefacts it affects.

## Cross-cutting interventions → Capability / ABB / SBB

An AAW **intervention** (known · cross-cutting) that changes shared architecture maps onto
AAA's building blocks — created or revised via the `create-*` agents:

| The intervention changes… | AAA artefact | Agent |
|---------------------------|--------------|-------|
| a business/operational capability | **Capability** (`CAP-NNN`) | `create-capability` |
| a reusable architecture pattern | **Architecture Building Block** (`ABB-NNN`) | `create-abb` |
| a concrete technology realisation | **Solution Building Block** (`SBB-NNN`) | `create-sbb` |
| a bounded context / platform / service | Context · Platform · Service | `create-context` / `create-platform` / `create-service` |
| a baseline → target migration | the artefacts' `lifecycle_state` (`baseline`, `target`), moved by **Decision Records** (`DR-NNN`) | `create-*` for the artefact |
| a shortfall knowingly taken on | **Technical debt** (`TD-NNN`), a consequence of a Decision Record | (recorded with the decision) |

A `chore` or `change` rarely reaches here — by definition they're not cross-cutting. When
they unexpectedly are, AAW's *promotion* rule applies: the work is re-triaged up to an
intervention, and the architecture artefacts above come into play.

## Direction of flow

- **AAW → AAA**: a delivery item that's architecturally significant emits a Decision Record
  and/or revises building blocks.
- **AAA → AAW**: an architecture initiative (e.g. "introduce capability X") is itself an AAW
  **intervention** — it's planned and executed through AAW's work lifecycle, with AAA's
  `architecture-work` type and deliverables.
- **AAR → AAA**: a *validated* research decision (see AAR's inquiry seam,
  `docs/aaw-inquiry-seam.md` in AI-Assisted Research) lands as a Decision Record here
  before AAW delivers it. AAR's `/aar-sync-research-result` proposes the record, citing the
  hypothesis node and its work item, when a finding settles an architectural choice.

## Planning, deliverables and definition stages

Planning is the third seam. AAW plans architecture work a period at a time; AAA says what
that work has made true. The unit that joins them is a definition stage, a stage on the
[definition ladder](capabilities/standard-definition-ladder.md): a piece of architecture work
is framed as moving one capability area's flows from one definition stage to another, and a
planning period opens with the grid of where each area starts and where it is committed to
finish. A definition stage says how far a capability has been defined and built towards
service; it is not a stage of the delivery lifecycle, which AAW owns. The stages were called
rungs before; the `rung` column and keys are still read.

### Deliverable types map to artefact kinds, and so to definition stages

Each deliverable type in a workspace's deliverable register names the AAA artefact kind it
produces. The artefact kind decides the definition stage the deliverable evidences, so a named product
says which stage it moves toward. A typical mapping:

| Deliverable type | AAA artefact kind | Definition stage it evidences |
|------------------|-------------------|-------------------|
| Capability definition | Capability (`CAP-NNN`) | R1 Named |
| Building block specification | ABB (`ABB-NNN`) | R2 Bounded |
| Open question | Consideration (`CN-NNN`) | R2 Bounded |
| Decision | Decision Record (`DR-NNN`) | R3 Decided |
| Logical pattern | Pattern, every box an ABB | R3 Decided |
| Product mapping | SBB (`SBB-NNN`) | R4 Buildable |
| Cost model | A `cost-model` reference on the physical pattern | R4 Buildable |
| Physical pattern | Pattern, every box an SBB | R4 Buildable |
| Evaluation received | An `evidence` reference on the physical pattern | R5 Proven |
| Runbook received | A `runbook` reference, and the capability `active` | R6 In service |

The register records the definition stage in its own `stage` column, using the stage identifiers of the
workspace's ladder. The names of the deliverable types belong to the workspace; the artefact
kinds and stages are AAA's. R5 and R6 are received from implementation, so their deliverables
are links, not documents architecture writes.

### The ladder AAW reads

AAW's quarter planning reads a ladder as a CSV with the columns `stage,name,description`. AAA
ships one at `standards/capabilities/definition-ladder.csv`. A workspace that adopts the AAA
ladder binds that file, or its own governed copy of it, as the planning skill's ladder, so
both frameworks name the same stages.

### Derived definition stages feed the framing

`/architecture stage` derives each capability's definition stage, per flow, from the artefacts that exist, and names
the artefact that blocks the next stage. Its `--json` output is what planning consumes:

- **Starting stage.** An epic's "from" stage is the derived stage at the start of the period, not
  a claim. A framing whose "from" is above the derived stage is claiming evidence that does not
  exist yet.
- **Products.** The blocker `/architecture stage` names is the first product the epic needs. Each target
  stage should have at least one named product whose deliverable type evidences it.
- **Close.** At the end of the period the stage reached is read again from `/architecture stage`, not
  asserted, and any unfinished movement carries into the next period's grid as its start.

Criteria follow the same rule. An outcome measure has an identifier of the form `OC-NNN-M<n>`
(see the [Strategy Standard](strategy/standard-strategy.md)), and planning cites those
identifiers as `advances_criterion_ids` to say which measures a piece of work moves.

## Vocabulary alignment (no drift)

| Concept | AAW | AAA |
|---------|-----|-----|
| an architectural choice | a `decision` deliverable | Decision Record (`DR-NNN`) |
| cross-cutting change | class `intervention` | Capability / ABB / SBB revision |
| architecture project | `architecture-work` work item | the work that produces AAA artefacts |
| baseline vs target | release / version | `lifecycle_state` on each artefact |
| progress of architecture work | an epic's movement between definition stages, per flow | a definition stage, derived by `/architecture stage` |
| what a product evidences | deliverable type and its `stage` | artefact kind |
| a criterion work advances | `advances_criterion_ids` | an outcome measure id (`OC-NNN-M<n>`) |

AAA owns the *architecture metamodel and artefacts*; AAW owns the *class definitions and the
delivery lifecycle*. The seam is `decision → DR`, `cross-cutting intervention → building
blocks`, and `deliverable type → artefact kind → definition stage`.

See AAW's `docs/concepts/work-classification.md` for the full taxonomy,
and AAA's `standard-metamodel.md` for the artefact definitions.
