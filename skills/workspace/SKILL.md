---
name: workspace
description: "Initialise or reinitialise a repository that uses the architecture skills. Clears out what retired tooling left behind (framework submodules, aaw-* and aar-* skills, the old modules block, stale installed copies and build output), installs the skills .agents/skills.json declares, writes the repository's door script so its check and regeneration skip quietly when the skills are missing, wires package.json and .gitignore, and runs the Docusaurus build. Use when asked to set up, initialise, reinitialise, reset or clean a repository for the architecture skills, to clear out old skill or framework remnants, to make a site build without the skills installed, or to reinstall the skills and rebuild the site."
license: Apache-2.0
compatibility: Node.js 18 or newer and git; no npm packages. The build needs the repository's own Docusaurus packages. Regeneration runs the pattern and model skills (Python 3.11 or newer, PyYAML) and markdown-deck (its npm packages, and a Chromium-based browser for PDFs) when they are installed, and skips each one that is not.
metadata:
  author: dermot-obrien
  version: "0.1.2"
---

# Workspace

A repository that uses the architecture skills should build the same site with or without them. The skills are tooling for whoever authors the architecture; a contributor or CI without them still gets a green build from what is committed. This skill sets a repository up that way, and resets one that older tooling has left in a muddle.

## Step 0, before anything else

See what is there, and change nothing:

```bash
node <skills>/workspace/bin/workspace.mjs doctor --repo <repository>
```

`<skills>` is where this skill is installed: `.agents/skills` in a repository that already has it, or a clone of architecture-continuum's `skills/` for a repository that does not yet. It reports what is declared, locked and installed, what install would write, what clean would remove, and what is left for a person to decide. Read it to the user before changing anything.

## Initialise or reinitialise

```bash
node <skills>/workspace/bin/workspace.mjs init --repo <repository> --dry-run   # the plan
node <skills>/workspace/bin/workspace.mjs init --repo <repository>             # do it
```

`init` is clean, install and build in that order. Once a repository has been initialised, `npm run reinit` does the same from inside it, and installs the skills first when they are missing.

| Step | Does |
|---|---|
| `clean` | Removes the framework submodules, retired skills, links to nothing, the `modules` block of `.aaw-config.yaml`, ignored installed copies of skills (install puts back the declared ones from the lock) and ignored build output. A dry run unless `--apply` |
| `install` | Writes `scripts/architecture.mjs` and the installer, adds the npm scripts and `.gitignore` lines that are missing, installs the declared skills (`--locked` when there is a lock) and any npm packages they need. `--declare vX.Y.Z` writes `.agents/skills.json` when there is none |
| `build` | `npm ci` (always in `init`, otherwise only when `node_modules` is missing), then `npm run build`, whose `prebuild` regenerates |

What clean treats as left over is listed, with the reason for each, in [references/retired.json](references/retired.json). It deletes only what git or the installer gives back: an untracked file that git does not ignore, and a tracked file with uncommitted changes, are kept and reported. It never changes `.claude/settings.json` or a `package.json` script; a hook that runs a retired installer, or a build that calls a skill directly, is reported with what to change. Report every note to the user.

Install replaces a file or script only when this skill wrote it; `--force` replaces the rest, and replaces a `build` script that calls the skills directly with `docusaurus build`. Ask the user before passing `--force`.

## The repository's door

`scripts/architecture.mjs` runs this skill's command when the skill is installed, and when it is not prints one line and exits 0:

| npm script | Runs |
|---|---|
| `check:architecture` | The continuum check (`--strict`) and the cross-reference check |
| `prebuild`, `regenerate` | The pattern skill's diagrams, exports and walkthroughs for each bound folder, then the decks and PDFs |
| `reinit` | `init`, installing the skills first when they are missing |
| `skills`, `skills:check` | The installer: install the locked skills, or say what changed |

Each step of `check` and `regenerate` is skipped in one line when its skill or binding is missing, so the build continues from what is committed. A step whose skill is installed and fails stops the build: that is a page to fix, or `REGENERATE=0` to build without regenerating.

## Bindings

All optional, in `[suite.workspace]` of `.agents/skill-bindings.toml` (the contract is [inputs.toml](inputs.toml)):

```toml
[suite.workspace]
decks = "../site/static/decks"   # where decks publish; unbound, no decks
# deckSource = "../docs/architecture"   default: [suite.architecture] root
# diagrams = ["../docs/architecture/demand/use-cases"]   default: the use-case and pattern outputDir
# pdf = true                            default: [suite.markdown-deck] pdf
# render = "never"                      how the pattern skill renders views
```

## After a run

Say what changed and what was kept, then have the user review `git status` and commit: the removals of tracked files are staged by git, and the new scripts, `package.json` and `.gitignore` changes are in the working tree. The installed copies are ignored and stay out of the commit; the lock is committed.
