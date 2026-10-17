# Examples

Worked examples that ship with this repository, and what each one shows. Paths are relative to the repository root. The standards' examples a skill compares against are also in that skill's `references/standards/`.

## Artefacts written to the standards

Each standard carries a worked example the skills compare their output against.

| Example | Shows | Used by |
|---|---|---|
| `standards/building-blocks/architecture-building-blocks/example/` | A complete ABB: `index.md`, `summary.md`, the components and summary draw.io diagrams and their PNG exports | [/architecture abb](skills/architecture/abb.md) |
| `standards/building-blocks/architecture-building-blocks/example-requires/` | Five ABBs (`ABB-010` to `ABB-014`) whose `requires` lists form a dependency graph, for gap analysis | [/architecture abb](skills/architecture/abb.md), [/architecture stage](skills/architecture/stage.md) |
| `standards/building-blocks/solution-building-blocks/example/` | A simple SBB mapping each ABB component to a product, with its diagrams | [/architecture sbb](skills/architecture/sbb.md) |
| `standards/building-blocks/solution-building-blocks/example-composite/` | A composite SBB with parts, ports and connectors (`index.md`), and the C4 System Context view of the same system from outside (`c4-context.md`) | [/architecture sbb](skills/architecture/sbb.md) |
| `standards/ontology/example-identity-platform.json` | One platform described in the modernisation ontology: capabilities, components, changes and milestones | [Ontology](ontology.md) |

## The foundation seed

`foundation/` is a complete, generic platform-as-product model you can seed into a workspace
([Concepts](concepts.md#the-foundation-seed)) or read as a larger example of every artefact
kind:

| Folder | Holds |
|---|---|
| `foundation/strategy/outcomes/`, `use-cases/` | 13 outcomes (`OC-NNN`) and 5 use cases (`UC-NNN`) |
| `foundation/platforms/` | 12 platforms (`PL-NNN`) |
| `foundation/capabilities/` | 44 capabilities across L1, L2 and L3, with `capability-model.md` and its two CSVs |
| `foundation/contexts/` | 12 bounded contexts (`BC-NNN`) |
| `foundation/building-blocks/` | 8 ABBs and 3 SBBs with full diagram sets |
| `foundation/profiles/` | The `core`, `integration` and `infrastructure` profiles the seeder copies |

To see what the profiles would copy into your workspace without writing anything, run this from the workspace root, with `<aaa>` a clone of this repository:

```bash
node <aaa>/scripts/seed-foundation.mjs --profile all --dry-run
```

## A workspace at every stage

`skills/architecture/tests/fixtures/workspace/` is a small order-handling workspace built for the
`/architecture stage` tests. It has one capability at each stage from R1 to R6, one held back by an open
consideration, one whose decision was superseded, one with two flows at different stages, and
one named only by a pattern. It carries its own `skill-bindings.toml`, so you can run the
skill against it directly from a clone of this repository:

```bash
python skills/architecture/bin/stage.py --bindings skills/architecture/tests/fixtures/workspace/skill-bindings.toml
```

```text
Capability  Flow           Stage            Recorded    Blocking the next stage
----------  -------------  ---------------  ----------  ----------------------
CAP-001     -              R1 Named                     CAP-001 names no ABB in realised_by_abbs (+1 more)
CAP-002     -              R2 Bounded                   no pattern realises CAP-002: add realises: [CAP-002] to a logical pattern
CAP-003     -              R3 Decided                   no SBB realises ABB-002 (+1 more)
...
CAP-006     -              R6 In service                top of the ladder
...
```

Read its documents side by side with the report to see which front matter earns each stage.
[Configuration](configuration.md#front-matter-read-by-the-stage-flow) lists the fields.

## The quick start

The [quick start](quick-start.md) builds a small example of its own: a capability
`CAP-100 Order Notifications` with one flow, taken from R1 to R2 by adding an ABB.
