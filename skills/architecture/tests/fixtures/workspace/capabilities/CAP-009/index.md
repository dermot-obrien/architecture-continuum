---
id: CAP-009
kind: capability
title: "CAP-009 Invoicing"
version: 0.1.0
created: 2026-09-01
last_modified: 2026-09-01
owner: Order Team
status: draft
level: L2
components:
  organisation: "Order operations"
  people: ["Order analysts"]
  processes: ["Order handling"]
  technology: "Order records and messaging"
maturity: { current: 0, target: 3 }
parent: CAP-001
required_by_outcomes: [OC-001]
realised_by_abbs: [ABB-008]
open_questions: none
flows:
  - id: issue-invoice
    name: Issue an invoice
    stage: R4
  - id: credit-note
    name: Raise a credit note
    description: From a disputed line to a credit
    rung: R4  # the former key, still read
---

# CAP-009 Invoicing

## 1  Purpose

Why the organisation needs this.
