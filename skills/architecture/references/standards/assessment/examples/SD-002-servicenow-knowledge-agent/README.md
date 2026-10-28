# SD-002 end to end: from a solution design document to a report

This folder holds the ServiceNow knowledge agent test case run the way the method intends, starting from a design document rather than from a specification written by hand. Each file is the input to the next.

| Step | File | Made by |
|---|---|---|
| 1. Design | [index.md](index.md), with [components.drawio](components.drawio), [components.svg](components.svg) and [scenarios.html](scenarios.html) | The design author, from the pattern skill's solution design template. The diagram and the walkthrough are generated from the document's tables by the pattern skill's model tools, using [model.toml](model.toml) |
| 2. Specification | [SD-002-servicenow-knowledge-agent.design.yaml](SD-002-servicenow-knowledge-agent.design.yaml) and [the gaps list](SD-002-servicenow-knowledge-agent.gaps.md) | The `specify` flow, by an agent that read only the document |
| 3. Triage | [TR-005-servicenow-knowledge-agent.triage.yaml](TR-005-servicenow-knowledge-agent.triage.yaml) | The `triage` flow, with the responsible architect's target-state positions as a manual input |
| 4. Assessment | [AS-005-servicenow-knowledge-agent.assessment.yaml](AS-005-servicenow-knowledge-agent.assessment.yaml) | The `assess` flow, by an independent agent |
| 5. Report | [The report](AS-005-servicenow-knowledge-agent.report.md) and its [slide readout](AS-005-servicenow-knowledge-agent.readout.md) | The `report` flow |

The earlier runs of the same test case (TR-001 to TR-004 and AS-002 to AS-004, one folder up) started from a specification written straight from a research page. They are kept as the record of how the method was developed. Catalogue identifiers in this example are illustrative.

[TR-006](TR-006-servicenow-knowledge-agent.triage.yaml) re-triages the same specification after two method changes: servicenowkb3 is re-attested at the new position `contained` (in use, not to be extended), and attested building blocks with no catalogue entry no longer count as new. The tier falls from AT3 to AT2. AS-005 was made under TR-005, at the same depth and lenses, so its review covers the lower tier, and its blocker stands: a new use of a contained block needs the same escalated exception.

The outcome proposed is not endorsed: the connection that copies ServiceNow articles into Microsoft 365 is not part of the target state, and no exception has been escalated. A person confirms the outcome.
