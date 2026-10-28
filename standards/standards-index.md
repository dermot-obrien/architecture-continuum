# Agent Configuration

This file defines top-level discovery and precedence rules for AI agents working with this framework. Paths are relative to the root of this repository. Each skill under `skills/<name>/` carries its own copy of the standards it reads in `references/standards/`, and its own resolution rules in `references/standards-discovery.md`; this file is the overview across them.

## Agent Skills

Installed one by one, or all together from `bundle.json`, with AI-Assisted Work's `bin/skills.mjs` into `.agents/skills/`, with `.claude/skills/` linked at them when `.claude` exists.

| Skill | Invoke | Description |
|-------|--------|-------------|
| Create Outcome/UC | `/architecture strategy` | Strategic and operational layer creation. |
| Create Platform | `/architecture platform` | Defining business platforms and strategic ownership. |
| Create Capability | `/architecture capability` | End-to-end capability creation and maturity mapping. |
| Create Context | `/architecture context` | Defining Bounded Contexts and linguistic boundaries. |
| Create ABB | `/architecture abb` | End-to-end ABB creation: logical structure and diagrams. |
| Create SBB | `/architecture sbb` | End-to-end SBB creation: product mapping, realisation, composite structure. |
| Create Service | `/architecture service` | Runtime unit of execution definition. |
| Derive Stage | `/architecture stage` | Read-only. Derives each capability's stage on the definition ladder, per flow, and names the artefact blocking the next stage. See `standards/capabilities/standard-definition-ladder.md`. |
| Create Runtime Agent | `/architecture runtime-agent` | (Builder skill) Author an autonomous **runtime agent** as a catalogued service with run-time guardrails, contracts, capability scope, and output provenance. See `standards/agent-native/agent-types.md`. |

## Scripts

| Script | Path | Prerequisites | Description |
|--------|------|---------------|-------------|
| Seed Foundation | `scripts/seed-foundation.mjs` | Node.js 18+ | Optional. Seeds workspace `capabilities/` and `building-blocks/` from foundation profiles (`core`, `integration`, `infrastructure`). Run from a clone with `--workspace <dir>`. No skill needs the seed. |

## Canonical Standards

Always load these standards before creating or modifying artefacts.

> The skills resolve these by searching the workspace first and falling back to their own copy in `references/standards/`, so they keep working when an organisation governs its standards in its own tree (for example under `governance/standards/`). See any skill's `references/standards-discovery.md`.

- **Visual design standard** - search the workspace for a folder named `visual-design` containing `visual-design-standard.md`. If found, load it. If not found, fall back to `standards/visual-design/visual-design-standard.md` (in a skill, `references/standards/visual-design/visual-design-standard.md`).
- `standards/strategy/standard-strategy.md`
- `standards/platforms/platform-standard.md`
- `standards/capabilities/standard-capability-document.md`
- `standards/capabilities/standard-capability-diagram.md`
- `standards/capabilities/standard-definition-ladder.md`
- `standards/contexts/standard-bounded-context.md`
- `standards/building-blocks/standard-building-block-calibration.md`
- `standards/building-blocks/architecture-building-blocks/standard-abb-document.md`
- `standards/building-blocks/architecture-building-blocks/standard-abb-diagram.md`
- `standards/building-blocks/solution-building-blocks/standard-sbb-document.md`
- `standards/building-blocks/solution-building-blocks/standard-sbb-diagram.md`
- `standards/runtime/standard-service.md`
- `standards/standard-traceability.md`
- `standards/standard-frontmatter.md` *(v1.1.0)*

For **agent-native** workspaces (AI-majority engineering), also load:
- `standards/agent-native/agent-types.md` *(builders vs runtime agents)*
- `standards/agent-native/principles.md`
- `standards/agent-native/operating-model.md`
- `standards/agent-native/provenance.md`

For reviewing a design (draft, not yet read by any skill):
- `standards/assessment/standard-architecture-assessment.md` *(depths, lenses, findings and verdict; the line with cybersecurity assessment)*
- `standards/assessment/schemas/` *(design specification, lens and assessment record schemas)*
- `standards/assessment/lenses/` *(the core, ai-solution, ai-agent and production lenses)*

## Scope Routing

- For business outcomes and use cases, apply `standard-strategy.md` via `/architecture strategy`.
- For business platforms, apply `platform-standard.md` via `/architecture platform`.
- For capability documents, apply `standard-capability-document.md` via `/architecture capability`.
- For capability diagrams (maps and traceability matrices), apply `standard-capability-diagram.md`.
- For how far a capability has been defined, apply `standard-definition-ladder.md`, and derive the stage with `/architecture stage`.
- For bounded context definitions, apply `standard-bounded-context.md` via `/architecture context`.
- For whether something is an ABB, an SBB, a component inside one, or a whole system, apply `standard-building-block-calibration.md` before `/architecture abb`, `/architecture sbb`, or a pattern's building-block table.
- For ABB narrative/content documents, apply `standard-abb-document.md` via `/architecture abb`.
- For SBB narrative/content documents, apply `standard-sbb-document.md` via `/architecture sbb`.
- For runtime services, apply `standard-service.md` via `/architecture service`.
- For runtime agents, apply `agent-specification.md` via `/architecture runtime-agent`.
- For links between all layers, apply `standard-traceability.md`.
- For the YAML frontmatter on every catalog artefact, apply `standard-frontmatter.md` *(v1.1.0)*. Schemas at [`standards/schemas/v1.1.0/`](../standards/schemas/v1.1.0/).

## Enforcement Rules

- Traceability requirements (**Outcome → Use Case → Platform → Capability → Context → ABB → SBB → Service**) must be applied to every new artefact.
- A building block is one C4 container (`standard-building-block-calibration.md`): no ABB or SBB is created for a component or for code, and none stands for a whole system, which is a Capability.
- Colour references must use identifiers (e.g., `1.1`) from the visual design standard.
- Cross-references must use folder-relative paths and must not append `/index.md`.

## Discovery Check (Agent Self-Check)

Before finalising any artefact, confirm:

1. All canonical standards above were loaded for the relevant artefact type.
2. The specific Agent Skill (e.g. `skills/architecture/SKILL.md`) was followed in order, with no phase skipped.
3. The **AI Agent Self-Verification Checklist** from the relevant standard was executed.
4. The "Golden Thread" of traceability back to a Strategic Outcome is intact.
