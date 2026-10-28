# SD-002 ServiceNow Knowledge Agent in Teams: gaps

These are the questions the specification of [SD-002](./index.md) version 0.1.0 could not answer from the document. Each is a field that `design.schema.json` or one of the lenses would read, and that the document leaves blank or does not mention. The specification, [SD-002-servicenow-knowledge-agent.design.yaml](./SD-002-servicenow-knowledge-agent.design.yaml), leaves each out rather than guess. This list is for the revised document, which added scenario importance and difficulty, eval metrics and thresholds, and bounded contexts for building blocks. The criterion that reads each field is given in brackets.

## Header and place on the continuum

1. Is the solution baseline, in flight or target in its lifecycle? (`design.lifecycle_state`, CORE-TGT-03)
2. Which landscape does the solution sit in? (`context.landscape`, CORE-STR-07)
3. Is the solution part of a product, and if so which one? (`context.products`)
4. Does the solution cover every flow of CAP-033, or only some? The front matter names no flows. (`context.flows`)

## Drivers

5. How will the first goal, a correct and cited answer in Teams without searching the portal, be measured?
6. How will the second goal, fewer service desk contacts, be measured, and against what baseline?
7. Who is the source of the assumption of about 2,000 questions a working day across 9,000 staff? (`drivers.assumptions.source`, CORE-DEM-03)
8. From where do staff reach the solution: corporate devices only, personal or mobile devices, networks outside the organisation? The From where cell is blank. (`design.exposure`)

## Structure

9. Which building block of RA-007 does 07 ServiceNow knowledge agent on SBB-044 Copilot Studio realise? The Pattern building block cell of the first Pattern Realisation row is blank. (CORE-TGT-01)
10. Which building block of RA-007 do 06 servicenowkb3 connection and 05 Microsoft Graph semantic index realise? The Pattern building block cell of the second row is blank. Does RA-007 have any building block not listed in Pattern Realisation?
11. What does 06 servicenowkb3 connection realise, and where is it deployed? Its Realises and Deployed to cells are blank. (`elements.realises`, CORE-STR-03)
12. Which architecture building block does SBB-044 Copilot Studio realise? Its Realises cell is blank. (`elements.realises`, CORE-STR-03)
13. Were SBB-044 Copilot Studio, DN-009 Power Platform production environment and the ServiceNow Knowledge Copilot connector admitted to the landscape by a component onboarding or platform assessment, and if so which one? (`elements.assessed_by`, read at triage)
14. Who owns 02 ServiceNow instance, 03 Microsoft Teams, 04 Microsoft Entra ID and 05 Microsoft Graph semantic index? Their Owner cells are blank. (`elements.owner`)

## Data

15. Are the Copilot Studio telemetry in Application Insights and the audit records under Purview retention data sets of their own? The template asks for logs, telemetry and audit records, and only the transcripts are listed. Do they hold personal data? (`data`, CORE-DAT-01)
16. What data do IF-01, IF-02, IF-06 and IF-07 carry? Does IF-02 carry DS-03 conversation transcripts, or the questions and answers they are made from? (`connectors.data`, CORE-DAT-03)

## Model-backed component

17. Which version of the Copilot Studio generative orchestration model runs, and can the team pin it? If it cannot, is there a decision that accepts the platform-managed model, with the gating evals rerun on any platform model change as its condition? Drift monitoring reruns the evals after a change to the connection's query string, but does not say after a model change. (`elements.ai.model.version`, AIS-MOD-01)
18. Where is the model card or system card for the model? (`elements.ai.model.card`, AIS-MOD-02)
19. What token, rate, time and cost limits apply to each model call? If the platform sets them and the team cannot, is there a decision accepting the platform's limits, and what is the per-call budget? The 600 USD monthly cap is recorded under operations, not as a call limit. (`elements.ai.limits`, AIS-OPS-01)
20. Human oversight is in-the-loop: who is the human, and at what point do they act before an answer reaches staff? (`elements.ai.human_oversight`, AIS-HUM-01)
21. What validates the output before it reaches Teams, given it is validated but not constrained? (`elements.ai.output_handling`, AIS-IO-02)

## Evals

22. For EVAL-02 Correctness, what is the positive class, and what are the ceilings on a false pass and a false fail? (`elements.ai.evals.positive_class`, `elements.ai.evals.errors`, AIS-EVAL-06)
23. EVAL-02 uses an LLM judge that is not calibrated. Will its agreement with human labels be measured before it gates a release, and against how many labelled cases? (`elements.ai.evals.judge_calibrated`, AIS-EVAL-04)
24. What does each error of EVAL-03 Citation cost when it happens? The cost is given for EVAL-01 but not for EVAL-03. (`elements.ai.evals.errors.cost`)
25. Is the set of 100 adversarial prompts in EVAL-05 a red-team eval, and who wrote it? The model's input trust is mixed, and no eval is of kind red-team nor is a red-team report cited. What is EVAL-05's positive class? (`elements.ai.evals.kind`, AIS-EVAL-05)
26. Does any eval or misuse scenario test article text that carries instructions to the model? IF-03 is marked as carrying untrusted content, and M1 tests permissions only. (AIS-EVAL-03, AIS-IO-01)
27. How many weekly conversations does EVAL-06 Online feedback need before its thumbs-down rate is read? Its Sample size cell is blank. (`elements.ai.evals.sample_size`, AIS-EVAL-09)

## Interfaces

28. What contract, with its version, does each interface carry? The Contract cell is blank on all seven, IF-01 to IF-07, including those to vendor interfaces such as the Graph search API, the ServiceNow REST table API and the Microsoft Copilot scripted REST API. (`connectors.contract`, CORE-INT-01)
29. Can the payloads of IF-01, IF-02, IF-04, IF-05, IF-06 and IF-07 carry content someone outside the solution could influence? Only IF-03 is answered. IF-01 carries the staff member's own question text, and IF-04 the article text that makes IF-03 untrusted. (`connectors.carries_untrusted_content`, CORE-SEC-03)
30. How is the servicenowkb3 connection authenticated and authorised on IF-07 to Microsoft Entra ID? Both cells are blank. (`connectors.authentication`, `connectors.authorisation`, CORE-SEC-02)

## Scenarios

31. Which use case does S2, the connection indexing the articles, serve? (`scenarios.use_case`, CORE-TRC-04)
32. Is there a scenario for maintainability, and one for cost against the 600 USD monthly cap? No scenario names either quality attribute. (`scenarios.quality_attribute`, CORE-QA-02)

## Decisions and open questions

33. Does any of DEC-01, DEC-02 or DEC-03 depart from RA-007 or from a standard? The Departure cell is blank on all three; is it none? (`decisions.departure`, CORE-TGT-02)
34. Which elements or interfaces does DEC-03 affect? (`decisions.affects`)
35. DEC-03's rationale says it is still to be confirmed in the tenant that Graph connector knowledge is returned under Authenticate with Microsoft. Is that an open question to record alongside the other two? (`considerations`, CORE-DEC-02)
36. Does any decision take on technical debt, for example reusing servicenowkb3 rather than a dedicated connection? (`decisions.technical_debt`, CORE-DEC-05)
37. Is there a decision recording how Copilot Studio telemetry differs from the OpenTelemetry GenAI conventions, and does it record prompts, outputs, tokens and cost per call? (AIS-OPS-02)
38. Who owns each of the two open questions, and by when must each be answered? Both cells are blank. (CORE-DEC-02)

## Operations

39. Where is the runbook? (`operations.runbook`, CORE-OPS-04, PRD-OPS-03)
40. How do staff move to the solution, what does it replace, and is anything to be retired? The Transition row is blank. (`operations.transition`, PRD-REL-04)
41. What is the unit cost, for example per question or per Copilot Credit, and where is the cost model? The front matter's template references to a cost model are absent. (`operations.cost.unit_cost`, `evidence` of type cost-model, CORE-CST-01)
42. Do traces follow the OpenTelemetry GenAI semantic conventions, and if so which version? The specification records the platform telemetry named in the document in their place. (`operations.observability.conventions`, CORE-OPS-02)
43. Which elements does each SLO apply to, and who receives the alerts? (`operations.slos.applies_to`)

## Evidence

44. Is there a threat model for version 0.1.0? (`evidence` of type threat-model, CORE-SEC-04)
45. Has the security assessment been requested, so that it can be handed over before the design is accepted? (`evidence` of type security-assessment, CORE-SEC-04, PRD-HND-01)
46. Is there a privacy impact assessment for the processing of staff personal data in DS-03 conversation transcripts? (`evidence` of type privacy-impact-assessment, PRD-HND-01)
47. Is there an AI impact assessment, or a record of why the EU AI Act obligation does not need one? (`evidence` of type ai-impact-assessment, AIS-HUM-03)
48. Have any of the gating evals been run yet, and where are their reports? (`evidence` of type eval-report, PRD-AI-01)
49. For production entry only: is there an as-built record, an acceptance test covering S1 and S2, a rollback test, a recovery test against the 4-hour recovery time, and an operational readiness review, each for the version being released? (PRD-BLD-02, PRD-EVD-02, PRD-REL-01, PRD-REL-02, PRD-OPS-03)

## Notes on translating from the template

These are places where the solution design template's tables still do not map cleanly to `design.schema.json`, or where the schema has a field the template has no column for, after the revision that added scenario Importance and Difficulty, eval Metric and Threshold, the Bounded context column, EVAL-NN eval ids, PL-NNN and OC-NNN in Where It Sits, a semantic version in the front matter, and the rule that the Consumer calls the Provider. They are for the template, not for this design's author.

### Identifiers

- The template's ids are local to the document, but the schema's `localId` must be kebab case starting with a letter, or a catalogue id. TZ-NN, DS-NN, IF-NN, EVAL-NN, DEC-NN and FF-NN are lowercased in translation (tz-01, if-01, eval-01), and the two-digit local numbers 01 to 07 are given names. This is a fixed rule now rather than a judgement, but the template could say it.
- Constraints, assumptions and obligations have no id in the template, though the schema requires one, so those were coined in kebab case.

### Columns with no schema field

- Interfaces, Errors and retry: no connector field.
- Building Blocks, Source (RA-007 or loose): no element field.
- Scenario steps, Actor and Target: a schema step has only `via` and `action`, so a step that travels its interface in the response direction (S1 steps 4 and 5) loses its direction.
- Evals, Must never happen: maps to the `zero_tolerance` boolean, but the error's own description has nowhere to go now that the metric has its own column.
- Who Uses It, From where: no field other than the single `exposure` value.
- Goals and Non-Goals, Measure: goals are plain strings in the schema, so a measure has nowhere to go.
- Open Questions, Owner and Needed by: considerations have neither field.
- Controls and Guardrails: guardrails exist only on the agent facet, so a configured assistant with no tools, like this one, has no home for its controls or their source standard. Cross-Cutting Concerns has no field either.
- Catalogue Mapping: no field; it was used only to decide which elements carry a `ref`.
- Pattern Realisation: no field of its own. It reached the specification only through a decision's `affects`; the realised pattern building block would need an element of its own for `realises` to point at.

### Schema fields the template has no column for

- `design.lifecycle_state`, `context.landscape`, `context.products`, `context.features`.
- `elements.technology`, `elements.assessed_by`.
- `connectors.context_relationship`.
- `elements.ai.model.version` (only Version pinned has a column), `model.card`, `model.fallback_model`, and `elements.ai.limits`.
- `elements.ai.evals.judge_calibrated`: EVAL-02 still folds it into Kind ("LLM judge, not calibrated").
- `decisions.status` (this document puts it in brackets in the Decision cell), `decisions.affects`, `decisions.technical_debt`.
- `risks.affects`; `evidence.covers`.
- `operations.runbook`, and the sub-fields of each Operations aspect: a single prose cell per aspect has to be split into `slos` with `alerting`, the observability booleans and `conventions`, deployment `strategy` and `rollback`, recovery `rto`, `rpo` and `degraded_mode`, cost `model`, `unit_cost` and `budget`, support `team`, `hours`, `on_call` and `escalation`, and the four transition fields. Sub-rows per field would remove the interpretation.
- `profiles`: derived here from the facets.

### Vocabularies that do not match the schema's

- Trust: the template offers "partly trusted"; the schema's value is partially-trusted.
- Reversibility: the template offers "Easy / costly / one-way"; the schema has two-way-door, costly and one-way-door. This document wrote "Two-way door".
- Eval Kind: the template offers "offline / LLM judge / online", omitting red-team, human-review and trajectory.
- Evidence Kind: the template offers "eval / test / review / proof of concept", none of which is a schema value; the schema has eval-report, load-test, threat-model and others. Evidence Outcome is free text in the template ("Supports DEC-01, DEC-02 and DEC-03") and an enum of passed, passed-with-conditions or failed in the schema, which also has no Covers column to receive what this row actually says. The Evidence example row still gives the design version as 0.1, not 0.1.0.
- Access control and Output shown as are prose in the template; the schema wants an enum for access control and two booleans plus a string for output handling, so "validated, not constrained" had to be parsed out of a sentence.

### Smaller inconsistencies

- The guidance now says a data set's Owner is the building block that holds it, but the Data example row still shows "Owning team".
