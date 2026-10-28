# Report

Turns an assessment record into what people read: a full report, and a short slide readout for the meeting where the outcome is confirmed. The record is the source of truth and the report never departs from it; the report makes it readable by the people who decide, most of whom do not know the method. It is separate from the [assess flow](assess.md) so that a record can be reported on by someone other than its assessor, and reported on again when the audience changes.

It never changes the record, the triage or the design.

## What it needs

No bindings are required; `catalogueUrl`, when declared or given, turns identifiers into links (see Links to the catalogue below). It reads the assessment record (`AS-NNN-<slug>.assessment.yaml`), the triage record it cites and any that supersede it, the design specification for the names of things, and the lenses at the versions the record names, for what each criterion asks: from the organisation's criteria set when the record names one in `criteria_set` (the `assessment` binding), else the shipped lenses.

## Steps

1. **Read the record whole**, with its triage, and check it validates against `assessment.schema.json`. A record that does not validate is reported on only as far as saying so.
2. **Read the design** for the plain names of its parts: report on "the connection that copies policy documents into the search index", not on an element id.
3. **Note anything that has changed since the assessment**, such as a later triage record or an attestation received afterwards. Report it as a later update and never fold it into the assessment's own results.
4. **Report.** Write `AS-NNN-<slug>.report.md` beside the record, for the people who decide, with the structure below. It is the full account, kept with the record and diffable.
At AT1 and AT2 write only a one-page summary, `AS-NNN-<slug>.summary.md`: the outcome, the blockers and the majors, each with what to do, and who confirms. The full report and the readout below begin at AT3.

5. **Readout.** From AT3, write `AS-NNN-<slug>.readout.md` beside it: the same conclusions as a short slide deck for the meeting where the outcome is confirmed. Slides are separated by a line holding only `---`, so the file renders to PowerPoint, PDF or HTML with a Markdown slide tool (Marp, Slidev) or loads into a slide service. Each slide holds one idea a reader takes in at a glance, at a 16:9 shape; detail stays in the report. The slides, in order: the subject and the recommended outcome; how much scrutiny it got and why, with where each part stands against the target state; how the review was done; how the checks came out; one slide per risk, in plain words; what must happen, by whom and by when; what a person must decide; what the review did not do. The writing rules below apply to every slide, with ids only in the speaker notes.

## Writing for people

The report and the readout are read by the people who decide, and most of them do not know this method. Write for them, not for the assessor who checks the record.

- Lead with what was assessed, what was found and what must happen, in everyday words.
- Name things by what they are, not by ids or fields: "the connection that copies policy documents into the search index", not `sbb-doc-connection`; "the Copilot Studio environment", not `node-pp-prod`.
- Keep criterion ids, finding ids, specification paths and field names out of the body. Put them in a closing reference table that maps each finding to its criterion and to where in the specification it rests, for the people who check the record. In a readout they go in the speaker notes.
- Translate the method's terms, or explain them once in passing: a tier is a level of scrutiny ("an enhanced review, the third of four levels"); `baseline` is "in use today but not part of the target state"; `not-met` is "missing" and `partly-met` "incomplete"; a disposition is "what happens next".
- Write each finding as what is wrong, why it matters to the business or to the people who use the solution, what to do about it, and who does it.
- Use short sentences in the active voice. A sentence that someone outside architecture cannot follow is rewritten, not footnoted.
- Count in plain numbers: "39 of 77 checks passed", "nothing blocks the design", "22 important gaps".

## The report

1. **Summary.** The subject and version, the proposed outcome, the tier, the number of blockers and majors, and the two or three things that decide the outcome.
2. **How much scrutiny, and why** (the triage). The drivers as declared and as derived, with the tier each gives; the resulting type, tier and plan; anything that would move the tier.
3. **How the review was done** (the assessment path). What was done and in what order: the depth and why, the criteria set when it is an organisation's, the lenses and versions, the check (schema validation and the tool criteria), the review, whether an evaluation was held, the evidence read, and what an agent could not decide and left to a person.
4. **How the checks came out** (results by lens). For each lens, the count of `met`, `partly-met`, `not-met`, `not-applicable` and `not-assessed`.
5. **Findings.** What blocks the design first, then the important gaps, then the minor ones, grouped by what they put at risk. Each says what is wrong, why it matters, what to do and who does it, in plain words.
6. **What it puts at risk, and what goes to other teams** (risk themes and hand-overs).
7. **What must happen next** (conditions). What must change before the next assessment, who owns it, and which tier and depth the next one will be.
8. **What this review did not do** (limits). What was not read, what was assumed, and what only a person can confirm.
9. **Reference.** A table mapping each finding to its criterion id, its result and severity, and the specification paths or evidence it rests on, for the people who check the record against the report.

## Links to the catalogue

When a catalogue URL prefix is known (the requester gives it, or `catalogueUrl` in `[suite.architecture]` of `.agents/skill-bindings.toml` declares it), every catalogue identifier in a report or readout is a link: the identifier appended to the prefix, as `[CAP-033](<prefix>CAP-033)`. A catalogue identifier is one of the envelope's series, a capital prefix, a hyphen and three digits (`PL`, `OC`, `UC`, `CAP`, `BC`, `ABB`, `SBB`, `SV`, `ST`, `DN`, `DR`, `CN`, `TD`, `API`, `EV`, `AP`, `RA`, `SD`, `AS`, `TR`). Link the first mention in each section, or each slide of a readout, and leave later mentions plain. Criterion identifiers (`CORE-QA-01`) are not in the catalogue: when a criteria URL prefix is known (the requester gives it, or `criteriaUrl` in `[suite.architecture]` declares it, such as `https://architecture.example.com/docs/assessment-criteria/`), link each to its published page, the identifier in lower case appended to the prefix, as `[CORE-QA-01](<prefix>core-qa-01)`, first mention per section or slide; otherwise write it plain. Do not link finding identifiers (`F-012`) or a design's local element ids. The YAML records keep identifiers as plain values: links belong to the documents people read. With no prefix known, write identifiers as plain text and say so in the report's limits.

## Rules

- Never say more than the record, and never soften it. Every count, severity, outcome and condition in the report is the record's.
- Translate faithfully. Where a plain word would change the meaning, keep the precise one and explain it.
- The readout never says more than the report.
