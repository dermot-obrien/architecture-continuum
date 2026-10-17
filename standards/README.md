# AI-Assisted Architecture Standards

This directory contains the canonical standards for all architectural layers in the framework. All AI agents and architects MUST follow these standards when creating or modifying artefacts.

## Directory Structure

| Folder | Layer | Purpose |
| :--- | :--- | :--- |
| `strategy/` | **Strategy & Operational** | Outcomes and Use Cases. |
| `platforms/` | **Organisational** | Platform definitions, ownership, and grouping. |
| `capabilities/` | **Business** | Capability definitions and mapping. |
| `contexts/` | **Solution** | Bounded Context boundaries and model ownership. |
| `building-blocks/` | **Logical & Physical** | ABBs and SBBs. |
| `runtime/` | **Runtime** | Services and execution units. |
| `ontology/` | **Model** | The modernisation ontology (entities, schema, CLI tooling). |
| `agent-native/` | **Operating model** | How the framework operates when most engineers/architects are AI agents (builds on every layer above). |
| `visual-design/` | **Visual** | Colour palette, typography, and diagram styling. |

## Key Standards

- **[Platform Standard](./platforms/platform-standard.md)**: The primary organisational and architectural unit.
- **[Traceability & Hierarchy Standard](./standard-traceability.md)**: The "Golden Thread" linking all layers.
- **[Building Block Calibration Standard](./building-blocks/standard-building-block-calibration.md)**: The grain of an ABB and an SBB, calibrated against the C4 model. A building block is one container: never a component or code, never a whole system.
- **[Definition Ladder Standard](./capabilities/standard-definition-ladder.md)**: How far a capability has been defined, as a stage from R0 to R6 that is checked against the artefacts that exist.
- **[Frontmatter Standard](./standard-frontmatter.md)**: The universal artefact envelope (machine-validatable via [`schemas/v1.1.0/`](./schemas/v1.1.0/)).
- **[Agent-Native Architecture](./agent-native/README.md)**: The operating model for an AI-majority workforce — principles, the author→verify→reconcile loop, the provenance envelope, executable contracts, and continuous reconciliation.
- **[Visual Design Standard](./visual-design/visual-design-standard.md)**: The core UI/UX rules for diagrams and docs.

## Enforcement

Agents use the `triggers:` section in the YAML front matter of each standard to determine which rules to apply to a specific task.
