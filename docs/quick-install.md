# Install quick start

Install Architecture Continuum and every skill it works with into a repository, with one declaration and one command, then reinstall over that installation whenever you need to. The [quick start](quick-start.md) is the tutorial that follows; [Installation](installation.md) has every other route.

| Skill | From | What it does |
|---|---|---|
| `architecture` | architecture-continuum | Authors and checks the architecture, one flow per level |
| `workspace` | architecture-continuum | Sets the repository up: clears out old skill leftovers, installs the skills, wires a build that runs without them |
| `pattern`, `use-case`, `cross-reference` | [architecture-pattern](https://github.com/dermot-obrien/architecture-pattern) | Pattern documents and use cases that are also the diagram and the deck; identifiers cited across catalogues |
| `model` | [diagram-model](https://github.com/dermot-obrien/diagram-model) | A diagram and a document as two views of one model |
| `markdown-deck` | [markdown-deck](https://github.com/dermot-obrien/markdown-deck) | Slides and PDFs from tagged Markdown |

## What you need

| Tool | For |
|---|---|
| git | Fetching the skills, and `workspace`'s clean step, which works only in a git repository |
| Node.js 18 or later | The installer and every Node skill |
| Python 3.11 or later, with PyYAML (`pip install pyyaml`) | The stage flow, `pattern`, `use-case` and `model` |
| Edge or Chrome, or `MARKDOWN_DECK_BROWSER` naming a Chromium | Optional: PDFs of decks |
| draw.io desktop | Optional: rendering diagrams to SVG and PNG |

Run every command below from the root of the repository you are installing into. For a new folder, run `git init` there first.

## Install

### 1. Fetch the continuum at a release

Take the latest release from the [releases page](https://github.com/dermot-obrien/architecture-continuum/releases); the commands below name the one current when this page was written.

```powershell
$Version = 'v0.7.0'  # x-release-please-version
git clone --quiet --depth 1 --branch $Version https://github.com/dermot-obrien/architecture-continuum.git ../architecture-continuum
```

```bash
VERSION=v0.7.0  # x-release-please-version
git clone --quiet --depth 1 --branch "$VERSION" https://github.com/dermot-obrien/architecture-continuum.git ../architecture-continuum
```

The clone is only the means of running `workspace` before it is installed. After the install the repository has its own copy, and the clone can go.

### 2. Declare the skills

`.agents/skills.json` names each skill and the release it comes from; commit it. The continuum is pinned to its release tag. The three other repositories have not tagged their current releases yet, so their skills are pinned to the commit of each release, which never moves: pattern 0.12.0, use-case 0.3.1 and cross-reference 0.3.1 at `363a743`, model 0.9.1 at `f098f06`, and markdown-deck 0.6.9 at `6e8e180`. When a repository tags a release (`pattern--v0.12.0`, `markdown-deck--v0.6.9`), pin the tag instead.

```powershell
New-Item -ItemType Directory -Force .agents | Out-Null
@"
{
  "sources": [
    { "bundle": "https://github.com/dermot-obrien/architecture-continuum.git", "ref": "$Version" },
    { "repo": "https://github.com/dermot-obrien/architecture-pattern.git", "ref": "363a743a911ae2d5764401ce46b6a871eb354e76", "path": "skills/pattern", "name": "pattern" },
    { "repo": "https://github.com/dermot-obrien/architecture-pattern.git", "ref": "363a743a911ae2d5764401ce46b6a871eb354e76", "path": "skills/use-case", "name": "use-case" },
    { "repo": "https://github.com/dermot-obrien/architecture-pattern.git", "ref": "363a743a911ae2d5764401ce46b6a871eb354e76", "path": "skills/cross-reference", "name": "cross-reference" },
    { "repo": "https://github.com/dermot-obrien/diagram-model.git", "ref": "f098f067b9a5ae859e4c56e84fcce7afd96fbdfd", "path": "skills/model", "name": "model" },
    { "repo": "https://github.com/dermot-obrien/markdown-deck.git", "ref": "6e8e18049342b3f7581dff38090ae364868f6479", "path": "skills/markdown-deck", "name": "markdown-deck" }
  ]
}
"@ | Set-Content -Encoding ascii .agents/skills.json
```

```bash
mkdir -p .agents
cat > .agents/skills.json <<EOF
{
  "sources": [
    { "bundle": "https://github.com/dermot-obrien/architecture-continuum.git", "ref": "$VERSION" },
    { "repo": "https://github.com/dermot-obrien/architecture-pattern.git", "ref": "363a743a911ae2d5764401ce46b6a871eb354e76", "path": "skills/pattern", "name": "pattern" },
    { "repo": "https://github.com/dermot-obrien/architecture-pattern.git", "ref": "363a743a911ae2d5764401ce46b6a871eb354e76", "path": "skills/use-case", "name": "use-case" },
    { "repo": "https://github.com/dermot-obrien/architecture-pattern.git", "ref": "363a743a911ae2d5764401ce46b6a871eb354e76", "path": "skills/cross-reference", "name": "cross-reference" },
    { "repo": "https://github.com/dermot-obrien/diagram-model.git", "ref": "f098f067b9a5ae859e4c56e84fcce7afd96fbdfd", "path": "skills/model", "name": "model" },
    { "repo": "https://github.com/dermot-obrien/markdown-deck.git", "ref": "6e8e18049342b3f7581dff38090ae364868f6479", "path": "skills/markdown-deck", "name": "markdown-deck" }
  ]
}
EOF
```

### 3. Install

```bash
node ../architecture-continuum/skills/workspace/bin/workspace.mjs init --repo . --dry-run   # the plan, changing nothing
node ../architecture-continuum/skills/workspace/bin/workspace.mjs init --repo .             # do it
```

`init` does three things in order:

1. Clean: removes what older tooling left behind, such as framework submodules, `aaa-*`, `aaw-*` and `aar-*` skills, and stale installed copies. It deletes only what git or the installer gives back, and reports everything else.
2. Install: writes `scripts/skills.mjs` (the installer) and `scripts/architecture.mjs` (the repository's door to the skills), adds `.gitignore` lines for the installed copies, installs the seven skills into `.agents/skills/` (and `.claude/skills/` when `.claude` exists), writes `.agents/skills.lock.json`, and installs the npm packages the skills need. With a `package.json` it also adds the npm scripts `skills`, `skills:check`, `check:architecture`, `regenerate`, `prebuild` and `reinit`.
3. Build: with a `package.json`, `npm ci` and `npm run build`. Without one, there is nothing to build and the step is skipped.

A repository with scripts or a `build` of its own keeps them: `init` reports each one it would change, and `--force` replaces them.

### 4. Bind the skills to folders

The skills have no default layout; one table says where the architecture lives. For a repository new to the continuum, the check flow scaffolds the layout and writes the bindings for it, for every flow and for `pattern`, `use-case` and `cross-reference`:

```bash
node .agents/skills/architecture/bin/continuum.mjs scaffold --root docs/architecture --namespace <code> --name "<Name>" --bind
```

`<code>` is a short lowercase name other catalogues cite this one by, such as `ks`. For an architecture that already exists, write `[suite.architecture]` in `.agents/skill-bindings.toml` by hand; [Configuration](configuration.md#architecture) lists every key and the flows that need it. To publish decks into the site, add:

```toml
[suite.workspace]
decks = "../site/static/decks"
```

### 5. Check it

```bash
node scripts/skills.mjs check                                    # every installed skill is as installed
node .agents/skills/architecture/bin/check.mjs                   # the bindings resolve
node .agents/skills/architecture/bin/check.mjs --flow abb        # what one flow needs
node scripts/architecture.mjs check                              # the continuum and cross-reference checks
node .agents/skills/workspace/bin/workspace.mjs doctor --repo .  # what is declared, installed and left over
```

Then commit `.agents/skills.json`, `.agents/skills.lock.json`, `.agents/skill-bindings.toml`, `scripts/`, `.gitignore` and any `package.json` change. The installed copies are ignored, and anyone who clones the repository gets them with `node scripts/skills.mjs sync --locked --copy`, or `npm run skills`.

## Reinstall over an installation

`reinit` clears out the installed copies and anything left over, installs the skills again from the lock, and builds. It is safe to run at any time: the lock, the declaration, the bindings and every committed file stay as they are.

```bash
npm run reinit -- --dry-run     # the plan, changing nothing
npm run reinit                  # do it
node scripts/architecture.mjs reinit   # the same, in a repository without a package.json
```

When the skills are not installed at all, as in a fresh clone, `reinit` installs them first and then runs. Run the checks in step 5 afterwards.

### To a newer release

1. Change the continuum's `ref` in `.agents/skills.json` to the new tag, and any other skill's `ref` you want to move.
2. Reinstall: `npm run reinit`, or `node scripts/architecture.mjs reinit`. It sees that the lock no longer matches the declaration, installs the declared refs instead of the locked commits, and rewrites the lock.
3. Read the release notes for what a workspace must change, run the checks, and commit the declaration and the lock.

### From the aaa-* skills, or the framework installers

A repository that installed the ten `aaa-*` skills (continuum 0.5.0 and earlier), or still carries the AI-Assisted Work, Architecture or Research framework clones, moves the same way. Fetch the continuum as in step 1, declare the skills as in step 2 (replacing the old declaration), and run `init` from the clone as in step 3, adding `--force` to route the repository's own `check:architecture`, `regenerate` and `prebuild` scripts through the door. Its lock names the old skills, so `init` installs the new declaration and rewrites the lock. Clean removes the old copies, the framework submodules and the `modules` block of `.aaw-config.yaml`, and reports what it leaves for you to decide. Then:

- Move the keys of the old `[suite.aaa-*]` tables into one `[suite.architecture]` table. Until you do, the skill reads them, with a warning naming each table.
- Change any script that calls `.agents/skills/aaa-*/` to `.agents/skills/architecture/`. `doctor` names the `package.json` scripts that call a skill directly.

### Without a network

Copy the skills onto the machine first, as clones of the four repositories or as a folder of skill folders, and pass `--from <folder>` to `init` or `reinit`. The installer then fetches nothing.
