# Specify

Turns a design document into a design specification: the same design written as data, valid against `design.schema.json`, so that a tool, a person or an agent can triage it and assess it criterion by criterion. The document stays the design people read; the specification is its data, and `design.source` links the two. The method is section 2 of the [Architecture Assessment Standard](../standards/assessment/standard-architecture-assessment.md); this flow is how to apply it.

It never changes the document and never judges the design. It writes one specification and a list of what the document does not say.

## What it needs

No bindings are required. It reads `design.schema.json` (with `envelope.schema.json` from `references/standards/schemas/v1.1.0/`) and the examples in `references/standards/assessment/examples/` for the shape a finished specification takes (SD-001, an agent with tools; SD-002, an AI solution with none). And from the requester: the design document (Markdown, Word, PDF, a wiki page, diagrams), and the catalogue identifiers of what it realises and runs on, where the document does not give them.

## Steps

1. **Read the document whole**, with its diagrams. Note its type: an architecture pattern (AP), a reference architecture (RA) or a solution design (SD), and its version. If it is a solution design written from the pattern skill's template, use template mode: translate it table by table by the mapping in [specify-solution-design.md](../specify-solution-design.md), which replaces steps 2 to 8, then validate and write as steps 9 and 10 say. Otherwise go on as below.
2. **Fix the header.** `design`: id, title, type, version, status, owner, authors, and `source` pointing at the document. `exposure`: who uses or reaches the solution. Record `provenance` as `ai-generated` and `ai-raw`: the author confirms the specification before it is assessed.
3. **Place it on the continuum.** `context`: the capabilities it realises, the platform, bounded contexts, outcomes, use cases, products, each by its catalogue identifier. Ask for any identifier the document does not give; never coin one.
4. **Write the drivers.** Goals, non-goals, stakeholders with their concerns, constraints and assumptions with their sources, obligations with how each instrument classes the design.
5. **Write the structure.** Trust zones; data sets with owner and classification; every box in the document's diagrams as an element typed by its continuum kind (actor, external-system, local-role, abb, sbb, technology, service, store, deployment-node), with its bounded context, owner, trust zone, deployment and what it realises. A model-backed element gets an `ai` facet; one whose model calls tools gets an `agent` facet as well. A configured assistant with no tools has no `agent` facet, whatever the vendor calls it.
6. **Write every interaction as a connector**, with its style, protocol, contract, authentication, authorisation, the data it carries, and whether its payload can carry content someone outside could influence.
7. **Write what the design promises.** Scenarios: functional ones tied to use cases, and quality, failure and misuse ones with a stimulus, a response and a measurable response measure. Fitness functions. For each model-backed element, its evals with the positive class, each kind of error and its ceiling, and the sample size.
8. **Write what was decided and what is open.** Decisions with alternatives, rationale and reversibility, and a departure where the document says the design steps away from the target state. Considerations for every open question the document raises. Risks with owners. Operations: SLOs, observability, deployment, recovery, cost, support. Evidence the document cites, each with its date and the design version it was produced for.
9. **Validate** the specification against `design.schema.json` and fix what fails.
10. **Write `<ID>-<slug>.design.yaml`** beside the document, or where the requester asks, and a short list of gaps beside it: every field the schema or the lenses would read that the document does not answer, as a question for the author.

## Rules

- Never invent a fact. A field the document does not answer is left out and listed as a gap, not filled with a plausible guess. The gaps are the author's to answer, and they are what an assessment would otherwise find.
- Never record a target-state position. Whether a building block is target state is attested by the responsible architect at triage, not read from a design document.
- Keep the document's own words where a field is prose, and cite where in the document each element, connector and scenario comes from, in a comment, so the author can check the translation.
- When the document changes, specify again from the new version; the old specification's digest no longer matches any assessment made from it.
