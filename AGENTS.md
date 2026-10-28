# Agent notes

Guidance for any coding agent working in this repository, whatever tool runs it. `CLAUDE.md` is a one-line shim that points here. The README says what the repository is; [CONTRIBUTING.md](CONTRIBUTING.md) says how changes are made and checked.

## Versions and releases

Workspaces install pinned releases of this bundle, so every change is versioned. The full rules are in [CONTRIBUTING.md](CONTRIBUTING.md#releases); the ones an agent needs:

1. A pull request's title is a Conventional Commits subject, `type(scope): what changed`, written for someone reading the release notes: a pull request into `develop` is squash merged with its title as the subject, which becomes its one line in `CHANGELOG.md` and the GitHub Release. `feat` bumps the minor version, `fix` the patch, and a `!` after the type (or a `BREAKING CHANGE:` footer in the description) marks a breaking change, which bumps the minor version until 1.0.0. `docs`, `build`, `ci`, `chore`, `refactor`, `test` and `style` never bump. The PR check fails a title in another form and a description that cites no reason for the change; a commit subject in another form is a warning, and fails only when it is the pull request's only commit.
2. The repository follows Git Flow. `develop` is the integration branch: every branch starts from `origin/develop`, and its pull request targets `develop` and is squash merged. `main` only takes releases: a pull request from `develop` to `main` with a `chore(release): ...` title, merged with a merge commit, never squashed, or the two branches' histories diverge. Its `chore` title keeps the merge commit out of the release notes. A fix to a released version branches from `main`, merges into `main`, then back into `develop`.
3. Never edit the bundle's version by hand: not `version` in `package.json` or `package-lock.json`, not `.release-please-manifest.json`, and not `CHANGELOG.md`. Release Please writes all four in the release pull request (`chore(main): release X.Y.Z`), which it keeps open against `main` and updates on every merge into `main`. Merging it is the release: the tag `vX.Y.Z` and the GitHub Release follow from the `Release Please` workflow, and nothing else tags. Then merge `main` back into `develop`, so the release commit is on both.
4. A skill's own version is different: when you change anything inside a skill folder, bump `metadata.version` in its `SKILL.md` and the version and purl in `bundle.json`, in the same pull request. That is the version the installer records in a workspace's lock.
5. A workspace pins a tag, never `main` and never a commit: `"ref": "vX.Y.Z"` on this bundle's source in its `.agents/skills.json`. A change reaches a workspace only after the release pull request that carries it is merged and the workspace moves its pin.

## Writing style

No em dashes as sentence punctuation, no bold inside a sentence, British spelling, and each paragraph on one line.
