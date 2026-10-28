# Assessment visuals

Pictures of the [Architecture Assessment Standard](../../standards/assessment/standard-architecture-assessment.md) for the people who use it. Each is a single HTML file that opens in a browser.

| File | What it shows |
|---|---|
| [viewpoints.html](viewpoints.html) | The method read from six seats: architecture leadership, the design author, the assessor, the service owner, the specialist assessors (security, privacy, compliance), and AI and agent teams |
| [viewpoints-deck.html](viewpoints-deck.html) | The same six viewpoints as seven slides, for presenting |
| [lens-atlas.html](lens-atlas.html) | Every lens, area and criterion, with who decides each (tool, tool and reviewer, or reviewer) and its default severity, generated from `standards/assessment/lenses/` |

They show standard 0.7.0 with core lens 0.6.0, AI solution 0.4.0, AI agent 0.1.0 and production 0.1.1: 121 criteria, 26 of them blockers. The privacy lens (0.1.0, 8 criteria) came later and is not drawn in them. When a lens changes, regenerate the atlas's data from the lens files and check the counts on the viewpoints.
