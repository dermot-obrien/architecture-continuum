# Architecture ontology module

`architecture.schema.json` is the architecture layer of the layered ontology that DD-11 of
[AI-Assisted Work](https://github.com/dermot-obrien/ai-assisted-work) sets out, identified as
`pkg:generic/dermot-obrien/architecture-continuum/architecture-ontology@2.0.0`. `bundle.json`
names it and the range of the work layer it builds on.

| Layer | Module | Holds |
|---|---|---|
| Work | `work-ontology`, AI-Assisted Work | WorkItem, Activity, Task, Initiative, Deliverable, Stakeholder |
| Delivery | `delivery-ontology`, delivery-planning | Epics, stories, capacity, products, feature requests |
| Architecture | this module | The seam to work, and the architecture concepts by name |

It holds:

- `ArchitectureWork`, a work layer WorkItem that produces architecture artefacts, with the
  outcome measures it advances (`advances_criterion_ids`), and `ArchitectureDeliverable`, a
  work layer Deliverable that names the `artefact_kind` it produces and the `artefact_ids`
  it produced or revised. This is the seam in [aaw-work-seam.md](../standards/aaw-work-seam.md):
  a decision deliverable becomes a Decision Record, and the kind of artefact a deliverable
  produces decides the stage it evidences.
- The architecture concepts of the base ontology, `standards/ontology/ontology-schema.json`,
  each by `$ref`: Platform, Capability, Component, Interface, Integration, Change, Driver,
  Theme, Transition, Opportunity, UseCase, Decision, Pattern, Standard, QualityAttribute, Risk, Control,
  Viewpoint, View and the reference and dependency domains. One definition, two names.

It is additive. The base ontology is unchanged, and a repository validating against it
validates exactly as before. Initiative, the programme and delivery types, Stakeholder,
ExternalReference and Notes are not named here, because DD-11 places them in the work and
delivery layers; they move there with the base ontology's next major version, which needs
its own migration note.

`scripts/test-architecture-ontology.mjs` checks the module against the base ontology's worked
example and against cases it must refuse.
