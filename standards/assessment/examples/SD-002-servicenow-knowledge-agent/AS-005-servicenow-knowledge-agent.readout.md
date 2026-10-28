---
marp: true
paginate: true
size: 16:9
title: ServiceNow knowledge agent in Teams, design review readout
---

# 1. ServiceNow knowledge agent in Teams

Design review of [SD-002](https://catalogue.example.com/items/SD-002), version 0.1.0, 28 October 2026

A Copilot Studio agent in Teams that answers staff questions from ServiceNow articles, with citations. It reads and answers; it never acts.

Recommended outcome: not endorsed, a proposal for a person to confirm

- 1 finding blocks the design
- 22 important gaps are open

From the design document, written from the template, to a specification, a triage, this review and its report.

<!-- Record AS-005, triage TR-005 (supersedes TR-004). Source document index.md from the pattern skill's solution design template; specification SD-002-servicenow-knowledge-agent.design.yaml by the specify flow, ai-raw; gaps list of 49 questions. Outcome not-endorsed by rule 2 of section 7: open blocker CORE-TGT-05 (F-012), and open majors disposed fix-design with no due date. Digest sha256:a11193e1...61c85d543. -->

---

# 2. How much scrutiny, and why

An enhanced review, the third of four levels, set by how new the parts are.

| Part | Where it stands |
|---|---|
| The agent, Teams, Entra ID sign-in | Where we are heading |
| Copilot Studio and its environment | Where we are heading, for running agents |
| Microsoft 365 search index | Where we are heading, only for Microsoft 365 content |
| The connection copying ServiceNow articles into it | Not part of the target state |

The target state has a separate enterprise knowledge store for this.

<!-- TR-005: type ai-solution, tier AT3. Drivers: reach-and-agency AT2 (read, none), data AT2, exposure AT1, untrusted-content AT2, effect-on-people AT1, novelty AT3, reversibility AT1. target_state attested by Dermot O'Brien, 2026-10-28: copilot-studio SBB-044 target; teams target; entra-id target; pp-production-env DN-009 target, permitted use limited to running Copilot Studio agents; graph-index target, permitted use Microsoft 365 content only; servicenowkb3 not-target, successor the enterprise knowledge store (vector and graph RAG). Plan: review, lenses core and ai-solution, independent assessor, approver the architecture board or delegate with the service owner, hand-overs cybersecurity and privacy, reassess six-monthly. AT2 if redesigned onto a catalogued target store with refs added. -->

---

# 3. How the review was done

1. Started from the design document and its specification, not yet confirmed by its author
2. Checked the level of scrutiny again from the specification
3. Chose two sets of checks: core architecture and AI solution
4. Ran every automatic check exactly as written
5. Answered the checks that need judgement, and read the cited research
6. Proposed what happens next and the outcome

Where each part stands is the responsible architect's call, used as given. An agent did the review alone; a person must review it.

<!-- Lenses core 0.4.0 and ai-solution 0.3.0; ai-agent not applicable (no agent facet); production not applicable (trigger new-design). Depth review, no utility tree. Assessor: agent, independent; AT3 needs an independent lead assessor and a security architect, both people. Specification review_state ai-raw. AS-004 read for shape only. -->

---

# 4. How the checks came out

| | Passed | Incomplete | Missing | Other | Total |
|---|---|---|---|---|---|
| Core architecture | 30 | 10 | 8 | 3 | 51 |
| AI solution | 16 | 6 | 5 | 0 | 27 |
| All | 46 | 16 | 13 | 3 | 78 |

29 shortfalls: 1 blocks, 22 important, 6 minor

<!-- Other: 1 not-applicable (CORE-OPS-04), 2 not-assessed (CORE-STR-07, CORE-CST-02). Incomplete = partly-met, missing = not-met. -->

---

# 5. Risk: the agent is fed off the target state

- ServiceNow articles are copied into Microsoft 365's search index, which the target state excludes
- That uses the index beyond what it is approved for
- Neither departure is recorded, and no exception has been sought
- The design never considers the enterprise knowledge store

The fix: ground the agent on the enterprise knowledge store

<!-- RT-01. F-012 CORE-TGT-05 blocker; F-008 CORE-TGT-01, F-009 CORE-TGT-02, F-010 CORE-TGT-03 major; F-011 CORE-TGT-04, F-048 CORE-EVO-02 minor. Rests on triage.target_state, decisions.dec-01, decisions.dec-02, connectors.if-05. -->

---

# 6. Risk: wrong answers are not yet shown to be rare

- The model can change without a release, and nothing reruns the tests when it does
- The AI judge of correctness is not checked against people
- No test plants instructions in an article
- The 2 per cent limit on wrong answers has three different bases
- The citation test does not say what its errors cost

<!-- RT-02. F-054 AIS-MOD-01, F-059 AIS-EVAL-03, F-060 AIS-EVAL-04, F-062 AIS-EVAL-06 major; F-065 AIS-EVAL-09 minor. Rests on elements.knowledge-agent.ai.model, elements.knowledge-agent.ai.evals, scenarios.q1, scenarios.q2. -->

---

# 7. Risk: permissions are not yet shown to survive

- No threat model for this version
- The connection's identity towards Entra ID is not stated
- Users are matched to ServiceNow by email; a wrong match gives the wrong access
- Untrusted article text is not marked where it enters
- No red-team plan; monitoring data not named

<!-- RT-03. F-030 CORE-INT-01, F-033 CORE-DAT-01, F-038 CORE-SEC-03, F-039 CORE-SEC-04, F-040 CORE-SEC-05, F-061 AIS-EVAL-05, all major. Rests on connectors.if-07, scenarios.s2, data.ds-02.lineage, evidence. Hand-over: cybersecurity. -->

---

# 8. Risk: value and cost are asserted, not shown

- A 600 US dollar monthly cap, but no cost model
- No comparison with putting portal search into Teams
- No decision on the platform's limits on model calls
- Monitoring not shown to record cost per call

<!-- RT-04. F-045 CORE-CST-01, F-052 AIS-FIT-01, F-073 AIS-OPS-01 major; F-074 AIS-OPS-02 minor. Rests on operations.cost, decisions, elements.knowledge-agent.ai. -->

---

# 9. Risk: change and failure are not fully designed

- The flow copying articles into the index serves no named use case
- Only one failure is described; platform, model and search outages are not
- No cost or ease-of-change scenario
- Permission changes can take a day to apply, with no decision on it
- Three open questions are not listed, including whether sign-in returns the results at all

<!-- RT-05. F-007 CORE-TRC-04, F-021 CORE-QA-02, F-023 CORE-QA-04, F-024 CORE-QA-05, F-026 CORE-DEC-02, all major. Rests on scenarios.s2, scenarios.f1, elements.knowledge-agent.ai.grounding.freshness, decisions.dec-03.rationale. -->

---

# 10. What must happen, by whom, by when

| What | Who |
|---|---|
| Ground the agent on the enterprise knowledge store | Digital workplace team, with the responsible architect |
| List the three missing open questions | Digital workplace team |
| Close the important gaps | Digital workplace team |
| Catalogue entries for Teams, Entra ID, the index and the store | Not yet named |
| Confirm the specification | The design's author |

Dates are the owner's to set; the review proposes the next design review.

<!-- verdict.conditions 1 to 7. Next assessment: design review of the redesigned version, re-triaged first; AT3 while any not-target block remains, AT2 once grounded on a catalogued target store and every sbb and technology has a ref. -->

---

# 11. What a person must decide

- Confirm or change the proposed outcome: not endorsed
- Redesign onto the knowledge store, or escalate an exception to the exception authority
- Reconcile the design calling the connection existing with its position outside the target state
- An independent lead assessor and a security architect review the findings

<!-- The responsible architect is not inclined to seek an exception and cannot approve one alone (CORE-TGT-05). provenance.review_state ai-raw. -->

---

# 12. What the review did not do

- Judge whether controls are built or work: the security assessment's job
- Assess the enterprise knowledge store, which is not in the design
- Work from a specification its author has confirmed
- Score conformance to the target state: no catalogue
- Use a real catalogue: links use a placeholder address

<!-- Limits from the report, section 8. Placeholder prefix https://catalogue.example.com/items/. Compared with AS-004 (counts only): blockers 1 and 1, majors 19 and 22, minors 5 and 6; passed 50 and 46. Report section 9 says which differences come from the template (TRC-04, SEC-05) and which from assessor judgement (EVAL-06, EVO-02). -->
