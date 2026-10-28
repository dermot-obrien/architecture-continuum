# Specify: template mode for a solution design

The pattern skill ([architecture-pattern](https://github.com/dermot-obrien/architecture-pattern)) ships a solution design template, `assets/templates/solution-design.md`, whose tables carry the fields a design specification needs. A document written from it is translated table by table, by the mapping below, rather than read and interpreted. The rules of the [specify flow](flows/specify.md) still hold: never invent a fact, never record a target-state position, cite each element, connector and scenario back to its row.

## Recognising the template

Use template mode when the document's front matter has `pattern_type: solution-design` (or the repository's own type name for it) and the document has the template's tables, recognised by their headings: Building Blocks, Interfaces, Trust Zones and Data, and at least two of Who Uses It, Where It Sits, Pattern Realisation, Evals, Quality, Failure and Misuse Scenarios, and Operations. A document that has only Building Blocks, Interfaces and Scenarios, such as an architecture pattern or a reference architecture from the same skill, uses those three tables by this mapping and is otherwise read as the specify flow says. Say in the gaps list which mode was used.

## How a cell becomes a field

- A blank cell is a gap: leave the field out and add a question to the gaps list. A cell that holds a value outside the schema's vocabulary is a gap too; never pick the nearest value.
- A vocabulary value is matched ignoring case, with spaces read as hyphens: `Two-way door` is `two-way-door`, `LLM judge` is `llm-judge`, `Partially trusted` is `partially-trusted`, `Yes` and `No` are `true` and `false`.
- An identifier in a table (`TZ-01`, `DS-02`, `IF-03`, `EVAL-01`, `DEC-02`, `FF-01`) becomes the same identifier in lower case (`tz-01`), because local ids are lower case. A building block with a local number (`07 ServiceNow knowledge agent`) takes a kebab-case id from its name (`knowledge-agent`), cited back to its number; one with a catalogue identifier (`SBB-044 Copilot Studio`) takes a kebab-case id from its name and the identifier as `ref`. Use the same element id wherever the block is named again.
- Rows with no identifier of their own (constraints, assumptions, obligations) take `con-01`, `asm-01`, `obl-01` in row order.
- Keep the document's own words in every prose field.

## The mapping

| Template | Specification |
|---|---|
| Front matter `title` or the H1: identifier and name | `design.id`, `design.title` |
| Front matter `pattern_type`, `pattern_scope`, `version`, `status`, `owner`, `author`, `exposure`, `implements` | `design.type`, `design.scope`, `design.version`, `design.status`, `design.owner`, `design.authors`, `design.exposure`, `design.implements` |
| Front matter `realises`, `flows` | `context.realises`, `context.flows` |
| The document's path | `design.source`; `design.provenance` is `ai-generated`, `ai-raw`, whatever the document's own provenance says |
| Goals and Non-Goals: Kind, Statement, Measure | `drivers.goals` or `drivers.non_goals`: the statement, followed by "measured by" and the measure when there is one |
| Who Uses It | Confirms `design.exposure`; no field of its own |
| Where It Sits: Kind, Identifier | Platform `context.platform`; Bounded context `context.bounded_contexts`; Outcome `context.outcomes`; Capability `context.realises`; Use case `context.serves`; Product `context.products`; Landscape `context.landscape` |
| Stakeholders: Stakeholder, Concerns | `drivers.stakeholders`: `role`, and `concerns` split at commas |
| Constraints, Assumptions and Obligations: Kind, Statement, Source, Classification | `drivers.constraints` and `drivers.assumptions` (`id`, `statement`, `source`); `drivers.obligations` (`id`, `source`, `classification`, `statement`) |
| Trust zones: Trust zone, Trust, What it holds | `trust_zones`: `id`, `name`, `trust`, `description` |
| Data sets: Data set, Owner, Classification, Personal data, Residency, Retention, Where it comes from, Used for AI | `data`: `id`, `name`, `owner` (the element id of the building block named), `classification`, `personal`, `residency`, `retention`, `lineage`, `used_for_ai` |
| Building Blocks: Building Block, Role, Kind, Realises, Bounded context, Owner, Trust zone, Deployed to | `elements`: `id`, `name`, `ref`, `responsibilities` (the role), `kind`, `realises`, `part_of`, `owner`, `trust_zone`, `deployed_to` |
| Pattern Realisation: Pattern building block, Realised here by, Departure, Decision | A departure names its decision: that decision's `departure` and `affects`. A row with no departure has no field; a blank Pattern building block is a gap |
| Model-Backed Components, first table: Role, Model and provider, Version pinned, Hosting, Input trust, Human oversight, Fallback | The element's `ai`: `role`, `model.name` and `model.provider`, `model.version_pinned`, `model.hosting`, `input_trust`, `human_oversight`, `fallback` |
| Model-Backed Components, second table: Grounded on, Retrieval, Access control, Freshness, Output shown as, Disclosure, Drift monitoring | `ai.grounding.sources`, `.retrieval`, `.access_control` ("the asking user's permissions" is `caller-permission-trimmed`), `.freshness`; `ai.output_handling.rendered_as`, with `constrained` and `validated` where the cell says so; `ai.disclosure`; `ai.drift_monitoring` |
| Agents: Started by, Tools and what each can change, Acts as, Limits, Guardrails | The element's `agent`: `initiation`, `tools` (each with its `effect`), `identity.acts_as`, `limits`, `guardrails`. No Agents table and no tools means no `agent` facet |
| Evals: Eval, Kind, Dataset, Metric, Threshold, Positive, False positive, False negative, Must never happen, Gates release, Sample size | `ai.evals`: `id`, `kind`, `dataset`, `metric`, `threshold`, `positive_class`, `errors.false_positive` and `errors.false_negative` (`meaning`, `max_rate`, `cost`), `zero_tolerance: true` with the error as a false positive at `max_rate` 0 when Must never happen is filled, `gating`, `sample_size` |
| Interfaces: Interface, Provider, Consumer, Purpose, Style, Protocol, Contract, Authentication, Authorisation, Data carried, Untrusted content, Errors and retry | `connectors`: `id`, `to` (the Provider), `from` (the Consumer, who calls), `description` (the purpose, then errors and retry), `style`, `protocol`, `contract`, `authentication`, `authorisation`, `data`, `carries_untrusted_content` |
| Quality, Failure and Misuse Scenarios: every column | `scenarios`: `id`, `type`, `name`, `quality_attribute`, `source`, `stimulus`, `environment`, `artefact`, `response`, `response_measure`, `importance`, `difficulty` |
| Fitness Functions: every column | `fitness_functions`: `id`, `characteristic`, `measure`, `threshold`, `automated`, `runs`, `scenarios` |
| Scenarios: `### S1 <name>`, its sentence, its steps | A `functional` scenario: `id` `s1`, `name`, `use_case` from the use case the sentence names, `steps` with `via` the step's interface and `action`. A step's Actor and Target are where it runs, which the interface already says |
| Controls and Guardrails, Cross-Cutting Concerns | No field. An agent's guardrail belongs in the Agents table; anything else is read as evidence for the criteria that ask about it |
| Operations: Service levels, Observability, Deployment, Recovery, Cost, Support, Transition | `operations.slos`, `.observability`, `.deployment`, `.recovery`, `.cost`, `.support`, `.transition`, split into the schema's fields; a part a cell does not state is a gap |
| Decisions: Decision (with its status), Chosen, Alternatives rejected, Rationale, Reversibility, Departure | `decisions`: `id`, `title`, `status`, `chosen`, `alternatives`, `rationale`, `reversibility`, `departure` |
| Open Questions: Question, Options, Owner, Needed by | `considerations`: `id`, `question`, `options`, `status: open`, `owner`, `due` |
| Risks and Trade-offs: every column | `risks`: `id`, `statement`, `likelihood`, `impact`, `mitigation`, `owner` |
| Evidence: Evidence, Kind, Date, Design version, Outcome | `evidence`: `id`, `ref`, `type`, `date`, `design_version`, `outcome`; an outcome that names decisions rather than a result is `covers` |
| Catalogue Mapping | Confirms which elements have no `ref`; no field of its own |

Fields the template has no column for (`design.lifecycle_state`, an element's `technology` and `assessed_by`, a connector's `context_relationship`, a model's card and fallback model, an eval's `judge_calibrated`, a decision's `technical_debt`, an operations runbook) are left out and asked for in the gaps list, like any other blank.
