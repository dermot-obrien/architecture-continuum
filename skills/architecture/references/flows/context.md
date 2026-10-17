# Create Bounded Context

You are an enterprise architecture agent defining linguistic and structural boundaries. The
value of a bounded context is the language it fixes: inside it, each term means exactly one
thing.

Resolve and load the canonical standards before Phase 3, per
[references/discovery/context.md](../discovery/context.md): a copy the workspace
holds wins, and otherwise the copy this skill ships in `references/standards/`.

## Step 0, before anything else

Run the resolver and use only the paths it prints. This skill carries the method; where the
artefacts live is the repository's to declare, and there is no default to fall back on:

```bash
node <skills>/architecture/bin/check.mjs --json --flow context
```

Run it from the workspace root. `<skills>` is the directory the skills are installed in. It
prints each binding as an absolute path, or `null` when it is not declared, and exits non-zero
when `status` is `error`. Do not proceed on an error and do not guess a path.

| Binding | Used for |
|---|---|
| `contextDir` | Where a new Bounded Context folder is created |
| `platformDir` | Searched for the Platform the context realises |
| `capabilityDir` (optional) | The Capabilities the context realises |
| `capabilityIdPattern` (optional) | The capability identifier series, `CAP-NNN` by default |

The contract is declared in the skill's `inputs.toml`. The repository answers it in
`[suite.architecture]` of its `.agents/skill-bindings.toml`. An optional binding that is not
declared means the step that needs it is reported as not done, never quietly skipped.

## Phase 1: Discovery

1. **Platform**: which Platform (`PL-NNN`) does this context realise? Search `<platformDir>`. If
   none exists, offer `/architecture platform` first.
2. **Context name**: the technical boundary, for example "Claims Management".
3. **Owner**: which team owns the model and the implementation.
4. **Ubiquitous language**: the five to ten most important terms in this domain and what each
   means here specifically.

Push on the language. Where a term already means something different in a neighbouring
context, that difference is the boundary and is worth recording explicitly.

## Phase 2: Load standards

Load the bounded context, traceability and frontmatter standards.

## Phase 3: Create artefacts

### Step 1: `<contextDir>/BC-NNN/index.md`

Create the folder and `index.md`. Include the Ubiquitous Language section, and map the context
to the parent business Capability folders it realises.

### Step 2: Map the ABBs

Identify which logical ABBs (`ABB-NNN`) live within this context and link them using
folder-relative paths with no `/index.md` suffix.

## Phase 4: Self-verification

Execute the AI Agent Self-Verification Checklist from the standards listed above, then confirm
the framework-level checks in [references/traceability.md](../traceability.md).

## Related flows

- `/architecture capability` creates the capability this context realises.
- `/architecture abb` creates the building blocks inside it.
