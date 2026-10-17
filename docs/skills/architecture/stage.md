# /architecture stage

Derives each capability's definition stage on the ladder, R0 Unrecognised to R6 In service, per
flow, from the artefacts that exist, and names the specific artefact that blocks the next stage.
Read-only: it never edits a capability or creates what is missing.

A definition stage says how far a capability has been defined and built towards service, not
where a piece of work is in a delivery lifecycle. The stages were called rungs before version
0.9.0 of the skill: `/architecture rung`, `bin/rung.py`, the `rung` key in `flows[]` and the
`rung` keys in the JSON output all still work.

Use it when you want to know what stage a capability is at, how far it has been defined, what
blocks it from moving up, whether a recorded or planned stage is backed by evidence, or the
starting and finishing stages of a piece of work or a planning period.

The ladder itself is explained in [Concepts](../../concepts.md#the-definition-ladder) and defined
in `standards/capabilities/standard-definition-ladder.md`.

## Before you start

It needs Python 3.11 or later. PyYAML is used when installed and is not required. Like every AAA skill it needs no other skill: it resolves its own bindings.

| Binding | Holds | If unbound |
|---|---|---|
| `capabilityDir` | Capability documents | Every capability is R0 |
| `abbDir` | ABBs | R2 cannot be evidenced |
| `sbbDir` | SBBs | R4 cannot be evidenced |
| `decisionDir` | Decision records | A resolved consideration cannot be confirmed at R3 |
| `considerationDir` | Considerations | R2 needs `open_questions: none` |
| `patternDir` | Patterns | R3 and above cannot be evidenced |
| `localPattern` | Regex for a local box id in a pattern's Building Blocks table | `[model] local_pattern`, then `[0-9]{1,3}` |
| `capabilityIdPattern` | Regex a capability id matches in full, such as `'^CP-\d{3}$'`. A page with no `id` takes it from its folder name, then its title | `^CAP-\d{3}$` |

Every binding is optional. Leave one unset when the workspace does not keep that kind; the
report then names it, so a blocker it causes reads as a gap in the workspace, not in the
capability. A binding that is set must exist.

## Run it

In your agent, ask "what stage is CAP-012 at?" or type `/architecture stage`. From a shell:

```bash
python .agents/skills/architecture/bin/stage.py --doctor          # resolve the bindings and stop
python .agents/skills/architecture/bin/stage.py                   # every capability and flow
python .agents/skills/architecture/bin/stage.py CAP-012 -v        # one capability, every blocker
python .agents/skills/architecture/bin/stage.py --json            # for tools and planning
python .agents/skills/architecture/bin/stage.py --check           # exit 1 if a recorded stage claims too much
```

All options and exit codes are in [Commands](../../commands.md#stagepy).

## Reading the output

```text
Capability  Flow         Stage       Recorded  Blocking the next stage
----------  -----------  ----------  --------  ----------------------
CAP-100     (all flows)  R2 Bounded            no pattern realises CAP-100 for flow shipping: add realises: [CAP-100] to a logical pattern
            shipping     R2 Bounded  R2        no pattern realises CAP-100 for flow shipping: add realises: [CAP-100] to a logical pattern
```

- Stage is the highest stage with every stage below it evidenced. With flows, the capability's
  stage is its lowest flow's.
- Recorded is `flows[].stage` from the document: `claimed` when above the derived stage, `stale`
  when below.
- Blocking the next stage is the first check that fails, with `(+N more)` when there are others;
  `-v` shows them all. [Troubleshooting](../../troubleshooting.md#stage-blockers) lists every
  blocker and the skill that fixes it.
- `note` lines report latent evidence, which counts once the stages below hold, and capabilities
  named elsewhere with no document. `unbound` lines name kinds with no folder.

When the agent reports a stage, it quotes the blocker exactly and names the skill that authors
the missing artefact. It never states a stage the tool did not derive.

## In CI

`--check` exits 1 when any flow records a stage the evidence does not support, so a workspace
can keep its recorded stages honest:

```bash
python .agents/skills/architecture/bin/stage.py --check
```

## In planning

`--json` output feeds planning: a piece of work's starting stage is the derived stage now, and the
stage it reaches is the derived stage at its end. The seam with AI-Assisted Work's planning is
described in `standards/aaw-work-seam.md`.

## Related

- [/architecture capability](capability.md) authors the capability, its flows and its
  demand.
- [/architecture abb](abb.md) and [/architecture sbb](sbb.md) author the
  building blocks R2 and R4 need.
- The [architecture-pattern](https://github.com/dermot-obrien/architecture-pattern) skill,
  `/pattern`, authors the patterns R3 to R6 need.
- The quick start's [steps 7 to 9](../../quick-start.md#7-derive-the-stages-of-the-starter-model)
  show it moving a capability from R1 to R2.
