# ServiceNow knowledge assistant in Teams: architecture review

An AI assistant that answers staff questions in Microsoft Teams from ServiceNow knowledge articles.

- Recommendation: approve, with conditions
- Level of scrutiny: enhanced, the third of four levels
- Problems found: none blocking; 22 important, 13 minor

Reviewed by an AI reviewer on 28 October 2026. A person makes the decision.

<!-- Record: [AS-003](https://catalogue.example.com/items/AS-003) of [SD-002](https://catalogue.example.com/items/SD-002) version 0.1.0, triage TR-002 (tier AT3). Proposed outcome endorsed-with-conditions: 0 blockers, 22 majors, 13 minors. Provenance ai-raw. -->

---

## Parts of it are not yet part of our planned technology

We scale each review to the risk. This one got the third of four levels, because the parts that find and fetch the articles are not formally in our technology catalogue.

| Part of the design | Where it stands in our target architecture |
|---|---|
| The connection that copies ServiceNow articles into Microsoft 365 | In use today, but not where we are heading; no replacement chosen yet |
| Microsoft 365 search, which finds the right articles | In use today, but not where we are heading; no replacement chosen yet |
| Copilot Studio, Microsoft Teams, Entra ID sign-in | Part of where we are heading |
| The Power Platform environment it runs in | Part of where we are heading, but only for running Copilot Studio agents (confirmed after the review) |

Target positions given by Dermot O'Brien, responsible architect.

<!-- [TR-002](https://catalogue.example.com/items/TR-002) supersedes TR-001 (AT2). Novelty AT3: teams, entra, graph-index and sbb-kb-connection have no catalogue ref and no element names an assessed platform; this conflicts with the attestation of the connection and index at baseline. All other drivers AT2 or lower. [TR-003](https://catalogue.example.com/items/TR-003) later records node-pp-prod (DN-009) as target, limited to running Copilot Studio agents. -->

---

## The written design, checked against 77 standard questions

1. Confirmed the level of scrutiny from the design itself
2. Checked the design document is complete and well formed
3. Ran the checks that can be decided automatically
4. Answered the rest by reading the design and judging
5. Judged planned tests by their plan, since nothing is built yet

Not part of this review: checks for AI that takes actions (this assistant only answers), go-live readiness (a later review), and a workshop with the people who use it.

<!-- Lenses core 0.3.0 and ai-solution 0.3.0; not ai-agent, not production. Review depth. Source document and research evidence not available. -->

---

## Half the checks passed, and nothing stops the design

| Passed | Incomplete | Missing | Not applicable or not checked |
|---|---|---|---|
| 39 | 21 | 14 | 3 |

The 35 that are incomplete or missing are 22 important gaps to close before approval and 13 minor ones. None is serious enough to stop the design outright.

<!-- Core: met 26, partly-met 13, not-met 8, n/a 1, not-assessed 2. AI solution: met 13, partly-met 8, not-met 6. CORE-STR-05 fails as written and was moved from blocker to minor with a reason; restoring it makes the outcome not endorsed. -->

---

## Risk 1: it relies on technology we plan to move away from

Every answer depends on the ServiceNow connection and Microsoft 365 search. Neither is where we are heading, and nothing has been chosen to replace them.

- Record using them as a time-limited exception, with an end date and a way back
- Ask the responsible architect what will replace them
- Stop describing the design as fully in line with the target

If ignored: we build more on technology we intend to retire.

<!-- CORE-TGT-01, CORE-TGT-02, CORE-TGT-03, CORE-DEC-02. Threatens [CAP-033](https://catalogue.example.com/items/CAP-033). -->

---

## Risk 2: we can't yet show staff only see what they're allowed to

Some articles are restricted, HR ones above all. The design doesn't yet show how that holds, or that an article's text can't trick the assistant.

- Write the security threat analysis with a security architect
- Say what happens when someone loses access, and how fast it takes effect
- State the account the assistant runs as and what it can reach
- Plan tests that try to trick it through article text

The security team then tests the built system; its result is needed before go-live.

<!-- CORE-SEC-04, CORE-SEC-03, CORE-QA-04, CORE-QA-05, CORE-SEC-05, CORE-DAT-01, AIS-EVAL-03, AIS-EVAL-05. Handed over to cybersecurity and privacy. -->

---

## Risk 3: the tests can't yet prove the answers are right

The test plan is well thought out, but as written it could pass while the assistant still gives wrong answers.

- Check the automated marker against people's own marking first
- Test "answers it should have refused" separately, on about 190 questions, not 160
- Re-run the tests whenever Microsoft changes the underlying AI model

If ignored: confident wrong answers, with a citation that makes them look right.

<!-- AIS-EVAL-04, AIS-EVAL-07, AIS-MOD-01. Threatens [OC-004](https://catalogue.example.com/items/OC-004). -->

---

## Risk 4: cost and operating limits haven't been worked out

The budget is capped at 600 US dollars a month, but nothing shows how far that goes, or what staff see once it runs out.

- Build a cost model against the expected number of questions
- Confirm the sign-in approach works before relying on it
- Write down why an AI assistant beats the search staff already have
- Name the interfaces it uses, and accept the platform's limits in writing

If ignored: the service stops part-way through a month, or costs more than planned.

<!-- CORE-CST-01, CORE-QA-02, CORE-DEC-01, AIS-FIT-01, CORE-INT-01, CORE-STR-07, AIS-OPS-01. -->

---

## Conditions for approval

| What | Who | By when |
|---|---|---|
| Record the exception for the connection and search, and ask what replaces them | Digital workplace team, with the responsible architect | 27 Nov 2026 |
| Add the four parts not yet in the technology catalogue: the connection, search, Teams and Entra ID | Digital workplace team | Next review |
| Security threat analysis and cost model | Digital workplace team | 27 Nov 2026 |
| Fix the test plan: trickery, lost access, load, marker, refusals | Digital workplace team | 27 Nov 2026 |
| Name interfaces and data, add failure cases, record the open decisions | Digital workplace team, with the Microsoft 365 admin | 27 Nov 2026 |
| Security and privacy teams return their results | Digital workplace team | Before go-live |
| Confirm the Power Platform environment's position: done | Responsible architect | Closed |

Dates are the reviewer's suggestion; the design's owner sets them.

---

## Five decisions the reviewer can't make

1. Accept the recommendation: approve with conditions
2. Set the deadlines; without them the design can't be approved
3. Decide whether one strict check, that every reference in the design points somewhere real, should block approval
4. Decide whether technology already in use counts as new just because it isn't in the catalogue yet
5. Choose what will replace the ServiceNow connection and Microsoft 365 search

<!-- 3: CORE-STR-05. 4: novelty versus the attestation. -->

---

## What this review did not do

- An AI reviewer worked alone; a lead architect and a security architect still need to check its work
- It read the written design only, not the live system or the research behind it
- It could not compare the design with the full technology catalogue
- It did not test whether security controls work; that is the security team's job
- Links in the report go to a placeholder catalogue address for now

The full report and the review record sit beside the design.
