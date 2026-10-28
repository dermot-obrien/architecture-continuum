# Triage

Before anything is assessed, triage decides what kind of assessment it gets and how much. It answers a short set of questions about the subject, gives each risk driver a tier, takes the highest (AT1 Light to AT4 Critical), and writes the plan that tier requires. The method is the [Assessment Triage Standard](../standards/assessment/standard-assessment-triage.md); this flow is how to apply it.

Triage never assesses and never edits the subject. It writes one triage record and reports.

## What it needs

No bindings are required; `catalogueUrl`, when declared, turns identifiers in the report into links (see Links to the catalogue below). It reads the skill's copies of the standards in `references/standards/assessment/`, and the subject: a design specification valid against `design.schema.json` if there is one, otherwise what the requester says about it. A workspace's own copy of the standards wins over the skill's.

## Steps

1. **Read the standard.** Load `standard-assessment-triage.md` in full: the assessment types (section 2), the drivers and their tables (section 3), the tiers (section 4), changes (section 5), platforms (section 6) and component onboarding (section 7).
2. **Name the subject and its type.** A component new to the landscape, a platform, an architecture design, a solution, an AI solution, an agent, a change or entry to production. A configured assistant with no tools is an AI solution, whatever the vendor calls it; the agent type begins when a model calls a tool.
3. **Answer the questions.** For each field of `answers` in `triage.schema.json`, record the answer and where it came from: a path in the specification (`design.exposure`, `data[].classification`, `elements[].ai.grounding.access_control`) or the requester's words. Never fill an answer you cannot source; ask.
4. **Get the target-state positions from the architect.** For every `sbb`, `technology` and `deployment-node` the subject uses, ask the architect responsible for its target architecture for its position (`target`, `in-flight`, `baseline`, `retiring`, `retired`, `not-target`) its successor if not target, and any limit on its use (`permitted_use`), and record each in `target_state` with who attested it and when (section 3.3 of the standard). A catalogue `lifecycle_state` an architect maintains counts as that attestation. Never infer a position, from a name, a vendor or the design's own words; leave it unattested and say so.
5. **Derive from the specification when there is one.** Read reach from the tools' `effect` and `reversible`, and from grounding with no tools; agency from `approval` and `initiation`; data from the highest `data.classification` and `data.personal`; exposure from `design.exposure`; untrusted content from `carries_untrusted_content`, `input_trust` and `reads_untrusted`. An indexed enterprise source retrieved per user is `read`, not `knowledge`: `knowledge` is only content loaded into the configuration itself. Content many people can edit counts as untrusted input. Derive novelty from the elements: an `sbb` or `technology` with no `ref` is new to the landscape, and a platform counts as assessed only when its element names the admitting assessment in `assessed_by`. Where a derived driver is higher than a declared one, the derived one wins; say so.
6. **Tier each driver** from the tables in section 3, and take the highest. Raise it with a recorded reason if the owner asks; never lower it. A prohibited practice stops triage: record type `stopped` and report.
7. **Check the prerequisites.** A component new to the landscape needs its onboarding assessment first. A subject on a platform inherits that platform's controls only inside the platform's envelope and only if the platform has been assessed; otherwise novelty applies. Inheritance lowers effort, never the tier.
8. **Write the plan** from the table in section 4 for the tier: depth, lenses (by profile and trigger, not by tier, and only those of the assessment about to run: the `production` lens belongs to production entry), whether an independent assessor is needed (a person, from AT2), approver, evidence, hand-overs, staged rollout, re-assessment. Separate evidence due at this assessment from evidence due at production entry: eval reports and test results cannot exist before the solution is built.
9. **Record.** Write `TR-NNN-<slug>.triage.yaml` beside the subject's specification, valid against `triage.schema.json` (with `envelope.schema.json` from `references/standards/schemas/v1.1.0/`). If a triage of the same subject exists, a new one names it in `supersedes`.
10. **Report** the target-state positions and who attested them, the drivers table (declared, derived, tier), the resulting tier and type, the plan, and anything that would move the tier, such as a design change that removes a driver.

## Links to the catalogue

When a catalogue URL prefix is known (the requester gives it, or `catalogueUrl` in `[suite.architecture]` of `.agents/skill-bindings.toml` declares it), every catalogue identifier in a report or readout is a link: the identifier appended to the prefix, as `[CAP-033](<prefix>CAP-033)`. A catalogue identifier is one of the envelope's series, a capital prefix, a hyphen and three digits (`PL`, `OC`, `UC`, `CAP`, `BC`, `ABB`, `SBB`, `SV`, `ST`, `DN`, `DR`, `CN`, `TD`, `API`, `EV`, `AP`, `RA`, `SD`, `AS`, `TR`). Link the first mention in each section, or each slide of a readout, and leave later mentions plain. Do not link criterion identifiers (`CORE-QA-01`), finding identifiers (`F-012`) or a design's local element ids; they are not in the catalogue. The YAML records keep identifiers as plain values: links belong to the documents people read. With no prefix known, write identifiers as plain text and say so in the report's limits.

## Rules

- The derived tier wins over the declared one, and the highest driver wins over the rest.
- An answer without a source is a question for the requester, not a guess.
- Triage does not judge whether the design is good. That is the assessment's job.
