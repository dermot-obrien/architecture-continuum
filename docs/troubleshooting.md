# Troubleshooting

Find the message you saw, then read what it means and what to do. Messages are quoted as the
tools print them; `<...>` stands for a path, key or value that varies.

- [Installing](#installing)
- [Bindings and post-install checks](#bindings-and-post-install-checks)
- [/architecture stage](#the-stage-flow)
- [Stage blockers](#stage-blockers): what each one asks you to create or fix
- [In your agent](#in-your-agent)
- [Validation and ontology scripts](#validation-and-ontology-scripts)

## Installing

#### `skills: no bundle at <path>/bundle.json. Pass --bundle <bundle.json or its folder>, or --repo <url> for one skill.`

`skills.mjs install` was not given this repository. Pass `--bundle` with the path of a clone; `--bundle` takes a folder or file, not a URL. To install from GitHub without a clone, declare the bundle in `.agents/skills.json` and run `skills.mjs sync` ([Installation](installation.md#route-2-a-declared-locked-set-of-skills)).

#### `skills: --locked: the lock has no commit for bundle <url>; run skills sync first`

`sync --locked` installs only what `.agents/skills.lock.json` records, and there is no lock yet. Run `skills.mjs sync` once, commit the lock it writes, then use `--locked`.

#### There is no `.claude/skills/`

The installer links `.claude/skills/` only when `.claude` exists. Skills are still in `.agents/skills/`, which most agents read. For Claude Code, create `.claude` and install again.

#### `aaa: command not found`, or `bin/aaa.js` does not exist

`aaa install` and the npm commands were removed in 0.4.0. Install with AI-Assisted Work's `skills.mjs` ([Installation](installation.md)), or check out the `v0.3.0` tag to keep the old installer.

#### Each skill appears twice in Cursor or GitHub Copilot

Those tools read both `.agents/skills/` and `.claude/skills/`. The second entry is a link to the same folder, so either works.

#### `/create-abb` (or any `/create-*`) does nothing

The unprefixed command shims were removed. Use `/architecture abb` and so on, and delete any `create-*` shims an older installer left behind.

#### `= skip existing: <name>`

The seeder found the file or folder already in the workspace and left it alone. Add
`--force` to `seed-foundation.mjs` to overwrite.

#### `! profile not found: <name> (<path>)`

`--profile` named a profile that does not exist. Use `core`, `integration`,
`infrastructure`, `all` or `foundation`.

#### `Workspace root points to the framework root`

The seeder was pointed at this repository's own folder. Run it from the workspace root, or pass `--workspace`.

#### `Error: Workspace root not found: <path>`

`--workspace` names a folder that does not exist. The seeder does not create it; make the
folder first, or correct the path.

## Bindings and post-install checks

#### `warning: .aaa-config.yaml: not found in <root>, so no workspace ontology schema is set. To set one, copy references/standards/workspace/aaa-config.yaml from this skill to the workspace root.`

Harmless: the file is optional and the skill carries on. Copy the template only if you want to set a workspace ontology schema; see [Configuration](configuration.md#aaa-configyaml). If you do have a `.aaa-config.yaml`, the check is running from the wrong folder: run it from the workspace root.

#### `warning: .aaa-config.yaml: ontology.schema <path> does not exist, so nothing can be validated against the ontology. Put the schema there, or correct the path.`

The template's default path is not in your workspace. Set `ontology.schema` to `.agents/skills/architecture/references/standards/ontology/ontology-schema.json`, or copy the schema to the path named. See [Configuration](configuration.md#aaa-configyaml).

#### `.agents/skill-bindings.toml: not found at or above <root>. Create it with [suite.<skill>] declaring <keys>.`

No bindings file. Create one; the [quick start](quick-start.md#5-bind-the-skills-to-folders)
has a complete example.

#### `<file>: [suite.<skill>] does not declare <key>, which the <flow> flow needs. Name the folder; it has no default.`

A binding the flow needs is missing. Add it to `[suite.architecture]`.
[Configuration](configuration.md#architecture) lists every key and the flows that need it.

#### `<file>: [suite.architecture] binds nothing, so no flow can run.`

The table is empty or missing, and no old `[suite.aaa-*]` table answers either. Bind the folders the flows you use need; the post-install check passes once one is bound.

#### `warning: <file>: <keys> read from the old table(s) [suite.aaa-<name>]; move them to [suite.architecture], which this release still falls back from`

The repository still answers the ten skills' old tables. It works for this release. Move each key named into `[suite.architecture]` and delete the old table; a key is read from only one table, and when two old tables disagree the first is used and the conflict is a second warning.

#### `architecture has no flow <name>; its flows are platform, strategy, capability, context, abb, sbb, service, runtime-agent, stage, check`

`--flow` names a flow the skill does not have. Use one of those listed. `rung`, the stage flow's former name, still selects it. Exit code 2.

#### `<file>: [suite.<skill>] <key> = "<value>" resolves to <path>, which does not exist. Create it, or correct <key>.`

Paths resolve against the bindings file's folder, not the working directory. With the file
in `.agents/`, a folder at the workspace root is `"../name"`.

#### `<file>: [suite.<skill>] <key> = "<value>" is a file; it should name a folder.`

A `dir` binding points at a file.

#### `<file> is not valid TOML: Invalid statement (at line 1, column 1)`

Almost always a byte order mark at the start of the file, which PowerShell 5.1 writes with
`Set-Content -Encoding utf8` or `Out-File`. Rewrite the file with `-Encoding ascii`, or save
it as UTF-8 without BOM in your editor. Any other position means a real TOML syntax error at
that line.

#### `Node.js <version> is too old: this check needs 18 or newer.`

Upgrade Node.js. Exit code 2.

#### `usage: check.mjs [--json] [--flow <name>]   (run from the workspace root; exit 0 ok, 1 problems, 2 usage or environment)`

`check.mjs` takes only `--json` and `--flow <name>`. Set `SKILL_DIR` to point it at another installed skill; see [Commands](commands.md#post-install-checks).

## The stage flow

#### `! bindings did not resolve:` followed by one line per problem

`stage.py` stopped before reading anything, with exit code 2. The lines below it are:

#### `no .agents/skill-bindings.toml found above the working directory. Add [suite.architecture] to the repository's bindings file, or pass --bindings`

Run from inside the workspace, or pass `--bindings <path>`.

#### `[suite.architecture] <key> = '<value>' resolves to <path>, which is not a directory`

A bound folder does not exist. Create it, correct it, or delete the key to leave that kind
unbound.

#### `[suite.architecture] <key> is not a key this skill declares`

A typo, or a key from another skill's table. The keys are listed in
[Configuration](configuration.md#what-the-stage-flow-reads).

#### `local pattern '<regex>' is not a valid regex: <reason>`

Fix `localPattern`, or `[model] local_pattern`. Use a single-quoted TOML string so
backslashes stay as written.

#### `capabilityIdPattern '<regex>' is not a valid regex: <reason>`

Fix `capabilityIdPattern` in `[suite.architecture]`. Use a single-quoted TOML string so
backslashes stay as written. Exit code 2.

#### `reading bindings needs Python 3.11 or newer (tomllib)`

The stage flow reads TOML with `tomllib`, new in 3.11. Upgrade Python, or run it with a newer interpreter such as `py -3.12`. Exit code 2.

#### `(capabilityDir is not bound, and none named by a pattern or consideration)`

Nothing to report because no capabilities folder is bound. Bind `capabilityDir`.

#### `(no capabilities found under capabilityDir, and none named by a pattern or consideration)`

The folder is bound but no document in it was indexed. A capability is indexed only when its
file starts with a `---` front matter block, its `kind` is `capability` or absent, and its
identifier matches `capabilityIdPattern` in full (`CAP-` and three digits by default). The
identifier is the front matter `id`, or with none, the folder name of an `index.md` or
`README.md`, then the first word of the `title` or H1. A workspace that numbers its
capabilities otherwise, such as `CP-102`, binds `capabilityIdPattern = '^CP-\d{3}$'`.

#### `unbound  <key>: no <kind>, so <consequence>`

That kind of artefact is not bound, so the stages that need it cannot be evidenced. It is a
gap in the workspace, not in the capability. Bind the folder if the workspace keeps that kind.

#### `warn  <path>: front matter is not valid YAML: <reason>` or `front matter is not a mapping`

That document was skipped. Fix its front matter. Tabs in indentation are refused.

#### `Recorded` shows `<stage> claimed`

A flow records a stage higher than the evidence supports, and `--check` exits 1. Either add
the missing evidence (the blocker says what) or lower `flows[].stage`.

#### `Recorded` shows `<stage> stale`

The evidence supports more than the recorded stage. Raise `flows[].stage`, or remove it and let
`/architecture stage` derive it.

#### `note  <CAP>: latent evidence at <stages>, not counted until the stages below hold`

Artefacts for a higher stage exist, but a lower stage is not yet met. They will count once it is.

#### `note  <CAP>: named by <pattern or consideration> but has no capability document`

Something refers to a capability that does not exist. Create it with `/architecture capability`,
or correct the reference.

#### `warn  pattern <id> names flow <flow>, which <CAP> does not declare`

The pattern's `flows` and the capability's `flows[].id` disagree. Correct one of them.

## Stage blockers

The last column of the `stage.py` table names what stops the next stage. Each blocker, what it
means, and who writes the fix.

| Blocker | Fix | Skill |
|---|---|---|
| `no capability document for <CAP> under capabilityDir` | Create the capability | `/architecture capability` |
| `<CAP> has no level (L1, L2 or L3)` | Add `level`, at the top level or in a nested `capability:` block | `/architecture capability` |
| `<CAP> is <level> but names no parent` | Add `parent` for L2 and L3, at the top level or in a nested `capability:` block | `/architecture capability` |
| `<CAP> states no purpose: add a description, or a Purpose section` | Add `description` or a Purpose section | `/architecture capability` |
| `<CAP> names no demand: add required_by_outcomes, or record demand_assumption` | Link an outcome, or record the demand as an assumption | `/architecture strategy`, `/architecture capability` |
| `<CAP> names no ABB in realised_by_abbs` | Name the ABBs that realise it | `/architecture abb` |
| `<ABB> is named by <CAP> but has no ABB document under abbDir` | Create the ABB, or correct the id | `/architecture abb` |
| `<ABB> does not declare requires (an empty list is enough)` | Add `requires`, `[]` if it needs nothing | `/architecture abb` |
| `no consideration affects <CAP> or its ABBs, and it does not declare open_questions: none` | Record each open question as a consideration, or state there are none | You; considerations have no skill yet |
| `<CN> is <status>: it needs an accepted decision record in resolved_by` | Decide, and resolve the consideration | You |
| `<CN> is resolved but names no resolved_by decision record` | Add `resolved_by: DR-NNN` | You |
| `<CN> is resolved by <DR>, which has no document under decisionDir` | Create the decision record, or bind `decisionDir` | You |
| `<CN> is resolved by <DR>, whose status is <status>, not accepted or active` | Accept the decision | You |
| `no pattern realises <CAP> for flow <flow>: add realises: [<CAP>] to a logical pattern` | Author a pattern that realises it | `/pattern` |
| `pattern <id> is <abstraction>: <boxes> not logical` | Replace the named boxes with ABBs | `/pattern` |
| `no SBB realises <ABB>` | Create an SBB that realises the ABB | `/architecture sbb` |
| `<ABB> is realised only by <SBB> (<status>): an SBB must be accepted or active` | Accept the SBB | You |
| `no physical pattern realises <CAP> for flow <flow>: pattern <id> is <abstraction>: ...` | Make a pattern physical, every box an SBB | `/pattern` |
| `pattern <id> is physical but has no cost-model reference` | Add a `references` entry of type `cost-model` | `/pattern` |
| `pattern <id> links no evidence: add a reference of type evidence` | Link the implementation's evidence | You, from implementation |
| `<CAP> status is <status>, not active` | Set the capability `active` once in service | You |
| `no runbook reference on <CAP> or a pattern that realises it` | Link the runbook as type `runbook` | You, from implementation |
| `needs R<n> first` | Fix the lower stage's blockers first | |

`/pattern` is the [architecture-pattern](https://github.com/dermot-obrien/architecture-pattern)
skill, installed separately.

## In your agent

#### The skill says its check failed and stops

That is deliberate: a skill never guesses a path. Run the same command yourself from the workspace root, `node .agents/skills/<name>/bin/check.mjs --json`, and fix the `problems` it reports.

#### The skill stops and names a standard it cannot find

The standards come from the workspace, then from the copy each skill ships in its
`references/standards/`. Check that the installed skill has that folder; reinstall the skill
if it does not. A workspace that moved its standards must keep the file names, such as
`standard-abb-document.md`, so the search finds them.

#### The skill writes files, but PNG export fails

draw.io desktop is not on `PATH`. Install it and add its folder to `PATH`, or export the
`.drawio` files by hand later. See [Commands](commands.md#exporting-diagrams).

#### Diagrams use colours you did not expect

No workspace `visual-design-standard.md` was found, so the example palette the skill carries was used. Copy it into your workspace and edit it; see [Concepts](concepts.md#standards-how-artefacts-are-written).

#### The runtime agent is reported as "authored but not validated"

`agentProfileSchema` or `ontologyValidator` is not bound for `/architecture runtime-agent`.
Bind them; see [Configuration](configuration.md#/architecture runtime-agent).

## Validation and ontology scripts

#### `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'js-yaml'` or `Error: Cannot find module 'js-yaml'`

`validate-frontmatter.mjs`, `migrate-frontmatter.mjs` and the ontology scripts need `js-yaml`, `ajv` and `ajv-formats`. In a clone of this repository, run `npm install` once. For the validator `/architecture runtime-agent` carries, install them in the workspace: `npm install js-yaml ajv ajv-formats`.

#### `validate-frontmatter: ... fail=<n>`, with lines such as `/ must have required property 'components'`

A document does not meet its kind's schema in `standards/schemas/v1.1.0/`. The minimal
documents in the quick start carry only what the ladder reads, and fail here; the
The create flows write the full set.

#### `FAIL  <file>  1 error(s)` with `/version  must be equal to constant {"allowedValue":"<version>"}`

The document's `version` is not the schema's version. Update it, or validate against the
schema version it was written for with `--schema`.

#### `Root not found: <path>`

The path given to an ontology script does not exist. Exit code 2.

#### `No skills directory at <path>`

`validate-skills.mjs` was given a folder that does not exist, which includes `--help`, since
it takes no options.

#### `<file>: '<key>' is an unquoted value containing ': ', which is invalid YAML; quote it`

A `SKILL.md` front matter value needs quotes. Other `validate-skills.mjs` errors name the
field and the limit it breaks.
