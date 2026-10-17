# Architecture Continuum

[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](CHANGELOG.md)
[![Licence: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-blue.svg)](LICENSES/CC-BY-4.0.txt)
[![Licence: Apache-2.0](https://img.shields.io/badge/code-Apache--2.0-blue.svg)](LICENSES/Apache-2.0.txt)
[![REUSE 3.3](https://img.shields.io/badge/REUSE-3.3-lightgrey.svg)](https://reuse.software/spec-3.3/)

One vocabulary for describing a platform from the landscape it sits in down to the deployable units that run it, and the [Agent Skills](https://agentskills.io) that write each level to its standard. The continuum is the method; the skills are how an agent applies it. It works with any agent that reads Agent Skills.

## The continuum

![The continuum: the platform landscape, platform, capability, bounded context, architecture building block, solution building block, service and deployment node down the middle; outcome, use case, domain, product and module on the left; consideration, contracts, architecture pattern, reference architecture and store on the right](docs/continuum.svg)

Three bands. The demand space (landscape, platform, capability) says who owns what and what must be possible. The solution space (bounded context, architecture building block, solution building block) says how it is structured and built. The runtime (service, deployment node) says what runs where. Patterns sit beside the solution space because they compose building blocks at any scope; products sit beside the whole thing because they are what a consumer is offered and what a team runs.

Each level takes its definition from the practice that owns it, and the handovers between practices are stated rather than assumed: platform from platform engineering, capability and building block from TOGAF, domain and bounded context from domain-driven design, service and node from the C4 model and ArchiMate, with the AWS, Azure and Google Cloud Well-Architected frameworks placed where their workload and pillars land. Where this bundle departs from a source it says so, so a reader can tell current practice from a choice made here.

| Read | For |
|---|---|
| [The continuum](docs/continuum.md) | Every level defined, the relationships in one table, what is standard, practice or this bundle's choice, each contemporary framework placed on the continuum, the open decisions, and the references |
| [The schema on the continuum](docs/schema.md) | The front matter schemas drawn in the continuum's layout, generated from the schemas and checked against the continuum picture, with every relationship field listed |
| [Views of the continuum](docs/continuum-views.md) | The same continuum in seven traditions' words: C4, TOGAF, domain-driven design, ArchiMate, platform engineering, Team Topologies and the Well-Architected frameworks, each with what it defines, what it nearly defines and what it lacks, with references |
| [The skill bundles](docs/landscape.md) | The landscape of the author's skill bundles, this one among them: five layers from the installer to the solutions, what exists and what is needed, the dependency rule, and the two styles of keeping a solution's architecture |
| [`docs/continuum.svg`](docs/continuum.svg) | The diagram as published |
| [`docs/continuum.drawio`](docs/continuum.drawio) | The same diagram as an editable draw.io source, uncompressed |
| [Architectural Framework](docs/architectural-framework.md) | The reasoning behind the hierarchy, with the sources that informed it |

## What the bundle holds

| Part | Where | What it is |
|---|---|---|
| The definitions | [`docs/continuum.md`](docs/continuum.md) | The authority when a standard, a schema and a skill disagree |
| The standards | [`standards/`](standards/standards-index.md) | How each kind of artefact is written: document structure, diagrams, front matter, traceability, the definition ladder |
| The schemas | `standards/schemas/` | JSON Schemas for every kind's front matter |
| The ontology | `standards/ontology/`, [`ontology/`](ontology/README.md) | The optional queryable model, and the architecture layer that extends AI-Assisted Work's work ontology |
| The skills | [`skills/`](docs/skills/README.md) | Nine Agent Skills, each carrying its copy of the standards it reads |
| The foundation | [`foundation/`](foundation/README.md) | A starter model, seeded into a workspace by a script, optional |

## Skills

Two skills. `architecture` has a flow per level: eight write one kind of artefact each, keeping the thread from outcome to service intact, one reads the model and reports how far each capability has been defined, and one checks a whole repository against the continuum. `workspace` sets a repository up for them.

| Skill and flow | Does |
|---|---|
| [`/architecture strategy`](docs/skills/architecture/strategy.md) | Business outcomes with their measures, and the use cases that support them |
| [`/architecture platform`](docs/skills/architecture/platform.md) | Platforms with an executive owner, the capabilities they provide and the contexts they contain |
| [`/architecture capability`](docs/skills/architecture/capability.md) | Capabilities, added to the capability model |
| [`/architecture context`](docs/skills/architecture/context.md) | Bounded contexts and their ubiquitous language |
| [`/architecture abb`](docs/skills/architecture/abb.md) | Architecture building blocks with their diagrams |
| [`/architecture sbb`](docs/skills/architecture/sbb.md) | Solution building blocks, simple or composite, mapped to technologies |
| [`/architecture service`](docs/skills/architecture/service.md) | Services, the deployable units, each realising an SBB inside one context |
| [`/architecture runtime-agent`](docs/skills/architecture/runtime-agent.md) | Autonomous runtime agents with guardrails, capability scope and provenance |
| [`/architecture stage`](docs/skills/architecture/stage.md) | Read-only. Each capability's stage on the definition ladder, per flow, and what blocks the next |
| [`/architecture check`](docs/skills/architecture/check.md) | Read-only. Every page and register of an architecture against the continuum's standards, with each disagreement named; scaffolds the layout for a new repository |
| [`workspace`](docs/skills/workspace.md) | Initialises or reinitialises a repository for the skills: clears out what retired tooling left, installs the declared skills, and wires the build so it runs without them |

The flows were ten skills, `aaa-create-strategy` to `aaa-create-runtime-agent`, `aaa-rung` and `aaa-continuum`. The `aaa-` prefix was a namespace, not a meaning, so they are now one skill, as `work` and `research` became in their bundles. The skill still answers to the old names, and for one release it reads the old `[suite.aaa-*]` binding tables with a warning; [Configuration](docs/configuration.md#architecture) says how to move to the one `[suite.architecture]` table.

Every skill follows the [Agent Skills specification](https://agentskills.io/specification). CI validates them on every pull request with the specification's reference validator, `skills-ref`, and with `scripts/validate-skills.mjs`, which also checks that relative links resolve and warns when a `SKILL.md` body passes the specification's 500-line or 5,000-token guidance.

The `pattern` skill, which authors an architecture pattern as one Markdown document that is also the model and the deck, began here and lives in [architecture-pattern](https://github.com/dermot-obrien/architecture-pattern). `/architecture stage` reads a pattern's front matter.

## Install

You need git, Node.js 18 or later and Python 3.11 or later. draw.io desktop is optional, for PNG export of diagrams. No package registry is needed.

The [install quick start](docs/quick-install.md) installs the continuum and every skill it works with (`pattern`, `use-case`, `cross-reference`, `model` and `markdown-deck`) into a repository with one declaration and one command, and says how to reinstall over an installation, move to a newer release, or move from the old `aaa-*` skills. The rest of this section is the installer underneath.

Each skill is complete on its own: `architecture` carries the standards it reads, the `.aaa-config.yaml` template and its own binding resolver, and needs no other skill. Install them with `bin/skills.mjs`, the standalone skills installer in [AI-Assisted Work](https://github.com/dermot-obrien/ai-assisted-work) (AAW), from the workspace root:

```bash
git clone https://github.com/dermot-obrien/ai-assisted-work ../ai-assisted-work
git clone https://github.com/dermot-obrien/architecture-continuum ../architecture-continuum
node ../ai-assisted-work/bin/skills.mjs install --bundle ../architecture-continuum
```

Name a skill after the command to install only that one. For a team workspace, commit an `.agents/skills.json` that declares the bundle and let the installer fetch it and lock the commit:

<!-- x-release-please-start-version -->
```json
{ "sources": [ { "bundle": "https://github.com/dermot-obrien/architecture-continuum.git", "ref": "v0.6.1" } ] }
```
<!-- x-release-please-end -->

Pin a release tag, never `main`: the tag is what the lock and the release notes describe.

```bash
node scripts/skills.mjs sync --copy            # writes .agents/skills.lock.json; commit it
node scripts/skills.mjs sync --locked --copy   # after a clone: exactly the locked commits
```

A declaration or lock that still names `ai-assisted-architecture` keeps working: GitHub redirects the old repository name. Here `scripts/skills.mjs` is a copy of AAW's `bin/skills.mjs` kept in the workspace. The installer puts the skills in the workspace's `.agents/skills/`, and links `.claude/skills/` at them when a `.claude` folder exists (`--copy` copies instead). Which agent reads which folder:

| Agent | Workspace level | User level |
|---|---|---|
| VS Code with GitHub Copilot | `.agents/skills/`, `.github/skills/`, `.claude/skills/` | `~/.copilot/skills/`, `~/.agents/skills/` |
| Cursor | `.agents/skills/`, `.cursor/skills/`, `.claude/skills/` | `~/.cursor/skills/`, `~/.agents/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex | `.agents/skills/` | `~/.agents/skills/` |
| Gemini CLI | `.agents/skills/` | `~/.agents/skills/` |

Folders change between agent versions, so check your agent's documentation if a skill does not appear. To install without the installer, or for every workspace at user level, copy the `skills/architecture` and `skills/workspace` folders into one of those folders; [Installation](docs/installation.md) covers that, updating and removing.

Version 0.3.0 and earlier installed through AAW's framework engine with `aaa install`. That installer and its npm commands were removed in 0.4.0; pin the `v0.3.0` tag if you still need them.

## Quick start

After installing, seed a starter model from the clone, bind `/architecture stage` to it, and ask where each capability stands:

```bash
node ../architecture-continuum/scripts/seed-foundation.mjs --workspace .
printf '[suite.architecture]\ncapabilityDir = "../capabilities"\nabbDir = "../building-blocks/architecture-building-blocks"\n' > .agents/skill-bindings.toml
python .agents/skills/architecture/bin/stage.py
```

```powershell
node ../architecture-continuum/scripts/seed-foundation.mjs --workspace .
'[suite.architecture]', 'capabilityDir = "../capabilities"', 'abbDir = "../building-blocks/architecture-building-blocks"' | Set-Content -Encoding ascii .agents/skill-bindings.toml
python .agents/skills/architecture/bin/stage.py
```

You should see a table of seven capabilities, each with its stage and the artefact blocking the next one. Then bind the other flows and type `/architecture abb` (or any other flow) in your agent. The [quick start](docs/quick-start.md) does all of this from an empty folder, in PowerShell and bash, in about ten minutes.

## Documentation

| Page | Read it for |
|---|---|
| [The continuum](docs/continuum.md) | The definitions the bundle is built on, from the platform landscape to a deployable unit, each anchored in current practice, with the relationships in one picture and every reference |
| [The schema on the continuum](docs/schema.md) | The front matter schemas as one picture, in the continuum's layout, generated and checked |
| [Views of the continuum](docs/continuum-views.md) | The continuum in the words of C4, TOGAF, domain-driven design, ArchiMate, platform engineering, Team Topologies and the Well-Architected frameworks |
| [The skill bundles](docs/landscape.md) | The landscape of skill bundles and where a solution's architecture lives |
| [Install quick start](docs/quick-install.md) | The continuum and its related skills in one command, and reinstalling over an installation |
| [Quick start](docs/quick-start.md) | A first real result in about ten minutes |
| [Installation](docs/installation.md) | Every install route, for every agent, and updating and removing |
| [Concepts](docs/concepts.md) | Skills, bindings, standards, the golden thread and the definition ladder, in the order you need them |
| [Skills](docs/skills/README.md) | One page per skill: what it asks, writes and needs |
| [Configuration](docs/configuration.md) | Every binding key, config key and front matter field the tools read, with precedence |
| [Commands](docs/commands.md) | Every script, option and exit code |
| [Troubleshooting](docs/troubleshooting.md) | The messages the tools print, and what to do |
| [Examples](docs/examples.md) | The worked examples in this repository |
| [Ontology](docs/ontology.md) | The optional modernisation ontology and its scripts |
| [Architectural Framework](docs/architectural-framework.md) | The reasoning behind the hierarchy, with sources |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributing, and the checks to run before a pull request |
| [CHANGELOG.md](CHANGELOG.md) | What changed, release by release |

## Repository structure

```
docs/            This documentation, with the continuum (continuum.md, continuum.svg, continuum.drawio), the schema picture (schema.md, schema.svg), its views (continuum-views.md, views/) and the bundles landscape (landscape.md, landscape.svg, landscape.drawio)
skills/          The two Agent Skills: SKILL.md, inputs.toml, references/ (the architecture skill's flows and its copy of the standards), bin/
standards/       The standards the skills follow, with worked examples, the schemas, the ontology and the config template
foundation/      A generic starter model, optional, seeded into a workspace by scripts/seed-foundation.mjs
ontology/        The architecture ontology module (bundle.json names it)
scripts/         The foundation seeder, validators, ontology tools and maintainer scripts
bundle.json      Each skill's version, purl and post-install check
skill-standards.json   Which standards each skill carries a copy of
```

## Lineage

This repository was AI-Assisted Architecture from its first commit to version 0.4.0, and was renamed Architecture Continuum in October 2026. The history, the release tags (`aaa-create-abb--v0.5.0` and the rest) and the issues are this repository's, and the old repository URL redirects here. The ten `aaa-*` skills became the one `architecture` skill in the release after 0.5.0; the bundle's name and purls keep the old identifiers. The name changed because the old one named the tool rather than the method: in a practice where every artefact is written with an agent, "AI-assisted" says nothing, and the thing this bundle defines is the continuum.

The related bundles keep their names: [AI-Assisted Work](https://github.com/dermot-obrien/ai-assisted-work) for the installer, the bundle format and the `work` skill, and [AI-Assisted Research](https://github.com/dermot-obrien/ai-assisted-research) for research lineage.

## Licence

This bundle is permissively licensed to encourage the widest possible adoption: private, public, academic, and commercial. Attribution is the primary expectation.

- Documentation, standards, agent specifications, foundation seeds, diagrams ([`CC BY 4.0`](LICENSES/CC-BY-4.0.txt)): use, share, modify, and redistribute, including commercially, with attribution.
- Executable code (`scripts/`) ([`Apache-2.0`](LICENSES/Apache-2.0.txt)): same permissions, with an explicit patent grant.

Per-file licensing is declared via SPDX identifiers and the [`REUSE.toml`](REUSE.toml) manifest, following the [REUSE Specification 3.3](https://reuse.software/spec-3.3/). See [`LICENSE`](LICENSE) for the full overview.

### Trademark

"Architecture Continuum", "AI-Assisted Architecture" and any associated logos are trademarks of Dermot O'Brien. The licences above grant rights to the content and code only; they do not grant rights to use these marks. Nominative use ("based on Architecture Continuum") is welcome; please use a different name for forks or derivative offerings.

## Attribution

Created by Dermot O'Brien ([@dermot-obrien](https://github.com/dermot-obrien)).

If you use, fork, or build on this bundle, please credit the original project and link to this repository. Both CC BY 4.0 and Apache-2.0 require attribution; keep the copyright notices and indicate any changes you have made.
