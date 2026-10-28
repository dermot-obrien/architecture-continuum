# /architecture check

Checks an architecture repository against the architecture continuum and reports every
disagreement with the file it is in, or scaffolds the layout for a new one. Read-only apart from
the scaffold, which never overwrites a file.

Use it when you want to know whether an architecture catalogue is compliant before it is
published or merged, in CI on every pull request that touches the architecture, or to start the
`docs/architecture` folder of a repository that is new to the continuum.

The continuum itself is explained on [the continuum page](../../continuum.md); the standards the
check applies are the [frontmatter standard](../../../standards/standard-frontmatter.md) with its
schemas and the [calibration standard](../../../standards/building-blocks/standard-building-block-calibration.md).

## Before you start

It needs Node.js 18 or later and three npm packages, ajv, ajv-formats and js-yaml. Either run
`npm install` once in the skill's folder, or add the three to the workspace's own `package.json`
and install there; the skill looks in both places. Like every AAA skill it needs no other skill.

| Binding | Holds | If unbound |
|---|---|---|
| `root` | The folder the architecture lives in | The check stops: there is no default |
| `schemes` | The schemes register | `<root>/registers/identifier-schemes.csv` when it exists; else identifiers, homes and registers are not checked |
| `namespaces` | The namespaces register | `<root>/registers/identifier-namespaces.csv` when it exists; else citations of other catalogues are not checked |
| `schemas` | A folder of front matter schemas | The copy of v1.1.0 the skill carries |

The schemes register is what makes the check declarative. Each row is a series: its prefix, its
pattern, the kind of page it names, `home`, the path of each page with `{id}` for the identifier
(`solution/abbs/{id}-*/index.md`, or `platform.md` for a singleton, or empty for a series that
has register rows and no pages), and `register`, the CSV that lists the series. A page in the
wrong folder, a row without a page, a page without a row and an identifier in no series all come
from that one file.

## Run it

In your agent, ask "is the architecture compliant with the continuum?" or type `/architecture check`.
From a shell, at the workspace root:

```bash
node .agents/skills/architecture/bin/continuum.mjs doctor           # resolve the bindings and the modules, and stop
node .agents/skills/architecture/bin/continuum.mjs check            # every finding, then the summary
node .agents/skills/architecture/bin/continuum.mjs check --quiet    # errors only
node .agents/skills/architecture/bin/continuum.mjs check --strict   # warnings fail too
node .agents/skills/architecture/bin/continuum.mjs check --json     # for tools and CI
node .agents/skills/architecture/bin/continuum.mjs scaffold --root docs/architecture --namespace ks --name "Knowledge Store" --bind
```

All options and exit codes are in [Commands](../../commands.md#continuummjs).

## Reading the output

```text
error FM-003   solution/patterns/AP-001-ontology-driven-graphrag/index.md: /version must match pattern "^\d+\.\d+\.\d+..."
error REG-002  solution/abbs.csv: line 7: ABB-006 has no page at solution/abbs/ABB-006-*/index.md; write the page, or mark the row retired
warn  REL-002  runtime/services/SV-001-pipeline/index.md: SBB-003 realised_by_services pipeline, but realises here does not list SBB-003: the two sides of a relation agree
/architecture check check: 91 page(s), 13 register(s), 17 scheme(s) under docs/architecture; 2 error(s), 1 warning(s)
```

Each line is the level, the code, the file relative to the root and the disagreement. The codes
are listed in the skill's `SKILL.md`; in short, `CONT` is the layout, `FM` the front matter
against its schema, `ID` identifiers against the schemes, `REG` registers against pages, `REL`
relations that resolve and agree with their inverses, `PAT` the kinds of pattern document,
`MOD` diagrams and their exported views, `DEC` considerations against decisions and `CAL` the
calibration. Errors fail the check; warnings fail it only with `--strict`.

## In CI

Install the skills the workspace declares, install the three packages, and run the check:

```yaml
- run: node scripts/skills.mjs sync --locked
- run: npm ci
- run: node .agents/skills/architecture/bin/continuum.mjs check
```

`scripts/skills.mjs` is the workspace's copy of AI-Assisted Work's installer (see
[Installation](../../installation.md)). The check reads the lock's commits, so the result is the
same on every machine.
