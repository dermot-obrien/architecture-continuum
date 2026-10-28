# Design review: ServiceNow knowledge agent in Teams

Assessment [AS-005](https://catalogue.example.com/items/AS-005) of design [SD-002](https://catalogue.example.com/items/SD-002), version 0.1.0, 28 October 2026. Prepared by an independent assessing agent that did not write the design or its specification. The outcome below is a proposal; a person confirms it.

This run starts from a solution design document, [index.md](./index.md), written from the pattern skill's solution design template, with its component diagram and scenario walkthrough. The specify flow translated that document into a design specification, the same design written as data, and listed 49 questions the document does not answer. The triage then decided how much scrutiny the design gets, the assessment checked the specification against the standard's checks at that level, and this report explains the result. The chain is: document, specification, triage, assessment, report.

| Step | File | What it holds |
|---|---|---|
| Document | [index.md](./index.md) | The solution design people read, from the template |
| Specification | [SD-002-servicenow-knowledge-agent.design.yaml](./SD-002-servicenow-knowledge-agent.design.yaml) | The same design as data, not yet confirmed by its author |
| Questions | [SD-002-servicenow-knowledge-agent.gaps.md](./SD-002-servicenow-knowledge-agent.gaps.md) | The 49 things the document does not say |
| Triage | [TR-005-servicenow-knowledge-agent.triage.yaml](./TR-005-servicenow-knowledge-agent.triage.yaml) | How much scrutiny, and why |
| Assessment | [AS-005-servicenow-knowledge-agent.assessment.yaml](./AS-005-servicenow-knowledge-agent.assessment.yaml) | A result for every check, and the proposed outcome |
| Readout | [AS-005-servicenow-knowledge-agent.readout.md](./AS-005-servicenow-knowledge-agent.readout.md) | The same conclusions as slides |

## 1. Summary

The design is for a Copilot Studio agent in Microsoft Teams that answers staff questions from ServiceNow knowledge articles, cites the article it used, and says so when no article answers. It has no tools: it reads and answers, and never acts.

Proposed outcome: not endorsed. It had an enhanced review, the third of four levels of scrutiny. One finding blocks the design and 22 important gaps are open.

Three things decide the outcome:

- The agent itself, Teams, sign-in through Entra ID, Copilot Studio and its Power Platform environment are where the organisation is heading. What is not is the connection that copies ServiceNow articles into Microsoft 365's search index, which is how this design feeds the agent. The target state has a separate enterprise knowledge store for this, and the design does not use it.
- Bringing in a part the target state does not plan for needs an exception, and only the organisation's exception authority (for example the architecture board) can grant one, after escalation. Nothing has been escalated, and the responsible architect is not inclined to seek an exception.
- So the design cannot be endorsed while it relies on that connection. The way forward is to change the design so the agent is grounded on the enterprise knowledge store. The only alternative is an exception through escalation.

## 2. How much scrutiny, and why

The triage, [TR-005](https://catalogue.example.com/items/TR-005), replaces [TR-004](https://catalogue.example.com/items/TR-004), which triaged an earlier specification of the same design. No level of scrutiny was declared for this design, so every answer below was worked out from the specification. The specification has not yet been confirmed by its author; if the author corrects it, the answers are checked again.

| What could go wrong | What the design shows | Level it gives |
|---|---|---|
| What the agent can reach, and how far it acts alone | Reads articles as the asking user; takes no action | Standard |
| The most sensitive data | Confidential articles; staff questions and answers are personal data | Standard |
| Who uses it | Staff only | Light |
| Content many people can edit, read by the model | Article text, in a session that cannot act | Standard |
| Effect on people | None beyond telling staff it is AI | Light |
| How new the parts are | The connection that copies articles into Microsoft 365 is outside the target state; four parts have no catalogue entry | Enhanced |
| How hard it is to undo | Every decision is easy to reverse | Light |

The highest answer sets the level: enhanced, because of how new the parts are. The type of assessment is an AI solution, because the agent uses a model but calls no tools.

Where each part stands against the target state is the responsible architect's call, not the author's or the assessor's. Dermot O'Brien, responsible architect for the target architecture of this test case, gave these positions on 28 October 2026:

| Part | Where it stands | Limit or successor |
|---|---|---|
| Copilot Studio ([SBB-044](https://catalogue.example.com/items/SBB-044)) | Part of the target state | |
| Microsoft Teams | Part of the target state | |
| Microsoft Entra ID | Part of the target state | |
| The Power Platform production environment ([DN-009](https://catalogue.example.com/items/DN-009)) | Part of the target state | Limited to what is needed to run Copilot Studio agents |
| The Microsoft 365 search index | Part of the target state | Limited to content that originates in the Microsoft 365 ecosystem, not items from outside it |
| The connection that copies ServiceNow articles into the index | Not part of the target state | Successor: the target state's separate enterprise knowledge store, which mixes vector and graph retrieval |

In the architect's words about the index: "We are using M365 Copilot, so I guess we could say it is in use today, but what's not in the target state is adding to the graph items that originate from outside the Microsoft ecosystem." No other part was given a position, and none was assumed.

The plan for an enhanced review: a review of every check that applies, by an independent lead assessor and a security architect, approved by the architecture board or its delegate with the service owner. Due now: a threat model, a cost model, a decision on the connection (a redesign, or an approved exception), and plans for the tests, judged as plans. Due before going live: the test reports, an injection test, a red-team exercise, a load test, and the outcomes of a full security assessment and a privacy impact assessment, which are handed over. It is assessed again every six months and on any change.

What would change the level: grounding the agent on the enterprise knowledge store, once it is catalogued as target, with catalogue entries for Teams, Entra ID and the Microsoft 365 index, would bring it down to a standard review. An approved exception would not, because the connection would still be new to the landscape.

## 3. How the review was done

1. Fixed the subject: version 0.1.0, with a fingerprint of the specification file so the findings cannot be read against a later version.
2. Checked the triage again from the specification: still enhanced, so the review could go ahead.
3. Chose the sets of checks: the core architecture checks (version 0.4.0) and the AI solution checks (version 0.3.0), because the agent uses a model. The agent checks do not apply, because it calls no tools, and the production checks belong to the assessment before going live.
4. Confirmed the specification is well formed, then ran every automatic check exactly as written.
5. Answered the checks that need judgement, from the specification, the document, its diagram and walkthrough, and the one piece of research the design cites, which was read.
6. Gave each shortfall what happens next, and proposed the outcome by the standard's rules.

The depth was a review, not an evaluation, because the triage found no decision that is hard to reverse; so there was no stakeholder workshop. The agent worked alone and cannot make the decision: at this level an independent lead assessor and a security architect, both people, must review its findings, and a person confirms the outcome.

## 4. How the checks came out

| Set of checks | Passed | Incomplete | Missing | Does not apply | Not assessed | Total |
|---|---|---|---|---|---|---|
| Core architecture | 30 | 10 | 8 | 1 | 2 | 51 |
| AI solution | 16 | 6 | 5 | 0 | 0 | 27 |
| All | 46 | 16 | 13 | 1 | 2 | 78 |

Of the 29 shortfalls, 1 blocks the design, 22 are important and 6 are minor.

## 5. Findings

### What blocks the design

- The connection that copies ServiceNow articles into Microsoft 365 is outside the target state, and no exception has been approved. Relying on it commits the organisation to something it has decided not to build on. The Digital workplace team, with the responsible architect, should move the agent onto the enterprise knowledge store; the only other route is an exception escalated to and approved by the exception authority. The design calls the connection existing, while "not part of the target state" in this method means not in use today either; the architect and the owner should reconcile the two.

### Important gaps: the target state

- Using Microsoft 365's search index for ServiceNow content goes beyond what the index is approved for, which is content from Microsoft 365 itself. Like the connection, this departure has no decision behind it, and the same redesign removes it.
- Neither departure is recorded, so neither has an end date or a way back.
- The design moves the agent toward the target state but its grounding away from it. The decision on how knowledge reaches the agent only weighs Microsoft routes and never considers the knowledge store.

### Important gaps: proving answers are right

- The model is not pinned, and no decision accepts that. The platform can change it without a release, so the tests that justify the design could stop applying. The team should record that decision, with the gating tests rerun on every model change.
- The test of answer correctness uses an AI judge that has not been checked against human marking, so its 90 per cent pass mark is not yet proof. The team should calibrate it.
- No test plants instructions in article text, though the design treats that text as untrusted; latency has no planned load test; and the test sets do not say which staff groups or languages they represent.
- No red-team exercise is planned. The report is due before going live, but the plan is due now.
- The citation test does not say what each kind of error costs, so its limits cannot be checked against the harm. The 2 per cent limit on wrong answers is stated three ways: of all questions, of unanswerable questions, and without a base. The team should pick one, because it decides how many test cases are needed.

### Important gaps: the design's behaviour when things change or fail

- The flow that copies articles into the index, newly described in this document, is tied to no use case.
- The scenarios cover reliability, security and speed, but not cost or ease of change.
- Only one failure is described, the copy of articles stopping. An outage of Copilot Studio, the model, search or sign-in has no scenario.
- Two trade-offs are not recorded as decisions: answering more questions against answering wrongly, and how quickly permission changes take effect. A change to who may read a knowledge base reaches the index only at the daily full copy, or within 30 minutes with identity sync, so for up to a day someone who has lost access could still be answered from it.
- Three open questions are in the design but not listed: whether sign-in through Microsoft returns these results at all (the cited research says Microsoft's own pages disagree), which checks on the connection the reuse decision depends on, and whether the knowledge store can serve now. The two listed questions have no owner or date.

### Important gaps: security and data

- There is no threat model for this version. The security architect and the team should produce one.
- The design does not say what identity the connection uses to get its token from Entra ID and read its users, and it matches ServiceNow users to Entra users by email address. A wrong match would give one person another's access to articles, and nothing in the design would notice. Both became visible because the template brought in the indexing walkthrough and the Entra interface.
- None of the seven connections names its interface and version, so a vendor change could break one unnoticed.
- Three connections do not say whether they carry untrusted content, including the one that pulls article text from ServiceNow, although the design treats that same text as untrusted once it reaches the agent.
- Monitoring and audit data, which will hold staff questions and answers, are not named as data sets with an owner, retention and location.
- The AI Act duty is named, but the design does not say why no AI impact assessment is needed.

### Important gaps: cost and value

- There is a budget but no cost model showing that the 600 US dollar monthly cap holds at peak.
- No decision compares the agent with putting portal search into Teams, which the design already falls back on.
- No decision accepts the platform's own limits on model calls.

### Minor gaps

- The volume assumption has no source.
- The design does not raise with the architect whether the target state should change, if the knowledge store cannot serve this need yet.
- Moving to the knowledge store may force a change of sign-in and of how the tests run, because the sign-in decision was made partly for this index; that dependency is not recorded.
- No model card is cited.
- The test of declining unanswerable questions is only just large enough for its 2 per cent limit, the online feedback measure has no minimum sample, and no test reports its margin of error.
- Monitoring of model calls is not shown to capture prompts, answers and cost per call.

### What works

Answers are retrieved as the asking user, so staff see only articles ServiceNow would show them, and a permission leak test with zero tolerance gates every release. The answer-or-abstain test weighs a wrong answer as worse than a missed one. The research the design cites exists, dates from this version and supports its decisions, though it says itself that nothing has been built or tested. Any redesign must keep the per-user permission trimming.

## 6. What it puts at risk, and what goes to other teams

| Risk | What it threatens |
|---|---|
| The agent is grounded off the target state, with no exception sought | The move toward the target state, and outcome [OC-004](https://catalogue.example.com/items/OC-004) |
| Wrong answers with convincing citations are not yet shown to be rare | Staff getting correct answers, and fewer service desk contacts |
| Whether ServiceNow's permissions survive into the answers is not yet shown | No article shown to someone ServiceNow would not show it to, HR content above all |
| Value and cost are asserted, not shown | Fewer service desk contacts at a sustainable cost |
| Behaviour when things change or fail is incomplete | Correct answers, and permissions holding through change |

Handed to the cybersecurity assessment: whether ServiceNow permissions survive into whichever store grounds the agent (the permission rules, the HR reader role, the email matching, the delay before permission changes apply), the connection's identity towards Entra ID, injection through articles, and the threat model. Handed to the privacy impact assessment: staff questions and answers in transcripts, monitoring and audit records, any sharing of unanswered questions with knowledge base owners, and the lawful basis as employer.

## 7. What must happen next

1. Change the design so the agent is grounded on the enterprise knowledge store, not on a copy of ServiceNow content in Microsoft 365. Owner: the Digital workplace team, with the responsible architect. The only alternative is an exception escalated to and approved by the exception authority.
2. List the missing open questions: whether the knowledge store can serve now, whether sign-in through Microsoft returns these results, and which checks the reuse decision depends on. Owner: the Digital workplace team.
3. Close the important gaps in section 5. Owner: the Digital workplace team. Due dates are the owner's to set; this review proposes the next design review.
4. Get catalogue entries for Teams, Entra ID, the Microsoft 365 index and the knowledge store.
5. The architect and the owner reconcile the design's description of the connection as existing with the architect's position.
6. The author confirms the specification, which an agent translated from the document and no person has yet checked.
7. An independent lead assessor and a security architect review these findings, and a person confirms the outcome.

The next assessment is a design review of the changed version, triaged again first: enhanced while any part outside the target state remains, standard once the agent is grounded on a catalogued target store and every part has a catalogue entry.

## 8. What this review did not do

- It did not judge whether controls are built or work; that is the security assessment's job.
- It did not assess the enterprise knowledge store, which is not in the design or the catalogue, so it cannot say whether that store can enforce ServiceNow permissions or ground a Copilot Studio agent. The redesign must show it can.
- It assessed a specification its author has not yet confirmed. Where the specification and the document differ, the finding says so; a correction by the author may change findings.
- It did not record how closely the design follows the target state on the standard's scale, because the catalogue was not available; the architect's positions alone show the design has parts the target does not cover.
- It used the architect's positions as given, and gave no position to any part he did not name.
- It read an earlier review, [AS-004](https://catalogue.example.com/items/AS-004), for its shape only, and judged every check afresh.
- Catalogue links use a placeholder address, https://catalogue.example.com/items/, not a real catalogue.
- Only a person can confirm the outcome, accept any risk or approve an exception.

## 9. What starting from the template changed

AS-004 reviewed an earlier specification of the same design, written before the solution design document existed in this form. This review started from the document written from the template.

| | AS-004 | AS-005 |
|---|---|---|
| Blocks the design | 1 | 1 |
| Important | 19 | 22 |
| Minor | 5 | 6 |
| Checks passed | 50 | 46 |
| Incomplete | 12 | 16 |
| Missing | 13 | 13 |
| Does not apply | 1 | 1 |
| Not assessed | 2 | 2 |
| Total checks | 78 | 78 |

What the fuller document brought in: the walkthrough of how a question is answered now has six steps rather than four, including ServiceNow checking access again when a citation is opened; a second walkthrough shows how the connection copies articles into the index; a seventh connection, from the connection to Entra ID, carries its token and the identities used to match users; and a catalogue mapping in which the author records that Teams, Entra ID, the index and the connection have no catalogue entry.

What it closed: no check that fell short in AS-004 passes here. The gains are in what can be read with confidence. The indexing path, Federated sign-in and the email matching are now stated by the author rather than left to research, and the novelty finding rests on the author's own catalogue mapping rather than on missing references alone.

What it newly exposed: two important gaps come from what the template brought in. The indexing walkthrough is tied to no use case, and the new Entra connection has no stated authentication or authorisation, which, with the email matching it describes, leaves the connection's identity and the user matching unshown. The document also put the environment's owner in the wrong column, which the specification read as the owner and the author should confirm.

What did not come from the template: two further differences are this assessor's judgement on facts that were the same in the earlier specification. The citation test's missing costs and the three bases for the 2 per cent limit were judged incomplete here and passed in AS-004, and the tie between the grounding store and the sign-in decision was judged a minor gap here and passed there. Together the four differences account for the move from 50 to 46 checks passed.

## 10. Reference

Checks are those of the [core lens](../../lenses/core.yaml) (version 0.4.0) and the [AI solution lens](../../lenses/ai-solution.yaml) (version 0.3.0). Paths are in the specification.

| # | Finding | Check | Result | Severity | Rests on |
|---|---|---|---|---|---|
| F-012 | Not-target connection, no approved exception | CORE-TGT-05 | not-met | blocker | triage.target_state; decisions.dec-01; decisions.dec-02 |
| F-007 | Indexing scenario tied to no use case | CORE-TRC-04 | partly-met | major | scenarios.s2; context.serves |
| F-008 | Departures without decisions; index used beyond its permitted use | CORE-TGT-01 | not-met | major | triage.target_state; decisions.dec-01.affects; connectors.if-05 |
| F-009 | Departures unrecorded, no expiry or path back | CORE-TGT-02 | not-met (tool met) | major | decisions; triage.target_state |
| F-010 | Grounding moves away from the target state | CORE-TGT-03 | partly-met | major | decisions.dec-01.alternatives; connectors.if-05 |
| F-021 | No cost or maintainability scenario | CORE-QA-02 | partly-met | major | scenarios.quality_attribute |
| F-023 | Only one failure scenario | CORE-QA-04 | partly-met (tool met) | major | scenarios.f1; elements.knowledge-agent.ai.fallback |
| F-024 | Trade-offs not recorded as decisions | CORE-QA-05 | partly-met | major | elements.knowledge-agent.ai.grounding.freshness; decisions |
| F-026 | Open questions not named | CORE-DEC-02 | partly-met | major | considerations; decisions.dec-03.rationale; decisions.dec-02.chosen |
| F-030 | No connector contracts | CORE-INT-01 | not-met | major | connectors.if-01 to if-07 |
| F-033 | Telemetry and audit data sets unnamed | CORE-DAT-01 | partly-met (tool met) | major | data; operations.observability |
| F-038 | Untrusted content not stated on three connectors | CORE-SEC-03 | not-met | major | connectors.if-01; connectors.if-04; connectors.if-06 |
| F-039 | No threat model | CORE-SEC-04 | not-met | major | evidence |
| F-040 | Connection's Entra identity and email matching not shown | CORE-SEC-05 | partly-met | major | connectors.if-07; scenarios.s2; data.ds-02.lineage |
| F-045 | No cost model | CORE-CST-01 | not-met | major | operations.cost; evidence |
| F-052 | No case for a model over search | AIS-FIT-01 | partly-met | major | decisions; operations.recovery.degraded_mode |
| F-054 | Model not pinned, no decision | AIS-MOD-01 | not-met | major | elements.knowledge-agent.ai.model |
| F-059 | No injection, load or population coverage | AIS-EVAL-03 | partly-met | major | elements.knowledge-agent.ai.evals; connectors.if-03 |
| F-060 | AI judge uncalibrated | AIS-EVAL-04 | not-met | major | elements.knowledge-agent.ai.evals.eval-02.judge_calibrated |
| F-061 | No red-team plan | AIS-EVAL-05 | not-met | major | elements.knowledge-agent.ai.input_trust; evidence |
| F-062 | Citation errors uncosted; three bases for the 2 per cent limit | AIS-EVAL-06 | partly-met (tool met) | major | elements.knowledge-agent.ai.evals.eval-03.errors; scenarios.q1; scenarios.q2 |
| F-073 | No call limits or decision on platform limits | AIS-OPS-01 | not-met | major | elements.knowledge-agent.ai; operations.cost.budget |
| F-078 | No AI impact assessment or reason for none | AIS-HUM-03 | partly-met | major | drivers.obligations.obl-ai-transparency; evidence |
| F-003 | Volume assumption has no source | CORE-DEM-03 | partly-met | minor | drivers.assumptions.asm-volume |
| F-011 | No consideration on changing the target | CORE-TGT-04 | not-met | minor | decisions.dec-01.rationale; considerations |
| F-048 | Sign-in and evaluation tied to the grounding store | CORE-EVO-02 | partly-met | minor | decisions.dec-03.rationale; elements.knowledge-agent.ai.grounding |
| F-055 | No model card | AIS-MOD-02 | not-met | minor | elements.knowledge-agent.ai.model |
| F-065 | Abstain sample marginal, no intervals | AIS-EVAL-09 | partly-met | minor | elements.knowledge-agent.ai.evals.eval-01.sample_size; eval-06 |
| F-074 | Telemetry gap not decided | AIS-OPS-02 | partly-met | minor | operations.observability |
| F-019 | Landscape not stated | CORE-STR-07 | not-assessed | | context |
| F-046 | Environmental cost materiality | CORE-CST-02 | not-assessed | | scenarios; decisions |
| F-044 | Runbook (active designs only) | CORE-OPS-04 | not-applicable | | design.status |

The other 46 checks passed; each has its own finding in the record, among them the sensitivity points and non-risks F-032, F-067 and F-072, and observations F-013, F-018, F-037, F-042 and F-051. Record: AS-005-servicenow-knowledge-agent.assessment.yaml. Triage: TR-005-servicenow-knowledge-agent.triage.yaml, which supersedes TR-004. Specification digest sha256:a11193e1c80f3bb7f24a966dfd20a67d263678b10252baa49b44f5761c85d543. Catalogue items mentioned: [SD-002](https://catalogue.example.com/items/SD-002), [TR-005](https://catalogue.example.com/items/TR-005), [AS-005](https://catalogue.example.com/items/AS-005), [AS-004](https://catalogue.example.com/items/AS-004), [OC-004](https://catalogue.example.com/items/OC-004), [CAP-033](https://catalogue.example.com/items/CAP-033), [UC-031](https://catalogue.example.com/items/UC-031), [PL-005](https://catalogue.example.com/items/PL-005), [BC-012](https://catalogue.example.com/items/BC-012), [RA-007](https://catalogue.example.com/items/RA-007), [SBB-044](https://catalogue.example.com/items/SBB-044), [DN-009](https://catalogue.example.com/items/DN-009).
