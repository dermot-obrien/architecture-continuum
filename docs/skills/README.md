# Skills

Two Agent Skills: `architecture`, with a page per flow, and `workspace`. Each skill's own `SKILL.md`, and for the architecture skill each flow's reference under `references/flows/`, is the definition the agent follows; these pages are for the person using it.

The architecture skill was ten skills, `aaa-create-strategy` to `aaa-continuum`, and still answers to their names.

| Skill and flow | Does | Writes |
|---|---|---|
| [/architecture strategy](architecture/strategy.md) | Creates a business outcome with its measures, and a use case that supports it | `OC-NNN/`, `UC-NNN/` |
| [/architecture platform](architecture/platform.md) | Creates a business platform with its executive owner and mission | `PL-NNN/` |
| [/architecture capability](architecture/capability.md) | Creates a capability and adds it to the capability model | `CAP-NNN/`, `capability-model.md` |
| [/architecture context](architecture/context.md) | Creates a bounded context with its ubiquitous language | `BC-NNN/` |
| [/architecture abb](architecture/abb.md) | Creates a logical Architecture Building Block with its diagrams | `ABB-NNN/` |
| [/architecture sbb](architecture/sbb.md) | Creates a Solution Building Block that maps an ABB to products, simple or composite | `SBB-NNN/` |
| [/architecture service](architecture/service.md) | Creates a runtime service that implements an SBB | `<name>.md` |
| [/architecture runtime-agent](architecture/runtime-agent.md) | Specifies an autonomous runtime agent with guardrails, scope and provenance | Ontology records and an agent profile |
| [/architecture stage](architecture/stage.md) | Derives each capability's stage on the definition ladder and what blocks the next | Nothing: read-only |
| [/architecture check](architecture/check.md) | Checks every page and register of an architecture against the continuum's standards, and scaffolds the layout for a new repository | Nothing, or the empty layout |
| [workspace](workspace.md) | Clears out what retired tooling left in a repository, installs the declared skills, wires a build that runs without them, and builds the site | `scripts/architecture.mjs`, the installer, npm scripts and `.gitignore` lines |

## How the eight create flows work

The create flows share one shape, so learning one teaches you the rest.

1. Step 0, resolve. The flow runs `bin/check.mjs --json --flow <flow>` from the workspace root and uses only the paths it prints. A missing binding the flow needs stops it.
2. Phase 1, discovery. It asks what it needs and checks that the parents exist. A missing
   parent is proposed, with a plausible name, and created only if you agree.
3. Phase 2, load standards. It finds each standard it needs in the workspace, falling back to
   the copy the skill ships in `references/standards/`, and stops if one is missing. Each flow's
   `references/discovery/<flow>.md` lists them.
4. Phase 3, create. It writes the artefacts in a fixed order, at the next free identifier.
5. Phase 4, self-verify. It runs the checklist from the standard and the traceability checks,
   and reports which passed rather than asserting completion.

You invoke a flow by typing `/architecture <flow>`, or by asking for what it does: the skill's
description lets the agent pick it when a request matches.

## Where to start

Follow the golden thread from the top when you are modelling something new: strategy,
platform, capability, context, ABB, SBB, service. When you already know the building block you
need, start there; the flow will offer to create what is missing above it. Use `/architecture stage` at
any point to see where each capability stands, and `/architecture check` before publishing or merging
to see what disagrees with the standards. A repository new to the continuum starts with the
check flow's scaffold, or with `workspace init`, which also installs the skills and wires the build.
