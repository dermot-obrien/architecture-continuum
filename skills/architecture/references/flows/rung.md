# Rung

A capability's rung on the definition ladder is a claim that can be checked, so this skill checks it rather than asking anyone. It reads the capability, its ABBs, the considerations that affect them, the decision records that resolve those, the SBBs, and the patterns that realise the capability, and reports the highest rung held with every rung below it evidenced. For the next rung up it names the artefact that is missing or says the wrong thing.

It never writes. It does not edit a capability's recorded rungs, and it does not create the missing artefact. Those are for the user, or for the `/architecture` flow that authors that kind.

## Step 0, before anything else

Resolve the bindings and use only the paths printed:

```bash
python <skills>/architecture/bin/rung.py --doctor
```

`<skills>` is the directory this skill is installed in. It exits 2 when a bound path does not exist or a key is unknown, and names each. Do not proceed on an error, and do not guess a path: a rung derived over the wrong directory looks exactly like a real one.

Every directory is optional. A repository that does not keep a kind of artefact leaves its binding unset, and `--doctor` shows it as not bound. Nothing is read for an unbound kind, and the report lists it with what it costs, such as no SBBs meaning R4 cannot be evidenced. Say so when you report a rung: a blocker caused by an unbound kind is a gap in the repository, not in the capability. With no `[suite.architecture]` section at all, every kind is unbound and the report is empty but the run succeeds.

| Binding | Holds |
|---|---|
| `capabilityDir` | Capability documents (`CAP-NNN`, or ids matching `capabilityIdPattern`) |
| `abbDir` | Architecture Building Blocks (`ABB-NNN`) |
| `sbbDir` | Solution Building Blocks (`SBB-NNN`) |
| `decisionDir` | Decision records (`DR-NNN`) |
| `considerationDir` | Considerations (`CN-NNN`) |
| `patternDir` | Patterns, with `realises: [CAP-NNN]` in their front matter |
| `localPattern` | The regex for a local box id such as `07`. Falls back to `[model] local_pattern`, then `[0-9]{1,3}` |
| `capabilityIdPattern` | The regex a capability id matches in full, default `^CAP-\d{3}$`. A capability page with no `id` takes it from its folder name, then the first word of its title or H1 |

The contract is in the skill's `inputs.toml`. The repository answers it in `[suite.architecture]` of its `.agents/skill-bindings.toml`, and paths resolve against that file's directory. Every directory is searched recursively for Markdown with front matter.

## Derive

```bash
python <skills>/architecture/bin/rung.py                 # every capability, and each of its flows
python <skills>/architecture/bin/rung.py CAP-012 -v      # one capability, every blocker
python <skills>/architecture/bin/rung.py --json          # for tools, including quarter planning
python <skills>/architecture/bin/rung.py --check         # exit 1 if a recorded rung claims more than the evidence
```

The table shows, for each capability and each declared flow, the rung held, the rung recorded in `flows[].rung` where there is one (marked `claimed` when above the derived rung and `stale` when below it), and the first blocker for the next rung. Notes follow for latent evidence and for capabilities that patterns or considerations name but that have no document.

## The rules it applies

These are the checks from the Definition Ladder Standard (section 2; this skill's copy is [references/standards/capabilities/standard-definition-ladder.md](../standards/capabilities/standard-definition-ladder.md)). A rung holds only when its own check passes and every rung below it holds.

| Rung | Passes when |
|---|---|
| R1 Named | The capability document has `level`; `parent` if L2 or L3 (either may sit in a nested `capability:` block instead of at the top level); a purpose, as `description` or a Purpose section; and `required_by_outcomes` or `demand_assumption` |
| R2 Bounded | `realised_by_abbs` is non-empty; each ABB has a document that declares `requires` (an empty list is enough); and a consideration affects the capability or one of its ABBs, or the capability declares `open_questions: none` |
| R3 Decided | Every consideration affecting the capability or its ABBs, other than withdrawn ones, is `resolved` by a decision record whose status is `accepted` or `active`; and a realising pattern has every box an ABB (or is already physical) |
| R4 Buildable | Every ABB is realised by an SBB whose status is `accepted` or `active`; and a realising pattern is physical, every box an SBB, with a `cost-model` reference |
| R5 Proven | A physical realising pattern has an `evidence` reference |
| R6 In service | The capability's status is `active`, and it or a realising pattern has a `runbook` reference |

A pattern's abstraction is derived from the identifiers in its Building Blocks or Required Building Blocks table, by the `model` skill's rule: all local roles is conceptual, ABBs with or without local roles is logical, all SBBs is physical, anything else is mixed. Rows marked `external` or `context` in a Kind column are ignored, and an ABB or SBB id with no document counts as unknown, which makes the pattern mixed.

Flows. R1 and R2 belong to the capability. From R3 up, a flow counts only the realising patterns that list it in their `flows`, or that list no flows. The capability's rung is its lowest flow's.

Latent evidence. A rung whose own check passes above the rung held is reported as latent and never counted. Running code for a capability with no document is R0, whatever else exists.

## Reporting back

Give the rung for each capability asked about, per flow where it has flows, and quote the blocker for the next rung exactly as the tool printed it, because it names the artefact to create or fix. Say which create flow authors that artefact where one does (`/architecture capability`, `/architecture abb`, `/architecture sbb`, `/pattern`). Report any recorded rung marked `claimed` as a claim without evidence, not as the capability's rung. Report latent evidence as work that will count once the rungs below it exist. Never state a rung the tool did not derive.

When the output feeds planning, pass `--json`. An epic's starting rung is the derived rung now, and the rung reached at the end of a period is the derived rung then. The seam is described in the AAW work seam standard; this skill's copy is [references/standards/aaw-work-seam.md](../standards/aaw-work-seam.md).

## Related flows

- `/architecture capability` authors the capability document, its flows and its demand.
- `/architecture abb` and `/architecture sbb` author the building blocks R2 and R4 need.
- `/pattern` authors the pattern that realises the capability, with `realises`, `flows` and its `cost-model` and `evidence` references.
- `quarter-planning` (AI-Assisted Work) plans rung movements and reads this skill's `--json` output.
