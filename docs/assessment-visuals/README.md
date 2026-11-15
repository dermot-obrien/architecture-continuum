# Assessment visuals

Pictures of the [Architecture Assessment Standard](../../standards/assessment/standard-architecture-assessment.md) for the people who use it. Each is a single HTML file that opens in a browser.

| File | What it shows |
|---|---|
| [viewpoints.html](viewpoints.html) | The method read from six seats: architecture leadership, the design author, the assessor, the service owner, the specialist assessors (security, privacy, compliance), and AI and agent teams |
| [viewpoints-deck.html](viewpoints-deck.html) | The same six viewpoints as seven slides, for presenting |
| [lens-atlas.html](lens-atlas.html) | Every lens, area and criterion, with who decides each (tool, tool and reviewer, or reviewer) and its default severity, generated from `standards/assessment/lenses/` |
| [assessment-model-map.html](assessment-model-map.html) | The three schemas of draft 0.1.0 as concepts and relationships: the design specification, the lens and the assessment record, and the catalogue artefacts findings become |
| [assessment-core-model.html](assessment-core-model.html) | A proposal: one assessment core shared by architecture and cybersecurity assessment, the assurance depth (specified, designed, implemented, operating effectively) that separates them, and each concept's name in both practices and in OSCAL |
| [oscal-model-map.html](oscal-model-map.html) | NIST OSCAL 1.2.3 in its own names: the control, implementation and assessment layers, the assemblies an assessment touches, the fields that link them, and where OSCAL has no link from a control to a risk or threat |

They show standard 0.7.0 with core lens 0.6.0, AI solution 0.4.0, AI agent 0.1.0 and production 0.1.1: 121 criteria, 26 of them blockers. The privacy lens (0.1.0, 8 criteria) came later and is not drawn in them. When a lens changes, regenerate the atlas's data from the lens files and check the counts on the viewpoints.

The last three came from the research behind the standard and are not kept in step with it. The model map shows draft 0.1.0, before the method grew triage, the production lens and organisation criteria. The core model and the OSCAL map are proposals not yet adopted in the schemas; their OSCAL names were checked against the OSCAL 1.2.3 Metaschema sources and generated JSON Schema. The core model's assurance depth is a property of a criterion, not the standard's assessment depth (check, review, evaluation).
