# Continuum

A repository on the architecture continuum keeps its architecture under one root: a page with front matter for each element, in a folder named after its identifier; a CSV register for each kind; and two registers of identifiers, the schemes (which series exist, where each kind's pages live and which register lists them) and the namespaces (which other catalogues it cites). Compliance is a claim that can be checked, so this skill checks it rather than asking anyone, and it reports each disagreement with the file it is in and what to change.

It never edits a page. The one thing it writes is the layout of a new architecture root, with `scaffold`, and it never overwrites a file that exists.

## Step 0, before anything else

Resolve the bindings and the modules, and use only the paths printed:

```bash
node <skills>/architecture/bin/continuum.mjs doctor
```

`<skills>` is the directory this skill is installed in. It exits 2 when the root is not bound or does not exist, or when the three npm packages are missing, and says what to do. Do not proceed on a problem, and do not guess a root: a check run over the wrong folder passes for the wrong reason.

| Binding | Holds |
|---|---|
| `root` | The folder the architecture lives in, such as `../docs/architecture`. Required |
| `schemes` | The schemes register. Default `<root>/registers/identifier-schemes.csv` |
| `namespaces` | The namespaces register. Default `<root>/registers/identifier-namespaces.csv` |
| `schemas` | A folder of front matter schemas, to check against a version other than the one this skill carries |

The contract is in the skill's `inputs.toml`. The repository answers it in `[suite.architecture]` of its `.agents/skill-bindings.toml`, and paths resolve against that file's directory. `--root <dir>` on the command line overrides the binding for one run.

## Check

```bash
node <skills>/architecture/bin/continuum.mjs check            # every finding, then the summary
node <skills>/architecture/bin/continuum.mjs check --quiet    # errors only
node <skills>/architecture/bin/continuum.mjs check --strict   # warnings fail too
node <skills>/architecture/bin/continuum.mjs check --json     # for tools and CI
```

Each finding is one line: the level, a code, the file relative to the root, and what disagrees with what. The exit is 1 when there is an error, and with `--strict` when there is a warning. The codes:

| Code | Checks |
|---|---|
| `CONT-00n` | The layout: a `README.md` map at the root, the `demand`, `solution`, `runtime` and `decisions` folders, the two registers of identifiers, the schemes register's columns and patterns |
| `FM-001` to `FM-003` | Every `index.md` has front matter with a `kind`, the kind has a schema, and the front matter validates against it, error by error |
| `FM-005` | An identifier names one page |
| `ID-001` to `ID-003` | An identifier matches a scheme, the scheme's kind is the page's kind, and the page lives where the scheme's `home` says, `{id}` substituted |

The portfolio's pages (the standard's §2.9 and §6.23) are read the same way, with three allowances: a candidate (`kind: candidate`) mints no identifier, so it is held to no scheme; a page whose `portfolio.state` is `archived` keeps its place in the tree under the archive folder, not its scheme's `home`; and a stub left where an archived page was, front matter with `moved_to` and no `kind`, is not a page at all. A placeholder (`portfolio.state: placeholder`) validates without the fields its kind requires once it has content.
| `REG-001` to `REG-005` | A scheme's register exists, every row's identifier is in the series, every row that is not retired has a page where the scheme has a home, every page has a row, a `path` column resolves, a status on both sides agrees, and no identifier is a row of two registers |
| `REL-001` | Every identifier in a relation field names a page or a register row; a service field names a service's slug; a citation `ns:ID` names a registered namespace, and resolves locally when the namespace is this catalogue's own |
| `REL-002` | A relation with an inverse is recorded on both sides: `realises` and `realised_by`, `part_of` and `contains`, `implements` and `implemented_by`, `resolved_by` and `resolves`, and the rest |
| `PAT-001` | A reference architecture `implements` architecture patterns only, and an architecture pattern is `implemented_by` reference architectures only; the schema already requires the type, the scope, the series and at least one `implements` on a reference architecture |
| `MOD-001` to `MOD-003` | `model.diagram` exists beside the page; every `*.render.json` names a view that exists and a source whose hash still matches, so no committed view is stale; a diagram has an exported view |
| `DEC-001`, `DEC-002` | A resolved consideration names an accepted or active decision, and an open one is not already resolved by a decision that lists it |
| `CAL-001` | A block in use is realised by an SBB, so its capability can reach R4 |

Warnings are `REL-002`, `MOD-003`, `DEC-00n`, `CAL-001`, a placeholder kind, a status that disagrees between a page and its register, and a missing map, folder or register of identifiers. Everything else is an error.

## Reporting back

Report the error count and the warning count, then the findings grouped by code, each with its file. For each code say what fixes it, and which skill does so where one does: a `FM-003` on an ABB is `/architecture abb`'s form; a `PAT-001` or a `MOD-002` on a pattern document is the `pattern` skill and `model stamp`; a `REG-002` is a row to add or a page to write; a `REL-002` is one line in the page it names. Never report a page as compliant that the tool did not pass, and never silence a finding by editing the registers to match a page that is wrong: the register is the index and the page is the record, and the check says which one disagrees with the standard.

When the output feeds CI, pass `--json` or read the exit code. A repository that wants warnings to fail passes `--strict`.

## Scaffold

```bash
node <skills>/architecture/bin/continuum.mjs scaffold --root docs/architecture --namespace ks --name "Knowledge Store" [--url <base url>] [--bind]
```

Writes the layout under the root: the `README.md` map, the `demand`, `solution`, `runtime`, `decisions` and `registers` folders, a schemes register with the continuum's series and their homes, a namespaces register with this catalogue's own row, and an empty CSV register for each kind, with a one-line README in each folder of pages. Nothing that exists is overwritten. It then prints the bindings the layout answers: the one `[suite.architecture]` table for every flow of this skill, and the tables for `pattern`, `use-case` and `cross-reference`; `--bind` appends them to `.agents/skill-bindings.toml` when the section is not already there. After scaffolding, the first pages come from the authoring skills, and `check` passes on an empty layout.

## What it reads

The standards are the continuum's, and this skill's copies are in `references/`: [the continuum page](../continuum.md), the [frontmatter standard](../standards/standard-frontmatter.md) with the [v1.1.0 schemas](../standards/schemas/v1.1.0/envelope.schema.json), and the [calibration standard](../standards/building-blocks/standard-building-block-calibration.md). A repository that keeps a newer copy of the schemas binds `schemas` to it.

## Related flows

- The `/architecture` create flows author each kind the check reads, and `/architecture stage` reads the same pages to derive each capability's stage.
- The `pattern` and `use-case` skills in architecture-pattern author the pattern documents and use cases, and `model stamp` in diagram-model writes the render records the `MOD` checks read.
- The `cross-reference` skill in architecture-pattern reads the same two registers of identifiers to link citations; `REL-003` here checks the namespaces it would use.
