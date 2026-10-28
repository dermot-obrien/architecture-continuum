---
title: "An organisation's own assessment criteria"
sidebar_label: "Organisation criteria"
---

# An organisation's own assessment criteria

The architecture skill ships the method of the [Architecture Assessment Standard](standards/assessment/standard-architecture-assessment.md) and five lenses of criteria: core, AI solution, AI agent, privacy and production. An organisation that assesses against criteria of its own keeps them in its own repository, and one binding tells the skill where they are. The skill and its scripts stay as installed; only the criteria change.

## What an organisation can change

- Add lenses of its own, with criteria a tool checks without code, or a reviewer answers.
- Leave out shipped criteria, or whole shipped lenses, that it does not use.
- Change the default severity of a shipped criterion, with the reason.
- Replace the shipped lenses entirely, and use only its own.
- Supply its own assessment and triage standards, read by the flows in place of the shipped ones.

What it cannot change is the method the scripts rely on: the results (`met`, `partly-met`, `not-met`, `not-applicable`, `not-assessed`), the finding types and dispositions, the outcome rules and the record schemas. Those keep assessments comparable, from one design to the next and from one organisation to another.

## Set it up

1. Make a folder for the criteria in the organisation's repository, such as `governance/assessment/`, with an `assessment.yaml` and a `lenses/` folder. The [worked example](standards/assessment/examples/organisation-criteria/) is a starting point to copy.
2. Bind it in `[suite.architecture]` of the workspace's `.agents/skill-bindings.toml`. The path is relative to that file.

   ```toml
   [suite.architecture]
   assessment = "../governance/assessment"
   ```

3. Check it. `doctor` names the criteria set and validates every lens; `criteria` lists what is in force and how each criterion is decided.

   ```text
   node .agents/skills/architecture/bin/continuum.mjs doctor
   node .agents/skills/architecture/bin/assess.mjs criteria
   ```

Without the binding, the shipped lenses apply unchanged. Any `assess.mjs` command also takes `--assessment <folder>`, which wins over the binding, to try a folder before binding it.

## assessment.yaml

Valid against `assessment-config.schema.json`, which the skill carries in `references/standards/assessment/schemas/`.

```yaml
schema: assessment-config/0.1.0
id: acme                       # recorded in every assessment that uses this set
version: 1.0.0                 # bump it whenever a lens, an exclusion or an override changes
title: Acme architecture criteria
builtin: extend                # extend: the shipped lenses apply too. replace: only the organisation's
lenses:                        # optional; default every .yaml in lenses/
  - lenses/acme-data.yaml
exclude: [CORE-CST-02]         # criterion ids, or whole lens ids
overrides:
  CORE-CST-01:
    severity: minor
    note: Cost is governed by the FinOps review, not by architecture assessment.
standards:                     # optional; default the shipped standards
  assessment: standards/assessment-standard.md
  triage: standards/triage-standard.md
```

A criterion id or a lens id may be defined once. An organisation's lens that reuses a shipped id is an error, not a quiet replacement: to change a shipped criterion, exclude it and write the organisation's own under a new id, or override its severity.

## An organisation's lens

A lens is the same YAML file the shipped lenses are, valid against `lens.schema.json`. Its id and its criterion prefix are the organisation's own (`acme-data`, `ACME`), and its criteria ids follow `<PREFIX>-<AREA>-NN`. It applies `always`, when a design has a profile (`applies_when: { profile: payments }`), or for an assessment trigger (`applies_when: { trigger: production-entry }`). A design declares an organisation's profile in `profiles`; the AI profiles are also derived from its facets.

Each criterion is decided by `tool`, `reviewer` or `both`, as in the shipped lenses. A criterion a tool decides, or whose presence half a tool decides, carries a `check`: the rule written so the tool applies it. A criterion with no `check` is reported as `manual`, for a person to apply by its `rule`; it is never guessed.

## Checks without code

A `check` is one rule, or a list of rules, over the design specification.

```yaml
check:
  for_each: data                 # the items to check: a dotted path, stepping into every list
  where: { personal: true }      # only the items meeting these
  require:                       # what each item must meet; each field is a clause
    residency: [EU, EEA]
  message: "personal data set {id} is not kept in the EU or EEA (residency: {residency})"
```

| Part | Meaning |
|---|---|
| `for_each` | A dotted path to the items checked, such as `data`, `connectors` or `elements.agent.tools`. Omitted, the rule checks the specification itself. |
| `where` | Field path to matcher; an item is checked only when all hold. |
| `require` | Field path to matcher; each field of each chosen item is one clause. |
| `count` | Instead of `require`: `{ min, max }` items may match `where`. One clause. |
| `message` | The note when a clause fails. `{id}`, `{name}` or any field of the item is filled in, and `{field}` with the required field. |

A matcher is a value (equals it), a list (each value is one of it), or an object of `present`, `equals`, `in`, `not_in`, `matches` (a case-insensitive regular expression), `min_items` and `max_items`. Over a path that steps through a list, `equals`, `in` and `matches` must hold for every value, and `present` for at least one.

The result follows the standard: every clause holding is `met`, some `partly-met`, none `not-met`, and no item to check `not-applicable`.

## Publishing the register

`assess.mjs pages` writes the criteria in force as Markdown, one page per criterion named by its id in lower case, a page per lens and an index, ready for a Docusaurus site. Point `criteriaUrl` at where they are published, and the triage and report flows link every criterion id to its page.

```text
node .agents/skills/architecture/bin/assess.mjs pages --out docs/assessment-criteria
node .agents/skills/architecture/bin/assess.mjs pages --out docs/assessment-criteria --check
```

The second form fails when a page is missing, stale or orphaned, so a pull request that changes a lens without regenerating the pages fails its check.

## In the records

The `check --json` output, and the assessment record's `assessment.criteria_set`, name the set (`id`, `version`, `builtin`), and every lens is recorded with its version, as before. A severity an override changed is recorded with the lens's default beside it. A record is therefore always readable against the criteria it was assessed with, even after the organisation's criteria move on.
