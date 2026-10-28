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
- 19 important gaps are open

<!-- Record AS-004, triage TR-004 (supersedes TR-003). Outcome not-endorsed by rule 2 of section 7: open blocker CORE-TGT-05 (F-012), and open majors disposed fix-design with no due date. Digest sha256:b6ac13d4...88767c. -->

---

# 2. How much scrutiny, and why

An enhanced review, the third of four levels, set by how new the parts are.

| Part | Where it stands |
|---|---|
| The agent, Teams, Entra ID sign-in | Where we are heading |
| Copilot Studio and its environment | Where we are heading, for running agents |
| Microsoft 365 search index | Where we are heading, but only for Microsoft 365 content |
| Copying ServiceNow articles into it | Not part of the target state |

The target state has a separate enterprise knowledge store for this.

<!-- TR-004: tier AT3, type ai-solution. Drivers: reach-and-agency AT2 (read, none), data AT2, exposure AT1, untrusted-content AT2, effect-on-people AT1, novelty AT3, reversibility AT1. target_state: sbb-kb-connection not-target, graph-index target with permitted_use (Microsoft 365 content only), sbb-copilot-studio SBB-044 target, teams and entra target (no ref), node-pp-prod DN-009 target limited to running Copilot Studio agents. Successor for both: the enterprise knowledge store (vector and graph retrieval). AT2 if redesigned onto a catalogued target store and refs added. -->

---

# 3. How the review was done

1. Fixed the version reviewed, with a fingerprint of the file
2. Chose two sets of checks: core architecture and AI solution
3. Ran every automatic check exactly as written
4. Answered the checks that need judgement
5. Proposed what happens next and the outcome

Where each part stands is the responsible architect's call, used as given. An agent did the review alone; a person must review it.

<!-- Lenses core 0.4.0 and ai-solution 0.3.0; ai-agent not applicable (no agent facet). Depth review. Assessor: agent, independent; AT3 needs an independent lead assessor and a security architect. Escalation rule for CORE-TGT-05 applied per the requester's method update. AS-002 and AS-003 not read. -->

---

# 4. How the checks came out

| | Passed | Incomplete | Missing | Other | Total |
|---|---|---|---|---|---|
| Core architecture | 33 | 7 | 8 | 3 | 51 |
| AI solution | 17 | 5 | 5 | 0 | 27 |
| All | 50 | 12 | 13 | 3 | 78 |

25 shortfalls: 1 blocks, 19 important, 5 minor

<!-- Other: 1 not-applicable (CORE-OPS-04), 2 not-assessed (CORE-STR-07, CORE-CST-02). Incomplete = partly-met, missing = not-met. -->

---

# 5. Risk: the agent is fed off the target state

- ServiceNow articles are copied into Microsoft 365's search index, which the target state excludes
- That uses the index beyond what it is approved for
- Neither departure is recorded, and no exception has been sought
- The design never considers the enterprise knowledge store

The fix: ground the agent on the enterprise knowledge store

<!-- RT-01. F-012 CORE-TGT-05 blocker; F-008 CORE-TGT-01, F-009 CORE-TGT-02, F-010 CORE-TGT-03 major; F-011 CORE-TGT-04 minor. Rests on triage.target_state, decisions.d-copilot-connector, decisions.d-reuse-kb3. -->

---

# 6. Risk: wrong answers are not yet shown to be rare

A wrong answer with a convincing citation is the costliest error.

- The model can change without a release, with no decision on that
- The AI judge of correctness is not checked against people
- No test plants instructions in article text
- The test of declining may be too small to prove its ceiling

<!-- RT-02. F-054 AIS-MOD-01, F-059 AIS-EVAL-03, F-060 AIS-EVAL-04 major; F-065 AIS-EVAL-09 minor. -->

---

# 7. Risk: the security design is not yet shown

- No threat model for this version
- No connection names its interface and version
- Untrusted content is unstated on three connections
- No red-team exercise planned
- Monitoring data holding staff questions is not named

What works: answers are retrieved as the asking user, and a zero-leak test gates release

<!-- RT-03. F-039 CORE-SEC-04, F-030 CORE-INT-01, F-038 CORE-SEC-03, F-061 AIS-EVAL-05, F-033 CORE-DAT-01. Sensitivity point F-040 CORE-SEC-05; observation F-067 AIS-DATA-02. Hand-overs: cybersecurity, privacy. -->

---

# 8. Risk: value and cost are asserted, not shown

- A 600 US dollar monthly cap, but no cost model
- No comparison with simply improving portal search
- No decision on the platform's limits on model calls
- Monitoring not shown to capture cost per call

<!-- RT-04. F-045 CORE-CST-01, F-052 AIS-FIT-01, F-073 AIS-OPS-01 major; F-074 AIS-OPS-02 minor. -->

---

# 9. What must happen, by whom

| What | Who |
|---|---|
| Ground the agent on the enterprise knowledge store | Digital workplace team, with the responsible architect |
| Close the 19 important gaps | Digital workplace team |
| Catalogue entries for Teams, Entra ID, the index, the store | Digital workplace team |
| Review these findings | Independent lead assessor and security architect |

When: the owner sets the dates; this review proposes the next design review.

<!-- Verdict conditions in AS-004. Next assessment: design review of the changed version, re-triaged; AT3 while any not-target block remains, AT2 once grounded on a catalogued target store. -->

---

# 10. What a person must decide

- Confirm the outcome: not endorsed
- The design cannot be endorsed while it relies on copying ServiceNow content into Microsoft 365
- Two routes only:
  - Redesign onto the enterprise knowledge store (recommended)
  - An exception, escalated to and approved by the exception authority
- The responsible architect is not inclined to seek an exception

<!-- CORE-TGT-05 met only by an accepted decision with departure.approved_by naming the exception authority after escalation, per the requester's method update; core 0.4.0 text still names the responsible architect. Nothing escalated or approved. Also to reconcile: design.source calls servicenowkb3 existing. -->

---

# 11. What this review did not do

- Did not check whether controls are built or work
- Did not assess the enterprise knowledge store, which is not yet in the design
- Did not rate alignment to the target state on the standard's scale; the catalogue was not available
- Did not read the earlier assessments
- Cannot confirm the outcome, accept a risk or approve an exception

<!-- Conformance not recorded (assess flow: only when the catalogue is available). Catalogue links use a placeholder prefix. provenance.review_state ai-raw. -->
