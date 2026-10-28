<!--
Branch from origin/develop and target develop; only a release goes from develop to main (CONTRIBUTING.md, "Releases"). A pull request into develop is squash merged, so its title is its line in CHANGELOG.md and the GitHub Release. Its type sets the next version (CONTRIBUTING.md, "Releases"): `feat(scope): what changed` bumps the minor version, `fix(scope): what changed` the patch, and a `!` after the type marks a breaking change. `docs`, `build`, `ci`, `chore`, `refactor`, `test` and `style` never bump. Write it for someone reading the release notes.
The description is the change record. Update it before merging so it says what merged. Delete any section that does not apply.
-->

## Summary

<!-- One or two sentences: what changes, and for whom. -->

## Why

Refs <!-- Required: the issue (#n, fixes #n, refs #n, or owner/repo#n), thread (t-xxx), improvement (IMP-NNN) or ADR (ADR-NNN) this serves. If there is none, write a line "No reference:" followed by the reason. The Change reference check fails a pull request into main that cites none of these. -->

## What changed

<!-- By skill, standard or document. The choices made, and the options rejected where that matters later. -->

## How it was verified

<!-- The checks in CONTRIBUTING.md, "Checks before a pull request", and anything else: a skill run in a workspace, a diagram rendered. Say what was not verified. -->

## Skills and consumers

<!-- Workspaces install pinned releases, not main. Which skills change, and their new versions in SKILL.md and bundle.json (CONTRIBUTING.md). What a workspace must do after taking the next release: nothing, re-run the installer, or change its bindings or workspace files. "Nothing for consumers" is an answer. -->
