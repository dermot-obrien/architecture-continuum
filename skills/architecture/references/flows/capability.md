# Create Capability

You are an enterprise architecture agent creating Capability documents. A capability is
technology-agnostic: it says what the organisation must be able to do, never how.

Resolve and load the canonical standards before Phase 3, per
[references/discovery/capability.md](../discovery/capability.md): a copy the workspace
holds wins, and otherwise the copy this skill ships in `references/standards/`.

## Step 0, before anything else

Run the resolver and use only the paths it prints. This skill carries the method; where the
artefacts live is the repository's to declare, and there is no default to fall back on:

```bash
node <skills>/architecture/bin/check.mjs --json --flow capability
```

Run it from the workspace root. `<skills>` is the directory the skills are installed in. It
prints each binding as an absolute path, or `null` when it is not declared, and exits non-zero
when `status` is `error`. Do not proceed on an error and do not guess a path.

| Binding | Used for |
|---|---|
| `capabilityDir` | Where a new Capability folder is created |
| `capabilityIdPattern` (optional) | The capability identifier series, `CAP-NNN` by default |
| `platformDir` | Searched for the parent Platform |

The contract is declared in the skill's `inputs.toml`. The repository answers it in
`[suite.architecture]` of its `.agents/skill-bindings.toml`. An optional binding that is not
declared means the step that needs it is reported as not done, never quietly skipped.

## Phase 1: Discovery and proactive upward traceability

Verify the strategic justification before creating anything. Where a parent is missing,
propose it rather than inventing it.

1. **Platform**: which Platform (`PL-NNN`) does this capability belong to? Search `<platformDir>`.
   If none exists, offer `/architecture platform` first.
2. **Outcome**: which Business Outcome (`OC-NNN`) does it support? If missing, infer a business
   result from the capability name and suggest it, for example "I suggest linking this to a new
   Outcome: 'Increase Operational Visibility'".
3. **Use case**: which Use Case (`UC-NNN`) requires it? If missing, suggest a concrete
   operational scenario, for example "I suggest a use case: 'Real-time Signal Analysis'".
4. **The proposal**: "To justify this capability, I suggest we also define the parent Platform,
   Outcome, and Use Case. Should I create this strategic slice for you?"
5. **Details**: once agreed, gather level (L1, L2 or L3) and maturity.

If the proposed name contains a product or vendor, it is not a capability. Rename it to the
ability and record the product against the SBB that realises it.

## Phase 2: Load standards

Load the capability document standard, the traceability standard and the frontmatter standard.
Add the capability diagram and visual design standards if you will draw a map. Load the
building block calibration standard when the capability names the building blocks that realise
it: a capability is the C4 system, each building block it names is one container, and the C4
context diagram of that system belongs to the capability, never to an ABB.

## Phase 3: Create artefacts

### Step 1: index.md

Create the capability document at `<capabilityDir>/CAP-NNN/index.md`. Link back to the parent
Outcome and Use Case in the Purpose section. This is mandatory. The identifier matches `capabilityIdPattern` when the repository binds one (`CAP-NNN` by default). Number a new capability in the repository's own series, such as `CP-NNN` for `'^CP-\d{3}$'`, and follow where its existing capabilities sit (a capability area folder, a slug after the identifier).

Where no Outcome exists yet and the user declines to create one, record the demand as
`demand_assumption` rather than leaving it unstated. If the capability has distinct jobs that
will be defined at different speeds, declare them as `flows[]` (`id`, `name`, `description`).
Leave `stage` unset unless the user states one; `/architecture stage` derives it.

### Step 2: Update capability-model.md

Add one row for the new capability to the Canonical Capability Registry table in
`<capabilityDir>/capability-model.md`: identifier, name, level, `Parent ID` (`-` for L1),
providing Platform, current and target maturity. The registry is one flat table ordered by
level then identifier. Do not add a heading per L1 or L2 group; the hierarchy is the
`Parent ID` column. For an L3 capability realised by ABBs, add its row to the
Capability-to-ABB Traceability Matrix as well.

Then bring `capability-hierarchy.csv` and `capability-abb-mapping.csv` beside it into line,
since both are derived from the registry and the matrix. If the workspace has no generator for
them, add the rows by hand in the column order the capability document standard gives.

A capability that exists as a document but not in the registry is invisible to everything
downstream. If `capability-model.md` does not exist, create it in the registry form rather
than in nested headings.

### Step 3: Capability map, L1 domains only

If this is an L1 domain, create the map diagram per the capability diagram standard and export
at 300 DPI:

```bash
draw.io --export --format png --scale 3.125 --output capability-map.png capability-map.drawio
```

## Phase 4: Self-verification

Execute the AI Agent Self-Verification Checklist from the standards listed above, then confirm
the framework-level checks in [references/traceability.md](../traceability.md).

## Related flows

- `/architecture platform` creates the platform this capability belongs to.
- `/architecture context` creates the bounded context that realises it.
- `/architecture abb` creates the building blocks beneath it.
