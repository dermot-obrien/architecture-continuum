# The skill bundles: a landscape

The bundles the author keeps, arranged by what depends on what, with what exists and what is still needed. It is the continuum applied to its own tooling: each bundle is a platform in the continuum's sense, team-owned and self-service, its skills are the services a workspace consumes, and `bundle.json` and the installer are the contracts between them. The page lives here because the continuum is where the definitions live, and this landscape is the first thing that uses them on something real. The bundle format itself, `bundle.json`, the post-install check and the work ontology, is documented in [AI-Assisted Work](https://github.com/dermot-obrien/ai-assisted-work/blob/main/docs/integration/skill-bundles.md), which owns the installer.

![The skill bundles in five layers: foundations (the installer, diagram-model, markdown-deck), method bundles (architecture-pattern, delivery-planning, ai-assisted-research, ai-assisted-work, threads), the architecture catalogue (architecture-continuum), a scaffolding layer that is still needed, and the solutions that install them in one of two styles](landscape.svg)

The source is [landscape.drawio](landscape.drawio); the SVG is its export.

## The rule

Dependencies point down only. A bundle depends on bundles in the layers below it and never on a repository above it. A skill carries its method and its standards, and the repository that installs it declares where its artefacts live, in `.agents/skill-bindings.toml`. The catalogue layer owns the definitions, [the continuum](continuum.md), and no method bundle redefines them.

## The layers

| Layer | Bundles | State |
|---|---|---|
| L0 Foundations | AI-Assisted Work's installer and bundle format (`bin/skills.mjs`, the `bundle.json` schema, `skills.json` and its lock, the work ontology); `model` from diagram-model; `markdown-deck` | Exist. A workspace pins each bundle by release tag |
| L1 Method | `pattern`, `use-case` and `cross-reference` from architecture-pattern; `quarter-planning` from delivery-planning; `research` and `literature-discovery` from ai-assisted-research; `work` from ai-assisted-work; `thread` from threads; the landscape deck, a tool rather than a skill | Exist |
| L2 Catalogue | This bundle: one `architecture` skill with a flow per construct (strategy, platform, capability, context, abb, sbb, service, runtime-agent, stage), which also carries the continuum, the standards each flow reads, the front matter schemas, the architecture ontology and the definition ladder | The flows exist; they were nine `aaa-*` skills, now folded into one. The product, node and landscape flows are needed |
| L3 Scaffolding | `scaffold-architecture`, which scaffolds or validates a solution's architecture against the continuum, in either style below; `scaffold-implementation`, which builds a hexagonal skeleton from the catalogue's contexts and services; `reconcile`, which reports drift between the two and fails CI when a deployable has no catalogue entry | Needed. The first is built against patternode-architecture, then run against knowledge-store |
| L4 Solutions | patternode-architecture and patternode-platform; knowledge-store; life-guide-internal; the next solution | The exemplar exists; the rest are brought to the continuum one at a time |

## Where a solution's architecture lives

Two styles, and the scaffolding skill supports both.

| Style | When | Example |
|---|---|---|
| A, a repository of its own | A platform with several implementation repositories, or one whose architecture outlives any implementation. Architecture leads: the design is settled there first, and each implementation links back to it | patternode-architecture, the exemplar and the house profile, with patternode-platform implementing it |
| B, under `docs/` of the component's own repository | A standalone component that is released as one unit, so its architecture versions with its code. The same constructs, registers and identifiers, in one folder beside the implementation | knowledge-store, expressed with the continuum first; its decoupling into contexts and adapters follows the architecture rather than gating it. life-guide-internal does this informally today |

The style changes where the files are, not what they are. In either, the architecture is expressed in the continuum's constructs, bound through `.agents/skill-bindings.toml`, and checked by `reconcile` against what runs.

## What is needed, in order

1. The rename inside this repository: one `architecture` skill with flows, the bundle named `architecture-continuum`, lineage kept.
2. The continuum promoted to a standard every flow carries.
3. The product, node and landscape flows, with Patternode's runtime register and its missing platform and context pages as the first consumers.
4. `scaffold-architecture`, built against patternode-architecture and published, then run against knowledge-store in style B.
5. `scaffold-implementation` and `reconcile`, once the catalogue has the constructs they read.
6. The next solution, scaffolded from the house profile in whichever style fits it.
