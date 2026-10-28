# Installation

Architecture Continuum is a bundle of two standalone [Agent Skills](https://agentskills.io), listed in [`bundle.json`](../bundle.json): `architecture`, with a flow per level of the continuum, and `workspace`, which sets a repository up for it. They work with any agent that reads Agent Skills: VS Code with GitHub Copilot, Cursor, Claude Code, Codex, Gemini CLI and others. The architecture skill is complete on its own: it carries the standards it reads, the configuration template and its own binding resolver. The [install quick start](quick-install.md) installs the continuum with every related skill in one command, and reinstalls over an installation; the [quick start](quick-start.md) walks through the first route below end to end.

Whichever route you take, you need:

| Requirement | Why |
|---|---|
| The `architecture` skill folder (and `workspace`, if you use it) where your agent reads skills | The skills themselves |
| `.agents/skill-bindings.toml` | Where each flow writes, in one `[suite.architecture]` table; see [Configuration](configuration.md#skill-bindings) |
| Node.js 18 or later | The installer, the architecture skill's `bin/check.mjs`, and the ontology validator |
| Python 3.11 or later | The stage flow |
| ajv, ajv-formats and js-yaml (`npm install` in the skill folder, or in the workspace) | `/architecture check` |
| git | Fetching the bundle |
| draw.io desktop, optional | PNG export of diagrams |

No package registry is needed.

## Where agents read skills

| Folder | Read by |
|---|---|
| `.agents/skills/` in the workspace | VS Code with GitHub Copilot, Cursor, Codex, Gemini CLI and most other hosts |
| `.claude/skills/` in the workspace | Claude Code; VS Code with GitHub Copilot and Cursor also read it |
| `.github/skills/` in the workspace | VS Code with GitHub Copilot |
| `.cursor/skills/` in the workspace | Cursor |
| `~/.agents/skills/`, `~/.claude/skills/`, `~/.copilot/skills/`, `~/.cursor/skills/` | The same tools, for every workspace |

The installer writes to the workspace-level `.agents/skills/` and links `.claude/skills/<name>` at each skill when a `.claude` folder exists (pass `--copy` to copy instead of linking). Check your agent's own documentation for the folders its current version reads.

## Route 1: the skills installer from a clone

The installer is `bin/skills.mjs` in [AI-Assisted Work](https://github.com/dermot-obrien/ai-assisted-work) (AAW), a single Node script with no dependencies. Clone both repositories anywhere, then install the bundle into the workspace:

```bash
git clone https://github.com/dermot-obrien/ai-assisted-work path/to/ai-assisted-work
git clone https://github.com/dermot-obrien/architecture-continuum path/to/architecture-continuum
node path/to/ai-assisted-work/bin/skills.mjs install --bundle path/to/architecture-continuum
```

Run it from the workspace root, or pass `--workspace <dir>`. Name a skill after the command to install only that one, for example `... install --bundle path/to/architecture-continuum architecture`. `skills.mjs list --bundle <clone>` shows what the bundle holds. The installer records where each skill came from in `.agents/skills.lock.json`.

## Route 2: a declared, locked set of skills

For a team workspace, declare the skills in a committed `.agents/skills.json` and let the installer fetch them from GitHub:

<!-- x-release-please-start-version -->
```json
{ "sources": [ { "bundle": "https://github.com/dermot-obrien/architecture-continuum.git", "ref": "v0.12.0" } ] }
```
<!-- x-release-please-end -->

Add `"skills": ["architecture"]` to the source to take only that skill. Pin a release tag, never `main`: the tag is what the lock and the release notes describe. The [install quick start](quick-install.md) declares the skills the continuum works with beside it, and its install script writes the declaration for you. Keep a copy of `skills.mjs` in the workspace (for example `scripts/skills.mjs`, copied from AAW's `bin/skills.mjs`), then:

```bash
node scripts/skills.mjs sync --copy            # the first time, and to take newer commits: writes .agents/skills.lock.json
node scripts/skills.mjs sync --locked --copy   # after a clone or at session start: exactly the locked commits
```

Commit `.agents/skills.json` and `.agents/skills.lock.json`. `sync` clones the bundle into `.agents/.skill-sources/`, which you should ignore. `--locked` refuses to run until a plain `sync` has written the lock. Without access to GitHub, set `SKILLS_BASE_URL` to a mirror, or pass `--from <folder>` with clones already on the machine.

## Route 3: copy the skill folders

With no installer at all, copy the folders yourself, at workspace or user level, from a clone:

```powershell
New-Item -ItemType Directory -Force .agents/skills | Out-Null
Copy-Item -Recurse path/to/architecture-continuum/skills/architecture, path/to/architecture-continuum/skills/workspace .agents/skills/
```

```bash
mkdir -p .agents/skills
cp -r path/to/architecture-continuum/skills/architecture path/to/architecture-continuum/skills/workspace .agents/skills/
```

For every workspace, copy into a user-level folder from the table above instead, such as `~/.agents/skills/`. Run the [post-install checks](commands.md#post-install-checks) afterwards.

## What to keep out of git

Installed skills are installer output. Ignore them, and re-run the installer after a pull:

```gitignore
.agents/skills/
.claude/skills/
.agents/.skill-sources/
```

## Optional: .aaa-config.yaml

The create flows work without a `.aaa-config.yaml`; their check prints a warning and carries on. Add one only to set a workspace ontology schema. The architecture skill carries the template at `references/standards/workspace/aaa-config.yaml`:

```bash
cp .agents/skills/architecture/references/standards/workspace/aaa-config.yaml .aaa-config.yaml
```

Then set `ontology.schema` to a path that exists; see [Configuration](configuration.md#aaa-configyaml).

## Optional: the foundation seed

`foundation/` is a generic starter model that no skill needs. To copy a profile of it into a workspace, run the seeder from a clone:

```bash
node path/to/architecture-continuum/scripts/seed-foundation.mjs --workspace . --profile core
```

See [Commands](commands.md#seed-foundationmjs) for its options.

## Your visual design standard

Diagrams take their colours from the visual design standard. Until you provide your own, the example palette each skill carries is used. To make your own, copy it anywhere in the workspace inside a folder named `visual-design`:

```bash
mkdir -p standards/visual-design
cp .agents/skills/architecture/references/standards/visual-design/visual-design-standard.md standards/visual-design/
```

Edit the hex values and keep the token numbering (`1.1`, `2.6` and so on), which the diagram standards refer to.

## Agent instruction files

The skills are enough on their own. If your team keeps always-on instruction files such as `AGENTS.md` or `CLAUDE.md`, write your own; this repository no longer ships snippets for them. A line naming the `/architecture` flows and where `.agents/skill-bindings.toml` is kept is usually all they need.

## Verify

```bash
node path/to/architecture-continuum/scripts/validate-bundle.mjs --run-checks . path/to/architecture-continuum
node path/to/ai-assisted-work/bin/skills.mjs check
```

The first prints one `ok` line per installed skill once each is bound; the second confirms every installed copy matches what was installed. Then type `/` in your agent: `/architecture` and `/workspace` should be listed.

## Update and remove

To update, pull the clone and run `skills.mjs install --bundle <clone>` again, or `skills.mjs update`. With a declared set, run the install script from `scripts/update-skills.ps1` or `scripts/update-skills.sh`, which moves every declared source to its latest release tag and reinstalls (see [the install quick start](quick-install.md#to-a-newer-release)), or move the `ref`s by hand, run `skills.mjs sync --copy`, and commit the new lock. Installing replaces the skill folders and leaves your artefacts, bindings and config alone.

To remove, run `skills.mjs remove <name>...`, or delete `.agents/skills/architecture`, `.agents/skills/workspace` and their links under `.claude/skills/` (and the source from `.agents/skills.json`). Delete `.aaa-config.yaml` if you made one. Your artefacts are yours and stay.

## The old installer

Version 0.3.0 and earlier installed through AAW's framework engine with `aaa install`. That installer, its npm commands and the instruction-file templates were removed in 0.4.0. If you still need it, check out the `v0.3.0` tag and use it with AAW 4.0.0; see the [changelog](../CHANGELOG.md).
