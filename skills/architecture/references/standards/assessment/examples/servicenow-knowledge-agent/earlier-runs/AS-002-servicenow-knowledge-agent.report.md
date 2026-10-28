# AS-002: design review of the ServiceNow knowledge agent in Teams

The report of assessment [AS-002](AS-002-servicenow-knowledge-agent.assessment.yaml) of design specification [SD-002](SD-002-servicenow-knowledge-agent.design.yaml), version 0.1.0, for the people who decide. It was made by an agent with the `architecture` skill's assess flow. The outcome below is a proposal; a person confirms it.

## 1. Summary

SD-002 is a Copilot Studio agent in Microsoft Teams that answers staff questions from ServiceNow knowledge articles, retrieved as the asking user from the Microsoft Graph index that the existing Copilot connector connection `servicenowkb3` fills. It was assessed at review depth, at triage tier AT2 Standard, against the core lens 0.2.0 and the AI solution lens 0.2.0.

The proposed outcome is endorsed-with-conditions. No blocker criterion is open. Twelve findings are major: four go to decisions or considerations, and eight are design fixes, each given a proposed due date so that the outcome rule can be applied.

Three things decide the outcome:

1. Who may see which article depends on a shared connection that another team owns. Nobody has checked how faithfully it carries ServiceNow's permissions, and no scenario covers its failures, which happen without any error.
2. The decision to sign users in with Authenticate with Microsoft (d-auth-microsoft) is accepted, but it rests on a premise nobody has confirmed. If the premise fails, the fallback also removes the Copilot Studio evaluation tooling that every release gate depends on.
3. The evals are designed with unusual care, but as specified they cannot yet show that the answers are right:
   - the judge model is uncalibrated;
   - the gating false-positive ceiling has an ambiguous denominator, and is too tight for its sample;
   - indirect injection through article text is untested;
   - the model can change between releases.

## 2. Triage, declared versus derived

The declared triage is [TR-001](TR-001-servicenow-knowledge-agent.triage.yaml). Each driver that can be derived was derived again from the specification, as the triage flow requires.

| Driver | Declared in TR-001 | Derived from SD-002 | Tier | Read from |
|---|---|---|---|---|
| Reach and agency | `read`, `none` | `read`, `none` | AT2 | No agent facet and no tools; grounding from `data-kb-index`, a live index trimmed to the caller (`elements.svc-kb-agent.ai.grounding.access_control: caller-permission-trimmed`) |
| Data | `confidential`, staff personal data | `confidential`, staff personal data | AT2 | `data[].classification` all confidential; `data.data-transcripts.personal: true`, staff not customers |
| Exposure | `staff` | `staff` | AT1 | `design.exposure` |
| Untrusted content | `read-only` | `read-only` | AT2 | `connectors.c-agent-index.carries_untrusted_content: true`, `input_trust: mixed`, and no tool that writes or reaches outside |
| Effect on people | `none-or-transparency` | Not derivable; declared answer agrees with `drivers.obligations.obl-ai-transparency` | AT1 | Requester |
| Novelty | `catalogued-target` | Not derivable from the specification | AT1 as declared | Requester, with an assumption |
| Reversibility | `two-way-door` | Agrees with `decisions[].reversibility` | AT1 | Decisions |

All five derivable drivers come out the same as declared, so the derived tier is AT2, the same as the declared tier. No new triage record was written, and the assessment uses TR-001.

Three things in TR-001 are worth recording, although none changes the derived tier:

- The novelty answer has no source. TR-001's own note says it assumes Copilot Studio has been onboarded as a platform. Its `platform` answer says `within_envelope: true` but cites no platform assessment. The source document says the tier is AT3 until Copilot Studio is onboarded. Under step 6 of the triage flow, a subject inherits nothing from a platform that has not been assessed, and the novelty driver then applies. The answer is a question for the requester, not something to guess. If Copilot Studio turns out not to be an onboarded and assessed platform, the tier is AT3, and this assessment restarts at AT3 with a security architect, injection tests, a load test, a full security assessment and approval by the board.
- TR-001's plan lists the `production` lens. That lens applies only when the trigger is production entry, so it was not applied to this new-design review. It belongs to the production entry assessment that follows.
- TR-001's plan asks for eval reports and for the results of the checks on servicenowkb3. Neither exists yet: the source document says the configuration has not been built or tested.

The result is type `ai-solution`, tier AT2. The plan:

- review depth, with one independent assessor;
- the core and AI solution lenses;
- approval by the architecture lead;
- a threat model as evidence;
- hand-overs to cybersecurity and privacy;
- reassessment yearly, and on any change to the connection's scope, the model or the audience.

Four things would move the tier:

| Change | New tier |
|---|---|
| Finding that Copilot Studio is not an assessed platform | AT3 |
| Switching on web search or general knowledge, which brings untrusted external content into the model's context (reach `external`) | AT3 |
| Adding any tool, such as raising incidents, which the non-goals defer to a later phase | Re-triage |
| Bringing restricted or customer data into scope | AT3 |

## 3. Assessment path

The steps of the assess flow, in order:

1. **Triage.** TR-001 was read, and its drivers were derived again from the specification, as section 2 sets out. The derived tier equals the declared one, so the assessment proceeded at AT2.
2. **Preparation.** The subject was fixed:
   - design SD-002, version 0.1.0, at `standards/assessment/examples/SD-002-servicenow-knowledge-agent.design.yaml`, digest `sha256:b6ac13d464b9a6a083466ad0acda63cb0e7dad1bf0c6440c40686ca91b88767c` (identical to the skill's copy);
   - trigger `new-design`, with no stage gate;
   - depth `review`, which AT2 sets;
   - one assessor: an agent with role `agent`, independent because it neither wrote the design nor is accountable for delivering it.
3. **Lens selection.** `core` 0.2.0 always applies. The only element with an `ai` facet is `svc-kb-agent`, which brings in `ai-solution` 0.2.0, and that matches the declared `profiles: [ai-solution]`. No element has an `agent` facet, so `ai-agent` does not apply. `production` does not apply at this trigger.
4. **Check.** The specification validates against `design.schema.json`. Every `tool` criterion, and the presence half of every `both` criterion, was applied by its rule as written. Reference resolution and id uniqueness (CORE-STR-05) were checked by script. Where a rule seemed wrong for this case, the finding's statement says so and the result was not bent.
5. **Review.** Every reviewer criterion, and the judgement half of every `both` criterion, was answered from the specification and its source document. The source document is the page `design.source` names, which could be read. It is also the only evidence item, `ev-design-research`. Every criterion of both lenses has a result: 77 in all.
6. **Evaluation.** None was held: the depth is review, and an agent cannot hold the stakeholder workshop.
7. **Outcome.** The outcome was reached by applying section 7 of the standard mechanically.

Three things were left to a person:

- confirmation of the outcome;
- the due dates the assessor proposed for each condition;
- the novelty question in section 2.

## 4. Results by lens

| Lens | Version | met | partly-met | not-met | not-applicable | not-assessed | Total |
|---|---|---|---|---|---|---|---|
| core | 0.2.0 | 35 | 7 | 3 | 1 | 4 | 50 |
| ai-solution | 0.2.0 | 16 | 4 | 7 | 0 | 0 | 27 |
| Both lenses | | 51 | 11 | 10 | 1 | 4 | 77 |

By severity, the 21 findings that are partly met or not met break down as follows:

- 0 blockers;
- 12 majors;
- 9 minors, four of them moved down from major with a reason stated in the finding.

The four results recorded as not assessed are the target-state criteria CORE-TGT-01 to CORE-TGT-04. Each needs the catalogue, and there was none to read. The one not-applicable result is CORE-OPS-04, which applies only to an active design.

## 5. Findings

### Blockers

None. Every blocker criterion is met:

| Criterion | What it checks |
|---|---|
| CORE-DEM-01 | Goals, non-goals and stakeholders |
| CORE-STR-05 | Every reference resolves |
| CORE-QA-01 | Measurable quality scenarios |
| CORE-SEC-02 | Every connector crossing a zone is authenticated and authorised |
| AIS-EVAL-01 | Evals exist |
| AIS-DATA-02 | Confidential grounding is permission-trimmed |
| AIS-IO-02 | Output handling |

### Majors

**F-022, CORE-QA-04, partly met: no failure scenario for a wrong or stale access list.** Disposition: fix-design. Owner: Workplace architect.

- What the specification says: identities are mapped by email (`data.data-kb-index.lineage`). Permission changes reach the index only at the daily full crawl, unless identity sync runs (`elements.svc-kb-agent.ai.grounding.freshness`). The source document lists several silent failures, for example an HR knowledge base indexed as open to all when the integration user lacks the HR role.
- Why it matters: this is the path to `risks.rsk-overshare`, and the leakage eval runs only weekly and on change (`fitness_functions.ff-leakage`).
- Recommendation: add a failure scenario with a measure, such as the longest time a revoked user can still be answered, and say whether identity sync is part of the design.

**F-024, CORE-DEC-01, partly met: an accepted sign-in decision rests on an unconfirmed premise.** Disposition: fix-design. Owner: Workplace architect.

- What the specification says: `decisions.d-auth-microsoft` is accepted, but its rationale says it is still to be confirmed that Graph connector knowledge is returned under Authenticate with Microsoft. The source document notes that Microsoft's knowledge page asks for the `ExternalItem.Read.All` scope in the manual authentication setting.
- Why it matters: if the premise fails, the alternative, manual authentication, conflicts with `drivers.constraints.con-auth-eval`, and `fitness_functions.ff-gating-evals` loses its tooling.
- Recommendation: confirm the premise in a test tenant and record the result as evidence. Until then, set the decision to proposed and name a replacement eval harness.

**F-018, CORE-STR-07, partly met: the agent's scope and permissions depend on another team's connection, with no agreement.** Disposition: record-decision on `d-reuse-kb3`. Owner: Workplace architect.

- What the specification says: `elements.sbb-kb-connection.owner` is the Microsoft 365 admin. The connection also feeds Search and Microsoft 365 Copilot (`decisions.d-reuse-kb3.rationale`). `decisions.d-reuse-kb3` is still proposed, and is conditional on checks the specification does not list. `elements.svc-kb-agent.ai.drift_monitoring` admits that a change to the query string changes the agent's answers.
- Recommendation: accept d-reuse-kb3 only with its conditions written in, including a change-notice agreement with the connection's owner.

**F-025, CORE-DEC-02, partly met: open questions in the source document are not carried as considerations.** Disposition: raise-consideration. Owner: Workplace architect.

- What the specification says: the source document's list of checks to make in the tenant holds four open questions: whether user criteria use scripts (and so need the Advanced flow), who holds a licence and what cap follows, whether Agent 365 is onboarded, and the sign-in premise. `considerations` names only `cn-kb-scope` and `cn-hr-bases`.
- Recommendation: raise them as considerations, and carry the checks on servicenowkb3 into the specification as the conditions of d-reuse-kb3.

**F-038, CORE-SEC-04, not met: no threat model.** Disposition: fix-design, with the cybersecurity hand-over. Owner: Workplace architect.

- What the specification says: `evidence` holds only `ev-design-research`, of type `other`. TR-001's AT2 plan requires a threat model.
- Recommendation: produce one for version 0.1.0, covering the ingestion and query paths.

**F-020, CORE-QA-02, partly met: cost and maintainability have no scenario, and the cost cap has no stated behaviour.** Disposition: fix-design. Owner: Digital workplace team.

- What the specification says: the budget is a hard cap of 600 USD a month (`operations.cost.budget`, `elements.svc-kb-agent.ai.limits.budget`). Nothing says what unlicensed staff get when the cap is reached. `operations.cost.model` has no figures, so the cap cannot be checked against `drivers.assumptions.asm-volume`.
- An illustration only, at a price this assessment did not verify: at about 12 Copilot Credits a grounded answer, the cap buys about 5,000 answers a month, against a stated volume of about 42,000.
- Recommendation: add a cost scenario for the cap being reached, and put credits per answer and the licensed share into the cost model.

**F-032, CORE-DAT-01, partly met: telemetry is not a named data set.** Disposition: fix-design. Owner: Digital workplace team.

- What the specification says: telemetry goes to Application Insights (`operations.observability.conventions`). It can hold the questions staff ask, but it has no classification, residency or retention. Dataverse and Application Insights are not elements.
- Recommendation: add the telemetry data set and its stores.

**F-051, AIS-FIT-01, partly met: no case is made for a generative agent over what staff already have.** Disposition: record-decision. Owner: Digital workplace team.

- What the specification says: `decisions.d-reuse-kb3.rationale` says the same index already serves Microsoft Search and Microsoft 365 Copilot. No decision says what the agent adds for licensed and unlicensed staff.
- Recommendation: record that decision, with Search and Microsoft 365 Copilot as the alternatives.

**F-053, AIS-MOD-01, not met: the model is not pinned.** Disposition: record-decision. Owner: Digital workplace team.

- What the specification says: `elements.svc-kb-agent.ai.model.version_pinned` is false, and no version is set. On a managed platform, pinning may not be offered. The rule is applied as written, and the statement says so.
- Recommendation: record a decision to accept a platform-managed model, with the weekly gating rerun and a rerun on any model change as its conditions.

**F-059, AIS-EVAL-04, not met: the judge model is uncalibrated.** Disposition: fix-design. Owner: Digital workplace team.

- What the specification says: `elements.svc-kb-agent.ai.evals.eval-correctness` gates release with `judge_calibrated: false`, although the source document plans calibration.
- Recommendation: calibrate the judge against the knowledge base owners' labels, and report the agreement.

**F-060, AIS-EVAL-05, not met: there is no red-team eval, although input is mixed-trust.** Disposition: fix-design. Owner: Digital workplace team.

- What the specification says: `eval-content-safety` tests what a user types. Nothing tests injection through article text, the path that `connectors.c-agent-index.carries_untrusted_content` flags.
- Recommendation: add a gating red-team eval with injected instructions and crafted links planted in test articles.

**F-061, AIS-EVAL-06, partly met: the gating ceiling on false answers has an ambiguous denominator.** Disposition: fix-design. Owner: Digital workplace team.

- What the specification says: `scenarios.sc-correct.response_measure` reads the 2 percent ceiling as a share of all questions. `scenarios.sc-abstain.response_measure` reads it as a share of unanswerable questions. On the stated test set, that means either 8 wrong answers or about 3. `eval-citation` gives no cost for either of its errors.
- Recommendation: give each `max_rate` a named denominator, make the two scenarios agree with it, and cost the citation errors.

### Minors

| Finding | Criterion | Result | What is missing, and where | Disposition |
|---|---|---|---|---|
| F-003 | CORE-DEM-03 | Partly met | `asm-volume` has no source; the licensed share and the sign-in premise are not stated as assumptions | Fix-design |
| F-029 | CORE-INT-01 | Not met | No connector has a `contract`; vendor interfaces should be cited. Moved to minor because the team cannot version a vendor's interface | Fix-design |
| F-037 | CORE-SEC-03 | Not met | `c-staff-teams` and `c-staff-portal` omit `carries_untrusted_content`. Moved to minor because article text is already flagged at `c-agent-index` | Fix-design |
| F-052 | AIS-FIT-02 | Partly met | Web search, general knowledge and ungrounded responses being off, and the data policy, appear only in the source document; with web search on, the tier would be AT3 | Fix-design |
| F-054 | AIS-MOD-02 | Not met | No `model.card` | Fix-design |
| F-063 | AIS-EVAL-09 | Partly met | No intervals. Zero false answers in 160 negatives still gives a Wilson 95 percent upper bound of 2.3 percent, above the 2 percent ceiling | Fix-design |
| F-072 | AIS-OPS-01 | Not met | No `limits.timeout`. Moved to minor because the platform sets call limits and cost is capped | Fix-design |
| F-073 | AIS-OPS-02 | Not met | `conventions` names Copilot Studio telemetry, not the GenAI conventions | Fix-design |
| F-077 | AIS-HUM-03 | Not met | No reason recorded why limited risk needs no AI impact assessment. Moved to minor because only that sentence is missing | Fix-design |

### Recorded points among the met results

These criteria are met, but the result is worth keeping:

- Sensitivity points:
  - F-039, CORE-SEC-05: the integration user's HR role means HR protection rests entirely on the ACLs the connection builds.
  - F-046, CORE-EVO-01: correctness between releases rests on the weekly rerun.
  - F-066, AIS-DATA-02: permission trimming is only as good as the connection.
  - F-067, AIS-DATA-03: a revoked user may still get answers for up to a day.
- Trade-off point: F-023, CORE-QA-05, the reuse of servicenowkb3.
- Non-risks:
  - F-064, AIS-EVAL-08: the zero-tolerance leakage eval.
  - F-071, AIS-IO-03: no reliance on the system prompt for security.
- Observation: F-075, AIS-HUM-01. Oversight is described as in-the-loop, but it is better described as on-the-loop.

## 6. Risk themes and hand-overs

There are three risk themes.

| Theme | Findings | What it threatens |
|---|---|---|
| RT-1. What each member of staff may see rests on a shared connection the team does not own. Its permission fidelity is unchecked, and its silent failures have no scenario | F-018, F-022, F-024, F-025, F-038 | OC-004, and the security and privacy stakeholders' concern that no article is shown to someone ServiceNow would not show it to, HR content above all |
| RT-2. The evals are well designed but cannot yet show that answers are right | F-053, F-059, F-060, F-061, F-063 | OC-004, and the goal of a correct, cited answer |
| RT-3. The case for the agent and its running cost are not reconciled with demand | F-003, F-020, F-051 | The goal of fewer service desk contacts |

There are two hand-overs.

**Cybersecurity** (`handover-cyber`), findings F-022, F-038, F-060 and F-066. This is the baseline security assessment that AT2 requires. It covers:

- servicenowkb3's configuration, checked against the source document's list: access permissions, Federated Auth, the user criteria flow, the HR content reader role, table access and identity mapping;
- the integration user's roles;
- the delegated `ExternalItem.Read.All` scope;
- the data policy that keeps the agent to Copilot connector knowledge;
- the indirect injection path through article text.

**Privacy**, finding F-032. A privacy impact assessment for staff questions, transcripts, telemetry and audit records, processed as employer under the GDPR.

No AI impact or conformity assessment is required at limited risk (F-077).

## 7. Conditions and next steps

The due dates are the assessor's proposals, so that the rule for an endorsement with conditions can be applied. The architecture lead should confirm or change them.

| Condition | Owner | Proposed due |
|---|---|---|
| Confirm the sign-in premise in a test tenant and record the result as evidence, or set d-auth-microsoft to proposed and name the replacement eval harness (F-024) | Workplace architect | 2026-11-27 |
| Run the checks on servicenowkb3, record the results as evidence, and write the change-notice agreement into d-reuse-kb3 (F-018, F-025) | Workplace architect, with the Microsoft 365 admin | 2026-11-27, and before reuse |
| Produce the threat model for version 0.1.0, and open the cybersecurity and privacy hand-overs (F-038, F-032) | Workplace architect | 2026-11-27 |
| Close F-020, F-022, F-032, F-059, F-060 and F-061 in version 0.2.0 of the specification; record the decisions for F-051 and F-053 | Digital workplace team | 2026-11-27 |
| Confirm that Copilot Studio is an onboarded and assessed platform; if it is not, re-triage at AT3 | Digital workplace team | Before the next assessment |
| Resolve `cn-kb-scope` and `cn-hr-bases` with accepted decisions before the design's status moves to accepted. Keep HR bases out until the leakage eval passes on HR test articles | Workplace architect | Before acceptance |

The minor findings should be fixed in the same new version, but they do not hold acceptance.

The next assessment, in order:

1. A check-depth run on version 0.2.0 of the specification.
2. A review of the changed elements at AT2 by an independent assessor, which must include a person.
3. Before go-live, a production entry assessment at AT2 with the `production` lens. It reads the eval reports, the results of the servicenowkb3 checks, and the returned outcomes of the cybersecurity and privacy assessments, all against the version being released.

## 8. Limits of this assessment

- **What could not be read.**
  - No catalogue was available. The four target-state criteria are not assessed, no conformance level is recorded, and the existence of PL-005, BC-012, OC-004, CAP-033, UC-031, RA-007, SBB-044 and DN-009 was not checked.
  - The source document (`design.source`, also `ev-design-research`) could be read, but it is research, not a test: it says the configuration has not been built or tested in a tenant. No eval report, threat model or check result exists.
- **What was assumed.**
  - That article contributors are internal, so that article text counts as internal untrusted content rather than external content. If ServiceNow knowledge includes content from suppliers or customers, reach would be `external` and the tier AT3.
  - The Copilot Credit price in F-020 comes from general knowledge, not from Microsoft's current price list. It is an illustration of scale only.
- **Two rules that were read one way when they allow another.**
  - CORE-QA-02 was read to count scenarios of every type that have a `quality_attribute`.
  - CORE-INT-02 was read to apply only where both ends of a connector have a `part_of`.
- **What only a person can confirm.**
  - The outcome itself. An agent assessed this design and does not approve it: the AT2 approver is the architecture lead.
  - The novelty answer in TR-001.
  - The due dates.
  - Whether the four severities moved to minor (F-029, F-037, F-072, F-077) should stand.
  - Whether the controls are implemented and effective. That was not judged here; it belongs to the cybersecurity assessment.
- **Independence.** AT2 asks for one independent assessor. The only assessor here was an agent, so a person should review this record before it is relied on.
