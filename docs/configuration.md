# Configuration reference

Every setting the skills and tools read, where it lives, and what wins when two places say
different things.

| File | Written by | Read by |
|---|---|---|
| [`.agents/skill-bindings.toml`](#skill-bindings) | You | Every skill, through its own `bin/check.mjs --json` (with `--flow` for an architecture flow) or `stage.py --doctor`, and the post-install checks |
| [`.aaa-config.yaml`](#aaa-configyaml), optional | You, from the template the architecture skill carries | The post-install checks and the ontology validator |
| [`foundation-workspace.yaml`](#foundation-workspaceyaml) | `scripts/seed-foundation.mjs` | Nothing yet; a record of what was seeded |
| [Front matter](#front-matter-read-by-the-stage-flow) | The skills, or you | `/architecture stage`, `validate-frontmatter.mjs` |
| [Environment variables](#environment-variables) | You | The checks and `/architecture stage` |
| [Foundation profiles](#foundation-profiles) | Maintainers of this repository | The seeder |

The installer's own files, `.agents/skills.json` and `.agents/skills.lock.json`, belong to AI-Assisted Work's `skills.mjs`; see [Installation](installation.md#route-2-a-declared-locked-set-of-skills).

## Skill bindings

`.agents/skill-bindings.toml` tells each skill where the workspace keeps each kind of artefact. Each skill reads only its own table: the `architecture` skill reads `[suite.architecture]`, one table for all its flows, and `workspace` reads `[suite.workspace]`. The contract behind each table is the skill's `inputs.toml`, which names, for each key, the flows that read it and the flows that cannot run without it.

Rules that apply to every key below:

- Type `dir` is a folder, `file` is a file, `str` is a string.
- No key has a default. A flow that needs a key that is missing stops, naming the key. A key a flow reads but does not need, when missing, means the step that needs it is reported as not done.
- Relative paths resolve against the folder holding the bindings file, never the working directory. With the file in `.agents/`, paths start with `../`.
- A path that is set must exist. The stage flow also rejects a key the contract does not declare.
- The file is found by searching upward from the working directory for `.agents/skill-bindings.toml`, then `skill-bindings.toml`, taking the first. `stage.py --bindings <path>` overrides the search for the stage flow.
- Write the file as UTF-8 without a byte order mark. PowerShell 5.1 adds one unless you use `-Encoding ascii`.

### architecture

| Key | Type | Needed by | Also read by | Holds |
|---|---|---|---|---|
| `root` | dir | check | | The whole architecture: every page and CSV register under it is checked |
| `schemes` | file | | check | The schemes register. Default `<root>/registers/identifier-schemes.csv` |
| `namespaces` | file | | check | The namespaces register. Default `<root>/registers/identifier-namespaces.csv` |
| `schemas` | dir | | check | Front matter schemas to check against instead of the skill's v1.1.0 copy |
| `platformDir` | dir | platform, capability, context | | `PL-NNN` documents |
| `outcomeDir` | dir | strategy | platform | `OC-NNN` folders |
| `useCaseDir` | dir | strategy | | `UC-NNN` folders. May be the same folder as `outcomeDir` |
| `capabilityDir` | dir | capability | context, abb, stage | `CAP-NNN` folders (or `capabilityIdPattern`), with `capability-model.md` and its two CSVs |
| `contextDir` | dir | context | abb, service | `BC-NNN` folders |
| `abbDir` | dir | abb | sbb, stage | `ABB-NNN` folders |
| `sbbDir` | dir | sbb | service, stage | `SBB-NNN` folders, composites included |
| `serviceDir` | dir | service | | Service definitions, one file per service |
| `decisionDir` | dir | | stage | Decision records, `kind: decision-record` |
| `considerationDir` | dir | | stage | Considerations, `kind: consideration` |
| `patternDir` | dir | | stage | Patterns, read for `realises`, `flows`, `references` and their Building Blocks tables |
| `localPattern` | str | | stage | Regex for a model-local box id, such as `07` in `07 Gateway` |
| `capabilityIdPattern` | str | | capability, context, abb, stage | Regex a capability id matches in full. Default `^CAP-\d{3}$` |
| `agentProfileSchema` | file | | runtime-agent | The JSON Schema an agent profile is validated against |
| `ontologyValidator` | file | | runtime-agent | The validator run over each record the runtime-agent flow writes |

```toml
[suite.architecture]
root             = "../docs/architecture"
platformDir      = "../docs/architecture"
outcomeDir       = "../docs/architecture/demand/outcomes"
useCaseDir       = "../docs/architecture/demand/use-cases"
capabilityDir    = "../docs/architecture/demand/capabilities"
contextDir       = "../docs/architecture/solution/contexts"
abbDir           = "../docs/architecture/solution/abbs"
sbbDir           = "../docs/architecture/solution/sbbs"
serviceDir       = "../docs/architecture/runtime/services"
decisionDir      = "../docs/architecture/decisions"
considerationDir = "../docs/architecture/decisions"
patternDir       = "../docs/architecture/solution/patterns"
```

`node .agents/skills/architecture/bin/check.mjs --flow <flow>` says whether the table answers one flow; without `--flow` it fails only when the table binds nothing at all.

Before the ten `aaa-*` skills became one, each read its own table, `[suite.aaa-create-abb]` and the rest. For one release a key missing from `[suite.architecture]` is still read from those tables, with a warning that names the table to move it from; when two old tables give one key different values, the first is used and the conflict is reported. Move the keys into `[suite.architecture]` and delete the old tables.

The runtime-agent flow's two keys may point at the copies the skill carries (paths resolve against `.agents/`, so `skills/...` is `.agents/skills/...`); bind a workspace's own schema or validator instead if it governs one. The validator needs `js-yaml`, `ajv` and `ajv-formats` in the workspace's `node_modules`; see [Ontology](ontology.md#setup).

```toml
agentProfileSchema = "skills/architecture/references/standards/schemas/v1.1.0/agent-profile.schema.json"
ontologyValidator  = "skills/architecture/references/scripts/ontology/validate.cjs"
```

### What the stage flow reads

Every key the stage flow reads is optional. A folder left unset means the workspace does not keep that kind: nothing is read for it, and the report names it with the stages it cannot evidence. With no `[suite.architecture]` table at all, every kind is unbound and the report is empty, but the run succeeds. Every folder is searched recursively for Markdown files with front matter.

| Key | Type | Holds | If unbound |
|---|---|---|---|
| `capabilityDir` | dir | Capabilities, `kind: capability` or no kind, with an id matching `capabilityIdPattern` | Every capability is R0 |
| `abbDir` | dir | ABBs, `kind: abb`, read for `requires` | R2 cannot be evidenced |
| `sbbDir` | dir | SBBs, `kind: sbb`, read for `realises` and `status` | R4 cannot be evidenced |
| `decisionDir` | dir | Decision records, `kind: decision-record`, read for `status` | A resolved consideration cannot be confirmed at R3 |
| `considerationDir` | dir | Considerations, `kind: consideration`, read for `affects`, `consideration_status`, `resolved_by` | R2 needs `open_questions: none` on the capability |
| `patternDir` | dir | Patterns, read for `realises`, `flows`, `references` and their Building Blocks tables | R3 and above cannot be evidenced |
| `localPattern` | str | Regex for a model-local box id leading a Building Blocks cell, such as `07` in `07 Gateway` | Falls back as below |
| `capabilityIdPattern` | str | Regex a capability id matches in full, for a workspace that numbers its capabilities other than `CAP-NNN` | `^CAP-\d{3}$` |

`localPattern` precedence: `[suite.architecture] localPattern`, then `[model] local_pattern` in the
same file, then `[0-9]{1,3}`. Write a regex in a single-quoted TOML string so backslashes are
not treated as escapes.

`capabilityIdPattern` is the regex a capability's identifier must match in full: in `capabilityDir`, in a pattern's `realises`, in a consideration's `affects`, and on the stage flow's command line. A workspace that numbers its capabilities `CP-NNN` under capability area folders binds it like this:

```toml
[suite.architecture]
capabilityDir       = "../capabilities"
capabilityIdPattern = '^CP-\d{3}$'
```

A capability page with no `id` in its front matter takes its identifier from its folder when it is an `index.md` or `README.md` (`CP-102-agent-orchestration/index.md` is `CP-102`), and otherwise from the first word of its `title` or H1. A page whose identifier matches neither way is not a capability, so a capability area's own page (`CA-04-agent-interaction/README.mdx`) is passed over.

A capability's own fields, `level` and `parent`, are read from the top level of its front matter, or, when the top level has no such key, from a nested `capability:` block. No binding is needed for this: a repository that keeps the capability's attributes apart from the page's writes

```yaml
title: "CP-102 Agent Orchestration"
status: Draft
capability:
  level: L2
  parent: CA-04
```

and the stage flow reads it as `level: L2`, `parent: CA-04`. A top-level key wins over the nested one.


### What the check reads

`root` is required by the check and is the folder the architecture lives in; the check reads every Markdown page and CSV register under it. `schemes` and `namespaces` default to `registers/identifier-schemes.csv` and `registers/identifier-namespaces.csv` under the root when those files exist, and `schemas` defaults to the copy of the v1.1.0 front matter schemas the skill carries.

The schemes register's columns are `scheme`, `prefix`, `pattern`, `entity`, `home`, `register`, `deliverable_type`, `auto_link` and `notes`. `home` is where each page of the series lives, with `{id}` for the identifier, or a single file for a singleton, or empty for a series that has register rows and no pages; `register` is the CSV that lists the series, relative to the root. `scaffold` writes a register with the continuum's series.

### workspace

Every key is optional. `decks` is where decks publish, one folder per `deck_id` with a PDF beside each; unbound, regenerate publishes no decks. `deckSource` defaults to `[suite.architecture] root`, `pdf` to `[suite.markdown-deck] pdf`, and `diagrams`, the folders whose use cases and pattern documents the pattern skill regenerates, to the `outputDir` of `[suite.use-case]` and `[suite.pattern]`. `render` is how the pattern skill renders views, `never` by default so a build needs no draw.io desktop.

```toml
[suite.workspace]
decks = "../site/static/decks"
```

### Keys owned by other skills

The same file may hold tables for other skills, such as `[model]`, `[markdown.*]` and
`bindingsVersion` for the `model` skill, or `[suite.pattern]` for architecture-pattern. Those
are documented in their own repositories. The architecture skill reads only `[model] local_pattern`, as a
fallback for the stage flow.

## .aaa-config.yaml

Optional. Without it, the binding check prints a warning and carries on, and the ontology validator uses the schema beside it. Create it only to set a workspace ontology schema, by copying the template the architecture skill carries to the workspace root:

```bash
cp .agents/skills/architecture/references/standards/workspace/aaa-config.yaml .aaa-config.yaml
```

The template's source is `standards/workspace/aaa-config.yaml` in this repository.

| Key | Type | Default in the template | Meaning |
|---|---|---|---|
| `version` | integer | `1` | Format version of this file |
| `mode` | string | `local-fs` | Where artefacts live. Only `local-fs` is used |
| `ontology.schema` | path | `governance/metamodel/ontology-schema.json` | The ontology schema, relative to the workspace root |
| `ontology.specification` | path | `governance/metamodel/ontology-specification.md` | Its companion specification, for people and agents to read |

The template's schema path is a suggestion for workspaces that govern their own copy; the check warns when the path does not exist. To use the copy `/architecture runtime-agent` carries:

```yaml
ontology:
  schema: .agents/skills/architecture/references/standards/ontology/ontology-schema.json
```

Precedence for the ontology validator's schema: `--schema` on the command line, then `ontology.schema` in the nearest `.aaa-config.yaml` found upward from the working directory, then the `ontology-schema.json` beside the validator: `references/standards/ontology/` in the skill's copy, `standards/ontology/` in this repository. A configured path that does not exist is skipped.

## foundation-workspace.yaml

Copied from `foundation/workspace-manifest.example.yaml` by `scripts/seed-foundation.mjs`, if it does not exist. It records `foundation_source`, `imported_profiles` and a `policy` block (`workspace_is_canonical`, `allow_framework_fallback_readonly`, `require_copy_before_edit`). No tool reads it yet. Treat it as a note of what was seeded and on what terms.

## Front matter read by the stage flow

`/architecture stage` reads a small set of front matter fields. The full field list for every kind, with
types and required fields, is in `standards/standard-frontmatter.md` and the schemas in
`standards/schemas/v1.1.0/`.

A document is indexed when it has front matter, an `id` matching its kind's pattern
(`CAP-NNN`, `ABB-NNN`, `SBB-NNN` with up to two `.N` parts, `DR-NNN` or `CN-NNN`, each with three digits), and
either no `kind` or the right one.

| Kind | Field | Used for |
|---|---|---|
| capability | `level` | R1. `L1`, `L2` or `L3` |
| capability | `parent` | R1, for L2 and L3 |
| capability | `description`, or a Purpose section | R1 |
| capability | `required_by_outcomes`, or `demand_assumption` | R1 |
| capability | `realised_by_abbs` | R2 |
| capability | `open_questions: none` | R2, when no consideration applies |
| capability | `flows[]`: `id`, `name`, `description`, `stage` (`R0` to `R6`; `rung`, the former key, is still read) | Per-flow stages, and the recorded stage `--check` compares against |
| capability | `status` | R6 needs `active` |
| capability, pattern | `references[]` with `type` `cost-model`, `evidence` or `runbook` | R4, R5, R6 |
| abb | `requires` | R2. An empty list is enough |
| sbb | `realises`, `status` | R4. Status `accepted` or `active` |
| consideration | `affects`, `consideration_status`, `resolved_by` | R2 and R3 |
| decision-record | `status` | R3. `accepted` or `active` |
| pattern | `realises`, `flows`, and the ids in its Building Blocks table | R3 and R4, by the pattern's derived abstraction |

## Environment variables

| Variable | Read by | Effect |
|---|---|---|
| `SKILL_DIR` | Each skill's `bin/check.mjs` | The installed skill's folder. Defaults to the folder above `bin/`. Installers set it |
| `STAGE_PURE_YAML` | The stage flow | Any non-empty value forces the built-in front matter parser even when PyYAML is installed. The old names, `RUNG_PURE_YAML` and `AAA_RUNG_PURE_YAML`, still work |

## Foundation profiles

`foundation/profiles/<name>/profile.yaml` lists what `--profile <name>` seeds, under
`includes:` in three lists: `capabilities`, `architecture_building_blocks` and
`solution_building_blocks`, each of `ID` items. `paths:` in the same file is informational; the
seeder always writes to `capabilities/` and `building-blocks/` under the workspace. Profiles are
registered in `foundation/foundation-manifest.yaml`.

## Maintainer files

These configure this repository, not a workspace.

| File | What it sets |
|---|---|
| `bundle.json` | Each skill's `version`, `purl` and post-install `check`, and the ontology module with the work layer range it extends. Validated by `scripts/validate-bundle.mjs` |
| `skill-standards.json` | Which standards each skill carries a copy of under `references/standards/`, written by `scripts/sync-skill-standards.mjs` |
| `skills/<name>/inputs.toml` | A skill's binding contract: `[inputs.options.<key>]` with `type`, `description`, and either `required` or the `flows` that read it and the flows it is `required_by`; `[inputs]` may set `requires_any`, `flows` and `legacy_suites` |
