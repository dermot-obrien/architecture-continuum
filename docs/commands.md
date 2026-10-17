# Command reference

Every command this repository ships, with its options as its `--help` prints them. Paths assume the skills are installed in `.agents/skills/` of your workspace, and that `<aaa>` is a clone of this repository and `<aaw>` a clone of [AI-Assisted Work](https://github.com/dermot-obrien/ai-assisted-work). From the root of a clone of this repository, drop the `<aaa>/` prefix.

On macOS and Linux type `python3` where this page says `python`.

- [Installing](#installing): `skills.mjs`, the seeder
- [Skill tools](#skill-tools): `stage.py`, the post-install checks, `check.mjs --json`
- [Validation](#validation): skills, bundle, front matter
- [Ontology tools](#ontology-tools): validate, consolidate, namespace-divergent
- [Maintainer scripts](#maintainer-scripts)
- [Exporting diagrams](#exporting-diagrams)

## Installing

### skills.mjs

The installer is AI-Assisted Work's `bin/skills.mjs`, a single Node script with no dependencies. This repository does not ship one. The commands this bundle's skills use:

```text
node <aaw>/bin/skills.mjs install [<name>...] --bundle <aaa> [--workspace <dir>] [--copy] [--dry-run]
node <aaw>/bin/skills.mjs list --bundle <aaa> [--json]
node <aaw>/bin/skills.mjs sync [--locked] [--copy]
node <aaw>/bin/skills.mjs update [<name>...]
node <aaw>/bin/skills.mjs check
node <aaw>/bin/skills.mjs remove <name>...
```

`install` copies the named skills, or every skill in `<aaa>/bundle.json`, into `.agents/skills/` and links `.claude/skills/<name>` at each when `.claude` exists (`--copy` copies instead). `sync` installs what a committed `.agents/skills.json` declares, such as `{ "sources": [ { "bundle": "https://github.com/dermot-obrien/ai-assisted-architecture.git", "ref": "main" } ] }`, and removes what it no longer declares; `--locked` installs exactly the commits in `.agents/skills.lock.json`, and needs a plain `sync` to have written that lock first. `check` exits 1 when an installed skill has changed or is missing. `--from <folder>` installs from copies on the machine with no network, and `SKILLS_BASE_URL` clones from a mirror. AAW's README documents the rest; [Installation](installation.md) shows each route.

Version 0.3.0 and earlier shipped `aaa install`, which ran through AAW's framework engine. It was removed in 0.4.0; the `v0.3.0` tag still has it.

### seed-foundation.mjs

```text
node <aaa>/scripts/seed-foundation.mjs [--workspace <dir>] [--profile <names>] [--force] [--dry-run]
```

Copies a foundation profile into a workspace: the capability model files (`capability-model.md`, its two CSVs, `README.md` and `diagrams/`) into `capabilities/`, each listed capability into `capabilities/CAP-NNN/`, each ABB into `building-blocks/architecture-building-blocks/`, each SBB into `building-blocks/solution-building-blocks/`, and `foundation-workspace.yaml` at the root. No skill needs the seed. It has no dependencies, so it runs without `npm install`. `npm run seed-foundation -- <options>` runs it from a clone's root.

| Option | Default | Effect |
|---|---|---|
| `--workspace <dir>` | current folder | Where to seed. Refuses the repository's own folder |
| `--profile <names>` | `core` | Comma-separated: `core`, `integration`, `infrastructure`; `all` or `foundation` for all three |
| `--force` | off | Overwrite what already exists. Without it, existing files print `= skip existing` |
| `--dry-run` | off | Print `[dry-run] <from> -> <to>` for each copy without writing |
| `--help`, `-h` | | Print usage and exit 0 |

Ends with a `seed complete` line giving the number of capabilities, ABBs and SBBs copied. A profile name it does not know prints `! profile not found` and is skipped.

## Skill tools

### stage.py

```text
python .agents/skills/architecture/bin/stage.py [CAP-NNN ...] [--bindings BINDINGS] [--json] [--verbose] [--check] [--doctor] [--version]
```

Derives each capability's definition stage on the ladder, per flow, and names what blocks the
next stage. Read-only. `bin/rung.py`, its former name, runs the same command, and `/architecture rung` still selects the flow.

| Option | Effect |
|---|---|
| `CAP-NNN ...` | Only these capabilities. Default: every one |
| `--bindings BINDINGS` | The bindings file to use. Default: the nearest `.agents/skill-bindings.toml` above the working directory |
| `--json` | Machine-readable output: `result`, `bindings`, `ladder`, `capabilities` (each with `stage`, `flows`, `blockers`, `latent`), `unbound`, `warnings`. Each `stage` key is written again as `rung`, its former name, for one release |
| `--verbose`, `-v` | Every blocker, not only the first |
| `--check` | Exit 1 when a stage recorded in `flows[].stage` is above the derived one |
| `--doctor` | Resolve the bindings, print them, and stop |
| `--version` | Print `architecture stage <version>` |
| `--help`, `-h` | Print usage |

In the table, `Recorded` shows a flow's recorded stage, with `claimed` when it is above the
derived stage and `stale` when below. Lines after the table start with `unbound` (a kind with
no folder bound), `note` (latent evidence, or a capability named elsewhere with no document) or
`warn` (a document that could not be read).

Exit codes: 0 done, 1 `--check` found a claim above the evidence, 2 the bindings did not
resolve.

### continuum.mjs

The check flow's tool, run from the workspace root:

```bash
node .agents/skills/architecture/bin/continuum.mjs doctor
node .agents/skills/architecture/bin/continuum.mjs check [--json] [--quiet] [--strict] [--root <dir>] [--bindings <file>] [--schemas <dir>]
node .agents/skills/architecture/bin/continuum.mjs scaffold --root <dir> --namespace <code> --name "<Name>" [--url <base>] [--bind]
```

`doctor` prints the resolved bindings (`root`, `schemes`, `namespaces`, `schemas`), where the three npm packages were found, and any problem, then stops. `check` reads every Markdown page and CSV register under the root and prints one line per finding (`level code file: message`) and a summary; `--quiet` prints errors only, `--strict` makes warnings fail, `--json` prints `{ status, summary, findings }`, and `--root` overrides the bound root for one run. `scaffold` writes the layout for a new root, never overwriting, and prints the bindings it answers; `--bind` appends them to `.agents/skill-bindings.toml`.

Exit codes: 0 no errors (warnings may print), 1 errors, or warnings with `--strict`, 2 usage or environment (Node older than 18, no bound root, the npm packages missing, an unknown command or argument).

### workspace.mjs

`workspace`'s tool. `--repo` names the repository, and defaults to the working directory, so it runs from a clone of this repository against a repository that has no skills yet:

```bash
node <skills>/workspace/bin/workspace.mjs doctor
node <skills>/workspace/bin/workspace.mjs init [--dry-run] [--force] [--declare vX.Y.Z] [--from <folder>] [--no-build]
node <skills>/workspace/bin/workspace.mjs clean [--apply]
node <skills>/workspace/bin/workspace.mjs install [--dry-run] [--force] [--declare vX.Y.Z] [--from <folder>]
node <skills>/workspace/bin/workspace.mjs regenerate | check | build [--fresh]
```

`doctor` changes nothing and says what is declared, locked and installed, what install would write and clean would remove, and what is for a person to decide. `init` runs clean with `--apply`, install, and build with a fresh `npm ci`; `--dry-run` prints that plan and stops. Install writes `scripts/architecture.mjs` (the repository's door to the skill) and the installer, adds the npm scripts `skills`, `skills:check`, `check:architecture`, `regenerate`, `prebuild` and `reinit` where they are missing, and runs the installer. Once a repository has the door, the same commands run from it:

```bash
npm run reinit              # node scripts/architecture.mjs reinit: install the skills if missing, then init
npm run check:architecture  # the continuum and cross-reference checks
npm run build               # prebuild regenerates the diagrams and decks first
```

Without the skill installed, every command of the door but `reinit` prints one line and exits 0. `REGENERATE=0` builds without regenerating, and `DECK_PDF=0` publishes decks without PDFs.

Exit codes: 0 done, 1 a step failed (the installer, npm, or a regeneration or check that ran), 2 usage, no git repository for clean, or no `.agents/skills.json` for install.

### Post-install checks

Each skill carries a check an installer runs after installing it. Run all of them from the workspace root with:

```text
node <aaa>/scripts/validate-bundle.mjs --run-checks . <aaa>
```

Or one at a time, from the workspace root:

```bash
node .agents/skills/architecture/bin/check.mjs                # the post-install check
node .agents/skills/architecture/bin/check.mjs --flow abb     # what one flow needs
node .agents/skills/workspace/bin/check.mjs
```

`SKILL_DIR` names the installed skill's folder and defaults to the folder above `bin/`, so it is needed only when the check runs from somewhere else.

`bin/check.mjs`, the same file in `architecture` and `workspace`, checks that `[suite.<skill>]` of `.agents/skill-bindings.toml` answers the skill's `inputs.toml` and that each declared path exists. Without `--flow` it requires the keys marked `required`, and, where `[inputs]` sets `requires_any`, at least one binding; with `--flow <name>` it requires the keys whose `required_by` names that flow. A key missing from the table is read from the old tables `[inputs] legacy_suites` names, with a warning. `.aaa-config.yaml` is optional: without it the check warns and carries on, and with it the check warns when its `ontology.schema` does not exist.

Exit codes: 0 correct (warnings may print), 1 problems, one per line, 2 usage or environment error (Node older than 18, an unknown flow, or an unknown argument).

### check.mjs --json

Step 0 of every create flow resolves its bindings with the skill's check:

```text
node .agents/skills/architecture/bin/check.mjs --json --flow <flow>
```

Run it from the workspace root. It prints one JSON object: `skill`, `flow`, `status` (`ok` or `error`), `bindingsFile`, `bindings` with each key of the skill's `inputs.toml` as an absolute path (`null` when not declared), and `problems` and `warnings`. It exits non-zero when `status` is `error`, and the flow stops. No other skill is needed. The stage flow resolves its own bindings with `stage.py --doctor`, and the check flow with `continuum.mjs doctor`.

### validate-skills.mjs

```text
node scripts/validate-skills.mjs [skillsRoot]
```

Checks every `<skillsRoot>/<name>/SKILL.md` against the Agent Skills specification: front
matter first, `name` matching the folder and at most 64 characters, `description` at most 1024,
`compatibility` at most 500, no unquoted `: ` in a value, relative links resolving, and body
length against the 500-line and 5,000-token guidance (warnings). Default root: `./skills`.
Exits 1 when any skill has an error. It takes no options, so `--help` is read as a folder name.

The specification's reference validator does the same job and CI runs both:

```bash
pip install "git+https://github.com/agentskills/agentskills.git#subdirectory=skills-ref"
skills-ref validate skills/architecture
```

### validate-bundle.mjs

```text
node scripts/validate-bundle.mjs [bundleDir ...]
node scripts/validate-bundle.mjs --instance <file.json> --schema <$id|file>[#pointer]
node scripts/validate-bundle.mjs --run-checks <workspace> [--skills <dir>] [bundleDir]
any form: --schemas <dir> to load more schemas
```

The first form checks `bundle.json` against the bundle schema and against the skills: every
skill listed and nothing else, versions and names equal to each `SKILL.md`, purls well formed,
check commands present, and the ontology module's references resolved. The second validates
one JSON document against a schema. The third runs every skill's post-install check from
`<workspace>`, with skills in `<workspace>/.agents/skills` unless `--skills` says otherwise.
This file is a copy of the one in AI-Assisted Work; change it there.

### validate-frontmatter.mjs

```text
node scripts/validate-frontmatter.mjs [--root <dir>] [--quiet]
```

Validates the front matter of every `index.md` under `--root` (default `foundation`) against
the per-kind schemas in `standards/schemas/v1.1.0/`, chosen by `kind`. Prints `ok`, `FAIL` or
`skip` per file and `validate-frontmatter: N files under <root> -> pass=N fail=N skip=N`. Exit 1
when any file fails. Needs `npm install` in a clone of this repository.

To validate your own workspace, point it at a folder of artefacts:

```bash
node <aaa>/scripts/validate-frontmatter.mjs --root capabilities
```

## Ontology tools

A workspace runs the validator that `/architecture runtime-agent` carries, `.agents/skills/architecture/references/scripts/ontology/validate.cjs`, which needs `js-yaml`, `ajv` and `ajv-formats` in the workspace's `node_modules`. In this repository all three scripts are under `scripts/ontology/` and need `npm install` once. Full reference: [Ontology](ontology.md) and [standards/ontology/SCRIPTS.md](../standards/ontology/SCRIPTS.md).

| Command | Does | Exit codes |
|---|---|---|
| `node scripts/ontology/validate.cjs <root> [--schema <path>] [--quiet] [--verbose]` | Validates every YAML or JSON file under `<root>` (or one file) whose top-level `ontology_id` is `modernisation-ontology` | 0 all conform, 1 one or more do not, 2 invocation or I/O error |
| `node scripts/ontology/consolidate.cjs <root> [--schema <path>] [--output <path>] [--format yaml\|json] [--validate] [--on-collision error\|first-wins\|last-wins] [--annotate-source] [--quiet]` | Merges the documents into one aggregate | 0 produced, 1 collision with `error`, 2 invocation, parse or validation failure |
| `node scripts/ontology/namespace-divergent.cjs <root> [--dry-run] [--quiet]` | Renames shared ids of cross-platform entity types to per-platform ids, updating references | 0 done, 2 invocation or I/O error |

In this repository the same three are `npm run validate`, `npm run consolidate` and `npm run namespace-divergent`.

## Maintainer scripts

For working on this repository. Run from its root.

| Command | Does |
|---|---|
| `python -m unittest discover -s skills/architecture/tests` | The stage flow's tests. CI also runs them with `STAGE_PURE_YAML=1` |
| `node scripts/test-architecture-ontology.mjs` | Tests `ontology/architecture.schema.json` against the base ontology's worked example and cases it must refuse |
| `node scripts/migrate-frontmatter.mjs [--root <dir>] [--date YYYY-MM-DD] [--dry-run]` | Brings front matter up to v1.1.0 from each document's body. Idempotent. Default root `foundation` |
| `node scripts/gen-capability-csvs.mjs` | Regenerates the foundation's `capability-hierarchy.csv` and `capability-abb-mapping.csv` from `capability-model.md` |
| `node scripts/sync-cap-abb-frontmatter.mjs` | Aligns each foundation L3 capability's `realised_by_abbs` with the traceability matrix |
| `python scripts/generate_sbb_diagrams.py` | Regenerates the foundation SBBs' `components.drawio` |
| `node scripts/sync-skill-standards.mjs [--check]` | Writes each skill's copy of the standards under `references/standards/` from `standards/`, as `skill-standards.json` lists them; `--check` fails when a copy differs. CI runs `--check` |
| `node scripts/generate-schema-diagram.mjs [--check]` | Draws the front matter schemas as `docs/schema.svg` in the layout of `docs/continuum.drawio`, and writes the tables of [docs/schema.md](schema.md); `--check` writes nothing and fails when either is stale, when a schema field has no line, or when the two pictures differ in a way the script does not explain. CI runs `--check` |

Each accepts `--help`. `gen-capability-csvs.mjs`, `sync-cap-abb-frontmatter.mjs` and `generate_sbb_diagrams.py` take no other options and write files.
[CONTRIBUTING.md](../CONTRIBUTING.md#checks-before-a-pull-request) lists what to run before a
pull request.

## Exporting diagrams

The skills export draw.io diagrams to PNG at 300 DPI with draw.io desktop on `PATH`:

```text
draw.io --export --format png --scale 3.125 --output components.png components.drawio
```

On Windows the executable is usually `C:\Program Files\draw.io\draw.io.exe`; add its folder to
`PATH`, or call it by full path.
