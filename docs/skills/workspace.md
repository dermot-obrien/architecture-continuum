# workspace

Initialises a repository for the architecture skills, or reinitialises one that older tooling has left in a muddle: it clears out what retired tooling left behind, installs the skills the repository declares, wires the build so it runs with or without them, and builds the site.

Use it when a repository is new to the skills, when it still carries framework submodules, `aaw-*` or `aar-*` skills or a `modules` block from the framework installers, when its build fails on a clone without the skills, or when you want to start again from the lock: remove every installed copy, install them afresh and rebuild.

## Before you start

It needs Node.js 18 or later and git, and no npm packages, so it runs against a repository that has no skills yet: point it at the repository with `--repo` from wherever the skill is, such as a clone of this repository. The repository declares its skills in `.agents/skills.json`; with `--declare vX.Y.Z` the skill writes one declaring this bundle at that release.

| Binding | Holds | If unbound |
|---|---|---|
| `decks` | Where decks publish, such as `../site/static/decks` | No decks are published |
| `deckSource` | The folder whose `deck_publish: true` documents become decks | `[suite.architecture] root` |
| `pdf` | Whether each deck gets a PDF | `[suite.markdown-deck] pdf` |
| `diagrams` | The folders whose diagrams the pattern skill regenerates | The use-case and pattern `outputDir` |
| `render` | How the pattern skill renders views | `never` |

## What it does

```bash
node <skills>/workspace/bin/workspace.mjs doctor --repo .          # what is there; changes nothing
node <skills>/workspace/bin/workspace.mjs init --repo . --dry-run  # the plan
node <skills>/workspace/bin/workspace.mjs init --repo .            # clean, install, build
```

Clean removes what [references/retired.json](../../skills/workspace/references/retired.json) lists as left over, with the reason for each, plus links to skills that are not there, ignored installed copies of skills and ignored build output. It deletes only what git or the installer gives back: tracked files go through `git rm`, so their removal is staged for review, and an untracked file git does not ignore, or a tracked one with uncommitted changes, is kept and reported. It never edits `.claude/settings.json` or a `package.json` script; a hook that runs a retired installer, or a build script that calls a skill directly, is reported with what to change.

Install writes two files and replaces either only when the skill wrote it, unless you pass `--force`:

| File | Is |
|---|---|
| `scripts/architecture.mjs` | The repository's door to the skill. With the skill installed it runs its command; without it, it prints one line and exits 0 |
| `scripts/skills.mjs` | AI-Assisted Work's installer, or the path the repository already runs it from |

It adds the npm scripts that are missing (`skills`, `skills:check`, `check:architecture`, `regenerate`, `prebuild`, `reinit`, and `build` as `docusaurus build` when there is none), and the `.gitignore` lines for the installed copies, then installs the skills from the lock and any npm packages they need.

Build runs `npm ci`, then `npm run build`. Its `prebuild` regenerates: the pattern skill's diagrams, exports and walkthroughs for each bound folder, then the portfolio skill's inventory page of every pattern when `[suite.portfolio] inventory` is bound, then the decks and PDFs. Each step is skipped in one line when its skill is not installed, so a contributor or CI without the skills builds the same site from what is committed; a step that runs and fails stops the build, and `REGENERATE=0` builds without it.

## After a run

Review `git status` and commit: the removals of tracked files are staged, and the scripts, `package.json`, `.gitignore` and lock are in the working tree. From then on `npm run reinit` reinitialises the repository from inside it.
