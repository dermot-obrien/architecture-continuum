# Design review of the ServiceNow knowledge agent in Teams

Assessment [AS-003](https://catalogue.example.com/items/AS-003), made on 28 October 2026. Record: [AS-003-servicenow-knowledge-agent.assessment.yaml](AS-003-servicenow-knowledge-agent.assessment.yaml). Triage: [TR-002-servicenow-knowledge-agent.triage.yaml](TR-002-servicenow-knowledge-agent.triage.yaml), updated by [TR-003-servicenow-knowledge-agent.triage.yaml](TR-003-servicenow-knowledge-agent.triage.yaml). Slides: [AS-003-servicenow-knowledge-agent.readout.md](AS-003-servicenow-knowledge-agent.readout.md). An AI agent made this review alone. Its outcome is a proposal, and people must check it before anyone relies on it.

## 1. Summary

This is a review of the design, [SD-002](https://catalogue.example.com/items/SD-002) version 0.1.0, for a ServiceNow knowledge agent in Microsoft Teams. Staff ask a question in Teams. The agent, built in Microsoft Copilot Studio, answers from published ServiceNow knowledge articles that the person asking is allowed to read, and links to the article it used. It cannot raise or change tickets, and it answers from nothing but those articles. The articles reach it through a connection that copies them from ServiceNow into a search index in Microsoft 365.

The proposed outcome is that the design can go ahead, provided conditions are met (in the method's words, "endorsed with conditions").

The design received an enhanced review, the third of four levels of scrutiny. Nothing found stops the design. There are 22 important gaps and 13 minor ones. Of the 77 checks, 39 passed.

The design gets the hardest thing right. The search index decides who may read which article, using the person's own sign-in, so the agent never relies on its instructions to keep content private. It also has release tests for declining when no article answers and for leaking restricted content, with clear limits on each kind of error.

Three things decide the outcome:

1. The agent finds its answers through two parts that the responsible architect says are not part of the target state, and nobody has yet named what replaces them. The design does not record this as a departure from the target state.
2. Work this level of review expects is missing: a threat model, a cost model, a plan to attack-test the agent, and a check that the AI model marking the correctness test agrees with people.
3. Two judgements could turn the outcome into "not endorsed", and a person must confirm both. The review proposed every due date; the design's owner must set them. And one check that every reference in the design points to something real fails as its rule is written, and the review downgraded it from one that stops a design to a minor gap, with a reason. Restoring it would stop the design.

## 2. How much scrutiny, and why

Before the review, a triage set how closely to look. The triage, [TR-002](https://catalogue.example.com/items/TR-002), replaced the design author's own first triage. It worked out each factor again from the design, and where its answer was higher than the author's, its answer won.

| Factor | What the design shows | Level it gives |
|---|---|---|
| What the agent can reach and do | It reads indexed articles as the user and has no tools, so it can change nothing | 2 |
| Data | Confidential articles and transcripts; staff questions are personal data | 2 |
| Who uses it | Staff only | 1 |
| Untrusted content | Article text is written by many contributors, but the agent cannot act on it | 2 |
| Effect on people | It makes no decisions about people; the only legal duty is to say it is an AI | 1 |
| How new it is | Four of its parts have no catalogue entry, and no platform is shown as already assessed | 3 |
| How easy to undo | Every decision can be reversed | 1 |

The result is an AI solution at the third level, an enhanced review. The author's triage had said the second level. Only the "how new" factor raises it. Teams, Entra ID, the Microsoft Graph search index and the connection to ServiceNow have no catalogue entry, and the rule reads that as new to the organisation. Yet the architect's statement says all four are already in use. The review applied the rule as written and left this conflict for a person to settle.

The responsible architect, Dermot O'Brien, also stated where each part stands against the target state, the set of technology the organisation means to keep. Teams, Entra ID and Copilot Studio ([SBB-044](https://catalogue.example.com/items/SBB-044)) are target. The connection that copies articles into Microsoft 365 and the Microsoft Graph semantic index that stores and searches them are in use today but not target. In the architect's words, the ingestion into Microsoft 365 and the semantic querying matter more. No successor was named. At the time, the Power Platform production environment ([DN-009](https://catalogue.example.com/items/DN-009)) had no stated position.

Later update. After this review, the architect stated that the Power Platform environment is target, limited to what is needed to run Copilot Studio agents. The later triage, [TR-003](https://catalogue.example.com/items/TR-003), records this, and the condition to obtain that statement is closed. Whether the design's use of the environment, including transcripts and telemetry, stays within that limit is for the next review to judge.

The triage set the plan. It asked for a review rather than a workshop evaluation, because no decision is hard to undo. It asked for independent reviewers including people, approval by the architecture board or its delegate with the service owner, and referrals to cybersecurity and privacy. At this review the design should bring a threat model, a cost model, the results of the checks on the existing connection, catalogue entries for the four parts, and plans for the release tests, an injection test and a load test. Before production it needs the test reports and results, an attack-test report, and the outcomes of the security and privacy work.

Catalogue entries for the four parts would bring the level down to the second; adding any tool would raise it. A change to the connection's scope, the model, the audience or the knowledge bases (HR above all) is triaged again before it is made. The agent is reviewed every six months and on any change.

## 3. How the review was done

1. The triage came first, with the architect's statements recorded as given. Working the level out again gave the same answer, so the review went ahead.
2. The review fixed exactly which version of the design it read, with a fingerprint of the file. The reviewer was one AI agent, independent because it neither wrote nor delivers the design. At this level people must also review: a lead assessor and a security architect.
3. It used two sets of checks: the general set every design gets (version 0.3.0) and the set for AI solutions (version 0.3.0). The set for AI agents that use tools did not apply, because this agent has none. The production set applies only when the agent is about to go live.
4. The design file passed the format check. The review then ran every automatic check exactly as its rule is written.
5. It answered every check that needs judgement by reading the design. Tests and reports that can exist only once the agent is built were judged by their plans.
6. It held no stakeholder workshop, because this is a review.
7. It read the design and the author's first triage. It could not read the design's source document or its one piece of evidence, a research note.
8. It left to a person whether the goals trace to the business outcome they claim ([OC-004](https://catalogue.example.com/items/OC-004)), whether the research note exists and covers what it says, the conflict over how new the parts are, the five severities it changed, the due dates, and the outcome itself.

## 4. How the checks came out

| Set of checks | Passed | Incomplete | Missing | Did not apply | Could not judge | Total |
|---|---|---|---|---|---|---|
| General, 0.3.0 | 26 | 13 | 8 | 1 | 2 | 50 |
| AI solutions, 0.3.0 | 13 | 8 | 6 | 0 | 0 | 27 |
| All | 39 | 21 | 14 | 1 | 2 | 77 |

Open findings: none that stop the design, 22 important, 13 minor. Of the 22 important gaps, 13 are changes to the design and 9 call for a decision or an open question to be recorded. The review changed five severities from the check's default, each with a reason. One moved from "stops the design" to minor. Four moved from important to minor.

## 5. Findings

### What stops the design

Nothing. Every check that can stop a design passed. One such check failed as written but was downgraded to minor, and it is listed with the minor points.

### Important gaps

Unless a line says otherwise, the Digital workplace team, which owns the agent, does the work, and the review proposes 27 November 2026 as the due date.

#### Building on parts that are not target

- The design does not record that it departs from the target state. Two parts carry the whole of how the agent finds answers: the connection that copies the articles and the search index. Both are in use but not target. Two decisions name the connection without recording a departure, and none names the index. Without a recorded departure there is no end date and no plan to move off. Record a decision naming both parts as a departure. (At the time the Power Platform environment also had no position; that is now settled, as section 2 says.)
- That departure needs to be time-limited, with an end date the owner and the architect agree. A way back can only be written once someone names a successor, which is why the next point asks the architect for one.
- The channel, sign-in and agent platform are all target, but every answer depends on the two parts that are not. Reusing the shared connection adds one more user to it, which will make it harder to move off later. The design also labels itself target, which the architect's statement does not support. Nothing is being retired yet, so nothing is blocked today. The architect should say what the target is for copying content into Microsoft 365 and searching it, and whether this design goes ahead under a time-limited departure or waits. The design's label should then be corrected. Owner: Dermot O'Brien, responsible architect.
- The design lists two open questions: which knowledge bases to answer from, and whether HR knowledge bases are in scope. It misses three: what replaces the parts that are not target; whether the chosen sign-in returns the connection's content at all; and how the organisation accepts a model that Microsoft changes without notice. Add all three, each with its options.

#### Who can see which article, and whether article text can steer the agent

- The design covers only one failure, the connection stopping. It does not cover Copilot Studio or its model being down, when the agent cannot even say it is down. It does not cover Microsoft Graph search failing, or the permission path failing. Permission changes reach the index only at the daily full copy, or within 30 minutes if identity sync is on, and people are matched between ServiceNow and Microsoft 365 by email. So someone whose access was removed, or who was matched wrongly, could read an article they should not for up to a day. Add these failures, including how staff reach the portal search, with a limit on how long removed access can still return an article.
- How fresh permissions are, against the cost and load of copying more often, is a trade-off nobody has recorded. It is the one the information security team's concern turns on. Record the copy and identity sync schedule as a decision, with the delay it accepts, why, and the alternatives. Owner: the Microsoft 365 admin.
- Some data is not described. The telemetry sent to Application Insights can hold staff questions and answers. The design also leaves out the audit records kept under Purview and the email matching between ServiceNow and Microsoft 365, on which permissions depend. The test data is missing too, including restricted test articles and test users. Describe each: owner, sensitivity, whether it is personal, where it is held, how long it is kept and where it comes from.
- Three links that start with staff or with ServiceNow do not say whether they carry untrusted content: staff to Teams, staff to the Service Portal, and the connection fetching articles from ServiceNow. Article text is marked untrusted only at the last step, where the agent reads the index. The staff question is untrusted too, and the link from Teams to the agent does not say so, though the rule does not require it there. State it on every link, and say where content is checked.
- There is no threat model. Produce one for this version covering the permission path, instructions hidden in article text, and links shown in Teams. The design is still proposed, so a security assessment is not yet due, and the work has been referred to cybersecurity.
- The agent searches as the person asking, which is what makes permissions work, and the connection uses its own machine account with a custom read role. But the design does not state the agent's own identity. The permission the agent uses covers every connector in the Microsoft 365 tenant, so "ServiceNow articles only" rests on the agent's settings, not on the permission. And the machine account holds a role to read HR content while the HR question is still open. State the agent's identity, record why this permission is the narrowest available and where the limit to ServiceNow is enforced, and grant the HR role only once the HR question is settled.
- The test plan leaves gaps. Nothing tests instructions planted in article text; the safety test uses 100 hostile questions typed by users, which is not the same. Nothing tests removed access or wrong identity matching. Response time has no test or load-test plan, though this level of review requires a load test before production. Nothing says which languages, regions or roles the 400 test questions represent across 9,000 staff. Add a test with instructions planted in test articles, a probe that removes a test user's access and times how long content stays visible, a load-test plan, and a statement of who the questions represent.
- Nobody plans to attack-test the agent. Four of the industry's known AI attack risks apply here: instructions hidden in article text, content leaking between users, unsafe links shown in Teams, and leaking the agent's own instructions. Plan an attack test on those four, to run before production.

#### Whether the tests prove what they claim

- The AI model is not fixed to a version, so Microsoft can change it without a release. Nothing says the release tests rerun when it changes; they rerun weekly and when the connection's scope changes. Record a decision accepting a model the platform manages, on condition that the release tests rerun on any model change, and say how a change is detected.
- The correctness test is marked by another AI model, and nobody has checked that its marks agree with people's. It decides releases. Check it against marks by knowledge base owners on a sample, report how far they agree, and only then treat it as checked.
- The test of answering or declining is well set up: 160 of its 400 questions have no answer or are off-topic. But its "wrong answer" error lumps together answering when no article applies and answering from the wrong article. The second happens on questions that do have answers, so the 2 percent limit mixes two errors counted over different groups. The rate of answering when it should decline cannot be read from it. And 160 such questions can show a rate under 2 percent only if none fails, and by the stricter statistical test not even then. Measure the two errors separately, and use about 190 such questions or more, or report the range.

#### Platform, cost and running it

- Dependencies run the right way, down to platform services. But the design does not say where it sits in the wider landscape, and no link names an agreed interface. Set both.
- The design says how it must behave for reliability, security and speed, but not for cost or ease of change, and does not say the omission is deliberate. Yet cost is capped, and the connection's scope and the model are named as things that change. Add a cost scenario (credit use as volume or the share of unlicensed staff rises, against the 600 US dollar cap) and an ease-of-change scenario (a change to the connection's scope or the model, and what the test rerun does), or say why each is left out.
- The sign-in decision ("Authenticate with Microsoft") is marked accepted, but its own reasoning says it is still to be confirmed that the connection's content comes back under it. If it does not, the agent cannot find any answers. Confirm it in the tenant and record the result, or mark the decision proposed again.
- All six links cross the design's boundary, and none names its interface and version. Each runs over a vendor's published interface: Microsoft Graph search, the Graph interface for external content, ServiceNow's interfaces, and the Teams channel. Name the interface and version on each link.
- There is a price and a cap of 600 US dollars a month, but no cost model, only a sentence on how cost would be forecast. Build one from the expected volume and the share of staff without a Microsoft 365 Copilot licence, show the forecast against the cap, and record it as evidence.
- The goals say why an answer beats a search, but no decision compares using an AI model with a plain search that returns the article. Microsoft Search or the Service Portal search would do, and the portal search is already the design's fallback. Nothing compares what each would cost. Record that decision, comparing cost and how many service desk contacts each saves.
- There is a monthly budget but no time limit on an answer, and no decision accepts the platform's limits on calls. Record a decision naming the platform's token, rate and time limits, and what the agent does when the 600 dollar cap is reached.

### Minor gaps

#### Building on parts that are not target

- The design's own reasons for the connection say it is Microsoft's recommended route, and the alternatives are still in preview or need a ServiceNow connection per user. If that holds, the target state itself may be incomplete, and the design should ask for it to change. Nobody has asked. Put the question to the architect.
- Building on parts that are not target is technical debt taken on knowingly, and it is not recorded. Once the departure is recorded, raise a debt item for moving to the successor and attach it. This is accepted as debt, with no due date.
- The search path is the part most likely to change, and the agent is wired to it with no agreed interface. The model also changes without a release. Say how the search source would be swapped without rebuilding the agent, and which tests prove the swap.

#### Whether the tests prove what they claim

- The citation test sets limits on its two errors (5 and 15 percent) but gives no cost for either, so nobody can check that the limits fit. Downgraded from important: the test that carries the costliest error is weighted correctly. State the cost of each error and set the limits from it.
- The leak test's 300 probes are enough for a zero-leak target. The correctness test counts 240 questions but scores only the ones answered. If the agent declines up to its 20 percent limit, about 192 are answered. A 90 percent score on 192 has a likely range of about 85 to 93 percent, so it does not show 90 percent. Nothing says whether a target is a single score or a floor. Set each target as the bottom of the likely range, or report the range, and size the test on the answered questions.

#### Platform, cost and running it

- Telemetry is the platform's own, not the industry's convention for AI telemetry. No decision says what it records for each answer, such as the question, the answer and the cost. Record what it records and the gap.
- There is a response time target (95 percent within 10 seconds) and a fallback, but nothing says what happens when an answer is late, and there is no time limit. State the behaviour, such as a holding message and a portal link after a set time.

#### Other points

- The volume estimate, about 2,000 questions a working day across 9,000 staff, has no source, yet it drives the cost forecast and the peak load. Give it one, such as service desk contact figures or a pilot.
- The design treats Copilot Studio as one of its own building blocks, but it is a product many solutions share; this design's block is the agent built on it. Downgraded from important, because how the catalogue entry is drawn is the catalogue's choice. Ask the catalogue owner whether the entry describes one deployable part or a shared platform, and model it to match. Owner: the Power Platform team, with no due date.
- The research note lists the three decisions it covers. The check that every reference points to something real does not count decisions, so by its rule these three fail. Downgraded from "stops the design" to minor, because the references plainly point to decisions in the same file and nothing is left dangling. The rule itself looks wrong. If a person restores the default, the outcome becomes "not endorsed". Point the note at the parts of the design it covers, or change the check.
- There is no model card. Cite Microsoft's published transparency note for the Copilot Studio model.
- Nothing is trained on company data. But the test data is not described, so nobody can tell whether test questions come from real staff questions and may be used that way. Downgraded from important, because the privacy referral covers it. Describe the test data, its source and its permitted use.
- The design names the EU AI Act's transparency duty for limited-risk systems, but has no AI impact assessment and no sentence saying why none is needed. Downgraded from important: the fix is one sentence. Add it.

### What worked

Who may read which article is enforced by the index through the person's own sign-in, not by the agent's instructions, so nothing depends on keeping those instructions secret. The agent's tie to the shared connection is deliberate, and the tests rerun when the connection changes. But what the agent can answer depends on a setting another team owns for other users, so the open question on which knowledge bases to use, and the reuse decision, need settling before acceptance. The Microsoft 365 admin should tell the agent's owner of any change to the connection.

## 6. What it puts at risk, and what goes to other teams

| Risk | What it threatens |
|---|---|
| The agent finds answers through two parts that are not target, with no successor, no recorded departure and no way to swap them cleanly | The capability the design delivers, [CAP-033](https://catalogue.example.com/items/CAP-033), and the goal that staff get a correct, cited answer in Teams |
| Whether articles reach only the people ServiceNow would show them to, and whether article text can steer the agent, rests on paths with no threat model, no failure scenario and no injection or attack test | The promise that no article is shown to someone ServiceNow would not show it to, HR content above all, and the goal of a correct, cited answer |
| The tests are well framed, but the correctness marker is unchecked, one error mixes two, some samples are too small to tell a pass from chance, and the model can change without the tests rerunning | The business outcome, [OC-004](https://catalogue.example.com/items/OC-004), and the goal of a correct, cited answer |
| The design rests on vendor interfaces with no named versions, an unconfirmed sign-in choice, platform limits nobody has accepted, and a cost cap with no cost model | The business outcome, OC-004, and the goal of fewer service desk contacts |

Two pieces of work go to other teams:

- Cybersecurity: a full security assessment of the permission path and of untrusted article text. That covers how the connection builds access lists from ServiceNow's rules, the email matching, the daily permission delay, the machine account's roles, the agent's tenant-wide permission, hidden instructions in articles, and links shown in Teams. Whether these controls work is their question, not this review's.
- Privacy: a privacy impact assessment of staff personal data in transcripts (kept 30 days, with audit records under Purview), in telemetry, and in any test data drawn from staff questions. It also needs to set out the lawful basis for processing it as employer.

## 7. What must happen next

The review proposed these due dates. The owner must set them, or the outcome becomes "not endorsed".

| What must happen | Who | By |
|---|---|---|
| Record the departure for the connection and the search index as a time-limited decision, and ask the architect to name a successor | Digital workplace team, with Dermot O'Brien as responsible architect | 27 November 2026 |
| Get the architect's position on the Power Platform environment | Responsible architect | Done after the review: target, limited to running Copilot Studio agents ([TR-003](https://catalogue.example.com/items/TR-003)) |
| Add catalogue entries for Teams, Entra ID, the search index and the connection, or show they exist | Digital workplace team | Before the next review |
| Produce a threat model and a cost model | Digital workplace team | 27 November 2026 |
| Plan the attack test, the injection test, the removed-access probe and the load test; check the correctness marker; separate the two answering errors | Digital workplace team | 27 November 2026 |
| Name interfaces on every link and the design's place in the landscape; mark untrusted content on every link; describe the missing data and failures | Digital workplace team | 27 November 2026 |
| Record decisions on the managed model, the platform limits, the copy schedule, the agent's identity and permission, and AI over search; confirm the sign-in choice; add the three missing open questions | Digital workplace team; the Microsoft 365 admin for the copy schedule | 27 November 2026 |
| Settle which knowledge bases are in scope, and whether HR ones are, as accepted decisions | Digital workplace team | Before the design is accepted |
| Get the cybersecurity and privacy work back | Digital workplace team | Before production |

Next, once these are done, version 0.2.0 of the design, [SD-002](https://catalogue.example.com/items/SD-002), is triaged again and reviewed at the third level against the same two sets of checks. Catalogue entries for the four parts would bring it down to the second level. Before the agent goes live, a production review follows, at the level then in force. It adds the production checks, test reports, injection and load test results, an attack-test report and the security and privacy outcomes. After that, the agent is reviewed every six months and on any change.

## 8. What this review did not do

- An AI agent made it alone, and no person has yet checked it. A lead assessor and a security architect, both people, must review these findings before anyone relies on them. The architecture board or its delegate, with the service owner, confirms the outcome.
- It did not read the design's source document or its research note, which it could not access. It did not read an earlier assessment of this design, by instruction, so that this one stands alone. It looked at nothing in the live tenant, ServiceNow or the connection's settings. Whether the controls work is for cybersecurity.
- It could not judge two checks: whether the goals trace to the business outcome, [OC-004](https://catalogue.example.com/items/OC-004), because the catalogue was not available, and whether the research note exists and covers what it claims.
- It assumed the architect's words map to the parts as the requester mapped them: "the ServiceNow connector" and "M365 ingestion" to the connection, and "semantic querying" to the search index. It did not guess the Power Platform environment's position, which the architect has since given.
- It did not measure how far the design matches the target state overall. The catalogue was not available, the catalogue numbers in the design are illustrative, and the link address used in this report is a placeholder.
- Only a person can confirm the five changed severities, the due dates, the conflict over how new the parts are, and the outcome. Restoring the default severity of the reference check makes the outcome "not endorsed".
- Its judgements on test sizes use two standard statistical rules at 95 percent confidence, the rule of three and the Wilson interval.

## 9. Reference

For people who check this report against the record. Results: met, partly-met (incomplete), not-met (missing), not-applicable, not-assessed. Severity is shown only for open findings; "from" gives the check's default where the review changed it. Paths are in the design, [SD-002](https://catalogue.example.com/items/SD-002), unless they start `triage.`, which is the triage record [TR-002](https://catalogue.example.com/items/TR-002). The levels of scrutiny 1 to 4 in sections 1 to 3 are tiers AT1 to AT4; this review is at AT3, the author's triage (TR-001) declared AT2. The two sets of checks are the lenses `core` 0.3.0 and `ai-solution` 0.3.0. The outcome is `endorsed-with-conditions`, with `provenance.review_state` `ai-raw`.

| Finding | Criterion | Result | Severity | Subject | Rests on |
|---|---|---|---|---|---|
| F-002 | CORE-DEM-02 | not-assessed | | Goals traced to the business outcome | `context.outcomes`, `context.serves`, `context.realises`, `drivers.goals` |
| F-003 | CORE-DEM-03 | partly-met | minor | Volume estimate has no source | `drivers.constraints`, `drivers.assumptions.asm-volume`, `operations.cost.model`, `scenarios.sc-latency` |
| F-008 | CORE-TGT-01 | not-met | major | No departure recorded for parts not target | `triage.target_state`, `decisions.d-copilot-connector`, `decisions.d-reuse-kb3`, `elements.node-pp-prod` |
| F-009 | CORE-TGT-02 | not-met | major | Departure must be time-limited | `decisions`, `triage.target_state` |
| F-010 | CORE-TGT-03 | partly-met | major | Answers depend on parts not target | `triage.target_state`, `design.lifecycle_state`, `elements.svc-kb-agent.ai.grounding.sources`, `decisions.d-reuse-kb3`, `connectors.c-agent-index`, `connectors.c-connection-index` |
| F-011 | CORE-TGT-04 | partly-met | minor | Ask whether the target should change | `decisions.d-copilot-connector.rationale`, `decisions.d-copilot-connector.alternatives`, `considerations`, `triage.target_state` |
| F-012 | CORE-STR-01 | partly-met | minor (from major) | Copilot Studio drawn as this design's block | `elements.sbb-copilot-studio`, `elements.svc-kb-agent.realises` |
| F-016 | CORE-STR-05 | not-met | minor (from blocker) | Research note points at decisions | `evidence.ev-design-research.covers`, `decisions` |
| F-018 | CORE-STR-07 | partly-met | major | Place in landscape and interfaces unstated | `context`, `connectors` |
| F-020 | CORE-QA-02 | partly-met | major | No cost or ease-of-change scenario | `scenarios.quality_attribute`, `operations.cost`, `elements.svc-kb-agent.ai.drift_monitoring` |
| F-022 | CORE-QA-04 | partly-met | major | Missing failure scenarios, permission delay | `scenarios`, `elements.svc-kb-agent.ai.grounding.freshness`, `elements.svc-kb-agent.ai.fallback`, `data.data-kb-index.lineage`, `operations.recovery.degraded_mode` |
| F-023 | CORE-QA-05 | partly-met | major | Permission freshness trade-off not recorded | `elements.svc-kb-agent.ai.evals.eval-answer-or-abstain`, `elements.svc-kb-agent.ai.grounding.freshness`, `decisions`, `drivers.stakeholders` |
| F-024 | CORE-DEC-01 | partly-met | major | Sign-in decision rests on an unconfirmed premise | `decisions.d-auth-microsoft.status`, `decisions.d-auth-microsoft.rationale`, `decisions.d-copilot-connector` |
| F-025 | CORE-DEC-02 | partly-met | major | Three open questions missing | `considerations`, `triage.target_state`, `decisions.d-auth-microsoft.rationale`, `elements.svc-kb-agent.ai.model` |
| F-028 | CORE-DEC-05 | not-met | minor | Technical debt not recorded | `decisions.technical_debt`, `triage.target_state` |
| F-029 | CORE-INT-01 | not-met | major | No interface contract on any link | `connectors.contract`, `connectors.protocol` |
| F-032 | CORE-DAT-01 | partly-met | major | Telemetry, audit, identity mapping and test data not described | `data`, `operations.observability.conventions`, `data.data-transcripts.retention`, `data.data-kb-index.lineage`, `elements.svc-kb-agent.ai.evals` |
| F-037 | CORE-SEC-03 | not-met | major | Untrusted content not marked on three links | `connectors.c-staff-teams`, `connectors.c-staff-portal`, `connectors.c-connection-servicenow`, `connectors.c-agent-index.carries_untrusted_content`, `connectors.c-teams-agent` |
| F-038 | CORE-SEC-04 | not-met | major | No threat model | `evidence` |
| F-039 | CORE-SEC-05 | partly-met | major | Agent identity, tenant-wide permission, HR role | `connectors.c-agent-index.authentication`, `connectors.c-connection-servicenow.authorisation`, `considerations.cn-hr-bases`, `drivers.non_goals` |
| F-043 | CORE-OPS-04 | not-applicable | | Applies only once the design is active | `design.status` |
| F-044 | CORE-CST-01 | not-met | major | No cost model | `operations.cost`, `evidence` |
| F-047 | CORE-EVO-02 | partly-met | minor | Search path cannot be swapped cleanly | `triage.target_state`, `connectors.c-agent-index`, `elements.svc-kb-agent.ai.model` |
| F-050 | CORE-RSK-03 | not-assessed | | Research note not available | `evidence.ev-design-research` |
| F-051 | AIS-FIT-01 | partly-met | major | AI not compared with plain search | `drivers.goals`, `decisions`, `operations.recovery.degraded_mode` |
| F-053 | AIS-MOD-01 | not-met | major | Model not pinned, no rerun on change | `elements.svc-kb-agent.ai.model`, `elements.svc-kb-agent.ai.drift_monitoring`, `decisions` |
| F-054 | AIS-MOD-02 | not-met | minor | No model card | `elements.svc-kb-agent.ai.model` |
| F-058 | AIS-EVAL-03 | partly-met | major | Test plan gaps: injection, removed access, load, populations | `elements.svc-kb-agent.ai.evals`, `scenarios`, `connectors.c-agent-index`, `risks` |
| F-059 | AIS-EVAL-04 | not-met | major | Correctness marker unchecked | `elements.svc-kb-agent.ai.evals.eval-correctness` |
| F-060 | AIS-EVAL-05 | not-met | major | No attack test planned | `elements.svc-kb-agent.ai.input_trust`, `elements.svc-kb-agent.ai.evals`, `elements.svc-kb-agent.ai.output_handling.rendered_as`, `evidence` |
| F-061 | AIS-EVAL-06 | partly-met | minor (from major) | Citation errors have no cost | `elements.svc-kb-agent.ai.evals.eval-answer-or-abstain`, `elements.svc-kb-agent.ai.evals.eval-citation` |
| F-062 | AIS-EVAL-07 | partly-met | major | Answering error mixes two errors; too few negatives | `elements.svc-kb-agent.ai.evals.eval-answer-or-abstain`, `scenarios.sc-abstain` |
| F-064 | AIS-EVAL-09 | partly-met | minor | Correctness sample and ranges | `elements.svc-kb-agent.ai.evals.eval-correctness.sample_size`, `elements.svc-kb-agent.ai.evals.eval-correctness.metric`, `elements.svc-kb-agent.ai.evals.eval-permission-leakage.sample_size` |
| F-068 | AIS-DATA-04 | partly-met | minor (from major) | Test data source and permitted use | `data.used_for_ai`, `elements.svc-kb-agent.ai.evals`, `drivers.obligations.obl-privacy` |
| F-072 | AIS-OPS-01 | not-met | major | No time limit, platform limits not accepted | `elements.svc-kb-agent.ai.limits`, `elements.svc-kb-agent.ai.model.hosting`, `decisions` |
| F-073 | AIS-OPS-02 | not-met | minor | Telemetry not to AI conventions | `operations.observability.conventions`, `operations.observability.traces`, `decisions` |
| F-074 | AIS-OPS-03 | partly-met | minor | No behaviour for a late answer | `scenarios.sc-latency`, `operations.recovery.degraded_mode`, `elements.svc-kb-agent.ai.limits` |
| F-077 | AIS-HUM-03 | partly-met | minor (from major) | No reason given for no AI impact assessment | `drivers.obligations.obl-ai-transparency`, `evidence` |

What each finding leads to, from the record: design fixes for F-003, F-016, F-018, F-020, F-022, F-024, F-029, F-032, F-037, F-038, F-044, F-047, F-054, F-058, F-059, F-060, F-061, F-062, F-064, F-074 and F-077; decisions to record for F-008, F-009, F-023, F-039, F-051, F-053, F-072 and F-073; open questions to raise for F-010, F-011, F-012 and F-025; debt accepted for F-028; a referral for F-068. Risk themes: `rt-grounding-not-target` (F-008, F-009, F-010, F-011, F-025, F-028, F-047), `rt-permission-and-untrusted-content` (F-022, F-023, F-032, F-037, F-038, F-039, F-058, F-060), `rt-eval-evidence` (F-053, F-059, F-061, F-062, F-064), `rt-platform-cost-operability` (F-018, F-020, F-024, F-029, F-044, F-051, F-072, F-073, F-074). Referrals: cybersecurity (F-022, F-037, F-038, F-039, F-060), privacy (F-032, F-068). Notable among the met: F-066 (AIS-DATA-02) and F-071 (AIS-IO-03) are non-risks, F-031 (CORE-INT-03) is a sensitivity point, and F-026 (CORE-DEC-03) notes that `considerations.cn-kb-scope` and `cn-hr-bases` must close before acceptance. The condition on `node-pp-prod` from F-008 is closed by [TR-003](https://catalogue.example.com/items/TR-003).
