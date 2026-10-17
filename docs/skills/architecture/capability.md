# /architecture capability

Creates a capability document with its strategic justification, level and maturity, adds it to
the capability model, and draws the domain map for an L1 capability.

Use it when you want to create, define or add a capability, place one in the capability model,
set or map capability maturity, or create a `CAP-NNN` artefact or a capability map.

## Before you start

| Binding | Required | Used for |
|---|---|---|
| `capabilityDir` | yes | Where `CAP-NNN/` folders are created, and where `capability-model.md` and its CSVs live |
| `platformDir` | yes | Searched for the platform the capability belongs to |
| `capabilityIdPattern` | no | The capability identifier series, when it is not `CAP-NNN`, such as `'^CP-\d{3}$'` |

Standards it loads: capability document (`standard-capability-document.md`), traceability and
front matter, plus the capability diagram and visual design standards when it draws a map.
PNG export needs draw.io desktop.

## What it asks you

1. The platform (`PL-NNN`) it belongs to. If none exists, it offers
   [/architecture platform](platform.md) first.
2. The outcome (`OC-NNN`) it supports. If none exists, it suggests one.
3. The use case (`UC-NNN`) that requires it. If none exists, it suggests one.
4. Whether to create that strategic slice with it.
5. Its level (L1, L2 or L3) and maturity.

A name containing a product or vendor is not a capability. The skill renames it to the
ability and leaves the product for the SBB that realises it.

## What it writes

| File | Contents |
|---|---|
| `<capabilityDir>/CAP-NNN/index.md` | The capability, linked to its outcome and use case |
| `<capabilityDir>/capability-model.md` | One new row in the flat Canonical Capability Registry, and in the Capability-to-ABB Traceability Matrix for an L3 realised by ABBs |
| `capability-hierarchy.csv`, `capability-abb-mapping.csv` | Kept in line with the registry and matrix |
| `capability-map.drawio`, `capability-map.png` | For an L1 domain only |

When no outcome exists and you decline to create one, the demand is recorded as
`demand_assumption`. Distinct jobs of the capability that will be defined at different speeds
become `flows[]`. The skill leaves `flows[].stage` unset unless you state one;
[/architecture stage](stage.md) derives it.

## Try it

```text
/architecture capability Create an L2 capability "Order Tracking" under the Fulfilment platform.
It supports the where-is-my-order outcome.
```

## Related

- [/architecture context](context.md) creates the bounded context that realises it.
- [/architecture abb](abb.md) creates the building blocks beneath it.
- [/architecture stage](stage.md) reports how far it has been defined.
