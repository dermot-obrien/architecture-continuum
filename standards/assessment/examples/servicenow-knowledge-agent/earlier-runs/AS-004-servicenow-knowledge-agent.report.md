# Design review: ServiceNow knowledge agent in Teams

Assessment [AS-004](https://catalogue.example.com/items/AS-004) of design [SD-002](https://catalogue.example.com/items/SD-002), version 0.1.0, 28 October 2026. Prepared by an independent assessing agent. The outcome below is a proposal; a person confirms it.

## 1. Summary

The design is for a Copilot Studio agent in Microsoft Teams that answers staff questions from ServiceNow knowledge articles, citing the article, and says so when no article answers. It has no tools: it reads and answers, and never acts.

Proposed outcome: not endorsed. It had an enhanced review, the third of four levels of scrutiny. One finding blocks the design and 19 important gaps are open.

Three things decide the outcome:

- The agent itself, Teams, sign-in through Entra ID, Copilot Studio and its Power Platform environment are where the organisation is heading. What is not is copying ServiceNow articles into Microsoft 365's search index, which is how this design feeds the agent. The target state has a separate enterprise knowledge store for this, and the design does not use it.
- Bringing in a part the target state does not plan for needs an exception, and only the organisation's exception authority (for example the architecture board or its delegate) can grant one, after escalation. Nothing has been escalated. The responsible architect has said he is not inclined to support the design, because the target state is defined and these parts are not in it.
- So the design cannot be endorsed while it relies on that copy. The way forward is to change the design so the agent is grounded on the enterprise knowledge store. The only alternative is an exception through escalation.

## 2. How much scrutiny, and why

The triage, [TR-004](https://catalogue.example.com/items/TR-004), replaces [TR-003](https://catalogue.example.com/items/TR-003). The answers and the level are the same; it records the architect's corrected view of two parts and fixes reasoning in the earlier record that no longer matched it.

| What could go wrong | What the design shows | Level it gives |
|---|---|---|
| What the agent can reach, and how far it acts alone | Reads articles as the asking user; takes no action | Standard |
| The most sensitive data | Confidential articles; staff questions are personal data | Standard |
| Who uses it | Staff only | Light |
| Content many people can edit, read by the model | Article text, in a session that cannot act | Standard |
| Effect on people | None beyond telling staff it is AI | Light |
| How new the parts are | The connection that copies articles into Microsoft 365 is outside the target state; four parts have no catalogue entry | Enhanced |
| How hard it is to undo | Every decision is easy to reverse | Light |

The highest answer sets the level: enhanced, because of how new the parts are. The design's author had declared everything catalogued and on target; the specification does not support that, and the derived answer wins.

The plan for an enhanced review: an independent lead assessor and a security architect, approval by the architecture board or its delegate with the service owner, a threat model and a cost model now, and a security assessment and a privacy impact assessment handed over.

What would change the level: grounding the agent on the enterprise knowledge store, once it is catalogued as target, and catalogue entries for Teams, Entra ID and the Microsoft 365 index, would bring it down to a standard review. An approved exception would not, because the connection would still be new.

## 3. How the review was done

1. Fixed the subject: version 0.1.0, with a fingerprint of the file so the findings cannot be read against a later version.
2. Chose the lenses, the sets of checks: the core architecture checks (version 0.4.0) and the AI solution checks (version 0.3.0). The agent checks do not apply, because it has no tools.
3. Confirmed the specification is well formed, then ran every automatic check exactly as written.
4. Answered the checks that need judgement, from the specification and the design research it cites.
5. Gave each shortfall what happens next, and proposed the outcome by the standard's rules.

Where each part stands against the target state is the responsible architect's call, not the assessor's; this review used his attestation as given. It did not hold a stakeholder workshop, because that depth was not required. The agent worked alone; at this level a person must review its findings.

## 4. How the checks came out

| Set of checks | Passed | Incomplete | Missing | Does not apply | Not assessed | Total |
|---|---|---|---|---|---|---|
| Core architecture | 33 | 7 | 8 | 1 | 2 | 51 |
| AI solution | 17 | 5 | 5 | 0 | 0 | 27 |
| All | 50 | 12 | 13 | 1 | 2 | 78 |

Of the 25 shortfalls, 1 blocks the design, 19 are important and 5 are minor.

## 5. Findings

### What blocks the design

- The connection that copies ServiceNow articles into Microsoft 365 is outside the target state, and no exception has been approved. Using it commits the organisation to something it has decided not to build on. The Digital workplace team, with the responsible architect, should move the agent onto the enterprise knowledge store; the only other route is an exception escalated to and approved by the exception authority.

### Important gaps: the target state

- Using Microsoft 365's search index for ServiceNow content is beyond what the index is approved for (content from Microsoft 365 itself). Like the connection, this is a departure with no decision behind it, and the same redesign removes it.
- Neither departure is recorded, so neither has an end date or a way back. If either is kept, it needs both, with the knowledge store as the way back.
- The design moves the agent toward the target state but its grounding away from it. The decision on how knowledge reaches the agent never considers the knowledge store.
- Open questions are missing: whether sign-in through Microsoft returns these results at all, which the design leaves "to confirm in the tenant", and whether the knowledge store can serve now.

### Important gaps: proving answers are right

- The model is not pinned and no decision accepts that. The platform can change it without a release, so the tests that justify the design could stop applying. The team should record that decision, rerunning the gating tests on every model change.
- The test of answer correctness uses an AI judge not yet checked against human marking, so its 90 per cent pass mark is not yet proof. The team should calibrate it.
- No test plants instructions in article text, though the design treats that text as untrusted; latency has no planned test; and the test set does not say which staff groups it represents. The team should plan all three.
- No red-team exercise is planned. The report is due before go-live, but the plan is due now.
- Two trade-offs are not recorded as decisions: answering more questions against answering wrongly, and fast answers against permission changes taking up to a day to apply.
- The test scenarios cover reliability, security and speed, but not cost or ease of change, and only one failure is described: the article copy stopping. An outage of the agent platform or search has no scenario.

### Important gaps: security and data

- There is no threat model for this version. The security architect and the team should produce one, covering whether ServiceNow's permissions survive the copy and injection through articles.
- None of the six connections names its interface and version, so a vendor change could break it unnoticed.
- Three connections do not say whether they carry untrusted content, including staff questions and the article text pulled from ServiceNow.
- Monitoring data, which will hold staff questions and answers, is not named as a data set with an owner, retention and location. It goes to the privacy impact assessment.
- The AI Act duty is named, but the design does not say why no AI impact assessment is needed.

### Important gaps: cost and value

- There is a budget but no cost model showing the 600 US dollar monthly cap holds at peak.
- No decision compares the agent with simply improving portal search, which the design already falls back on.
- No decision accepts the platform's own limits on model calls.

### Minor gaps

- The volume assumption has no source.
- No model card is cited.
- The test of declining unanswerable questions may be too small to prove its 2 per cent ceiling, and no test reports its margin of error.
- Monitoring of model calls is not shown to capture cost per call.
- The design does not raise with the architect whether the target state should change, if the knowledge store cannot serve this need yet.

### What works

Answers are retrieved as the asking user, so staff see only articles ServiceNow would show them, and a permission leak test with zero tolerance gates every release. The tests weigh a wrong answer as worse than a missed one. The grounding source is one setting in the agent, so moving it to the knowledge store leaves the rest of the design intact. Any redesign must keep the per-user permission trimming.

## 6. What it puts at risk, and what goes to other teams

| Risk | What it threatens |
|---|---|
| The agent is grounded off the target state, with no exception sought | The move toward the target state, and outcome [OC-004](https://catalogue.example.com/items/OC-004) |
| Wrong answers with convincing citations are not yet shown to be rare | Staff getting correct answers, and fewer service desk contacts |
| The security design is not yet shown | No article shown to someone ServiceNow would not show it to |
| Value and cost are asserted, not shown | Fewer service desk contacts at a sustainable cost |

Handed to the cybersecurity assessment: whether ServiceNow permissions survive into whichever store grounds the agent, injection through articles, and the threat model. Handed to the privacy impact assessment: staff questions and answers in transcripts, monitoring and audit records.

## 7. What must happen next

1. Change the design so the agent is grounded on the enterprise knowledge store, not on a copy of ServiceNow content in Microsoft 365. Owner: the Digital workplace team, with the responsible architect. The only alternative is an exception escalated to and approved by the exception authority.
2. Close the important gaps in section 5. Owner: the Digital workplace team. Due dates are the owner's to set; this review proposes the next design review.
3. Get catalogue entries for Teams, Entra ID, the Microsoft 365 index and the knowledge store.
4. The architect and the owner reconcile the design research, which calls the connection existing, with the architect's position.
5. An independent lead assessor and a security architect review these findings, and a person confirms the outcome.

The next assessment is a design review of the changed version, triaged again first: enhanced while any part outside the target state remains, standard once the agent is grounded on a catalogued target store.

## 8. What this review did not do

- It did not judge whether controls are built or work; that is the security assessment's job.
- It did not assess the enterprise knowledge store, which is not in the design or the catalogue, so it cannot say whether that store can enforce ServiceNow permissions. The redesign must show it can.
- It did not record how closely the design follows the target state on the standard's scale, because the catalogue was not available; the architect's view alone shows it can be no better than partly aligned.
- It applied the rule that only the exception authority approves an exception after escalation, as the requester stated it; the checks as published still name the responsible architect. The outcome is the same either way.
- It did not read the two earlier assessments, so that this one stands on its own.
- Catalogue links use a placeholder address.
- Only a person can confirm the outcome, accept any risk or approve an exception.

## 9. Reference

| # | Finding | Check | Result | Severity | Rests on |
|---|---|---|---|---|---|
| F-012 | Not-target connection, no approved exception | CORE-TGT-05 | not-met | blocker | triage.target_state; decisions |
| F-008 | Departures without decisions; index used beyond its permitted use | CORE-TGT-01 | not-met | major | triage.target_state; decisions.d-copilot-connector; decisions.d-reuse-kb3; elements.svc-kb-agent.ai.grounding.sources |
| F-009 | Departures unrecorded, no expiry or path back | CORE-TGT-02 | not-met (tool met) | major | decisions; triage.target_state |
| F-010 | Grounding moves away from the target state | CORE-TGT-03 | partly-met | major | decisions.d-copilot-connector.alternatives; connectors.c-connection-index |
| F-021 | No cost or maintainability scenario | CORE-QA-02 | partly-met | major | scenarios.quality_attribute |
| F-023 | Only one failure scenario | CORE-QA-04 | partly-met (tool met) | major | scenarios.sc-crawl-stops; elements.svc-kb-agent.ai.fallback |
| F-024 | Trade-offs not recorded as decisions | CORE-QA-05 | partly-met | major | elements.svc-kb-agent.ai.grounding.freshness; decisions |
| F-026 | Open questions not named | CORE-DEC-02 | partly-met | major | considerations; decisions.d-auth-microsoft.rationale |
| F-030 | No connector contracts | CORE-INT-01 | not-met | major | connectors |
| F-033 | Telemetry and audit data sets unnamed | CORE-DAT-01 | partly-met (tool met) | major | data; operations.observability.conventions |
| F-038 | Untrusted content not stated on three connectors | CORE-SEC-03 | not-met | major | connectors.c-staff-teams; connectors.c-staff-portal; connectors.c-connection-servicenow |
| F-039 | No threat model | CORE-SEC-04 | not-met | major | evidence |
| F-045 | No cost model | CORE-CST-01 | not-met | major | operations.cost; evidence |
| F-052 | No case for a model over search | AIS-FIT-01 | partly-met | major | decisions; operations.recovery.degraded_mode |
| F-054 | Model not pinned, no decision | AIS-MOD-01 | not-met | major | elements.svc-kb-agent.ai.model; elements.svc-kb-agent.ai.drift_monitoring |
| F-059 | No injection, load or population coverage | AIS-EVAL-03 | partly-met | major | elements.svc-kb-agent.ai.evals; connectors.c-agent-index.carries_untrusted_content |
| F-060 | AI judge uncalibrated | AIS-EVAL-04 | not-met | major | elements.svc-kb-agent.ai.evals.eval-correctness.judge_calibrated |
| F-061 | No red-team plan | AIS-EVAL-05 | not-met | major | elements.svc-kb-agent.ai.input_trust; evidence |
| F-073 | No timeout or decision on platform limits | AIS-OPS-01 | not-met | major | elements.svc-kb-agent.ai.limits |
| F-078 | No AI impact assessment or reason for none | AIS-HUM-03 | partly-met | major | drivers.obligations.obl-ai-transparency; evidence |
| F-003 | Volume assumption has no source | CORE-DEM-03 | partly-met | minor | drivers.assumptions.asm-volume |
| F-011 | No consideration on changing the target | CORE-TGT-04 | not-met | minor | decisions.d-copilot-connector.rationale; considerations |
| F-055 | No model card | AIS-MOD-02 | not-met | minor | elements.svc-kb-agent.ai.model |
| F-065 | Abstain sample small, no intervals | AIS-EVAL-09 | partly-met | minor | elements.svc-kb-agent.ai.evals.sample_size |
| F-074 | Telemetry gap not decided | AIS-OPS-02 | partly-met | minor | operations.observability |
| F-019 | Landscape not stated | CORE-STR-07 | not-assessed | | context |
| F-046 | Environmental cost materiality | CORE-CST-02 | not-assessed | | scenarios; decisions |
| F-044 | Runbook (active designs only) | CORE-OPS-04 | not-applicable | | design.status |

The other 50 checks passed; each has its own finding in the record, among them the non-risks and sensitivity points F-040, F-048, F-062, F-067 and F-072. Record: AS-004-servicenow-knowledge-agent.assessment.yaml. Triage: TR-004-servicenow-knowledge-agent.triage.yaml. Specification digest sha256:b6ac13d464b9a6a083466ad0acda63cb0e7dad1bf0c6440c40686ca91b88767c. Catalogue items mentioned: [SD-002](https://catalogue.example.com/items/SD-002), [TR-004](https://catalogue.example.com/items/TR-004), [AS-004](https://catalogue.example.com/items/AS-004), [OC-004](https://catalogue.example.com/items/OC-004), [CAP-033](https://catalogue.example.com/items/CAP-033), [UC-031](https://catalogue.example.com/items/UC-031), [SBB-044](https://catalogue.example.com/items/SBB-044), [DN-009](https://catalogue.example.com/items/DN-009).
