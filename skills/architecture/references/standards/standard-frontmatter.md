---
document_type: standards
title: "Frontmatter Standard"
classification: internal
version: 1.1.0
status: draft
created: 2026-05-08
last_modified: 2026-05-08
owner: "Architecture Team"
triggers:
  - "Creating any catalog artefact (Outcome, Use Case, Platform, Capability, Bounded Context, ABB, SBB, API, Service, View, Decision Record, Event, Deployment Node, Consideration, Technical Debt)"
  - "Validating workspace artefacts in CI"
  - "Migrating v1.0.0 artefacts to v1.1.0"
  - "Querying the catalog by relations or status"
---

# Frontmatter Standard

This standard defines the **YAML frontmatter** every catalog artefact carries. It introduces a universal envelope, per-kind extensions, a unified relationship vocabulary, and lifecycle and change fields. Together these turn the framework's documentation into a queryable, machine-validatable catalog.

This standard is the prose form. The machine-validatable form lives at [`schemas/v1.1.0/`](./schemas/v1.1.0/).

> **Cross-references:**
> - [Traceability & Hierarchy Standard](./standard-traceability.md) — the relationship semantics this standard implements.
> - [Architectural Framework](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/architectural-framework.md) — the conceptual hierarchy this standard formalises.
> - [`schemas/v1.1.0/`](./schemas/v1.1.0/) — JSON Schemas (machine validators).
> - [`standards/standards-index.md`](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/standards/standards-index.md) — discovery and precedence.

---

## 1. Position in the Framework

Two distinct frontmatter shapes coexist:

- **Standards documents** (the `standards/.../*.md` files themselves) keep their existing shape: `document_type: standards`, `title`, `classification`, `version`, `status`, `created`, `last_modified`, `owner`, `triggers`. **This file follows that convention.**
- **Catalog artefacts** (every `index.md` under `outcomes/`, `use-cases/`, `platforms/`, `capabilities/`, `contexts/`, `building-blocks/architecture-building-blocks/`, `building-blocks/solution-building-blocks/`, `apis/`, `events/`, `views/`, `decisions/`, `considerations/`, `runtime/services/`, `deployment-nodes/`, and the pages of landscapes, products, features, stores and technical debt where a repository keeps them) **adopt the envelope defined below**.

This standard concerns the *artefact* shape. Standards documents are unaffected.

---

## 2. The Universal Envelope

Every catalog artefact's `index.md` begins with a YAML frontmatter block carrying the following fields. The `*` marker indicates a field required for new artefacts in v1.1.0+; existing v1.0.0 artefacts are migrated additively (see §7).

### 2.1 Identity

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | * | Canonical ID. Format: `<TYPE>-NNN` (zero-padded 3 digits) for every kind except `service` (kebab-case slug). MUST match the folder name. Immutable. |
| `kind` | enum | * | One of: `outcome`, `use-case`, `landscape`, `platform`, `product`, `feature`, `capability`, `bounded-context`, `abb`, `sbb`, `pattern`, `api`, `service`, `view`, `decision-record`, `event`, `deployment-node`, `store`, `consideration`, `technical-debt`. |
| `title` | string | * | Human-readable title. Convention: `"<ID> <Name>"` for visual artefacts. |
| `short_name` | string | recommended | Acronym used in diagrams (e.g. `"IAM"` for ABB-001). |
| `description` | string | recommended | One- to two-sentence summary. Used by the agent retrieval index (`llms.txt`). |

### 2.2 Versioning and lifecycle

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | semver | * | Semantic version of *this* artefact. Initial: `0.1.0` for drafts; `1.0.0` on first acceptance. |
| `status` | enum | * | One of: `draft`, `proposed`, `accepted`, `active`, `deprecated`, `superseded`, `retired`. See §3 for the lifecycle. |
| `created` | ISO-8601 date | * | `YYYY-MM-DD`. Date the artefact was first created. Immutable. |
| `last_modified` | ISO-8601 date | * | `YYYY-MM-DD`. Updated on every meaningful change. |
| `last_modified_by` | string | recommended | Worker or person ID. |

### 2.3 Change fields

| Field | Type | Required | Description |
|---|---|---|---|
| `lifecycle_state` | enum | recommended (default `baseline`) | One of: `baseline`, `in-flight`, `target`, `retired`. Allows multiple coexistent versions of the same `id` to live in the workspace, each declaring its standing. See §4. |
| `valid_from` | ISO-8601 date | optional | Date this state took effect. |
| `valid_until` | ISO-8601 date \| null | optional | Date this state ceased to be current. `null` means "still current". |
| `supersedes` | array of IDs | optional | IDs of artefacts this one replaces. |
| `superseded_by` | array of IDs | conditional | Required when `status: superseded`. |

### 2.4 Ownership and governance

| Field | Type | Required | Description |
|---|---|---|---|
| `owner` | string | * | Team or person responsible. For Platforms, the **Owner Team**. |
| `strategic_owner` | string \| null | * for Platforms | Executive role accountable (e.g. CISO). Required only for `kind: platform`. |
| `classification` | enum | recommended (default `internal`) | One of: `public`, `internal`, `confidential`, `restricted`. |
| `governance_zone` | enum | recommended (default `application`) | One of: `foundation`, `core`, `extension`, `application`. Distinguishes framework-shipped seed (`foundation`) from workspace-specific artefacts (`application`). |

### 2.5 Relations

The relations a kind carries depends on its position in the metamodel. The full vocabulary is in §5. Per-kind extensions in §6 specify which relations are required, recommended, or optional for each kind.

### 2.6 References to external systems

| Field | Type | Description |
|---|---|---|
| `references` | array of objects | Each object has `type` (one of `jira`, `linear`, `github-pr`, `github-issue`, `source`, `doc`, `runbook`, `external`, `evidence`, `cost-model`) plus type-specific fields (`id`, `url`, `repo`, `path`, `ref`). |

Three types carry meaning for the [definition ladder](./capabilities/standard-definition-ladder.md), which reads them from a capability or from the pattern that realises it:

| Type | Points at | Definition stage |
|---|---|---|
| `cost-model` | The model of the running cost | R4 Buildable |
| `evidence` | An experiment, build or evaluation, and its results against the capability's criteria | R5 Proven |
| `runbook` | How the capability is operated in service | R6 In service |

Example:
```yaml
references:
  - { type: jira, id: "PAT-1234" }
  - { type: source, repo: "patternode-platform", path: "bounded-contexts/trading-signals/", ref: "main" }
  - { type: doc, url: "https://docs.example.com/runbook" }
```

### 2.7 Indexing

| Field | Type | Description |
|---|---|---|
| `tags` | array of strings | Free-form tags. |
| `sidebar_label` | string | Docusaurus rendering hint. |
| `sidebar_position` | integer | Docusaurus rendering hint. |
| `unlisted` | boolean | Docusaurus rendering hint: when true the page is built but kept out of the sidebar, the search index and the sitemap. For a page kept for the record rather than for reading, such as a superseded or retired artefact a repository chooses to keep. |

### 2.8 Schema declaration

| Field | Type | Description |
|---|---|---|
| `$schema` | URI | Path or URI to the JSON Schema this artefact conforms to. Recommended: `"../../standards/schemas/v1.1.0/<kind>.schema.json"` (workspace-relative) or the framework's published schema URL. |

---

## 3. Status Lifecycle

```
                    ┌─────────────┐
                    │    draft    │
                    └──────┬──────┘
                           │ ready for review
                           v
                    ┌─────────────┐
                    │  proposed   │
                    └──────┬──────┘
                           │ approved
                           v
                    ┌─────────────┐
            ┌─────► │  accepted   │ ◄────┐
            │       └──────┬──────┘      │
            │              │ in service  │ ratification
            │              v             │
            │       ┌─────────────┐      │
            │       │   active    │      │
            │       └──────┬──────┘      │
            │              │             │
   amended  │              │ replaced    │
            │              v             │
            │       ┌─────────────┐      │
            │       │ deprecated  │      │
            │       └──────┬──────┘      │
            │              │ replacement │
            │              v             │
            │       ┌─────────────┐      │
            └────── │ superseded  │ ─────┘
                    └──────┬──────┘
                           │ no longer relevant
                           v
                    ┌─────────────┐
                    │   retired   │
                    └─────────────┘
```

- `draft` — author still working on it; not yet for review.
- `proposed` — review-ready; under consideration.
- `accepted` — reviewed and approved; not yet in production.
- `active` — in production / in use.
- `deprecated` — discouraged for new use; still works.
- `superseded` — explicitly replaced by another artefact (`superseded_by` required).
- `retired` — no longer in use; kept for historical reference.

`accepted` and `active` are the two "live" states. The distinction matters for governance: an `accepted` Decision Record is approved but the change may not yet be deployed; `active` means the change is reflected in running systems.

---

## 4. Lifecycle State Semantics

`status` describes *the artefact's lifecycle*. `lifecycle_state` describes *which architecture state the artefact belongs to*. The two are orthogonal.

| `lifecycle_state` | Meaning | Typical use |
|---|---|---|
| `baseline` | Part of the current as-is architecture | Default for live artefacts |
| `in-flight` | Part of a change under way; neither pure baseline nor target | Temporary states during migration |
| `target` | Part of a future / aspirational architecture; not yet realised | Documents the Target Architecture per TOGAF Phase B |
| `retired` | Was once in the baseline; no longer is | Historical artefacts kept for audit |

**Multiple coexistent artefact-versions for the same `id`** are permitted when they have different `lifecycle_state` values. For example, the workspace may simultaneously hold:

- `ABB-007/index.md` with `version: 2.0.0`, `lifecycle_state: baseline`
- `ABB-007-target/index.md` with `version: 3.0.0`, `lifecycle_state: target`

The directory layout convention for coexistent versions is:

```
building-blocks/architecture-building-blocks/
  ABB-007/                        # default (baseline)
    index.md
  ABB-007-target/                 # explicit target
    index.md
  ABB-007-v2.0.0/                 # historical retired
    index.md
```

Folder name pattern: `<ID>` for the canonical (baseline) version; `<ID>-target` for the target version; `<ID>-v<semver>` for explicit historical versions. The `id` frontmatter remains `ABB-007` for all of them; the validator checks that exactly one folder per `id` carries `lifecycle_state: baseline` (or omits the field, defaulting to baseline).

The model has no snapshot or transition kinds: an artefact's standing is its own `lifecycle_state`, and a change is recorded by the decision record that makes it (`affects_artefacts`).

---

## 5. Relationship Vocabulary

The framework's "Golden Thread" is expressed via frontmatter relations. Universal relations apply to many kinds; per-kind specialisations are defined in §6.

**Inverse-consistency rule:** every directional relation has an inverse. The validator and the audit skill enforce inverse consistency: if A `realises` B, then B's frontmatter must include A under `realised_by`. CI fails on inconsistency in `strict` profile; warns in `lenient` profile.

### 5.1 Universal relations

| Relation | Inverse | Cardinality | Description |
|---|---|---|---|
| `part_of` | `contains` | single | DDD-style strict containment: a BC `part_of` a Platform; an ABB `part_of` a BC. |
| `contains` | `part_of` | multi | Inverse of `part_of`. |
| `realises` | `realised_by` | multi | Concretises an abstract concept. SBB `realises` ABB; BC `realises` Capability. |
| `realised_by` | `realises` | multi | Inverse. |
| `depends_on` | `depended_on_by` | multi | Runtime or contract dependency. |
| `depended_on_by` | `depends_on` | multi | Inverse. |
| `applies_to` | `governed_by` | multi | Used by Decision Records and cross-cutting artefacts. |
| `governed_by` | `applies_to` | multi | Inverse. |
| `references` | (none) | multi | External-system references (see §2.6). Not bidirectional. |

### 5.2 Strategic-DDD relationship vocabulary (Bounded Context ↔ Bounded Context)

A Bounded Context may declare named relationships with peer BCs:

```yaml
relationships:
  - { with: BC-005, pattern: anti-corruption-layer, role: downstream }
  - { with: BC-007, pattern: customer-supplier, role: customer }
```

**Patterns:** `anti-corruption-layer`, `open-host-service`, `published-language`, `conformist`, `customer-supplier`, `partnership`, `shared-kernel`, `separate-ways`.

**Roles:** `upstream`, `downstream`, `peer`, `customer`, `supplier`.

### 5.3 Per-kind specialised relations

Defined within each per-kind section in §6.

---

## 6. Per-Kind Extensions

For each `kind`, this section specifies additional required and optional frontmatter fields that supplement the universal envelope. Existing v1.0.0 fields from the corresponding standard are *promoted* from body tables to frontmatter.

### 6.1 Outcome (`OC-NNN`)

```yaml
kind: outcome
id: OC-001
title: "OC-001 Zero Trust Workload Posture"
kpi: "Reduce credential-related incidents to zero"
kpi_target: { value: 0, unit: "incidents/quarter", measurement: "security-incident-tracker" }
target_date: 2027-03-31              # recommended; omit rather than fabricate a date for undated/seed outcomes
business_rationale: "Eliminate standing credentials per zero-trust mandate."
time_horizon: short | medium | long  # short ≤ 1y; medium 1–3y; long > 3y
measures:                            # optional; each id is a criterion planning can cite
  - { id: OC-001-M1, measure: "Credential-related incidents", target: 0, unit: "incidents/quarter" }

owned_by_platform: PL-001            # required
requires_capabilities: [CAP-004, CAP-005]
supported_by_use_cases: [UC-001, UC-002]   # the inverse of supports_outcome on the use case
```

`supported_by_use_cases` replaces `realised_by_use_cases`, which is removed: the continuum's verb is supports, since a use case supports an outcome and does not realise it.

`measures[]` is optional. Each entry has `id` (`OC-NNN-M<n>`, required), `measure` (required), `target` and `unit`. The identifiers are what planning cites as `advances_criterion_ids` and what a consideration may list in its `criteria`. See the [Strategy Standard §2.3](./strategy/standard-strategy.md#23-outcome-measures-as-criteria).

**Schema:** [`schemas/v1.1.0/outcome.schema.json`](./schemas/v1.1.0/outcome.schema.json).

### 6.2 Use Case (`UC-NNN`)

```yaml
kind: use-case
id: UC-001
title: "UC-001 Real-Time Policy Enforcement"
primary_actor: "Authenticated workload"
secondary_actors: ["Policy Decision Point", "Audit Sink"]
scenario: "..."
preconditions: ["Workload has valid SPIFFE identity"]
success_criteria: ["Policy decision returned in < 50ms p99"]
frequency: low | medium | high
volume: "≥ 10k decisions/sec"

supports_outcome: OC-001             # required
requires_capabilities: [CAP-004]     # the capabilities that make it possible
realised_by: [AP-001]                # the architecture patterns that realise it (and reference architectures that make them concrete)
fulfilled_by_features: [FE-003]      # the product features that fulfil it
```

On the continuum a use case supports an outcome, requires capabilities, is fulfilled by the features of a product and is realised by an architecture pattern, whose scenarios walk the use case's scenarios across the building blocks. `realised_by` is the inverse of `serves` on the pattern, and `fulfilled_by_features` the inverse of `fulfils` on the feature. `realised_by_abbs` is removed: a use case reaches its building blocks through the pattern that realises it, and the capabilities it requires are named in `requires_capabilities`.

**Schema:** [`schemas/v1.1.0/use-case.schema.json`](./schemas/v1.1.0/use-case.schema.json).

### 6.3 Platform (`PL-NNN`)

```yaml
kind: platform
id: PL-001
title: "Identity & Access Platform"
strategic_owner: "CISO"              # required for Platform
owner: "Identity Platform Team"
landscape: LS-001                    # the platform landscape it belongs to
layer: L1                            # the landscape layer that holds it

owns_outcomes: [OC-001, OC-002]
provides_capabilities: [CAP-004, CAP-005]   # required, ≥1
contains_bounded_contexts: [BC-001]          # required, ≥1

slos:
  - { name: "Token issuance latency p99", target: "< 100ms" }
  - { name: "Availability", target: "99.95%" }
self_service_interfaces: ["REST API at /v1/identity", "CLI: idp-cli"]
consuming_teams: ["Trading Platform Team", "Market Data Team"]
tier: solo | growth | scale | null   # optional cost-tier classifier
```

**Schema:** [`schemas/v1.1.0/platform.schema.json`](./schemas/v1.1.0/platform.schema.json).

### 6.4 Capability (`CAP-NNN`)

```yaml
kind: capability
id: CAP-004
title: "CAP-004 Identity Lifecycle Management"
level: L1 | L2 | L3                  # required
parent: CAP-003 | null               # required for L2/L3; null for L1

components:                          # TOGAF G189 four-component definition
  organisation: "Identity Governance Steering Committee"
  people: ["IAM engineers", "Compliance analysts"]
  processes: ["Provisioning workflow", "Credential rotation policy"]
  technology: "Identity directory, token issuance, policy evaluation"
maturity:
  current: 3                         # 0-5: None / Initial / Developing / Defined / Managed / Optimising
  target: 5
  assessment_date: 2026-04-15
  assessor: "Identity Platform Team"

provided_by_platform: PL-001         # required for L3 (L1/L2 span platforms, so optional)
required_by_outcomes: [OC-001, OC-002]
realised_by_abbs: [ABB-001, ABB-003]   # recommended; an unrealised L3 capability is a gap, not an error
gaps: ["Continuous Access Evaluation not yet implemented"]

# Definition ladder (all optional; see capabilities/standard-definition-ladder.md)
demand_assumption: "Operators need self-service credential rotation"   # only where no outcome is linked yet
open_questions: none                 # only where no consideration affects the capability or its ABBs
flows:
  - { id: provision, name: "Provision an identity", description: "Joiner to first sign-in", stage: R3 }
  - { id: rotate-credentials, name: "Rotate credentials", stage: R2 }
```

Blocks attach at the lowest level a capability is defined to (the continuum's decision D4): an L1 or L2 capability with no children may carry `realised_by_abbs`, and nothing restricts it to L3.

> **Realisation completeness is a gap, not a validation error.** `realised_by_abbs` is *recommended*, never required — an L3 capability with no realising ABB is a legitimate architecture **gap** surfaced by gap analysis (the foundation catalogue ships such placeholders deliberately, awaiting their ABBs). `provided_by_platform` is required only for L3 capabilities; L1/L2 capabilities are cross-platform groupings and may omit it.

**Definition ladder fields.** These are optional and additive: a capability without them still validates. They are read by the [Definition Ladder Standard](./capabilities/standard-definition-ladder.md) and derived against by `/architecture stage`.

| Field | Type | Required | Description |
|---|---|---|---|
| `flows[]` | array of objects | optional | Named paths through the capability that someone would recognise as a job being done. Declare flows when they move at different speeds; the capability sits at the stage of its lowest flow. |
| `flows[].id` | kebab-case string | * (per entry) | Unique within the capability. Patterns name it in their own `flows` list to scope themselves to it. |
| `flows[].name` | string | * (per entry) | Human-readable name. |
| `flows[].description` | string | optional | What the job is, from start to end. |
| `flows[].stage` | `R0` to `R6` | optional | The recorded definition stage. A derived stage wins where one is available, and a recorded stage above it is reported as a claim without evidence. `flows[].rung`, the former key, is still read; record one of the two, not both. |
| `open_questions` | `none` | optional | A marker stating that no open question with more than one credible answer remains, so no consideration is expected. Omit it when considerations exist. |
| `demand_assumption` | string | optional | The demand the capability answers, recorded as an explicit assumption until an outcome is linked in `required_by_outcomes`. |

**Schema:** [`schemas/v1.1.0/capability.schema.json`](./schemas/v1.1.0/capability.schema.json).

### 6.5 Bounded Context (`BC-NNN`)

```yaml
kind: bounded-context
id: BC-001
title: "BC-001 Identity & Access"
owner: "Identity Platform Team"

part_of: PL-001                      # required: parent Platform
contains: [ABB-001]                   # recommended; an empty (placeholder) context is a gap, not an error
realises_capabilities: [CAP-004]     # required, ≥1

ubiquitous_language:                 # required, 3-50 entries
  - { term: "Principal", definition: "Any actor authenticated by the system" }
  - { term: "Claim", definition: "A statement issued by an IdP about a Principal" }

relationships:                       # strategic-DDD; see §5.2
  - { with: BC-005, pattern: anti-corruption-layer, role: downstream }

subdomain_kind: core | supporting | generic
c4_levels: [container] | [component] | [container, component]
```

**Schema:** [`schemas/v1.1.0/bounded-context.schema.json`](./schemas/v1.1.0/bounded-context.schema.json).

### 6.6 Architecture Building Block (`ABB-NNN`)

```yaml
kind: abb
id: ABB-001
title: "ABB-001 Identity & Access Management"
short_name: "IAM"
category: "Security"

part_of: BC-001                      # required: parent BC
realises_capabilities: [CAP-004]     # required, ≥1
realised_by: [SBB-001]                # multi: SBBs
composed_by: [AP-001]                 # the architecture patterns that name it among their boxes

requires:                            # optional: capability-level dependencies on other ABBs
  - { abb: ABB-005, cardinality: "1", rationale: "Sign-in and lifecycle events are published to the event backbone" }

domains: [business, application]     # required, ≥1; multi-valued TOGAF metamodel domains
interfaces:                          # required, ≥1
  - { id: "I1", direction: "in", type: "request", description: "Token request (OIDC)" }
  - { id: "I2", direction: "out", type: "event", description: "Sign-in event" }
mandatory_subabbs: [iam, observability, governance]   # required; exactly these three
cross_cutting: false                 # true for ABBs that are themselves cross-cutting (IAM, Obs, Gov)
```

**The `requires` field (ABB capability dependencies).** `requires` declares the other ABBs this ABB depends on at the **logical / capability level** — *which* building blocks must be present for this one to do its job. It is an **abstract** dependency between logical components, deliberately distinct from two neighbouring concepts:

- It is **not** `mandatory_subabbs` (the three cross-cutting concerns every ABB embeds — IAM, Observability, Governance). `requires` captures *domain* dependencies particular to this ABB.
- It is **not** the part/connector wiring of a [composite SBB](#671-composite-sbbs-uml-composite-structure). `requires` says "an Agent Memory ABB must exist"; a composite SBB's `parts`/`connectors` say "*this concrete* memory product is wired to *that* port." Logical need vs concrete realisation.

| Field | Type | Required | Description |
|---|---|---|---|
| `requires[]` | array of objects | optional | Capability-level ABB→ABB dependencies. Omit when the ABB has no logical dependencies beyond the mandatory cross-cutting trio. |
| `requires[].abb` | `ABB-NNN` | * (per entry) | ID of the required ABB. |
| `requires[].cardinality` | enum | optional (default `1`) | `1` = exactly one (hard dependency); `0..1` = optional single; `1..n` = one or more; `0..n` = zero or more. |
| `requires[].rationale` | string | recommended | Why the dependency exists — read by reviewers and by gap analysis. |

**When to use:** declare a `requires` entry when this ABB cannot deliver its capability without another *logical* ABB being present (e.g. an AI Agent Platform requires a Reasoning Engine and Safety & Guardrails). Do **not** use it for internal composition of the ABB itself, nor for runtime product wiring — that belongs in the realising SBB. The inverse is not auto-materialised as a relation; `requires` is a forward-only declaration consumed by gap analysis (a required ABB absent from the catalogue is a gap — see the [ABB Document Standard §3.4](./building-blocks/architecture-building-blocks/standard-abb-document.md#34-capability-dependencies-requires)).

**Schema:** [`schemas/v1.1.0/abb.schema.json`](./schemas/v1.1.0/abb.schema.json).

### 6.7 Solution Building Block (`SBB-NNN`)

```yaml
kind: sbb
id: SBB-001
title: "SBB-001 Identity Lifecycle Service (Entra)"

realises: [ABB-001]                   # required, ≥1
realised_by_services: [identity-lifecycle-svc]
composed_by: [RA-001]                 # the reference architectures that name it among their boxes

technologies:                        # required, ≥1
  - { name: "Microsoft Entra ID", vendor: "Microsoft", licensing: "P2" }
product_mapping:                     # required, ≥1; ABB component → the technology that realises it
  - { abb_component: "Identity Provisioning", technology: "Entra ID Provisioning" }
  - { abb_component: "Token Issuance", technology: "Entra STS (v2.0)" }
cloud_provider: azure | aws | gcp | onprem | multi | none
variants: ["Entra-only", "Entra+Okta hybrid"]
deployment_model: managed | self-hosted | hybrid
```

The vendor's offering is a technology: the word product belongs to the consumable offering of a platform (§6.18). `technologies` replaces `products`, and `technology` replaces `sbb_product` in a mapping row (the continuum's decision D2); the old names are removed.

**Schema:** [`schemas/v1.1.0/sbb.schema.json`](./schemas/v1.1.0/sbb.schema.json).

#### 6.7.1 Composite SBBs (UML composite structure)

An SBB may be **composite** — an assembly of sub-SBBs wired together — rather than a flat product mapping. A composite SBB models its internals as a UML composite structure: typed **parts** (roles played by sub-SBBs), **ports** (interaction points on the boundary), and **connectors** (links between ports and parts). This lets a large realisation (e.g. a trading "Strategy Engine") be decomposed into independently-ownable sub-SBBs while keeping one catalogued boundary contract.

```yaml
composite: true                      # optional; default false. When true, parts + connectors are required.

ports:                               # interaction points on the SBB boundary
  - name: order-api                  # kebab-case, unique within the SBB
    direction: provided              # provided (ball/lollipop) | required (socket)
    protocol: REST/HTTP
    contract: openapi/v3             # contract id or media type; may be an API-NNN api id
    abb_interface: I1                # the parent ABB Interface this port realises (traceability)
  - name: market-data-feed
    direction: required
    protocol: pub-sub
    contract: cloudevents/v1
    abb_interface: I4

parts:                               # typed roles inside the composite
  - name: bar-builder                # kebab-case role name, unique within the SBB
    sbb: SBB-310                       # the sub-SBB that plays this role (composite-of-composites)
    role: "Aggregates ticks into OHLCV bars"
    multiplicity: "1"                # UML multiplicity: 1 | 0..1 | 1..* | *  (default 1)
    ports:                           # optional: the part's own ports, referenced by connectors
      - { name: ticks-in,  direction: required }
      - { name: bars-out,  direction: provided }
  - name: signal-generator
    sbb: SBB-311
    role: "Produces trade signals from bars"

connectors:                          # links wiring ports and parts
  - from: order-api                  # boundary port ...
    to: order-router.command-in      # ... delegated to a part's port (dotted form)
    type: delegation                 # delegation: boundary port <-> part port
  - from: bar-builder.bars-out       # part-to-part
    to: signal-generator.bars-in
    type: assembly                   # assembly: required socket meets provided ball
```

**Field rules:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `composite` | boolean | optional (default `false`) | Set `true` to declare an assembled SBB. |
| `ports[]` | array | recommended for composite | Boundary interaction points. `name` + `direction` required per port. |
| `ports[].direction` | enum | * (per port) | `provided` \| `required`. |
| `parts[]` | array | * when `composite: true` (≥1) | Each has `name` + `role`; `sbb` references the sub-SBB playing the role. |
| `connectors[]` | array | * when `composite: true` (≥1) | Each has `from`, `to`, `type`. |
| `connectors[].type` | enum | * (per connector) | `delegation` (boundary↔part) \| `assembly` (part↔part). |
| `connectors[].from` / `.to` | endpoint | * (per connector) | A boundary port name (`order-api`) or a part-scoped point in dotted form (`part-name.port-name`). |

**Validation rules** (the JSON Schema enforces the first three; the validator script enforces reference resolution):

1. When `composite: true`, both `parts` (≥1) and `connectors` (≥1) MUST be present.
2. Port and part `name`s are kebab-case and unique within the SBB.
3. A `delegation` connector MUST have exactly one endpoint that is a boundary port and one that is a part port; an `assembly` connector MUST wire two part ports.
4. Every `connectors[].from` / `.to` endpoint MUST resolve to a declared boundary port or a declared part (and, in dotted form, a declared part port).
5. A `delegation` connector crosses the boundary (one boundary-port end, one part-port end) and is drawn in data-flow direction: inward for a request/stream arriving on the port, outward for a result an inner part surfaces on a `provided` port. An `assembly` connector joins two part ports, drawn provided → required (producer → consumer).
6. Each `parts[].sbb` SHOULD exist as a catalogued SBB and SHOULD carry the inverse `part_of` (or be listed under this SBB's `contains`) so the composition is bidirectionally traceable.

A **simple** (non-composite) SBB omits all four fields and keeps the flat `product_mapping`. See [§ When to use composite vs simple SBBs](./building-blocks/solution-building-blocks/standard-sbb-document.md#composite-vs-simple-sbbs) in the SBB document standard.

### 6.8 API (`API-NNN`)

Reserved in v1.1.0; full per-kind extensions forthcoming. Schema placeholder: [`schemas/v1.1.0/_placeholders/api.schema.json`](./schemas/v1.1.0/_placeholders/api.schema.json).

### 6.9 Service (kebab-case slug, optional `numeric_id: SV-NNN`)

```yaml
kind: service
id: identity-lifecycle-svc           # kebab-case slug (preserves v1.0.0 convention)
numeric_id: SV-001                   # optional secondary ID for cross-kind queries
title: "Identity Lifecycle Service"

realises: [SBB-001]                   # required, ≥1
part_of: BC-001                      # required: parent BC
runtime_type: container | serverless | jvm | native | managed-service   # required

provides_apis: [API-001]             # multi
consumes_apis: [API-005]

# Source-code linkage (forthcoming)
repo: { url: "https://github.com/example/repo", path: "patternode-platform" }
module_path: "bounded-contexts/identity/identity-service"
packages: ["com.patternode.identity.service"]
key_classes: ["IdentityServiceApplication", "TokenEndpoint"]

deployed_to: [DN-001, DN-002]
run_by: [PRD-001]                    # the products that run it; the inverse of runs on the product
stores: [ST-001]                     # the stores it owns; the inverse of owned_by on the store
```

Service is the **one kind that uses kebab-case slugs as the canonical `id`** to preserve v1.0.0 backward compatibility. New services may optionally declare a `numeric_id: SV-NNN` for governance queries that prefer numeric IDs across kinds.

**Schema:** [`schemas/v1.1.0/service.schema.json`](./schemas/v1.1.0/service.schema.json).

### 6.10 View (`VW-NNN`)

Reserved in v1.1.0; full per-kind extensions forthcoming. Schema placeholder: [`schemas/v1.1.0/_placeholders/view.schema.json`](./schemas/v1.1.0/_placeholders/view.schema.json).

### 6.11 Decision Record (`DR-NNN` or `ADR-NNN`)

The identifier series is `DR-NNN`. A repository that already keeps its decisions as architecture decision records may use `ADR-NNN` instead; the schemas accept either, in `id` and wherever a decision record is referenced (`resolved_by`, `consequence_of`, `repaid_by`). One series per repository.

```yaml
kind: decision-record
id: DR-001
title: "DR-001 Adopt Platform-replaces-Domain"
status: accepted

y_statement: "In the context of EA-IT alignment, facing the gap between DDD/TOGAF/Platform Engineering vocabularies, we decided for unifying Domain + BC + Platform into a single Platform concept and against keeping them distinct, to achieve audience clarity and industry alignment, accepting some loss of strict DDD orthogonality."

decision_drivers: ["Industry alignment", "Audience clarity", "Completeness"]
considered_options:
  - "Keep TOGAF Domain + BC + Platform separate"
  - "Unify under Platform"
  - "Unify under DDD Domain"
decision_outcome: "Option 2 (unify under Platform)"
consequences:
  positive: ["Single vocabulary for execs and engineers", "Aligns with Team Topologies"]
  negative: ["Loss of strict DDD problem/solution-space distinction at top level"]
  technical_debt: [TD-003]           # the technical debt that is a consequence of the decision

change_type: introduce | modify | retire | replace | principle   # required
affects_artefacts: [PL-NNN, BC-NNN]    # required unless change_type=principle
repays_debt: []                      # technical debt the decision repays; the inverse of repaid_by

applies_to: []                       # universal relation
supersedes: []
superseded_by: []
```

**Schema:** [`schemas/v1.1.0/decision-record.schema.json`](./schemas/v1.1.0/decision-record.schema.json) (full body-section structure forthcoming as a separate Decision Record standard).

### 6.12 Event (`EV-NNN`)

Reserved in v1.1.0; full per-kind extensions forthcoming. Schema placeholder: [`schemas/v1.1.0/_placeholders/event.schema.json`](./schemas/v1.1.0/_placeholders/event.schema.json).

### 6.13 Deployment Node (`DN-NNN`)

Where a service runs: a cloud account and region, a runtime such as Cloud Run or Lambda, a virtual machine, a hosting service, a device. The same service on two nodes differs by node properties, not service properties.

```yaml
kind: deployment-node
id: DN-001
title: "DN-001 Cloud Run, production, europe-west2"
node_type: serverless                # required: serverless | container-runtime | kubernetes | virtual-machine | managed-service | hosting-service | device | other
runtime: "Cloud Run"                 # required, in the provider's words
cloud_provider: gcp
account: "acme-prod"                 # account, subscription or project
region: europe-west2
scaling_model: scale-to-zero         # fixed | manual | autoscaled | scale-to-zero | none
run_as: "svc-runtime@acme-prod.iam.gserviceaccount.com"
parent: null                         # a node this one is nested in
hosts: [identity-lifecycle-svc]      # services; the inverse of deployed_to
hosts_stores: [ST-001]               # stores; the inverse of hosted_on
```

**Schema:** [`schemas/v1.1.0/deployment-node.schema.json`](./schemas/v1.1.0/deployment-node.schema.json).

### 6.14 and 6.15

Removed. The model has no snapshot or transition kinds (§4); the numbers are kept so the sections after them keep theirs.

### 6.16 Consideration (`CN-NNN`)

A consideration is an open architectural question with more than one credible answer. It records the question, the options, the criteria that decide between them, and, once settled, the decision record that resolved it. Considerations are what the [definition ladder](./capabilities/standard-definition-ladder.md) reads at R2 (every open question is listed) and at R3 (every one is resolved by an accepted decision record).

```yaml
kind: consideration
id: CN-001
title: "CN-001 Where document embeddings are stored"
status: accepted                     # envelope lifecycle of this document
consideration_status: resolved       # required: open | resolved | withdrawn

question: "Where are document embeddings stored and queried?"
options:
  - { name: "Search engine with vector support", summary: "One store for keyword and vector search" }
  - { name: "Dedicated vector database", summary: "Best recall, one more system to run" }
criteria:
  - "p95 query latency under 300 ms at expected volume"
  - "OC-002-M1"                      # an outcome measure id may stand as a criterion
resolved_by: DR-007                  # required when consideration_status is resolved
affects: [CAP-012, ABB-021, AP-004]  # required, >=1: capabilities, ABBs, SBBs, architecture patterns or reference architectures
```

| Field | Type | Required | Description |
|---|---|---|---|
| `question` | string | * | The open question, phrased so each option is a possible answer. |
| `options[]` | array of objects | recommended, >=2 | Each has `name` (required) and `summary`. A question with one credible answer is not a consideration. |
| `criteria[]` | array of strings | recommended | What decides between the options. |
| `consideration_status` | enum | * | `open`, `resolved` or `withdrawn`. Kept separate from the envelope `status`, which is this document's own review lifecycle, because one property cannot satisfy two enums. |
| `resolved_by` | `DR-NNN` or `ADR-NNN` | conditional | Required when `consideration_status: resolved`. The ladder counts it only while that decision record is `accepted` or `active`. |
| `affects[]` | array of IDs | * (>=1) | The capabilities, ABBs, SBBs, architecture patterns or reference architectures whose definition waits on the question. An architecture pattern is named by its identifier (`AP-NNN`) and a reference architecture by its (`RA-NNN`), which is how the ladder finds them. |

A `withdrawn` consideration affects nothing. The decision record that resolves a consideration SHOULD list the consideration's `affects` entries in its own `affects_artefacts`.

**Schema:** [`schemas/v1.1.0/consideration.schema.json`](./schemas/v1.1.0/consideration.schema.json).

---

### 6.17 Architecture pattern (`AP-NNN`) and reference architecture (`RA-NNN`)

The two kinds of pattern document the continuum names, authored by the `pattern` skill in architecture-pattern. An architecture pattern is technology-agnostic (conceptual or logical, its boxes local roles or ABBs) and takes `AP-NNN`; a reference architecture is technology-specific (physical, its boxes SBBs and technologies), takes `RA-NNN`, and names the architecture patterns it applies in `implements`. The type is declared as `pattern_type` (`architecture-pattern` or `reference-architecture`) and must agree with the series; a repository binds both in `[suite.pattern.types.*]` of its binding file with those series. The kind is `pattern` for both, and the schema requires `pattern_type` and `pattern_scope`, an `AP-NNN` identifier on an architecture pattern, and an `RA-NNN` identifier and at least one entry in `implements` on a reference architecture. The skill's `model validate` checks a document's boxes against its type. The earlier series `PAT-NNN` and `REF-NNN` are retired: no document carries them, and the skill mints none.

```yaml
kind: pattern
id: RA-001
title: "RA-001 Knowledge Store on AWS"
pattern_type: reference-architecture      # required; agrees with the series
pattern_scope: platform                   # required
implements: [AP-001]                      # required on a reference architecture, at least one
composes: [SBB-004, SBB-007]              # the catalogued blocks among its boxes: SBBs here, ABBs in an architecture pattern
realises: [CAP-002, CAP-003]              # optional; read by /architecture stage
serves: [UC-001, UC-002]                  # optional; the use cases its scenarios walk
model:
  diagram: components.drawio              # the diagram the model skill keeps in step
```

`composes` mirrors the document's Building Blocks table for the boxes that are catalogued: ABBs in an architecture pattern, SBBs in a reference architecture, which the schema enforces. Local roles and technologies are not catalogued and are not listed. The inverse is `composed_by` on the ABB or SBB. An architecture pattern carries no `implements`, and a reference architecture no `implemented_by`.

**Schema:** [`schemas/v1.1.0/pattern.schema.json`](./schemas/v1.1.0/pattern.schema.json).

### 6.18 Product (`PRD-NNN`)

A product is a consumable offering of one platform: what a consumer asks for, in the consumer's terms, and what a named team runs. It requires capabilities, optionally narrowed to flows, and runs services. Its features (`FE-NNN`) are usually rows of a register beside it, and may have pages of their own (§6.19).

```yaml
kind: product
id: PRD-001
title: "PRD-001 Knowledge Store"
platform: PL-001                          # required: the platform that offers it
team: "Patternode"
product_state: available                  # backlog | available | retired
requires: [CAP-001, CAP-004]
requires_flows: ["CAP-004/ask"]
runs: [pipeline, portal-api]              # services, by slug or SV-NNN
```

**Schema:** [`schemas/v1.1.0/product.schema.json`](./schemas/v1.1.0/product.schema.json).

### 6.19 Feature (`FE-NNN`)

Something a product does that its users value, in the product's own terms and small enough that one story can deliver it: the hinge between a use case and the services that fulfil it. A feature is usually a row of the product's feature register; where it has a page, the page carries this front matter.

```yaml
kind: feature
id: FE-003
title: "FE-003 Ask a question of the library"
what: "Answers a question in plain language, citing the documents it used"
part_of: PRD-001                     # required: the product that has it
fulfils: [UC-002]                    # the use cases it fulfils
implemented_by: [query-api, ranker]  # services, by slug
```

**Schema:** [`schemas/v1.1.0/feature.schema.json`](./schemas/v1.1.0/feature.schema.json).

### 6.20 Store (`ST-NNN`)

A database, bucket, table, index, queue or secret: a resource owned by one bounded context, recorded on the service that owns it and on the node that hosts it, not a service of its own (the continuum's decision D1). Usually a row of a stores register.

```yaml
kind: store
id: ST-001
title: "ST-001 Identity directory"
store_type: database                 # required: database | table | bucket | index | queue | cache | secret | other
technology: "PostgreSQL 16"
part_of: BC-001                      # required: the one context that owns it
owned_by: identity-lifecycle-svc     # required: the owning service; the inverse of stores
hosted_on: DN-002                    # the inverse of hosts_stores
read_by: [audit-export]
written_by: []                       # another writer is a finding against the one-owner rule
```

**Schema:** [`schemas/v1.1.0/store.schema.json`](./schemas/v1.1.0/store.schema.json).

### 6.21 Platform landscape (`LS-NNN`)

The whole set of platforms an enterprise runs, in layers, so that a platform consumes only the platforms in the layers below it, and only through their contracts. A layer is declared on the landscape (`L0` at the bottom) and named by `layer` on each platform; it is not a kind of its own.

```yaml
kind: landscape
id: LS-001
title: "LS-001 Platform of platforms"
layers:                              # required, ≥1
  - { id: L0, name: "Foundation and infrastructure", platforms: [PL-001] }
  - { id: L1, name: "Shared services", platforms: [PL-002, PL-003] }
dependencies:                        # the provider is in a lower layer than the consumer
  - { consumer: PL-002, provider: PL-001, through: [API-004] }
```

**Schema:** [`schemas/v1.1.0/landscape.schema.json`](./schemas/v1.1.0/landscape.schema.json).

### 6.22 Technical debt (`TD-NNN`)

A shortfall in the architecture or its build, taken on deliberately or found later, that costs something to carry (the interest) and something to put right (the principal). Technical debt is a consequence of a decision: the decision records it among its `consequences`, beside the positive, negative and neutral ones, and the debt item names the decision in `consequence_of`, so the debt is never separated from the reasoning that made it acceptable. Once settled, it names the decision that repaid it. Where the debt was found rather than chosen, `consequence_of` names the decision that accepted it.

```yaml
kind: technical-debt
id: TD-003
title: "TD-003 Single-region deployment of the identity directory"
debt_status: open                    # required: open | scheduled | repaid | written-off
quadrant: deliberate-prudent         # Fowler's quadrant: deliberate or inadvertent, prudent or reckless
interest: "A regional outage stops sign-in for every workload"   # required: what carrying it costs
principal: "A second region and replication, about six weeks"
repayment: "Planned with the move to two regions"
target_date: 2027-06-30
consequence_of: DR-014               # required: the decision it is a consequence of
repaid_by: null                      # required when debt_status is repaid
affects: [SBB-001, DN-002]           # required, >=1: the artefacts that carry it
```

The decision record lists the same items in `consequences.technical_debt`, and the repaying decision in `repays_debt`. A repository usually keeps debt as rows of a register (`decisions/technical-debt.csv` in the `/architecture check` layout), with a page for an item that needs more than a row.

**Schema:** [`schemas/v1.1.0/technical-debt.schema.json`](./schemas/v1.1.0/technical-debt.schema.json).

The kinds and their relationships are drawn, generated from these schemas, in [the schema picture](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/schema.md).

## 7. Backward Compatibility with v1.0.0

### 7.1 Required vs migrated

For v1.1.0:

- **New artefacts** (created after v1.1.0 ships) MUST have all required envelope fields (§2.1, §2.2, §2.4) and the per-kind required fields (§6).
- **Existing v1.0.0 artefacts** are brought up to the v1.1.0 contract by a **one-way migration** rather than tolerated indefinitely by a relaxed validator. There is a single schema set — the strict v1.1.0 schemas in [`schemas/v1.1.0/`](./schemas/v1.1.0/) — and the goal is that every artefact validates against it.

> **No two-profile mechanism.** Earlier drafts of this standard described a `strict-v1.1.0` / `lenient-v1.0.0-compat` pair selected via a `governance.yaml` `schema_profile` key. That mechanism was never built, and the framework now **migrates rather than tolerates**: run the migration script (below) to bring a workspace to v1.1.0, then validate against the single strict schema set. (If a future frontmatter-validator CLI needs a gradual-adoption mode, a lenient profile can be reintroduced then, designed against a real validator rather than ahead of one.)

### 7.2 Migration script behaviour

The migration is performed by [`scripts/migrate-frontmatter.mjs`](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/scripts/migrate-frontmatter.mjs) (Node, zero runtime dependencies beyond `js-yaml`). For each artefact `index.md` under the target root it:

1. Infers `kind` from the directory path and `id` from the folder name.
2. Parses the existing frontmatter (preserved verbatim — no existing key is ever overwritten, so the migration is idempotent).
3. Adds the universal envelope fields (`id`, `kind`, `version` `0.1.0`, `status` `draft`, `created`/`last_modified`, `owner`, `governance_zone: foundation`).
4. **Extracts the per-kind required fields from the document body** — the Document Control table and the numbered prose sections — e.g. ABB `interfaces` from the §3 interface table, SBB `product_mapping` from the §2.2 table, capability `components`/`maturity` from §2/§3, BC `ubiquitous_language` and `contains` from their sections, plus relations recovered by reverse index (an ABB's parent BC, an Outcome's owning Platform).
5. Leaves the body in place (humans still read it).
6. Reports, per file, exactly which fields were added and any heuristic/defaulted values for review.

After migrating, validate the result with [`scripts/validate-frontmatter.mjs`](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/scripts/validate-frontmatter.mjs), which checks every artefact's frontmatter against its per-kind schema (the universal envelope composed in via `$ref`). The foundation seed shipped with the framework validates clean.

### 7.3 Standards documents are unchanged

The `standards/.../*.md` files keep their existing frontmatter (`document_type: standards`, `triggers`, etc.). They are *definitions*, not catalog artefacts. This standard formalises that distinction: a file with `document_type: standards` is governed by the v1.0.0 standards-document convention, not the v1.1.0 artefact envelope.

---

## 8. Schema Diagrams

### 8.1 Composition (envelope + 20 kinds)

```mermaid
classDiagram
    direction TB

    class Envelope {
        <<universal>>
        +id : anyId *
        +kind : enum *
        +title : string *
        +version : semver *
        +status : enum *
        +created : date *
        +last_modified : date *
        +owner : string *
        +lifecycle_state : enum
        +supersedes / superseded_by
        +classification, governance_zone
        +references
    }

    class Outcome { OC-NNN }
    class UseCase { UC-NNN }
    class Platform { PL-NNN }
    class Landscape { LS-NNN }
    class Product { PRD-NNN }
    class Feature { FE-NNN }
    class Store { ST-NNN }
    class Capability { CAP-NNN }
    class BoundedContext { BC-NNN }
    class ABB { ABB-NNN }
    class SBB { SBB-NNN }
    class Pattern { AP-NNN or RA-NNN }
    class Service { kebab or SV-NNN }
    class DecisionRecord { DR-NNN }
    class Consideration { CN-NNN }
    class TechnicalDebt { TD-NNN }
    class API { API-NNN ~placeholder~ }
    class View { VW-NNN ~placeholder~ }
    class Event { EV-NNN ~placeholder~ }
    class DeploymentNode { DN-NNN }

    Envelope <|-- Outcome
    Envelope <|-- UseCase
    Envelope <|-- Platform
    Envelope <|-- Landscape
    Envelope <|-- Product
    Envelope <|-- Feature
    Envelope <|-- Store
    Envelope <|-- Capability
    Envelope <|-- BoundedContext
    Envelope <|-- ABB
    Envelope <|-- SBB
    Envelope <|-- Pattern
    Envelope <|-- Service
    Envelope <|-- DecisionRecord
    Envelope <|-- Consideration
    Envelope <|-- TechnicalDebt
    Envelope <|-- API
    Envelope <|-- View
    Envelope <|-- Event
    Envelope <|-- DeploymentNode
```

### 8.2 Relations and Golden Thread

![The kinds of the schemas and the identifier fields between them, laid out where the continuum puts them: demand space, solution space and runtime](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/schema.svg)

The picture is generated from the schemas by `scripts/generate-schema-diagram.mjs`, which fails in CI when a schema field has no line or the picture and the continuum's own diagram differ in a way it does not explain. [The schema page](https://github.com/dermot-obrien/ai-assisted-architecture/blob/main/docs/schema.md) lists every line with its fields and every difference from the continuum picture.

### 8.3 Lifecycle

The same artefact `id` (e.g. `ABB-007`) can coexist in two states, `lifecycle_state: baseline` at v2.0.0 and `lifecycle_state: target` at v3.0.0, under different folder names (§4). The decision record that moves it from one to the other names it in `affects_artefacts`. There is no snapshot or transition kind: the baseline is the set of artefacts in `baseline`, and the target the set in `target`.

---

## 9. Worked Example

A complete Capability frontmatter under v1.1.0:

```yaml
---
$schema: ../../standards/schemas/v1.1.0/capability.schema.json
id: CAP-004
kind: capability
title: "CAP-004 Identity Lifecycle Management"
short_name: "ILM"
description: "Manage the lifecycle of identities — provisioning, credential management, deprovisioning — across human and workload principals."

version: 1.0.0
status: active
created: 2026-03-07
last_modified: 2026-05-08
last_modified_by: claude-opus-4-7

lifecycle_state: baseline

owner: "Identity Platform Team"
classification: internal
governance_zone: foundation

# Per-kind
level: L3
parent: CAP-003
components:
  organisation: "Identity Governance Steering Committee"
  people: ["IAM engineers", "Compliance analysts"]
  processes: ["Provisioning workflow", "Credential rotation"]
  technology: "Identity directory, token issuance, policy evaluation"
maturity:
  current: 3
  target: 5
  assessment_date: 2026-04-15
  assessor: "Identity Platform Team"

# Relations
provided_by_platform: PL-001
required_by_outcomes: [OC-001, OC-002]
realised_by_abbs: [ABB-001, ABB-003]
applies_to: []
references:
  - { type: doc, url: "https://www.opengroup.org/togaf-series-guide-business-capabilities" }

# Indexing
sidebar_label: "CAP-004 Identity Lifecycle Management"
sidebar_position: 4
tags: [identity, security, foundation]
---
```

---

## 10. AI Agent Self-Verification Checklist

Before finalising any catalog artefact, verify:

1. [ ] **Frontmatter complete**: All required envelope fields present (`id`, `kind`, `title`, `version`, `status`, `created`, `last_modified`, `owner`).
2. [ ] **Per-kind required fields**: All required fields for the artefact's `kind` (per §6) are populated.
3. [ ] **ID matches folder**: `id` frontmatter field matches the folder name exactly.
4. [ ] **`kind` matches schema**: `kind` matches the schema referenced in `$schema`.
5. [ ] **Inverse relations**: For every relation declared (`realises`, `part_of`, `applies_to`, etc.), the inverse relation exists on the target artefact's frontmatter.
6. [ ] **Status lifecycle**: If `status: superseded`, then `superseded_by` is populated and points at a valid artefact.
7. [ ] **Lifecycle-state coexistence**: If multiple folders carry the same `id`, exactly one has `lifecycle_state: baseline` (or omits the field).
8. [ ] **Date validity**: `last_modified ≥ created`; `valid_until ≥ valid_from` when both set.
9. [ ] **Schema validation**: The artefact validates against `schemas/v1.1.0/<kind>.schema.json` (run the validator).
10. [ ] **Docusaurus hints**: `sidebar_label` and `sidebar_position` set if the workspace renders to Docusaurus.

---

## 11. References

- TOGAF Standard, 10th Edition — Architecture Building Blocks, Solution Building Blocks.
- TOGAF Series Guide G189 — Business Capabilities (the four-component model: organisation, people, processes, technology).
- BIZBOK Guide v10 — capability mapping foundations.
- Domain-Driven Design (Eric Evans) — Bounded Contexts, ubiquitous language, strategic design patterns.
- *Implementing Domain-Driven Design* (Vaughn Vernon) — context mapping vocabulary.
- C4 Model (Simon Brown) — zoom-level grammar for architecture views.
- MADR (Markdown Any Decision Records) — Decision Record body template.
- Y-statements (Olaf Zimmermann) — one-sentence decision summary form.
- llms.txt specification — agent retrieval index conventions.
- Keep a Changelog — versioning convention for the framework itself.
