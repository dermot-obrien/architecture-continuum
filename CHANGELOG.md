# Changelog

All notable changes to AI-Assisted Architecture will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

From 0.4.1 on, releases are made by Release Please from the pull requests merged to `main`: a pull request's title is its line here, and the release pull request adds the next section, bumps the version and, when merged, tags `vX.Y.Z` and publishes the GitHub Release. The rules are in [CONTRIBUTING.md](CONTRIBUTING.md#releases). Do not add lines here by hand. The skills' own versions, in each `SKILL.md` and in `bundle.json`, stay separate and are bumped in the pull request that changes the skill.

## [0.10.0](https://github.com/dermot-obrien/architecture-continuum/compare/v0.9.0...v0.10.0) (2026-10-28)


### Added

* **assessment:** keep reviews as light as the risk allows, and run the check as a tool ([#74](https://github.com/dermot-obrien/architecture-continuum/issues/74)) ([e26db42](https://github.com/dermot-obrien/architecture-continuum/commit/e26db42f701954c3eda4bcbe594117ee10884aea))

## [0.9.0](https://github.com/dermot-obrien/architecture-continuum/compare/v0.8.0...v0.9.0) (2026-10-28)


### Added

* **assessment:** publish a page per criterion, bring the method to 2026 practice, and gather the ServiceNow exemplar into one folder ([#70](https://github.com/dermot-obrien/architecture-continuum/issues/70)) ([f9b245f](https://github.com/dermot-obrien/architecture-continuum/commit/f9b245fbfb9a9cd15bd2bc5901f474ae1a531b76))
* **standards:** the portfolio signature: collaboration, candidates, the portfolio block and site fields ([#62](https://github.com/dermot-obrien/architecture-continuum/issues/62)) ([6fc8738](https://github.com/dermot-obrien/architecture-continuum/commit/6fc8738198503350b7f93b9e11a6392618ca1835))


### Documentation

* say why merge commits keep a blank body ([0c9bcdb](https://github.com/dermot-obrien/architecture-continuum/commit/0c9bcdb8ca2e1f9f0efe2a904e883ba5e126fc52))
* squash pull requests into develop, merge commits only for releases ([#69](https://github.com/dermot-obrien/architecture-continuum/issues/69)) ([94a1f4d](https://github.com/dermot-obrien/architecture-continuum/commit/94a1f4d7bbf12ac5ae5ae6e7c17effa2340506b5))

## [0.8.0](https://github.com/dermot-obrien/architecture-continuum/compare/v0.7.0...v0.8.0) (2026-10-28)


### Added

* **scripts:** install or update the continuum and its skills in one command ([04d403c](https://github.com/dermot-obrien/architecture-continuum/commit/04d403cd960d5df6e0860936464fa13d494c1cc1))

## [0.7.0](https://github.com/dermot-obrien/architecture-continuum/compare/v0.6.1...v0.7.0) (2026-10-28)


### Added

* **assessment:** add an architecture assessment method with triage, lenses and specify, triage, assess and report flows ([436819f](https://github.com/dermot-obrien/architecture-continuum/commit/436819f28f10e5be0b20fce1a93dacf08b89ca56))


### Fixed

* **architecture:** settle the specify template mode where the mapping left choices open ([8c51805](https://github.com/dermot-obrien/architecture-continuum/commit/8c518050f746bd6196cff04888467bd1d1d029ab))


### Documentation

* move the branch and release rules to Git Flow with develop ([a89ec12](https://github.com/dermot-obrien/architecture-continuum/commit/a89ec127092521b1410c023b471c36f45af3e3bd))

## [0.6.1](https://github.com/dermot-obrien/architecture-continuum/compare/v0.6.0...v0.6.1) (2026-10-17)


### Fixed

* **workspace:** install the declaration when the lock no longer matches it, and an install quick start for the continuum with its related skills ([#47](https://github.com/dermot-obrien/architecture-continuum/issues/47)) ([59df23f](https://github.com/dermot-obrien/architecture-continuum/commit/59df23f41f3e3d330bc600cbd06253cd082e55b9))

## [0.6.0](https://github.com/dermot-obrien/architecture-continuum/compare/v0.5.0...v0.6.0) (2026-10-17)


### ⚠ BREAKING CHANGES

* **architecture:** the ten aaa-* skills are removed from the bundle. A workspace reinstalls (the installer replaces the old copies with architecture), moves its [suite.aaa-*] keys into [suite.architecture], and changes any script that calls .agents/skills/aaa-*/ paths to .agents/skills/architecture/.
* **schemas:** an SBB must name technologies and map each component to a technology; products, sbb_product, realised_by_abbs on a use case, realised_by_use_cases, subdomain_kind on a capability, contributes_to_transition and sequenced_decisions are no longer schema fields.

### Added

* **aaa-workspace:** initialise or reinitialise a repository for the skills, with a build that runs without them ([03d81bc](https://github.com/dermot-obrien/architecture-continuum/commit/03d81bc1d81761d26b6053c60b81ab1e9b4d50d2))
* **architecture:** call the definition ladder's steps stages, with rung kept as an alias ([3f6f2e9](https://github.com/dermot-obrien/architecture-continuum/commit/3f6f2e9f54f56e182c3d377b9eebe49ab9296c17))
* **architecture:** call the definition ladder's steps stages, with rung kept as an alias ([26a0847](https://github.com/dermot-obrien/architecture-continuum/commit/26a084703e4f2a9161ee08cb8d04997661c60a9c))
* **architecture:** capabilityIdPattern binding for capability ids other than CAP-NNN ([e61afef](https://github.com/dermot-obrien/architecture-continuum/commit/e61afef6a9395feda5d0e4b9d9c00b5ef28eba83))
* **architecture:** capabilityIdPattern binding for capability ids other than CAP-NNN ([cf0399f](https://github.com/dermot-obrien/architecture-continuum/commit/cf0399fe18908e90282e96034ae69ef7c224c2bc))
* **architecture:** the ten aaa-* skills become one architecture skill with a flow per level ([ae2ed1c](https://github.com/dermot-obrien/architecture-continuum/commit/ae2ed1cbcbe009be54559bf00f709297b339f722))
* **schemas:** align the front matter schemas with the continuum, add technical debt, and draw the schemas in the continuum's layout ([#40](https://github.com/dermot-obrien/architecture-continuum/issues/40)) ([1fa0beb](https://github.com/dermot-obrien/architecture-continuum/commit/1fa0beb0f091956af5c3452887ac72d5d97bcf1e))


### Fixed

* **architecture:** read a capability's level and parent from a nested capability: block ([4ab8317](https://github.com/dermot-obrien/architecture-continuum/commit/4ab83172e9132a1a8ae3ab0745d28cbb4f858107))
* **workspace:** install the site's packages before the skills', and carry the installer whose check ignores packages and caches ([7465aeb](https://github.com/dermot-obrien/architecture-continuum/commit/7465aeba188982743312b9fe01ebc6da92eebabc))
* **workspace:** say a locked retired skill comes back only if the declared release has it ([361fc71](https://github.com/dermot-obrien/architecture-continuum/commit/361fc71610e2bfba94955aa4500c018f57359313))
* **workspace:** say an installed copy the lock does not name comes back only if it is declared ([8f8bc62](https://github.com/dermot-obrien/architecture-continuum/commit/8f8bc62239004ac35fe70b1ab8a92f8f109dbe70))

## [0.5.0](https://github.com/dermot-obrien/architecture-continuum/compare/v0.4.1...v0.5.0) (2026-10-17)


### Added

* **aaa-continuum:** a skill that checks a repository against the continuum, with schemas for the pattern and product kinds ([602ab4c](https://github.com/dermot-obrien/architecture-continuum/commit/602ab4ca787f6cd572c003f23dcf89eef1a75a82))
* **aaa-continuum:** a skill that checks an architecture repository against the continuum, and scaffolds one ([d6fdaa6](https://github.com/dermot-obrien/architecture-continuum/commit/d6fdaa6d6b7093e84bdb25456241eab0b546b5d4))
* **continuum:** AP and RA as the identifier series of the two kinds of pattern document ([cbfc4f4](https://github.com/dermot-obrien/architecture-continuum/commit/cbfc4f43d7b11bb4d9575309d86778864568e497))
* **continuum:** architecture patterns and reference architectures, never a bare pattern ([1293cce](https://github.com/dermot-obrien/architecture-continuum/commit/1293ccec2c4268d46ba73be93be0e5238a6dac7a))
* **continuum:** architecture patterns and reference architectures, with AP and RA as their series ([b03e7dc](https://github.com/dermot-obrien/architecture-continuum/commit/b03e7dcac7024bdbc47bcb23e29c186a1da2cb22))
* **continuum:** the demand space, and ADR-NNN as a decision record identifier ([db1f59a](https://github.com/dermot-obrien/architecture-continuum/commit/db1f59add0e1572aa08334602111bdde4efc6ca3))
* **continuum:** the demand space, not the problem space ([ee7620a](https://github.com/dermot-obrien/architecture-continuum/commit/ee7620ae1fe77fe746243024563dad13e6811a94))
* **schemas:** an unlisted field on every artefact's front matter ([12ab509](https://github.com/dermot-obrien/architecture-continuum/commit/12ab509bf418bf826aeb1d2cc39b9a515eced3e7))
* **schemas:** an unlisted field on every artefact's front matter ([045ec8d](https://github.com/dermot-obrien/architecture-continuum/commit/045ec8dddc6fdd969d466c6fbdee95c32dbcecab))
* **schemas:** the pattern and product kinds, with their schemas ([fb36a66](https://github.com/dermot-obrien/architecture-continuum/commit/fb36a665798fe59e27d899e3136488ddba7d7200))
* **standards:** add the building block calibration standard ([f32f99b](https://github.com/dermot-obrien/architecture-continuum/commit/f32f99bde7c5681e46642de229699ea25b6c6818))
* **standards:** add the building block calibration standard ([54869e5](https://github.com/dermot-obrien/architecture-continuum/commit/54869e540d8f6a115f52949eaba473ff27a987ae))


### Fixed

* **schemas:** accept ADR-NNN as a decision record identifier ([f565c43](https://github.com/dermot-obrien/architecture-continuum/commit/f565c43e4861c210439d2aa76cb0a8432fdb5431))
* **scripts:** load js-yaml 5 as a namespace, which has no default export ([547980b](https://github.com/dermot-obrien/architecture-continuum/commit/547980baf6d271b61e2da5bd6861e6c7d4ee689b))


### Documentation

* **continuum:** drop the stale duplicate export of the continuum diagram ([47a9f26](https://github.com/dermot-obrien/architecture-continuum/commit/47a9f26c7abcbdc022bf7556b40c376aa2e98edb))
* **continuum:** the PAT and REF series are retired, not kept as history ([7b49d21](https://github.com/dermot-obrien/architecture-continuum/commit/7b49d216a9dab9797c1c56d9167741d5b756f10c))
* **continuum:** the PAT and REF series are retired, not kept as history ([159b682](https://github.com/dermot-obrien/architecture-continuum/commit/159b6827cc738aa90a93990f9f8ff9478f96102e))
* **continuum:** the two kinds in the diagrams' alt text ([2d0db7d](https://github.com/dermot-obrien/architecture-continuum/commit/2d0db7d2bc3b5fb4f9247c33f6822829e1fefc82))

## [0.4.1] - 2026-10-12

Cut by hand, before Release Please took over. Earlier releases were tagged by skill, `<skill>--v<version>`; from this one the tag is the bundle's, `vX.Y.Z`.

### Changed
- The ontology tools (`scripts/ontology/validate.cjs`, `consolidate.cjs`) no longer read `.aaw-config.yaml`. The schema comes from `--schema`, else the nearest `.aaa-config.yaml` above the working directory, else the default beside the script. Nothing writes the old key since AI-Assisted Work 5.0.0.
- `aaa-create-runtime-agent` 0.5.1 carries the changed validator and the updated ontology README.

## 0.4.0

AI-Assisted Architecture is now a bundle of standalone Agent Skills rather than a framework installed through AI-Assisted Work's engine. The last commit with the framework layout is tagged `v0.3.0`; pin it to keep running `aaa install` with AAW 4.0.0.

### Breaking

- **No `aaa install`.** `bin/aaa.js`, `framework.manifest.yaml` (with its `depends: [aaw]`, `seed:` block and config template entry) and the npm dependency on `ai-assisted-work` are removed. Install the skills with AI-Assisted Work's standalone installer, `bin/skills.mjs`: `node <aaw>/bin/skills.mjs install --bundle <clone of this repository> [names]`, or declare the bundle in a workspace's committed `.agents/skills.json` (`{ "sources": [ { "bundle": "https://github.com/dermot-obrien/ai-assisted-architecture.git", "ref": "main" } ] }`) and run `skills.mjs sync`, then `sync --locked --copy`, with the lock in `.agents/skills.lock.json`. See `docs/installation.md`.
- **No npm binaries.** `package.json` no longer declares `aaa`, `validate-ontology`, `consolidate-ontology` or `namespace-divergent-ontology`, and a workspace no longer takes this repository as an npm git dependency. In this repository the ontology tools stay under `scripts/ontology/` (`npm run validate`, `consolidate`, `namespace-divergent`). A workspace runs the validator `aaa-create-runtime-agent` carries, `.agents/skills/aaa-create-runtime-agent/references/scripts/ontology/validate.cjs <root>`, with `js-yaml`, `ajv` and `ajv-formats` in its own `node_modules`; its schema defaults to the copy beside it, or `ontology.schema` in `.aaa-config.yaml`.
- **No workspace instruction templates.** `install/` is removed: `AGENTS.md.txt`, `CLAUDE.md.txt`, `GEMINI.md.txt`, `.clinerules.txt`, `.cursorrules.txt`, `.windsurfrules.txt`, the `cursor/`, `gemini/` and `github/` templates and `install/README.md`. Workspaces write their own `AGENTS.md` or `CLAUDE.md`.

### Changed

- **The skills no longer need the `model` skill.** Step 0 of each `aaa-create-*` skill runs its own `node <skills>/<skill>/bin/check.mjs --json` from the workspace root, which prints each binding from `[suite.<skill>]` of `.agents/skill-bindings.toml` as an absolute path (`null` when not declared), with `status`, `problems` and `warnings`. `aaa-rung` still resolves its own bindings with `rung.py --doctor`.
- **`.aaa-config.yaml` is optional.** A skill's check warns and carries on without it. The template moved from `install/templates/aaa-config.yaml` to `standards/workspace/aaa-config.yaml`, and every `aaa-create-*` skill carries it at `references/standards/workspace/aaa-config.yaml`; copy it to the workspace root to set a workspace ontology schema.
- **Foundation seeding is a script.** `src/seed-foundation.mjs` moved to `scripts/seed-foundation.mjs`; run it from a clone with `node scripts/seed-foundation.mjs --workspace <ws> [--profile core]`. The foundation catalogue is optional content that no skill needs. The PowerShell `scripts/seed-foundation.ps1` is removed.
- **Skill metadata.** `metadata.framework: aaa` is removed from every `SKILL.md`. Skill versions: `aaa-create-*` 0.5.0, `aaa-rung` 0.5.1.
- **Documentation.** The README, `docs/`, `CONTRIBUTING.md`, the foundation, ontology and scripts READMEs and `standards/standards-index.md` describe the new installation; `REUSE.toml`, `.gitattributes` and `.gitignore` drop the removed paths.

## 0.3.0

### Added

- **Each skill carries the standards it reads.** Every `aaa-*` skill now ships a copy of its standards in `references/standards/`, keeping each file's path under `standards/`, so it works installed on its own (with `bin/skills.mjs` from AI-Assisted Work, or a copied folder) with no framework clone beside it. The resolution order in each `references/standards-discovery.md` keeps the workspace first: a path from the user or `.aaw-config.yaml`, then a workspace search by file name (now leaving installed skills out), then the skill's own copy, which replaces the framework clone at `.ai-assisted-architecture/standards/`. The copies are exactly the standards each skill's table lists, the agent-native standards, and the files a skill names: the definition ladder and AAW work seam for `aaa-rung`, the worked composite example for `aaa-create-sbb`, and the agent profile schema, the ontology README and schema and the ontology validator (`references/scripts/ontology/validate.cjs`) for `aaa-create-runtime-agent`. Images a copied standard embeds come too; any other relative link to a file a skill does not hold points at the file on GitHub. `skill-standards.json` lists them and `scripts/sync-skill-standards.mjs` writes them; CI runs it with `--check`, which fails when a copy differs. Skill versions: `aaa-create-*` 0.4.0, `aaa-rung` 0.5.0. Every skill still resolves its bindings with the `model` skill's doctor.

- **Ontology 2.0.0: Opportunity, and UseCase in its UML sense.** The portfolio entity called UseCase, an item with value tracking implemented by initiatives, is renamed Opportunity, with its collection and the fields that cite it (`implements_opportunity_ids`, `applies_to_opportunity_ids`, `depended_on_by_opportunity_ids`, `opportunity_type`, `opportunity_subtype`). UseCase now has its UML meaning, matching the use-case artefact of the front matter standard: a set of behaviours with owned scenarios, local to a container until endorsed. Breaking for data that uses the old names; SPECIFICATION.md §5.1 maps each one. The use-case artefact schema no longer describes a use case as a scenario.
- **Agent Skills reference validation in CI.** A `skills-ref` job installs the specification's reference validator from the agentskills repository, pinned to a commit, and runs `skills-ref validate` on every skill `bundle.json` lists. It fails when that list and the directories under `skills/` differ. All nine skills passed before this change and still pass. The README gains a Conformance section: the specification, how to validate locally, and where skills install.
- **Documentation.** A `docs/` set for people using the framework: a quick start from an empty folder to a derived rung, run as written in PowerShell 5.1 and Git Bash on Windows; installation for every agent, at workspace and user level; concepts in the order a user needs them; a page per skill; a configuration reference for every binding key in the skills' `inputs.toml`, `.aaa-config.yaml`, `.aaw-config.yaml`, the front matter `aaa-rung` reads and the environment variables; a command reference checked against each tool's `--help`; troubleshooting keyed to the messages the tools print; the ontology; and the worked examples. The README is shorter and indexes them. CONTRIBUTING gains the checks to run before a pull request.
- **`--help` on every script.** `src/seed-foundation.mjs`, `scripts/validate-frontmatter.mjs`, `scripts/migrate-frontmatter.mjs`, `scripts/gen-capability-csvs.mjs`, `scripts/sync-cap-abb-frontmatter.mjs` and `scripts/generate_sbb_diagrams.py` print usage and exit 0. Before, all but `validate-frontmatter.mjs` ignored the flag and ran, writing files.
- **`validate-skills.mjs` checks two more things.** An unquoted front matter value holding `: `, which real YAML parsers reject, is an error; a `SKILL.md` body over about 5,000 tokens, the specification's guidance, is a warning.

### Fixed

- **The ontology README named the framework clone** as where scripts find the base schema. It now says the default is the schema shipped two directories up from the script, which is also true of the validator copy in `aaa-create-runtime-agent`.
- **`aaa-rung --version` reported 0.3.0** (skill 0.4.2). `__version__` in the package had not moved with the skill; it now matches `metadata.version`. Behaviour is unchanged.
- **`aaa --help` described the retired command shims.** It now says the installer installs the Agent Skills into `.agents/skills/`, and lists `--no-python` and the pass-through to `aaw install`.
- **Instruction-file snippets named the old commands.** The headings in `install/AGENTS.md.txt` and its siblings said `/create-abb` and so on; they now say `/aaa-create-abb`, the names the skills answer to.
- **The ontology's worked example recorded version 1.4.0** against a schema at 1.5.0, so it failed validation on its own. It now records 1.5.0.
- **`install/README.md` and `scripts/README.md`** no longer say the installer wires command shims, or that the SBB diagram script runs from the workspace root.
- **`aaa-create-runtime-agent` compatibility note** (skill 0.3.2). It said validation uses `scripts/ontology/validate.cjs`, a path that is not in the skill and that the skill does not call. Validation runs the optional `ontologyValidator` and `agentProfileSchema` bindings, and the note now says so. The skill's behaviour is unchanged.
- **README skill count.** It said ten skills; there are nine since `pattern` moved to its own repository.

- **`bundle.json`**, the bundle manifest DD-11 of AI-Assisted Work defines: each skill's version, purl, requirements (none) and post-install check, and the ontology module with the work layer range it builds on. CI validates it with `scripts/validate-bundle.mjs`; the validator and the bundle and work schemas are copies from AI-Assisted Work in `scripts/vendor/`, so CI needs no network.
- **Post-install checks**, as DD-11 defines them: run from the workspace root with `SKILL_DIR` set, exit 0 when correct, 1 with one line per problem, 2 for a usage or environment error. Every `aaa-create-*` skill ships the same `bin/check.mjs` (CI checks the copies agree): `.aaa-config.yaml` present, its `ontology.schema` present (a warning when not), and `[suite.<skill>]` declaring every required binding in the skill's `inputs.toml`, with each declared path present. `aaa-rung` ships `bin/check.py`, which resolves its bindings as `--doctor` does, with the contract's exit codes; `--doctor` is unchanged. CI runs every check in the scratch workspace, unbound (they must fail) and bound (they must pass). Skill versions: `aaa-create-*` 0.3.1, `aaa-rung` 0.4.1. Patch releases: before 1.0.0 a minor would fall outside a dependent's `^0.3.0`, and nothing here breaks one.
- **Architecture ontology module**, `ontology/architecture.schema.json`, `pkg:generic/dermot-obrien/ai-assisted-architecture/architecture-ontology@1.0.0`: the architecture layer of DD-11. `ArchitectureWork` and `ArchitectureDeliverable` extend the work layer's WorkItem and Deliverable with the outcome measures work advances and the kind and identifiers of the artefacts a deliverable produces; the base ontology's architecture concepts are named by `$ref`. Additive: `standards/ontology/ontology-schema.json` is unchanged. `scripts/test-architecture-ontology.mjs` tests it against the base's worked example, in CI.

### Removed

- **`pattern` moved to its own repository**, https://github.com/dermot-obrien/architecture-pattern, released there from 0.8.0 so it can be installed without this framework. Its `NOTICE` names the commit here it was taken from, pattern 0.7.1 at 5a1c138, and its history before that is the history of `skills/pattern` here. It depends on `model` from https://github.com/dermot-obrien/diagram-model and `markdown-deck` from https://github.com/dermot-obrien/markdown-deck, which also left AI-Assisted Work. `aaa install` no longer installs it; `aaa-rung` still reads the pattern front matter it defined.
- **`model` is no longer provided by AI-Assisted Work.** Every AAA skill resolves its bindings with `model doctor`, so install `model` from https://github.com/dermot-obrien/diagram-model.

### Fixed

- **Skills missing from npm installs.** `package.json` `files` did not list `skills/`, so a repository that takes AAA as an npm git dependency got no skills: `aaa install` reported "no skills" and still removed the old `.claude/commands/aaa` shims, leaving nothing in their place. `skills/` is now packaged.

### Added

- **Definition ladder.** `standards/capabilities/standard-definition-ladder.md` defines how far a capability has been defined as a rung that can be checked: R0 Unrecognised, R1 Named, R2 Bounded, R3 Decided, R4 Buildable, R5 Proven, R6 In service. It gives what each rung requires and the artefact kinds that evidence it, and the rules: a capability sits on the highest rung with every lower rung evidenced; a rung is claimed per flow and the capability sits at its lowest flow; building ahead does not skip rungs but is latent evidence; a rung is lost when its evidence stops being true. It says how the ladder differs from capability maturity (0 to 5), `lifecycle_state` and `status`. Architecture's reach ends at R4, and R5 and R6 are received from implementation. `definition-ladder.csv` (`rung,name,description`) beside it is the form tools read. Linked from the capability document standard, which gains a Definition Rung section and a section on rung versus maturity, and from the metamodel.
- **`aaa-rung` skill.** Read-only. Derives each capability's rung, per flow, from the capabilities, ABBs, considerations, decision records, SBBs and patterns that exist, and names the specific artefact that blocks the next rung. A table by default, `--json` for planning, `--check` to fail CI when a recorded rung claims more than the evidence. Bound through `[suite.aaa-rung]` with six directories and no defaults. Each directory is optional (skill 0.4.0): a repository that does not keep a kind leaves it unbound, nothing is read for it, and the report and `--doctor` name it with the rungs it cannot evidence. A missing section binds nothing and still runs. A bound path that does not exist still stops the run. Python standard library only, with tests over a neutral fixture workspace: `python -m unittest discover skills/aaa-rung/tests`, also run in CI.
- **`consideration` artefact kind (`CN-NNN`).** An open question with more than one credible answer: `question`, `options[]` (`name`, `summary`), `criteria[]`, `consideration_status` (`open`, `resolved`, `withdrawn`), `resolved_by` (`DR-NNN`, required once resolved) and `affects[]` (capabilities, ABBs, SBBs or patterns). New `consideration.schema.json`; the envelope gains the kind, the `CN` prefix in `anyId` and a `considerationId` def. The lifecycle field is `consideration_status` rather than `status`, so it cannot collide with the envelope's `status` enum as the transition schema once did. Documented in the frontmatter standard (§6.16), the metamodel and the traceability standard, and known to `scripts/validate-frontmatter.mjs`.
- **Capability ladder fields.** Optional `flows[]` (`id`, `name`, `description`, `rung` matching `R[0-6]`), the `open_questions: none` marker, and `demand_assumption` for demand recorded as an assumption before an outcome is linked, in `capability.schema.json` and the frontmatter standard (§6.4).
- **`evidence` and `cost-model` reference types** in the envelope's `references[].type`, read by the ladder at R5 and R4 (with the existing `runbook` at R6).
- **Outcome measures as criteria.** Optional `measures[]` on an outcome (`id` as `OC-NNN-M<n>`, `measure`, `target`, `unit`). Planning cites the ids as `advances_criterion_ids`, and a consideration may list them in its `criteria`. The strategy standard (§2.3) sets the numbering rule, and `aaa-create-strategy` creates an id for every measure.
- **Pattern `realises`.** The `pattern` skill (0.6.0) template and method gain optional `realises: [CAP-NNN]`, `flows` and `cost-model` and `evidence` references, so a pattern counts toward the rungs of the capabilities it realises.
- **Named interface endpoints.** The `pattern` skill (0.7.0) writes Provider and Consumer, and scenario Actor and Target (0.7.1), as identifier and name, with `scripts/name-endpoints.py` to bring existing documents up to it and a note from `publish.py` for any that still need it.
- **The planning seam.** `standards/aaw-work-seam.md` maps deliverable types to artefact kinds and so to rungs, names `definition-ladder.csv` as the ladder AAW's quarter planning reads, and describes derived rungs feeding an epic's framing: its starting rung, its first product from the blocker, and the rung reached at close.

### Changed

- **The AAR seam names its file and its skill.** `standards/aaw-work-seam.md` pointed at "AAR's inquiry seam" without saying where it is. It now names `docs/aaw-inquiry-seam.md` in AI-Assisted Research and says that `/aar-sync-research-result` proposes the Decision Record, citing the hypothesis node and its work item.
- **Capability taxonomy settled on the flat registry form.** The capability document standard described `capability-model.md` as nested L1/L2 headings while the foundation seed used one flat registry table. The foundation's form is now the standard: a Canonical Capability Registry with an explicit `Parent ID` column, the hierarchy rules, a Capability-to-ABB Traceability Matrix, and the two derived CSVs with their columns. `aaa-create-capability` adds a registry row rather than a heading and keeps the CSVs in line. A workspace whose `capability-model.md` uses nested headings should flatten it into the registry table.
- **Ontology maturity horizons defined.** Crawl, walk, run and fly were never defined. They are now stated as bands of the definition ladder, as a mapping and not a new scale: crawl is R1–R2, walk is R3–R4, run is R5, fly is R6 (`SPECIFICATION.md` §4.2 and §4.7, and the `maturity` and `maturity_horizon` descriptions in `ontology-schema.json`). The enums are unchanged, so the ontology schema version is not bumped.
- **Schema versioning.** Every schema addition above is optional and made in place in `standards/schemas/v1.1.0/`, which is still unreleased; this follows how `requires`, `provenance` and the composite SBB fields were added. All 97 foundation artefacts still validate.

- **The eight `aaa-create-*` skills take their artefact locations from the repository**
  (breaking). Each declares an `inputs.toml` contract and reads `[suite.<skill-name>]` of the
  repository's `.agents/skill-bindings.toml`, resolved through the model skill's `doctor`, the
  same way `reference-architecture` already worked. They previously wrote to hardcoded paths
  such as `building-blocks/architecture-building-blocks/ABB-NNN/index.md`, which made the
  framework's own layout a condition of using it. There is no default: an unbound skill stops
  and names the key it is waiting for. The README carries a paste-ready block for a repository
  that does use the expected layout, which is where an opinion about layout belongs.
- `aaa-create-runtime-agent` no longer names a fixed validator or profile schema. Both are
  bindings, and both are optional: where one is undeclared the skill reports the record as
  authored but not validated, rather than skipping the step quietly.

### Added

- **`reference-architecture` skill.** Authors a reference architecture as one Markdown document
  that is also the model and also the deck: it generates the draw.io diagram and numbered
  scenario overlays from the document's own tables, validates that diagram and document agree,
  and publishes HTML slides and a PDF. Different in kind from the `create-*` skills, which each
  author one catalogue artefact. It needs `model` and `markdown-deck`, which ship with
  AI-Assisted Work; AAA already depends on AAW for the install engine, so installing both into
  a workspace provides them. Repository specifics — output directory, template, id series,
  ontology schema — come from `.agents/skill-bindings.toml`, so the skill carries none.
- **Agent Skills as the distribution format.** All eight `create-*` agents now ship as standalone [Agent Skills](https://agentskills.io) under `skills/`: a directory holding a `SKILL.md` with `name` and `description` frontmatter plus `references/`. One definition works in every skills-compatible tool. `aaa install` wires them through the shared AAW engine's new `skills` manifest key: each lands in `.agents/skills/<name>/`, read natively by Codex, Cursor, GitHub Copilot, VS Code and Gemini CLI, with `.claude/skills/<name>` linked at it for Claude Code, which reads only its own path. Requires AAW 2.1.0 or later.
- **Workspace-first standards resolution.** Skills resolve the canonical standards by searching the workspace before falling back to the framework copy, instead of the fixed `.ai-assisted-architecture/standards/…` paths the shims hard-code. An organisation that governs its standards in its own tree (for example under `governance/standards/`) now works without patching the skill. Each skill carries the resolution order and its own required-standards table in `references/standards-discovery.md`, and stops rather than proceeding on an assumed contract when a standard cannot be found.
- `/aaa-create-service` now hands off to `/aaa-create-runtime-agent` when the service is an autonomous agent, since that path needs guardrails, capability scope and provenance the service skill does not author.
- `scripts/validate-skills.mjs` — zero-dependency validator for the agentskills.io spec — and a CI workflow that runs it, installs into a scratch workspace and checks the Claude Code links resolve. AAA had no CI before this.

### Changed

- Skills are invoked as `/aaa-create-abb` and so on. The Agent Skills format has no namespacing of its own, so the `aaa-` prefix is what prevents collisions. The legacy shims keep their unprefixed `/create-abb` names.
- `agents/FRAMEWORK_AGENTS.md` and `install/README.md` updated: skills documented as the primary integration, shims marked superseded, and the retired `scripts/seed-foundation.ps1` replaced by `src/seed-foundation.mjs` via `aaa install --seed`.

### Deprecated

- The per-tool shims under `install/claude/`, `install/cursor/` and `install/github/`, and the instruction files under `agents/`, each now carrying a superseded header. They remain installed for setups that have not moved. A shim carries no `description`, so an assistant can only run it when the user types the command, and it points at one large instruction file read whole on every invocation.

### Removed

- **BREAKING: the per-tool `create-*` command shims** under `install/claude/`, `install/cursor/rules/create-*.mdc` and `install/github/prompts/`, and the instruction files under `agents/`. A workspace that still invokes `/create-abb` will find nothing behind it; use `/aaa-create-abb`. `aaa install` sweeps away shims it previously wrote, since they point at files that no longer exist. Requires AAW 3.0.0 or later.
- **BREAKING: the `shims` and `source_token` manifest keys are no longer set.** Both existed only for the shims. A skill is self-contained and holds no path back into the framework, so nothing needs rewriting at install time.
- `agents/create-deck.md`. It was an orphan: wired into no shim and absent from the manifest, the README and the standards index. It was also specific to one workspace's Docusaurus site rather than framework-general, and a separate deck skill now covers the need.

### Moved

- `agents/FRAMEWORK_AGENTS.md` → `standards/standards-index.md`. It is a standards discovery and precedence document, not an agent, and it outlived the `agents/` directory it sat in. Every discovery file under `install/` was repointed.

### BREAKING CHANGES

- **Transition `status` renamed to `transition_status`** (`standards/schemas/v1.1.0/transition.schema.json`). The transition schema composes the universal envelope — which defines `status` with the lifecycle enum `draft | proposed | accepted | active | deprecated | superseded | retired` — and then redefined `status` with a transition-specific enum (`planned | in-progress | completed | abandoned`). Under `allOf` both constraints applied to the same `status` property, so no value satisfied both and every Transition artefact failed validation. The transition-specific lifecycle now lives in a separate `transition_status` field; the envelope `status` still applies. The §6.15 example in `standard-frontmatter.md` was updated to match. **Migration:** rename `status: <planned|in-progress|completed|abandoned>` to `transition_status:` on every Transition artefact (the envelope `status` remains for `draft`/`active`/…).
- **SBB document frontmatter example realigned to `sbb.schema.json`** (`standards/building-blocks/solution-building-blocks/standard-sbb-document.md`). The example predated the v1.1.0 schemas and would not validate against them. Field changes: `primary_abb` + `realises_abbs` → `realises` (single array); `lifecycle_stage` (Plan/Encourage/Sustain/Retire) → `status` (envelope enum); `author` → `last_modified_by`; `version: "0.1"` → `"0.1.0"` (semver requires major.minor.patch); added the remaining required fields `kind`, `created`, `owner`, `products`, `product_mapping`; removed the maturity fields (`current_maturity`/`target_maturity`) and the inline `provenance` block. The corrected example is verified against `sbb.schema.json` with ajv. **Migration:** any SBB authored from the old example must rename these fields before it will validate.
- **Foundation artefacts migrated to full v1.1.0 frontmatter** (`foundation/**/index.md`). The migration script (`scripts/migrate-frontmatter.mjs`) now populates not just the universal envelope (`id`, `kind`, `version`, `status`, `created`, `last_modified`, `owner`, `governance_zone`) but the **per-kind required fields, extracted from each document's body** — ABB `category`/`short_name`/`interfaces`/`part_of`/`realises_capabilities`, SBB `realises`/`products`/`product_mapping`, capability `level`/`parent`/`components`/`maturity`/`provided_by_platform`/`realised_by_abbs`, BC `part_of`/`contains`/`realises_capabilities`/`ubiquitous_language`, platform `strategic_owner`/`provides_capabilities`/`contains_bounded_contexts`, outcome `kpi`/`business_rationale`/`owned_by_platform`, and use-case `primary_actor`/`supports_outcome`/`success_criteria`/`realised_by_abbs`. Relations not present in an artefact's own body are recovered by reverse index (an ABB's parent BC; an Outcome's owning Platform; ABB-004…008's realised capabilities, read from the capabilities that name them as `primary`). All **97 files now validate against their strict per-kind schemas** (verified by the new `scripts/validate-frontmatter.mjs`). Tooling that parsed these files expecting only the old Docusaurus keys (`title`, `sidebar_*`) now sees the full per-kind frontmatter. **Migration:** run `node scripts/migrate-frontmatter.mjs` (idempotent — existing keys are never overwritten) then `node scripts/validate-frontmatter.mjs`.
- **Three strict-schema constraints relaxed so realisation/containment completeness is a gap, not a validation error** (`standards/schemas/v1.1.0/`). These are corrections within the unreleased v1.1.0 schema set — they only *relax* constraints, so every artefact valid before remains valid:
  - `capability.schema.json` — `provided_by_platform` is now required only for **L3** capabilities (L1/L2 are cross-platform groupings); `realised_by_abbs` is no longer required even for L3 (an unrealised L3 capability is a legitimate gap surfaced by gap analysis, not a structural error — the foundation seed ships such placeholders deliberately).
  - `bounded-context.schema.json` — `contains` dropped from required (a placeholder context catalogued before its ABBs exist is a gap, not an error); `ubiquitous_language` minimum lowered from 5 to 3 entries.
  - `outcome.schema.json` — `target_date` dropped from required (catalogued/seed Outcomes are frequently undated; omit rather than fabricate a date).
  - The §6.1/§6.4/§6.5 examples and notes in `standard-frontmatter.md` were updated to match.
- **`lenient-v1.0.0-compat` / `strict-v1.1.0` two-profile mechanism removed from the spec** (`standards/standard-frontmatter.md` §7). The `governance.yaml` `schema_profile` selector described in earlier drafts was never built. The framework now **migrates rather than tolerates**: there is a single strict schema set, and `scripts/migrate-frontmatter.mjs` brings a workspace to it. (A lenient profile can return later if a frontmatter-validator CLI needs a gradual-adoption mode — designed against a real validator rather than ahead of one.)

### Added
- **C4 System Context diagram convention.** Adds the **outside-in** view to the framework, complementing the composite SBB **inside** view so a system can be read at adjacent C4 zoom levels. Comprises:
  - `standards/building-blocks/standard-c4-context-diagram.md` — the convention: rendered as a Mermaid **`flowchart`** (explicitly **not** the experimental, unstyleable `C4Context` type), with a fixed `classDef` palette (person `#08427b`, internal software system `#1168bd`, external system `#999999`, dashed boundary `#444444`), `[Person]` / `[Software System]` / `[External System]` node tags, persons-left / externals-right layout, and verb-phrase edge labels (no protocols at this altitude). Includes when-to-use (top-level ABB / system-level Capability only), the C4↔AAA mapping (boundary = Capability or top-level ABB; internal nodes = ABBs/SBBs/Services; external nodes often = ABB `requires` dependencies; **persons have no AAA artefact**), the explicit *Relationship to composite SBBs (zoom-in)* pairing (C4 Context = Level 1 outside; composite SBB = Level 2/3 inside), and a self-verification checklist.
  - `standards/building-blocks/solution-building-blocks/example-composite/c4-context.md` — a worked example: the **Patternode trading platform** context view (`kind: view`, `view_of: ABB-009`), with **Trader** + **AI Agents** as actors; **Strategy Engine**, **Order & Portfolio Service**, **Trading Dashboard**, **Reconciliation**, and **Watchdog** as internal systems inside the platform boundary; and **Alpaca**, **EODHD**, **GCP**, **Firebase**, **Slack**, **GitHub** as external systems. Authored as the **zoom-out companion** to the existing `SBB-301 Strategy Engine` composite (`index.md`), with the external systems reconciled against the composite's `required` boundary ports.
  - `standards/building-blocks/architecture-building-blocks/standard-abb-document.md` — a new **§2.1.1 C4 System Context (top-level ABBs)** section (external surface vs the §2.1 internal structure), cross-linked to the composite SBB as the zoom-out/zoom-in pair.
  - `standards/building-blocks/solution-building-blocks/standard-sbb-diagram.md` — a *Zoom relationship to C4 System Context* note framing the composite diagram as the Level 2/3 inside view and reconciling context external systems with `required` boundary ports.
  - `agents/create-abb.md` — a new **Step 2b** (top-level ABBs only): author a C4 System Context diagram in `index.md` (§2.1.1), document the AAA mapping, and cross-link to the realising composite SBB as the zoom-in companion.
  - `agents/create-sbb.md` — composite-SBB authoring now offers to create/refresh the parent system's C4 Context diagram (a `c4-context.md` beside `index.md`) and reconcile its `[External System]` nodes with the composite's `required` ports.
- **ABB capability dependencies (`requires`).** Architecture Building Blocks can now declare capability-level dependencies on other ABBs — *which* logical building blocks must be present for this one to function — distinct from internal composition and from the concrete part/connector wiring of a composite SBB. Comprises:
  - `standards/schemas/v1.1.0/abb.schema.json` — a new optional `requires` array; each entry has `abb` (required, `ABB-NNN`), `cardinality` (`1` | `0..1` | `1..n` | `0..n`, default `1`), and `rationale`.
  - `standards/standard-frontmatter.md` §6.6 — the `requires` field reference (field table, when-to-use, and how it differs from `mandatory_subabbs` and composite-SBB parts), plus an example in the ABB frontmatter block.
  - `standards/building-blocks/architecture-building-blocks/standard-abb-document.md` — a new **§3.4 Capability dependencies (`requires`)** section: when to declare a dependency, `requires` (abstract logical dependency) vs composite-SBB parts (concrete wiring), how `requires` feeds gap analysis (a required ABB absent from the catalogue is a gap; a missing `cardinality: "1"` dependency is a *hard* gap), plus a new self-verification item.
  - `agents/create-abb.md` — a discovery step that asks which other ABBs the ABB depends on (with cardinality and rationale, excluding the cross-cutting trio), and authoring instructions to populate `requires` and render §3.4.
  - `standards/building-blocks/architecture-building-blocks/example-requires/` — a worked example: `ABB-010 AI Agent Platform` requiring four sub-ABBs (`ABB-011` Reasoning Engine `1`, `ABB-012` Tool Integration `1..n`, `ABB-013` Agent Memory `0..1`, `ABB-014` Safety & Guardrails `1`), each created as a minimal ABB. All five validate against the updated schema.
- **Composite Solution Building Blocks (UML composite structure).** SBBs can now be modelled as assemblies of sub-SBBs using the UML 2 composite-structure grammar — **parts** (typed roles played by sub-SBBs), **ports** (provided/required interaction points on the boundary), and **connectors** (`delegation` boundary↔part, `assembly` part↔part). Comprises:
  - `standards/schemas/v1.1.0/sbb.schema.json` — new optional `composite`, `ports`, `parts`, `connectors` fields with a conditional that requires `parts` (≥1) and `connectors` (≥1) when `composite: true`. Endpoint-reference resolution is delegated to the validator script (documented in the schema and frontmatter standard).
  - `standards/standard-frontmatter.md` §6.7.1 — full field reference, required/optional rules, and six validation rules for composite SBBs.
  - `standards/building-blocks/solution-building-blocks/standard-sbb-document.md` — a *Composite SBBs* section with the UML→SBB mapping, a *When to use composite vs simple SBBs* decision guide, the §2.10 Composite Structure document section, and two new self-verification items.
  - `standards/building-blocks/solution-building-blocks/standard-sbb-diagram.md` — a *Composite Structure Diagrams (Mermaid)* section: the UML→Mermaid mapping, Mermaid's limitations with mandated workarounds (no native ball-and-socket / ports-on-border / stereotypes), node/edge naming conventions kept in lock-step with frontmatter, port and connector styling (`classDef`), and three worked examples (minimal, realistic, nested composite-of-composites).
  - `agents/create-sbb.md` — a simple-or-composite decision step and composite authoring instructions (frontmatter fields, §2.10, Mermaid diagram, bidirectional `contains`/`part_of` traceability).
  - `standards/building-blocks/solution-building-blocks/example-composite/index.md` — a complete worked example (`SBB-301 Strategy Engine`) assembling bar-building, signal-generation, and order-routing sub-SBBs behind a two-port boundary, with a rendered Mermaid composite diagram. Validates against the updated schema.
- **Agent-Native Architecture standards** (`standards/agent-native/`): a domain-agnostic operating model for when the majority of engineers and architects are AI agents. Builds on the existing layers (strategy, platforms, capabilities, contexts, building-blocks, runtime, ontology) rather than replacing them. Comprises:
  - `agent-types.md` — the two agent segmentations: **builder agents** (architecture + engineering, governed at build-time) and **runtime agents** (deployed services doing functional work, governed at run-time). Builders build runtime agents; the same nine principles apply on two enforcement planes. Defines the symmetry (work / guardrails / verification / provenance / capability-scope / escalation / reconciliation × build-time vs run-time), the separation that bounds blast radius (a runtime agent cannot change its own guardrails; a builder holds no runtime action credentials), the lifecycle, and how a runtime agent is represented in the ontology (a `Component` + `platform_guardrail` Standards, no new entity).
  - `create-runtime-agent.md` agent skill (`agents/`) — a builder skill that authors a runtime agent as a catalogued service with its contracts, run-time guardrails (tiered), capability scope, and output provenance.
  - `agent-specification.md` — the vendor-neutral **agent component set** (model, instructions, tools, skills, memory, knowledge, capabilities, guardrails, identity/auth, evaluation, provenance, discovery), each mapped to a verified contemporary standard: **MCP** (Tool sub-schema, spec rev 2025-11-25), **A2A** (AgentSkill + Agent Card discovery), **OASF/AGNTCY** (composable Modules), **Anthropic Agent Skills** (`SKILL.md`), **OpenAI Agents SDK** (corroborating field set), and the **OWASP Top-10 for Agentic Applications 2026** (ASI01–ASI10) threat mapping. Establishes the builder-spec ↔ runtime-card = ABB ↔ SBB refinement, so a catalogued agent is also interoperable. An agent remains a `Component` + `platform_guardrail` Standards (no new entity).
  - `schemas/v1.1.0/agent-profile.schema.json` — the machine-validatable agent profile (`agent_kind: builder|runtime`), composing the MCP Tool, A2A AgentSkill, Anthropic packaged-skill, OASF Module, and guardrail-reference sub-schemas. Validated as Draft 2020-12.
  - `principles.md` — the nine commitments (spec-is-truth, verify-don't-review, blast-radius-first, provenance-on-everything, machine-checkable, standardize-hard, human-budget-for-the-irreversible, context-window sizing, continuous reconciliation), each with its failure mode and enforcing mechanism.
  - `operating-model.md` — the author → adversarial-verify → reconcile loop, guardrail reversibility tiers (T0–T3) layered on the ontology's `platform_guardrail` Standard, capability-scoped agent roles, and mechanical human-escalation keyed to reversibility. Seams to the AAW work seam (a T0/T1 change is a Decision Record).
  - `provenance.md` — the AI-authorship envelope (origin / authored-by / review-state / verified-by), generalising AAR's provenance instinct to every artefact and change.
  - `executable-contracts.md` — refining `api` / `Interface` artefacts into runnable OpenAPI + event schemas + property-based invariants, verified by consumer-driven contract tests bound to the running code.
  - `reconciliation.md` — four standing drift loops (catalog↔deployed, contract↔implementation, graph↔code, docs↔behaviour) extending the static `validate`/`consolidate` gate into runtime drift control; drift becomes a provenance-stamped work item.
- **Provenance envelope** (`standards/schemas/v1.1.0/envelope.schema.json`): an optional, backward-compatible `provenance` block (`$defs/provenance` + property) added to the universal artefact envelope, recording AI-authorship and adversarial-verification lineage. Required fields when present: `origin`, `review_state`.
- **AAW work seam** (`standards/aaw-work-seam.md`): defines the contract between AAA and the AI-Assisted Work work-classification standard. A `decision` deliverable (from any work, or a validated AAR inquiry) → an AAA Decision Record (`DR-NNN`); a cross-cutting AAW `intervention` → a Capability / ABB / SBB revision via the `create-*` agents. Aligns the vocabularies so one classification flows across the frameworks without drift.

- **Unified installer integration.** A `framework.manifest.yaml` and a zero-dependency `bin/aaa.js` launcher install AAA through the shared AI-Assisted Work (AAW) engine — `aaa install` (add `--seed` to scaffold the foundation), wiring `create-*` command shims for Claude/Cursor/Copilot/Gemini. The Windows-only `scripts/seed-foundation.ps1` was ported to a cross-platform Node seeder (`src/seed-foundation.mjs`). AAA is now consumable as an npm git-dependency (no registry) that auto-pulls AAW.
- **Frontmatter Standard** (`standards/standard-frontmatter.md`) — universal envelope, per-kind extensions for all 15 artefact kinds, relationship vocabulary with inverse-consistency rules, status lifecycle, and lifecycle-state semantics for baseline/in-flight/target/retired coexistent versions.
- **JSON Schemas** (`standards/schemas/v1.1.0/`) — JSON Schema 2020-12 validators per kind: `envelope.schema.json` plus per-kind schemas for outcome, use-case, platform, capability, bounded-context, abb, sbb, service, decision-record, snapshot, transition. Placeholder schemas under `_placeholders/` reserve `view`, `event`, `deployment-node`, `api`.
- **Frontmatter migration + validation tooling** (`scripts/`) — `migrate-frontmatter.mjs` walks a workspace's `index.md` files and brings their frontmatter to v1.1.0, extracting per-kind fields from the Document Control table and prose sections (idempotent; reports every field added and any heuristic/defaulted value). `validate-frontmatter.mjs` validates each artefact's frontmatter against its per-kind schema with ajv (envelope composed via `$ref`), printing per-file errors and a pass/fail summary.
- **Decision Record artefact type** (`DR-NNN`) — first-class metamodel element for architectural decisions. MADR body + Y-statement frontmatter + `change_type` and `affects_artefacts` relations. Schema in v1.1.0 set; full body-section standard forthcoming.
- **Snapshot artefact type** (`SN-NNN`) — named architecture state at a point in time. Manifest of `id@version` pairs. Used for baseline / target / transition architectures.
- **Transition artefact type** (`TR-NNN`) — multi-step migration between two Snapshots, sequenced by Decision Records.
- Universal `lifecycle_state` field on every artefact (`baseline | in-flight | target | retired`).

### Changed

- **Unified ABB/SBB ID convention on `ABB-NNN` / `SBB-NNN`.** The v1.1.0 schemas previously used the short `AB-NNN` / `SB-NNN` forms while the foundation seed and the v1.0 document standards already used `ABB-NNN` / `SBB-NNN`. The longer forms are now canonical everywhere, so the schemas accept the foundation IDs. Updated `envelope.schema.json` (`abbId`/`sbbId` patterns + the `anyId` alternation), `abb.schema.json` and `sbb.schema.json` (`id` patterns), the Frontmatter / ABB / SBB document and diagram standards, the `create-abb` agent, and the `example-requires` and `example-composite` worked examples (`ABB-010…ABB-014`, `SBB-301`/`SBB-310…312`). No released artefact used the short form (v1.1.0 is unreleased).
- **Relicensed for wide adoption.** Replaced the AGPL-3.0 + Commercial dual licence with a permissive split: **CC BY 4.0** for content (documentation, standards, agent specifications, foundation seeds, diagrams) and **Apache-2.0** for executable code (`scripts/*`, `src/*`, `bin/*`). Commercial use is now explicitly permitted under both licences; attribution is required.
- Adopted [REUSE Specification 3.3](https://reuse.software/spec-3.3/) with `REUSE.toml` and `SPDX-License-Identifier` headers for per-file licensing metadata.
- Added a trademark notice for the "AI-Assisted Architecture" name; CC BY 4.0 and Apache-2.0 do not grant trademark rights.
- `agents/FRAMEWORK_AGENTS.md` references the new Frontmatter Standard in canonical-standards list and scope-routing section.

### Removed
- **PowerPoint generation removed entirely.** Deleted the `scripts/create-building-block-slide.py` slide generator, every `components-and-summary.pptx` artefact (foundation ABBs/SBBs and the ABB/SBB worked examples), and the `python-pptx` / `Pillow` dependency. ABBs and SBBs now ship their `components.drawio`/`.png` and `summary.drawio`/`.png` only; assembling those into a slide is left to the consumer's own tooling. The `create-abb`/`create-sbb` agents (and their install shims) no longer have a PPTX step, and the building-block file-set standards no longer list a `.pptx`. **Migration:** delete any `components-and-summary.pptx` files in your workspace; they are no longer part of the building-block deliverable set.
- `LICENSE-AGPL-3.0.txt` and `LICENSE-COMMERCIAL.txt` (superseded by `LICENSES/CC-BY-4.0.txt` and `LICENSES/Apache-2.0.txt`).

### Notes

- v1.1.0 is design-spec stage and unreleased; the **BREAKING CHANGES** above are corrections within the in-development v1.1.0 schema set, not breaks against any shipped release. There is a single strict schema set — v1.0.0 artefacts are brought up to it with `scripts/migrate-frontmatter.mjs` (a one-way migration), not tolerated by a relaxed validator profile.
- Decision Record / Snapshot / Transition agent skills (`agents/create-decision.md`, `create-snapshot.md`, `create-transition.md`) are forthcoming.
- Frontmatter validation now ships as `scripts/validate-frontmatter.mjs`; a CI hook recipe wiring it into `npm run validate` is forthcoming.

## [1.0.0] - 2026-03-08

### Added
- TOGAF-aligned ABB and SBB document and diagram standards.
- Visual design standard with colour tokens, typography, and accessibility rules.
- Traceability standard ("Golden Thread") linking Outcomes to Services.
- Strategy standard for Business Outcomes and Use Cases.
- Platform standard with platform-as-product model (Team Topologies, CNCF, Gartner).
- Platform diagram standard for landscape visualisation.
- Capability document and diagram standards with maturity model.
- Bounded Context standard with ubiquitous language and platform containment.
- Runtime Service standard.
- Repository structured as an installable Git submodule (`.ai-assisted-architecture/`).
- Agent specifications for 7 creation skills: strategy, platform, capability, context, ABB, SBB, service.
- `agents/FRAMEWORK_AGENTS.md` for agent discovery and precedence rules.
- IDE integration wrappers for Claude Code, Cursor, GitHub Copilot, Gemini, Cline, and Windsurf.
- Foundation seed with 12 platforms (PL-001 through PL-012).
- Foundation seed with 44 capabilities across L1/L2/L3 hierarchy.
- Foundation seed with 12 bounded contexts (BC-001 through BC-012).
- Foundation seed with 8 ABBs (ABB-001 through ABB-008) and 3 SBBs (SBB-001 through SBB-003).
- Foundation seed with 13 strategic outcomes (OC-001 through OC-013).
- Platform landscape diagram (Draw.io + PNG).
- Capability map and capability-to-ABB traceability diagrams.
- PowerPoint generation script for building block summary slides.
- Foundation seeding script (`seed-foundation.ps1`) with profile support.
- 300 DPI PNG export standard for all diagrams.

---

[Unreleased]: https://github.com/dermot-obrien/ai-assisted-architecture/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dermot-obrien/ai-assisted-architecture/releases/tag/v1.0.0
