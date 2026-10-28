# Scripts

The full reference for every script, with its options and exit codes, is [docs/commands.md](../docs/commands.md).

## update-skills.ps1, update-skills.sh

Install Architecture Continuum and the skills it works with into a repository, or update an installation to the latest releases, from that repository's root. With no `.agents/skills.json` it declares every skill at its latest release tag and runs `workspace init`; with one, it moves each source it knows to its latest release and reinstalls. `-CheckOnly` (`--check-only`) changes nothing; `-WithPortfolio` (`--with-portfolio`) adds `portfolio`, `draft` and `convert` to a fresh install. The [install quick start](../docs/quick-install.md) and [Commands](../docs/commands.md#update-skillsps1-update-skillssh) have the details.

## seed-foundation.mjs

Seeds a workspace with foundation capabilities and building blocks from this repository's `foundation/`. The foundation is optional content that no skill needs. Zero-dependency Node, so it runs on every platform without `npm install`.

### Usage

Run it from the workspace root, or pass `--workspace`:

```bash
node path/to/architecture-continuum/scripts/seed-foundation.mjs --workspace . --profile foundation
```

### Options

- `--profile core|integration|infrastructure|all|foundation` (default: `core`; comma-separate several)
- `--workspace <dir>` (default: current directory)
- `--force` overwrite existing workspace files and folders
- `--dry-run` preview copy actions without writing

### Notes

- The workspace must not be this repository's own folder.
- Workspace files are canonical after seeding.
- The foundation in this repository remains read-only reference.

## generate_sbb_diagrams.py

Regenerates the Draw.io component diagrams for the foundation SBBs (SBB-001/002/003). The component definitions are declared inline in the script; run it from the repository root after editing those definitions.

Uses only the Python standard library — no third-party packages required.

### Usage

```bash
python scripts/generate_sbb_diagrams.py
```

## gen-capability-csvs.mjs

Regenerates the two derived capability CSVs (`foundation/capabilities/capability-hierarchy.csv` and `capability-abb-mapping.csv`) from the authoritative `capability-model.md` (the Canonical Capability Registry and the Capability-to-ABB Traceability Matrix). Coverage/scope columns are derived from each relationship by a fixed rule (primary→full/core, supporting→partial/core, cross-cutting→full/context). Zero-dependency Node.

```bash
node scripts/gen-capability-csvs.mjs
```

## sync-skill-standards.mjs

Writes each skill's own copy of the standards it reads, `skills/<skill>/references/standards/`, from `standards/` as `skill-standards.json` at the repository root lists them, so a skill installed on its own needs no clone of this repository. Paths under `standards/` keep their layout, so links between copied standards resolve; images a copied standard embeds are copied too; any other relative link is rewritten to the file on GitHub. Links in code are left alone. `--check` writes nothing and exits 1 when a copy differs, is missing or is no longer listed; CI runs it. Zero-dependency Node.

```bash
node scripts/sync-skill-standards.mjs
node scripts/sync-skill-standards.mjs --check
```

## sync-cap-abb-frontmatter.mjs

Aligns each L3 capability's `realised_by_abbs` frontmatter with the traceability matrix in `capability-model.md`, so the model, the per-capability frontmatter, and the mapping CSV stay in lock-step. Idempotent, zero-dependency Node.

```bash
node scripts/sync-cap-abb-frontmatter.mjs
```
