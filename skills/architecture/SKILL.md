---
name: architecture
description: "Author, check and assess an architecture on the architecture continuum, one flow per level: platforms, outcomes and use cases, capabilities, bounded contexts, architecture and solution building blocks, services and runtime agents, each to its standard with traceability kept; a capability's definition stage; a check of pages and registers; and the assessment of a design: specify it as data, triage it, assess it, report on it. Use when asked to create one of those artefacts (/architecture platform, strategy, capability, context, abb, sbb, service, runtime-agent), a capability's stage (/architecture stage, formerly rung), whether an architecture is compliant (/architecture check), or to specify, triage, assess or report on a design (/architecture specify, triage, assess, report). Also answers to its former names: aaa-create-platform, aaa-create-strategy, aaa-create-capability, aaa-create-context, aaa-create-abb, aaa-create-sbb, aaa-create-service, aaa-create-runtime-agent, aaa-rung, aaa-continuum."
license: CC-BY-4.0 AND Apache-2.0
compatibility: Node.js 18 or newer for the binding check and the continuum check (which also needs ajv, ajv-formats and js-yaml, from npm install here or the workspace); Python 3.11 or newer for the stage flow. PNG export needs draw.io desktop. Carries its own copy of the standards in references/standards/. Artefact locations come from [suite.architecture] of the repository's .agents/skill-bindings.toml; the skill ships no layout of its own.
metadata:
  author: dermot-obrien
  version: "0.15.0"
---

# Architecture

An architecture on the continuum, authored and checked one level at a time: the demand (platforms, outcomes, use cases, capabilities), the solution (bounded contexts, architecture and solution building blocks) and the runtime (services, runtime agents), each held as a page with front matter in the repository's own layout, with every link back to its parent kept.

This skill was ten skills, `aaa-create-platform` to `aaa-create-runtime-agent`, `aaa-rung` and `aaa-continuum`. They shared one method, one set of standards and one bindings file, so they are now flows of one skill, each in its own reference. A user who types an old name gets the flow it named.

## The flows

| The user | Flow | Read |
|---|---|---|
| `/architecture platform`, "create a business platform", `PL-NNN` | A platform with its executive owner, mission, outcomes and capabilities | [references/flows/platform.md](references/flows/platform.md) |
| `/architecture strategy`, "a business outcome", "a use case", `OC-NNN`, `UC-NNN` | An outcome with its measure, and the use case that supports it | [references/flows/strategy.md](references/flows/strategy.md) |
| `/architecture capability`, "define a capability", `CAP-NNN` | A capability in the capability model, with its level and maturity | [references/flows/capability.md](references/flows/capability.md) |
| `/architecture context`, "a bounded context", `BC-NNN` | A bounded context with its ubiquitous language | [references/flows/context.md](references/flows/context.md) |
| `/architecture abb`, "an architecture building block", `ABB-NNN` | A logical building block at container grain, with its diagrams | [references/flows/abb.md](references/flows/abb.md) |
| `/architecture sbb`, "a solution building block", `SBB-NNN` | A building block mapped to technologies, simple or composite | [references/flows/sbb.md](references/flows/sbb.md) |
| `/architecture service`, "a deployable service" | A runtime service that implements an SBB inside one context | [references/flows/service.md](references/flows/service.md) |
| `/architecture runtime-agent`, "a runtime agent", "an agent profile" | An autonomous agent with tiered guardrails, scope and provenance | [references/flows/runtime-agent.md](references/flows/runtime-agent.md) |
| `/architecture stage [CAP-NNN]` (or `rung`, its former name), "what stage is this capability at" | Read-only. Each capability's stage, per flow, and what blocks the next | [references/flows/stage.md](references/flows/stage.md) |
| `/architecture check`, "is this compliant", `/architecture scaffold` | Read-only. Every page and register against the continuum's standards; or the layout of a new root | [references/flows/check.md](references/flows/check.md) |
| `/architecture specify`, "turn this design into a specification", "write the design as data" | Writes only the specification. A design document turned into a design specification valid against the schema, with a list of what the document does not say. A solution design written from the pattern skill's template is translated table by table | [references/flows/specify.md](references/flows/specify.md) |
| `/architecture triage`, "what assessment does this need", "which tier is this agent" | Read-only except for the triage record. The assessment type and risk tier, AT1 to AT4, and the plan they set | [references/flows/triage.md](references/flows/triage.md) |
| `/architecture assess`, "assess this design", "review this agent", "is it ready for production" | Read-only except for the record. A design specification against the lenses, at the depth its triage set, with findings, dispositions and a proposed outcome. The check depth runs as `bin/assess.mjs check`, and `bin/assess.mjs changed` lists what a change must re-check. The criteria are the shipped lenses, or an organisation's own set named by the `assessment` binding ([references/organisation-criteria.md](references/organisation-criteria.md)): `bin/assess.mjs criteria` lists them and `bin/assess.mjs pages` publishes them | [references/flows/assess.md](references/flows/assess.md) |
| `/architecture report`, "write up this assessment", "make the readout" | Read-only except for the report and readout. An assessment record turned into a plain-language report and a slide readout for the people who decide | [references/flows/report.md](references/flows/report.md) |

Read the flow's reference before acting, and the references it names when it names them. With no flow named, ask which artefact the user means; never guess a level.

## Step 0 in every flow

Resolve the bindings first and use only the paths printed. The skill carries the method; where the artefacts live is the repository's to declare:

```bash
node <skills>/architecture/bin/check.mjs --json --flow <flow>
```

`<skills>` is the directory the skill is installed in. Run it from the workspace root. It prints each binding as an absolute path, or `null` when it is not declared, and exits non-zero when a binding the flow needs is missing or a declared path does not exist. Do not proceed on an error and do not guess a path. The stage and check flows resolve their own bindings too, as their references say.

All bindings sit in one table, `[suite.architecture]` of `.agents/skill-bindings.toml`, and paths resolve against that file's directory. The contract, with the flows that need each binding, is [inputs.toml](inputs.toml):

```toml
[suite.architecture]
root          = "../docs/architecture"            # check, scaffold
platformDir   = "../docs/architecture"
outcomeDir    = "../docs/architecture/demand/outcomes"
useCaseDir    = "../docs/architecture/demand/use-cases"
capabilityDir = "../docs/architecture/demand/capabilities"
contextDir    = "../docs/architecture/solution/contexts"
abbDir        = "../docs/architecture/solution/abbs"
sbbDir        = "../docs/architecture/solution/sbbs"
serviceDir    = "../docs/architecture/runtime/services"
```

A repository that still has the old tables, `[suite.aaa-create-abb]` and the rest, keeps working for this release: a key missing from `[suite.architecture]` is read from them, with a warning naming the table to move it from.

## Rules that hold in every flow

1. Never invent a parent. Where a flow needs a parent that does not exist, propose it with a plausible name and create it only when the user agrees.
2. Load the standards the flow's discovery reference names before writing anything. A copy the workspace holds wins over the skill's copy in `references/standards/`.
3. Every artefact links back to its parent in its front matter, and the parent's inverse list is updated in the same change.
4. The stage, check, specify, triage, assess and report flows never edit a page or a design document. They report, with the file and what to change, and write only their own output: a specification, a triage record, an assessment record, or a report and readout.

## Standards

The skill's copies, written from the continuum's `standards/` and checked against it in CI, are in [references/standards/](references/standards/). Each create flow's own list, with the order a workspace copy is preferred in, is in `references/discovery/<flow>.md`. The continuum itself is described in [references/continuum.md](references/continuum.md), and the framework-level traceability checks in [references/traceability.md](references/traceability.md).
