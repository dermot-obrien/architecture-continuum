# Architecture and cybersecurity assessment

Guidance on where an architecture assessment ends and a cybersecurity assessment begins, written for architects and security colleagues who work on the same designs. It sets out one principle, a test for placing any criterion or control, examples, the points where the two assessments meet, and the questions to agree between the two teams. It reads alongside section 9 of the [Architecture Assessment Standard](../standards/assessment/standard-architecture-assessment.md#9-the-line-with-cybersecurity-assessment), which is the rule; this page is the practical reading of it.

## The principle

Architecture decides where a control must exist and what it must achieve. Cybersecurity verifies that the control exists and works. The risk owner accepts what remains.

Put another way, the architecture assessment judges the design, and the cybersecurity assessment judges the system that was built from it. Neither can do the other's job: an architecture review that reads a design cannot say whether a control is configured and effective, and a control test that reads a running system cannot say whether the design was the right one.

## The delineation

| | Architecture criteria and controls | Cybersecurity criteria and controls |
|---|---|---|
| Question | Is the design built to be secure? Where must controls sit, and what must they achieve? | Are the controls implemented, configured and effective, and is the residual risk acceptable? |
| Reads | The design specification: trust zones, connectors, identities, data flows, decisions, the threat model | The running system: configuration, control tests, scans, logs, penetration and red-team results |
| When | Design review, before build, and at the definition-ladder gates | Before go-live, then continuously, on its own cadence |
| Method | The assessment standard and its lenses | Its own: NIST SP 800-53A, an ISO/IEC 27001 audit, IRAP, internal control testing |
| Who | Architects, with a security architect from triage tier AT3 | Security assessors, often independent or accredited |
| Produces | Findings against the design, dispositions, a design outcome | Control test results, a security assessment outcome, residual risk for acceptance |
| Cannot do | Accept security risk, or say a control works | Change the design, or say the design is fit for purpose |

## A test for any criterion or control

1. If it can be answered by reading the design specification, it is architecture.
2. If it needs the running system, its configuration, tests or logs, it is cybersecurity.
3. If it is a decision about how much risk is acceptable, it belongs to the risk owner, and neither assessment makes it.

A control that sits on both sides is usually two controls in one sentence. "Every trust-boundary crossing is authenticated" is a design requirement the architecture assessment checks in the specification (`CORE-SEC-02`); "authentication on that crossing is enforced, with the configuration and tokens it was designed with" is a test the cybersecurity assessment runs. Split it, and each side owns one half.

## Examples

| Topic | Architecture: designed, read from the specification | Cybersecurity: verified, read from the system |
|---|---|---|
| Identity | Every service and agent has its own identity; every trust-boundary crossing is authenticated and authorised; least privilege is designed | MFA and Conditional Access are enforced; credentials rotate; privileged access is reviewed; tokens carry the scopes designed |
| Data | Every significant data set is classified and owned, with residency and retention; retrieval is trimmed to the caller | Encryption is configured; DLP policies are effective; access reviews happen; backups restore |
| Logging | What the audit trail records, and that it is tamper-evident | Logs are collected, retained and monitored, and alerts reach a person who acts on them |
| Network and zones | Trust zones are declared and every element sits in one; untrusted content is marked where it enters | Segmentation and firewall rules match the zones; ingress and egress controls are in place |
| AI and agents | No single session holds untrusted input, sensitive data and outward action; limits sit outside the agent; model output is validated; permission-leakage and injection evals are planned | Injection and red-team tests run against the built agent; content filters are configured; the kill switch is tested; leakage probes pass in the tenant |
| Suppliers | The design names its dependency on a supplier, and how it would exit | The supplier's security posture and certifications are assessed |
| Vulnerabilities | The design avoids patterns known to be unsafe, and records why where it cannot | Scanning, patching and penetration testing of the built system |

## The one shared activity: threat modelling

Threat modelling is where the two meet in the same artefact. The architecture assessment requires a threat model of the design version it assesses (`CORE-SEC-04`), and it is best written by the architect with a security architect, because it analyses the same representation the architecture assessment reads. The cybersecurity assessment then uses it to scope and plan its testing. It is the one artefact both teams should sign.

## Where the two assessments meet

1. **At design review.** The architecture assessment owns the security architecture and finds what the design is missing. It names the obligations the design is under and hands over to the cybersecurity assessment, with the findings that prompted the hand-over and the threat model. Triage sets the size of what is handed over: a baseline security assessment at AT2, a full one at AT3 and above.
2. **At production entry.** The cybersecurity assessment's outcome comes back to the architecture assessment as evidence for the version being released (`PRD-HND-01`). A failed outcome blocks go-live. The architecture assessment checks that the residual risk the cybersecurity assessment reports has been accepted by the person it names (`PRD-HND-02`); it never accepts that risk itself.
3. **After an incident.** A security finding or incident that traces back to the design becomes a new architecture criterion, through the incident trigger in the [triage standard](../standards/assessment/standard-assessment-triage.md). This is how the architecture side learns from what the security side finds.

## Why cybersecurity is not an architecture lens

An architecture lens is a set of criteria applied by the architecture method, to a design specification, by architecture assessors, with the findings in an architecture record. A cybersecurity assessment differs on all four: it reads the running system and its controls, follows its own method, often needs an accredited or legally accountable assessor, and ends in an acceptance only its owner can give. Written as a lens, it would let an architecture review look like assurance of controls nobody tested. The same holds for privacy impact, AI impact and regulatory conformity assessments. What is lens-shaped is the design-facing part of each: the security architecture is in the core lens (`CORE-SEC-*`) and the agent lens, and a privacy-by-design lens is a candidate.

## Who does what

| Activity | Architect | Security architect | Security assessor | Risk owner |
|---|---|---|---|---|
| Design the security architecture | Responsible | Consulted | | |
| Threat model of the design | Responsible | Co-author | Informed | |
| Architecture assessment of the design | Responsible (lead assessor) | Assessor from AT3 | | |
| Cybersecurity assessment of the system | Informed | Consulted | Responsible | |
| Accept residual security risk | | Consulted | Consulted | Accountable |
| Approve the design | Per the triage tier | Consulted from AT3 | | |

## A worked example

Take an AI assistant that answers staff questions from knowledge articles copied into a search index by a connector, with no tools. On the architecture side, an assessment finds that the design has no threat model, does not mark every path that carries untrusted content, does not state the identity the connector runs as or the breadth of the assistant's delegated scope, and plans no injection or red-team evaluation. Those are design findings, closed by changing the design. Whether the connector really carries the source system's permissions into the index, whether the delegated scope is configured as designed, and whether the deployed assistant resists injection are questions about the running system: they are handed over to the cybersecurity assessment, and its results return as evidence at production entry.

## Questions to agree between the teams

- Who writes the security reference patterns that architecture assessments apply. The suggestion is the security architects.
- Who co-signs a threat model, and at which tier it must be co-signed.
- How severities are calibrated across the two, for example whether an unauthenticated trust-boundary crossing is always a blocker.
- From which tier a security architect joins the architecture review. The current proposal is AT3.
- Who the risk owner is at each tier.
- Which control framework the cybersecurity assessment maps to, so the architecture record can cite its outcome by control.
