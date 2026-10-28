# Assess

An architecture assessment of one version of one design: what is read, against which lenses, at what depth, and where each finding goes. The method is the [Architecture Assessment Standard](../standards/assessment/standard-architecture-assessment.md); the depth, assessors and evidence come from the subject's triage ([triage flow](triage.md)). This flow is how a person or an agent carries it out and writes the record and the report.

It never edits the design. It writes an assessment record and a report, and it proposes; a person confirms the outcome.

## What it needs

No bindings. It reads, from `references/standards/assessment/` (a workspace copy wins):

- `standard-architecture-assessment.md` and `standard-assessment-triage.md`;
- the lenses in `lenses/`, each with its version;
- the schemas in `schemas/`, with `envelope.schema.json` from `references/standards/schemas/v1.1.0/`;
- `examples/` for the shape of a design specification, a triage record and an assessment record.

And from the subject: the design specification (YAML), its source document if `design.source` names one, its triage record, and the evidence it cites.

## Steps

1. **Triage first.** If the subject has no triage record, run the triage flow. Read the plan: type, tier, depth, lenses, assessors, evidence. Derive the tier again from the specification; if it is higher than the record's, stop and report that the assessment must restart at the derived tier.
2. **Prepare.** Fix the subject: `design.id`, `design.version`, the file's path and its `sha256` digest. Record the trigger, the stage gate if any, the depth from the plan, the assessors (an agent records itself with role `agent`, and is independent only if it did not write or deliver the design), and what is out of scope. From AT2 the independent assessor must include a person; an agent working alone says in its record and report that an independent person must review its findings before they are relied on.
3. **Select lenses.** `core` always. Derive profiles from the facets (an `ai` facet brings `ai-solution`, an `agent` facet `ai-agent`) and compare them with `profiles`; report a mismatch. Add `production` when the trigger is `production-entry`. Record each lens id and version.
4. **Check.** Validate the specification against `design.schema.json`. If it fails, stop: the outcome is `deferred` and the finding is the validation errors. Otherwise apply every criterion with `decided_by: tool` by its `rule`, and the presence half of every `both`, exactly as written. Record a result for every one, `met` included: a tool run records every criterion. For a `both` criterion, put the presence half in `tool_result`. `CORE-TGT-01` reads the target-state positions the responsible architect attested in the triage record (or a catalogue `lifecycle_state` an architect maintains); never infer a position, and record any element without one as a missing attestation and a condition. Missing evidence is not a reason to stop: it is a finding against the criterion that asks for it. At a design review, evidence that can exist only once the solution is built is judged by its plan.
5. **Review.** Answer the reviewer criteria, and the judgement half of each `both` in `result` (never better than its `tool_result`; a present answer you cannot judge is `not-assessed`), reading the specification, its source document and its evidence. At tier AT1 only blocker criteria need a reviewer answer. Each result cites what it rests on, as specification paths (`elements.svc-x.ai.evals`) or evidence ids. `not-assessed` is a result and says why. Do not judge whether controls are implemented or effective; that is handed over (section 9 of the standard).
6. **Evaluate, at evaluation depth only.** Draft the utility tree from the specification's quality scenarios, and mark it as a draft for the stakeholders' workshop. An agent cannot hold the workshop.
7. **Dispose.** Give every `partly-met` and `not-met` finding its type (`gap`, `risk`, `non-risk`, `sensitivity-point`, `trade-off-point`, `observation`), the criterion's default severity unless a reason in the statement moves it, a recommendation, and a disposition from section 6 of the standard: `fix-design`, `raise-consideration`, `record-decision`, `accept-as-debt`, `accept-risk` (never for a blocker) or `hand-over`. Group related risks into risk themes, each naming the goals or outcomes it threatens.
8. **Decide, as a proposal.** Apply the outcome rules of section 7 in order, and stop at the first that applies: `deferred` if the assessment cannot be carried out (an invalid specification, a derived tier above the triage's, or no fixed version and digest); `not-endorsed` if any blocker is open, or any open major is a design fix with no due date; `endorsed-with-conditions` if any open major remains; otherwise `endorsed`. Due dates are the owner's to set; an assessor proposes them, and says so. Record the conformance level against the target state only if the catalogue is available; otherwise leave it out and say why. Set `provenance.review_state` to `ai-raw` or `ai-verified`: an agent proposes the outcome, and a person confirms it.
9. **Record.** Write `AS-NNN-<slug>.assessment.yaml` beside the design, valid against `assessment.schema.json`, citing the triage in `assessment.triage`. Open the hand-overs the design needs.
10. **Report.** Write `AS-NNN-<slug>.report.md` beside the record, for the people who decide, with the structure below. It is the full account, kept with the record and diffable.
11. **Readout.** Write `AS-NNN-<slug>.readout.md` beside it: the same conclusions as a short slide deck for the meeting where the outcome is confirmed. Slides are separated by a line holding only `---`, so the file renders to PowerPoint, PDF or HTML with a Markdown slide tool (Marp, Slidev) or loads into a slide service. Each slide holds one idea a reader takes in at a glance, at a 16:9 shape; detail stays in the report. The slides, in order: the subject and the proposed outcome; the triage, with the target-state positions; the assessment path; results by lens; one slide per risk theme, with its blockers and majors; conditions with owners and dates; what a person must decide; limits.

## The report

1. **Summary.** The subject and version, the proposed outcome, the tier, the number of blockers and majors, and the two or three things that decide the outcome.
2. **Triage.** The drivers as declared and as derived, with the tier each gives; the resulting type, tier and plan; anything that would move the tier.
3. **Assessment path.** What was done and in what order: the depth and why, the lenses and versions, the check (schema validation and the tool criteria), the review, whether an evaluation was held, the evidence read, and what an agent could not decide and left to a person.
4. **Results by lens.** For each lens, the count of `met`, `partly-met`, `not-met`, `not-applicable` and `not-assessed`.
5. **Findings.** Blockers, then majors, then the rest. Each with its criterion, what the specification says (by path), why it matters, the recommendation and the disposition.
6. **Risk themes and hand-overs.**
7. **Conditions and next steps.** What must change before the next assessment, who owns it, and which tier and depth the next one will be.
8. **Limits of this assessment.** What was not read, what was assumed, and what only a person can confirm.

The readout never says more than the report, and never softens it.

## Rules

- Never edit the design, its evidence or its triage. Report what to change.
- Every finding cites the specification or evidence it rests on. A finding with no citation is an opinion, and is left out.
- Apply a tool criterion's rule as written, even when the result seems harsh, and say so in the statement if the rule seems wrong for the case; propose a change to the lens separately.
- An agent may assess. It does not approve, and it does not accept risk.
