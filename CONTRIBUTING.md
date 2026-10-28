# Contributing to AI-Assisted Architecture

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Ways to Contribute

### 1. Report Issues
- Bug reports for standards or scripts
- Suggestions for improvements
- Documentation clarifications

### 2. Improve Standards
- Enhanced ABB/SBB document or diagram standards
- Visual design standard improvements
- Cross-referencing refinements

### 3. Improve Agents
- Enhanced agent instructions
- New agent capabilities
- Bug fixes in existing agents

### 4. Improve Documentation
- Clearer explanations
- More examples
- Integration guides

### 5. Share Experience
- Use cases and examples
- Tips and best practices
- Integration patterns

## Open source, and giving improvements back

These skills are open source: documentation under CC BY 4.0 and code under Apache-2.0 (see `LICENSE`). You may use, copy and adapt them, inside an organisation or out, on the terms of those licences.

If you improve a skill and the improvement would be useful to others beyond you or your organisation, please give it back to the source repository, [ai-assisted-architecture](https://github.com/dermot-obrien/ai-assisted-architecture): open an [issue](https://github.com/dermot-obrien/ai-assisted-architecture/issues) describing the improvement, or a pull request with the change. An issue is enough when the change is specific to your setup, or when you cannot share the code.

This repository is the original source of its skills. Its `LICENSE`, `LICENSES/` and the licence headers in its files record that. Some skills first published here now live in repositories of their own, architecture-pattern (the pattern skill): each of those names this repository as its origin in its `NOTICE`, with the path and commit it came from, and that notice travels with every copy.

How you give back depends on how you took the skills.

### You copied the skills into another repository or skills library

A copy does not track this repository: it stays at the version you copied until you copy again.

1. Keep `LICENSE` and `LICENSES/` with every copy, including a single skill folder, and keep the copyright and licence headers in the files. Add your own attribution beside them rather than replacing them.
2. Record where the copy came from: this repository, and the release you took (a tag `vX.Y.Z`, see Releases below) or the commit. Before 0.4.0 release tags were named after the skill, `<skill>--v<version>`; those tags remain.
3. To update, copy a newer release over it, then re-apply any local changes you still need. Keep local changes small and separate, so they are easy to carry forward.
4. To give a change back, raise an issue here, or apply the change to a fork of this repository and open a pull request. A change made only in the copy is lost at the next update.

### You cloned or forked the repository and keep it in step

1. Keep this repository as a remote so you can take its releases: `git remote add upstream https://github.com/dermot-obrien/ai-assisted-architecture.git`, then `git fetch upstream` and merge or rebase onto its `main` or a release tag.
2. Make your changes on a branch in your fork, and open a pull request against this repository's `main` for anything useful to others. Keep organisation-specific configuration out of the skills: it belongs in your workspace's bindings, which this repository never needs to see.
3. If you publish your fork, it is a derivative work: follow Derivative Works below.

## Contribution Process

### For Minor Changes

1. Fork the repository
2. Make your changes
3. Submit a pull request

### For Significant Changes

1. **Open an Issue** describing what you want to contribute
2. **Discuss** with maintainers
3. **Fork and develop**
4. **Submit PR** referencing the issue

## Pull requests

- One change per pull request, from a branch started at `origin/develop` and into `develop`, with the template filled in: what, why (with the issue, thread, improvement or decision it serves, or `No reference:` and the reason), how it was verified, and what changes for the skills and the workspaces that install them.
- The title is a Conventional Commits subject (`feat(scope): what changed`), and so are the commit subjects. Pull requests are merged with merge commits, not squashed, so every commit subject reaches `main` and is a line in the release notes, and together they decide the next version (see Releases below). Write each commit subject for a reader of the notes. The PR check fails a title or a description that does not follow this; a commit subject in another form is a warning. A pull request into `main` must cite a change reference; into `develop` that check only warns.
- CI must pass: the checks below.
- Contributions are licensed as the file they change is (see Licensing of Contributions below).

### Checks before a pull request

CI runs these on every pull request. Run them from the repository root first:

```bash
node scripts/validate-skills.mjs skills
node scripts/validate-bundle.mjs --schemas standards/ontology .
node scripts/test-architecture-ontology.mjs
node scripts/sync-skill-standards.mjs --check
node scripts/generate-schema-diagram.mjs --check
python -m unittest discover -s skills/architecture/tests
```

Each skill carries its own copy of the standards it reads in `references/standards/`. After
changing a file under `standards/`, or the list in `skill-standards.json`, run
`node scripts/sync-skill-standards.mjs` to rewrite the copies, and commit them with the change.
After changing a schema or `docs/continuum.drawio`, run `node scripts/generate-schema-diagram.mjs`
to redraw `docs/schema.svg` and its page, and commit them with the change.

With `npm install` done, also run `node scripts/validate-frontmatter.mjs --quiet` when you change a schema or the foundation. CI also runs the `skills-ref` reference validator, installs the bundle into a scratch workspace with AI-Assisted Work's `bin/skills.mjs` and runs each skill's check there, and checks REUSE compliance; [Commands](docs/commands.md) describes each tool.

If you change anything inside a skill folder, bump that skill's version in its `SKILL.md` `metadata.version` and in `bundle.json` (version and purl): the patch for a fix, the minor for a change in what the skill does or reads, the major when a workspace must change to keep using it. Do not add a line to `CHANGELOG.md`: the pull request's title becomes that line at the next release. Changes to `docs/` need no skill version bump.

## Releases

The repository follows Git Flow. `develop` is the integration branch and the base of every pull request. `main` only takes releases: when a release is wanted, a pull request from `develop` to `main` is merged with a merge commit, never squashed, so the two branches keep one history. A fix to a released version branches from `main`, merges into `main`, then back into `develop`.

Releases are made from what reaches `main`, by [Release Please](https://github.com/googleapis/release-please) in the `Release Please` workflow. Versions follow [semantic versioning](https://semver.org/) and tags are `vX.Y.Z`. The version is the bundle's, the one `package.json` names and the one a workspace pins; each skill also carries its own version, bumped by hand as above, which is what the installer records in a workspace's lock.

| What | Rule |
|---|---|
| The next version | From the commit subjects that reached `main` since the last tag: `feat` bumps the minor version, `fix` the patch, and a `!` after the type or a `BREAKING CHANGE:` footer marks a breaking change, which bumps the minor version until 1.0.0 and the major after. `docs`, `build`, `ci`, `chore`, `refactor`, `test`, `style` and `perf` never bump on their own |
| The changelog | One section per release in `CHANGELOG.md`, written by Release Please: `feat` lines under Added, `fix` under Fixed, `perf` under Changed, `docs` under Documentation, and breaking changes first. The other types are kept out. Each commit subject is its line, so write commit subjects for a reader of the notes |
| The release pull request | Release Please keeps one open against `main`, `chore(main): release X.Y.Z`, and updates it on every merge into `main`. It bumps `version` in `package.json` and `package-lock.json`, `.release-please-manifest.json` and `CHANGELOG.md`. Merging it, with a merge commit, is the release: the workflow creates the tag and the GitHub Release with that section as its notes. Then `main` is merged back into `develop`. Nothing else tags, and nobody edits those four files by hand |
| Pins | A workspace pins a tag, `"ref": "vX.Y.Z"` on the bundle's source in `.agents/skills.json`, never `main` and never a commit. To upgrade, move the tag, read the release's notes, run `skills.mjs sync` and commit the new lock |
| 1.0.0 | A deliberate decision, made by adding `"release-as": "1.0.0"` to `release-please-config.json` for one release, not a consequence of a breaking change |

Before Release Please, versions were tagged by skill and `CHANGELOG.md` was written by hand. 0.4.1 was the last of those. The workflow publishes a version the manifest names but no tag carries, from its `CHANGELOG.md` section, so a hand-cut version is possible but should not be needed again.

Settings the maintainer keeps (nothing in the repository can set them): the repository secret `RELEASE_PLEASE_TOKEN`, a fine-grained token scoped to this repository with contents and pull requests write, which the workflow uses to open the release pull request so that it gets CI runs (a pull request opened with the workflow's own token starts no other workflow); and, under Pull Requests, merge commits allowed, their message the default title with a blank body, and `develop` as the default branch. The blank body matters: with the pull request's title in it, Release Please reads every merge commit as one more change, and lists each change once per merge as well as for its own commit. From the command line, `gh pr merge --merge --body ""` does the same. Without the secret the workflow falls back to its own token, which needs "Allow GitHub Actions to create and approve pull requests" on under Actions, and the release pull request then has no CI run until it is closed and reopened.

## Content Guidelines

### Organisation-Agnostic

All contributions must be:

- **Generic.** No company-specific references
- **Reusable.** Works for any organisation
- **Adaptable.** Easy to customise

### Standards

When contributing standards:

- Clear, unambiguous rules
- Non-normative examples where helpful
- British English spelling
- Bullet lead-ins use `. ` not ` — `

### Agent Instructions

When contributing agents:

- Clear, step-by-step instructions
- Defined inputs and outputs
- Error handling guidance
- Examples of usage

## Attribution

### Acknowledging the Original

AI-Assisted Architecture was created by **Dermot O'Brien**. When you:

- **Write** about the framework (blog posts, articles)
- **Present** the framework (talks, demos)
- **Teach** the framework (workshops, courses)
- **Fork** or create derivatives

Please consider crediting the original project and linking to this repository. This helps others find the source and supports the community.

### Derivative Works

If you create a derivative or fork:

1. Keep the original `LICENSE`, `LICENSES/`, and `REUSE.toml` files intact.
2. Preserve `SPDX-FileCopyrightText` and `SPDX-License-Identifier` headers in the files you carry over.
3. Mention "Based on AI-Assisted Architecture by Dermot O'Brien" in your README, and link to the original repository.
4. Indicate any changes you have made (required by both CC BY 4.0 and Apache-2.0).
5. Choose a different name for forks distributed as a distinct product — "AI-Assisted Architecture" is a trademark.

## Licensing of Contributions

This repository is dual-licensed:

- **Content** (Markdown, YAML, CSV, Draw.io, agent specs, foundation seeds): [CC BY 4.0](LICENSES/CC-BY-4.0.txt)
- **Code** (`scripts/*.py`, `scripts/*.ps1`): [Apache-2.0](LICENSES/Apache-2.0.txt)

By submitting a contribution (pull request, patch, issue with code), you agree that your contribution is licensed under the same terms as the file you are modifying. New code files must include an SPDX header:

```python
# SPDX-FileCopyrightText: <year> <your name or organisation>
# SPDX-License-Identifier: Apache-2.0
```

New content files are covered by the bulk rules in `REUSE.toml` and do not need per-file headers, but you may add one if you wish.

The project follows the [REUSE Specification 3.3](https://reuse.software/spec-3.3/) for machine-checkable licensing metadata.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Recognition

Contributors are recognised in:

- Release notes, where each pull request's title is a line
- Documentation credits

## Questions?

- Open a [Discussion](https://github.com/dermot-obrien/ai-assisted-architecture/discussions)
- Create an [Issue](https://github.com/dermot-obrien/ai-assisted-architecture/issues)

---

Thank you for helping improve AI-Assisted Architecture!
