# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
"""The built-in front matter parser, which runs wherever PyYAML is not installed.

    python -m unittest discover -s skills/architecture/tests
"""
from __future__ import annotations

import glob
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "src"))

from ladder import docs, yamlish  # noqa: E402

SAMPLE = """\
id: CAP-009            # a comment
title: "CAP-009 Invoicing: issue and credit"
level: L2
parent: CAP-001
required_by_outcomes: [OC-001, OC-002]
open_questions: none
maturity: { current: 0, target: 3 }
flows:
  - id: issue-invoice
    name: Issue an invoice
    stage: R4
  - { id: credit-note, name: "Raise a credit note, fast", stage: R2 }
references:
  - { type: cost-model, path: "cost/model.csv" }
  - type: doc
    url: https://example.com/a#b
description: >
  Folded
  text.
notes: |
  Line one
  Line two
empty:
quoted: 'it''s'
nested:
  deeper:
    - a
    - - b
      - c
"""

EXPECTED = {
    "id": "CAP-009",
    "title": "CAP-009 Invoicing: issue and credit",
    "level": "L2",
    "parent": "CAP-001",
    "required_by_outcomes": ["OC-001", "OC-002"],
    "open_questions": "none",
    "maturity": {"current": "0", "target": "3"},
    "flows": [
        {"id": "issue-invoice", "name": "Issue an invoice", "stage": "R4"},
        {"id": "credit-note", "name": "Raise a credit note, fast", "stage": "R2"},
    ],
    "references": [
        {"type": "cost-model", "path": "cost/model.csv"},
        {"type": "doc", "url": "https://example.com/a#b"},
    ],
    "description": "Folded text.\n",
    "notes": "Line one\nLine two\n",
    "empty": "",
    "quoted": "it's",
    "nested": {"deeper": ["a", ["b", "c"]]},
}


class BuiltIn(unittest.TestCase):
    def test_sample(self):
        self.assertEqual(yamlish.parse(SAMPLE), EXPECTED)

    def test_empty(self):
        self.assertEqual(yamlish.parse(""), {})
        self.assertEqual(yamlish.parse("# only a comment\n"), {})

    def test_tabs_rejected(self):
        with self.assertRaises(yamlish.YamlError):
            yamlish.parse("a:\n\t- b\n")

    def test_front_matter_after_a_licence_comment(self):
        # The tag is split so REUSE does not read this test string as the file's licence.
        meta, body = docs.split("<!-- SPDX-" "License-Identifier: CC-BY-4.0 -->\n---\nid: CAP-001\n---\n# Body\n")
        self.assertEqual(yamlish.parse(meta), {"id": "CAP-001"})
        self.assertEqual(body.strip(), "# Body")


@unittest.skipIf(yamlish._pyyaml is None, "PyYAML is not installed; nothing to compare against")
class AgreesWithPyYaml(unittest.TestCase):
    """Where PyYAML is present, both parsers must read every fixture identically."""

    def test_sample(self):
        self.assertEqual(yamlish.parse(SAMPLE), yamlish._pyyaml.load(SAMPLE, Loader=yamlish._pyyaml.BaseLoader))

    def test_fixture_front_matter(self):
        files = glob.glob(os.path.join(HERE, "fixtures", "**", "*.md"), recursive=True)
        self.assertTrue(files)
        for p in files:
            with open(p, encoding="utf-8") as fh:
                fm, _ = docs.split(fh.read())
            if fm is None:
                continue
            with self.subTest(path=os.path.relpath(p, HERE)):
                self.assertEqual(yamlish.parse(fm),
                                 yamlish._pyyaml.load(fm, Loader=yamlish._pyyaml.BaseLoader) or {})


if __name__ == "__main__":
    unittest.main()
