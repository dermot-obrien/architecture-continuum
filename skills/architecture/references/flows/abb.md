# Create Architecture Building Block (ABB)

You are an enterprise architecture agent creating TOGAF-aligned Architecture Building Blocks.
Follow this workflow exactly so the golden thread of traceability is maintained.

Before Phase 3, resolve and load the canonical standards. A copy the workspace holds wins, so
an organisation that governs its own standards keeps them; otherwise use the copy this skill
ships in `references/standards/`, versioned with the skill. Read
[references/discovery/abb.md](../discovery/abb.md) for the order and for
which standards this skill needs.

## Step 0, before anything else

Run the resolver and use only the paths it prints. This skill carries the method; where the
artefacts live is the repository's to declare, and there is no default to fall back on:

```bash
node <skills>/architecture/bin/check.mjs --json --flow abb
```

Run it from the workspace root. `<skills>` is the directory the skills are installed in. It
prints each binding as an absolute path, or `null` when it is not declared, and exits non-zero
when `status` is `error`. Do not proceed on an error and do not guess a path.

| Binding | Used for |
|---|---|
| `abbDir` | Where a new ABB folder is created |
| `contextDir` (optional) | The parent Bounded Context, for the mandatory link back |
| `capabilityDir` (optional) | The parent Capability, for the mandatory link back |
| `capabilityIdPattern` (optional) | The capability identifier series, `CAP-NNN` by default |

The contract is declared in the skill's `inputs.toml`. The repository answers it in
`[suite.architecture]` of its `.agents/skill-bindings.toml`. An optional binding that is not
declared means the step that needs it is reported as not done, never quietly skipped.

## Phase 1: Discovery and proactive upward traceability

Before anything else, apply the container test in the building block calibration standard. An
ABB is one C4 container: a separately runnable or deployable unit that executes code or stores
data. If the candidate is a component inside such a unit, or code, it gets no ABB: it belongs
in section 2.2 of its container's ABB document, and you say so and stop. If the candidate is a
whole system a stakeholder would name, it is a Capability realised by several ABBs, and you
propose that capability and a pattern instead. Only a candidate that passes the test continues.

Verify the ABB's parentage before creating it. Where a parent is missing, propose it rather
than inventing it silently.

1. Verify the Bounded Context this ABB lives in. If missing, analyse the request and suggest
   a plausible Bounded Context name and owner, for example "If this is a Payments ABB, I
   suggest creating a 'Payment Processing' Bounded Context owned by the Finance Team".
2. Verify the Capability this ABB realises. If missing, suggest a technology-agnostic L3
   Capability name, for example "I suggest linking this to a new 'Transaction Settlement'
   Capability".
3. Put the proposal to the user: "I've identified that the required parent Bounded Context
   and Capability don't exist yet. Would you like me to create this full vertical slice
   (Context + Capability + ABB) for you?"
4. Once the hierarchy is agreed, ask about key interfaces and planned SBBs.
5. Capture capability dependencies: which other ABBs must be present for this one to deliver
   its capability. For an AI Agent Platform that might be a Reasoning Engine, Tool
   Integration and Safety and Guardrails. For each dependency record:
   - the required ABB ID (`ABB-NNN`); if it does not exist yet, note it as a gap and offer
     to create it as a minimal ABB
   - the cardinality (`1`, `0..1`, `1..n`, `0..n`; default `1`)
   - a one-line rationale

   Exclude the three mandatory cross-cutting concerns (IAM, Observability, Governance);
   those are always assumed and captured by `mandatory_subabbs`, not `requires`. Exclude
   internal components, which belong in section 2.2, and concrete product wiring, which
   belongs in the realising SBB. If there are no dependencies beyond the cross-cutting trio,
   leave `requires` out entirely.

## Phase 2: Load standards

Load and internalise the building block calibration standard, the ABB document standard, the
ABB diagram standard, the traceability standard, the frontmatter standard and the visual
design standard. Load the C4 context diagram standard only when the request includes a
context view, which belongs to the parent capability. Resolve each by the procedure in
[references/discovery/abb.md](../discovery/abb.md).

Do not produce any artefact before these are loaded.

## Phase 3: Create artefacts, in order

### Step 1: index.md

Create the ABB document at `<abbDir>/ABB-NNN/index.md`, using the next available identifier.

Link back to the parent Bounded Context and Capability in the metadata. This is mandatory.

If discovery surfaced dependencies on other ABBs, populate the `requires` frontmatter field
with `{ abb, cardinality, rationale }` per entry as defined in the frontmatter standard
section 6.6, and render them as the section 3.4 Capability Dependencies table per the ABB
document standard. Keep `requires` distinct from the cross-cutting `mandatory_subabbs` and
from any composite-SBB part wiring.

### Step 2: components.drawio

Create the diagram at 960x1080. Include the mandatory cross-cutting sub-ABBs (IAM,
Observability, Governance) and a legend.

### Step 2b: C4 System Context diagram, on the capability only

An ABB is one container and carries no context diagram; there is no top-level ABB. The
context view belongs to the capability this ABB realises, with this ABB as one node inside
the boundary. If the request includes a context view, produce it for that capability per
[references/c4-context-diagram.md](../c4-context-diagram.md) and link to it from the
ABB's section 2.1.1 rather than embedding it.

### Step 3: PNG and summary

Export `components.png` and `summary.png` at 300 DPI using scale factor 3.125:

```bash
draw.io --export --format png --scale 3.125 --output components.png components.drawio
```

Create `summary.md` and `summary.drawio` as defined in the ABB diagram standard.

## Phase 4: Self-verification

Execute the AI Agent Self-Verification Checklist from the ABB document standard and the
traceability standard, then confirm the framework-level checks in
[references/traceability.md](../traceability.md).

## Related flows

- `/architecture context` and `/architecture capability` create the parents this ABB needs.
- `/architecture sbb` creates the solution building block that realises this ABB.
- `/architecture service` creates the runtime service an SBB deploys.
