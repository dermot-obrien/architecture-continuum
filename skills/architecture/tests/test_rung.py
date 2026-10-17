# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
"""Rung derivation over a small fixture workspace: one capability per rung, plus the cases
the rules exist for (blocked, lost, per flow, named only by a pattern).

    python -m unittest discover -s skills/architecture/tests
"""
from __future__ import annotations

import io
import json
import os
import shutil
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "src"))

from ladder import bindings, cli, derive  # noqa: E402

FIXTURE = os.path.join(HERE, "fixtures", "workspace")
BINDINGS = os.path.join(FIXTURE, "skill-bindings.toml")


def derived(bindings_path=BINDINGS):
    b = bindings.load(bindings_path)
    ws = derive.Workspace(b.paths, b.local_pattern, b.capability_id_pattern)
    report = derive.derive_all(ws)
    return {c["id"]: c for c in report["capabilities"]}, ws, report


class EachRung(unittest.TestCase):
    """One capability in the fixture sits on each rung, blocked by one specific artefact."""

    @classmethod
    def setUpClass(cls):
        cls.caps, cls.ws, cls.report = derived()

    def assertRung(self, cid, rung, blocker_fragment):
        c = self.caps[cid]
        self.assertEqual(c["rung"], rung, f"{cid}: {c['blockers']}")
        if blocker_fragment is None:
            self.assertEqual(c["blockers"], [])
            self.assertIsNone(c["next"])
        else:
            self.assertTrue(any(blocker_fragment in b for b in c["blockers"]),
                            f"{cid}: expected a blocker containing {blocker_fragment!r}, got {c['blockers']}")

    def test_r0_unrecognised(self):
        self.assertRung("CAP-010", "R0", "no capability document for CAP-010")
        self.assertIn("pattern PAT-010", self.caps["CAP-010"]["evidence_elsewhere"])

    def test_r1_named(self):
        self.assertRung("CAP-001", "R1", "CAP-001 names no ABB in realised_by_abbs")
        # Purpose from description, demand from demand_assumption: both satisfy R1.
        self.assertEqual(self.caps["CAP-001"]["checks"]["R1"], [])

    def test_r2_bounded(self):
        self.assertRung("CAP-002", "R2", "no pattern realises CAP-002")

    def test_r3_decided(self):
        self.assertRung("CAP-003", "R3", "no SBB realises ABB-002")
        self.assertTrue(any("no physical pattern realises CAP-003" in b
                            for b in self.caps["CAP-003"]["blockers"]))

    def test_r4_buildable(self):
        self.assertRung("CAP-004", "R4", "pattern PAT-002 links no evidence")

    def test_r5_proven(self):
        self.assertRung("CAP-005", "R5", "CAP-005 status is draft, not active")
        self.assertTrue(any("no runbook reference" in b for b in self.caps["CAP-005"]["blockers"]))

    def test_r6_in_service(self):
        self.assertRung("CAP-006", "R6", None)


class Rules(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.caps, cls.ws, cls.report = derived()

    def test_blocked_by_an_open_consideration(self):
        c = self.caps["CAP-007"]
        self.assertEqual(c["rung"], "R2")
        self.assertEqual(c["next"], "R3")
        self.assertEqual(c["blockers"], ["CN-002 is open: it needs an accepted decision record in resolved_by"])
        self.assertEqual(c["considerations"], ["CN-002"])

    def test_building_ahead_does_not_skip_rungs(self):
        # A physical pattern, a cost model and an accepted SBB exist, so R4's own check
        # passes, but the open question below it holds the capability at R2.
        c = self.caps["CAP-007"]
        self.assertEqual(c["checks"]["R4"], [])
        self.assertEqual(c["latent"], ["R4"])

    def test_superseded_decision_loses_the_rung(self):
        c = self.caps["CAP-008"]
        self.assertEqual(c["rung"], "R2")
        self.assertIn("CN-003 is resolved by DR-002, whose status is superseded", c["blockers"][0])

    def test_rung_is_lost_when_evidence_stops_being_true(self):
        with tempfile.TemporaryDirectory() as tmp:
            ws = os.path.join(tmp, "ws")
            shutil.copytree(FIXTURE, ws)
            p = os.path.join(ws, "decisions", "DR-001", "index.md")
            with open(p, encoding="utf-8") as fh:
                s = fh.read()
            with open(p, "w", encoding="utf-8") as fh:
                fh.write(s.replace("status: accepted", "status: deprecated"))
            caps, _, _ = derived(os.path.join(ws, "skill-bindings.toml"))
            self.assertEqual(caps["CAP-003"]["rung"], "R2")
            self.assertIn("DR-001, whose status is deprecated", caps["CAP-003"]["blockers"][0])

    def test_open_questions_none_stands_in_for_considerations(self):
        self.assertEqual(self.caps["CAP-002"]["checks"]["R2"], [])
        self.assertEqual(self.caps["CAP-002"]["considerations"], [])

    def test_without_considerations_or_marker_r2_is_blocked(self):
        self.assertTrue(any("does not declare open_questions: none" in b
                            for b in self.caps["CAP-001"]["checks"]["R2"]))


class Flows(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.caps, _, _ = derived()
        cls.cap = cls.caps["CAP-009"]
        cls.flows = {f["id"]: f for f in cls.cap["flows"]}

    def test_each_flow_has_its_own_rung(self):
        self.assertEqual(self.flows["issue-invoice"]["rung"], "R4")
        self.assertEqual(self.flows["credit-note"]["rung"], "R2")

    def test_capability_sits_at_its_lowest_flow(self):
        self.assertEqual(self.cap["rung"], "R2")
        self.assertEqual(self.cap["limited_by_flow"], "credit-note")

    def test_local_role_blocks_r3(self):
        self.assertIn("pattern PAT-008 is logical: 07 (local role) not an ABB",
                      self.flows["credit-note"]["blockers"])

    def test_recorded_rung_is_compared(self):
        self.assertEqual(self.flows["issue-invoice"]["claim"], "matches")
        self.assertEqual(self.flows["credit-note"]["claim"], "above")
        self.assertEqual(self.flows["credit-note"]["recorded"], "R4")

    def test_patterns_are_scoped_by_flow(self):
        self.assertEqual(self.flows["issue-invoice"]["patterns"], ["PAT-007"])
        self.assertEqual(self.flows["credit-note"]["patterns"], ["PAT-008"])


class Abstraction(unittest.TestCase):
    def test_rule_matches_the_model_skill(self):
        a = derive.abstraction
        self.assertEqual(a(["conceptual", "conceptual"]), "conceptual")
        self.assertEqual(a(["logical", "logical"]), "logical")
        self.assertEqual(a(["logical", "conceptual"]), "logical")
        self.assertEqual(a(["physical", "physical"]), "physical")
        self.assertEqual(a(["physical", "logical"]), "mixed")
        self.assertEqual(a(["physical", ""]), "mixed")
        self.assertEqual(a(["physical", None]), "physical")
        self.assertEqual(a([None]), "")
        self.assertEqual(a([]), "")

    def test_fixture_patterns(self):
        _, ws, _ = derived()
        by_id = {p.id: p for p in ws.patterns}
        self.assertEqual(by_id["PAT-001"].abstraction, "logical")
        self.assertTrue(by_id["PAT-001"].all_abb)
        self.assertEqual(by_id["PAT-002"].abstraction, "physical")  # external row ignored
        self.assertEqual(by_id["PAT-008"].abstraction, "logical")
        self.assertFalse(by_id["PAT-008"].all_abb)                    # a local role remains
        self.assertEqual(by_id["PAT-010"].abstraction, "mixed")       # SBB-009 has no document
        self.assertNotIn("patterns/README.md", [p.path for p in ws.patterns])

    def test_table_rows_inside_comments_are_ignored(self):
        _, ws, _ = derived()
        pat = next(p for p in ws.patterns if p.id == "PAT-001")
        self.assertEqual([b.ident for b in pat.boxes], ["ABB-002"])


class Bindings(unittest.TestCase):
    def write(self, tmp, body):
        p = os.path.join(tmp, ".agents", "skill-bindings.toml")
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(body)
        return p

    def test_missing_section_binds_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = self.write(tmp, 'bindingsVersion = "1.0"\n')
            b = bindings.load(p)
            self.assertEqual(b.paths, {})
            self.assertEqual(set(b.unbound), set(derive.DIR_KEYS))

    def test_every_directory_is_optional(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = self.write(tmp, '[suite.architecture]\ncapabilityDir = "."\n')
            b = bindings.load(p)
            self.assertEqual(set(b.paths), {"capabilityDir"})
            self.assertEqual(set(b.unbound),
                             {"abbDir", "sbbDir", "decisionDir", "considerationDir", "patternDir"})

    def test_paths_resolve_against_the_bindings_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            for d in ("c", "a", "s", "d", "n", "p"):
                os.makedirs(os.path.join(tmp, d))
            p = self.write(tmp, "[suite.architecture]\n" + "\n".join(
                f'{k} = "../{v}"' for k, v in (("capabilityDir", "c"), ("abbDir", "a"), ("sbbDir", "s"),
                                                ("decisionDir", "d"), ("considerationDir", "n"),
                                                ("patternDir", "p"))) + "\n")
            here = os.getcwd()
            try:
                os.chdir(HERE)          # somewhere else entirely
                b = bindings.load(p)
            finally:
                os.chdir(here)
            self.assertEqual(b["capabilityDir"], os.path.normpath(os.path.join(tmp, "c")))

    def test_keys_for_other_flows_are_left_to_them(self):
        with tempfile.TemporaryDirectory() as tmp:
            os.makedirs(os.path.join(tmp, "c"))
            p = self.write(tmp, '[suite.architecture]\ncapabilityDir = "../c"\nroot = "../nowhere"\noutcomeDir = "x"\n')
            b = bindings.load(p)
            self.assertEqual(set(b.paths), {"capabilityDir"})
            self.assertNotIn("outcomeDir", b.unbound)

    def test_old_table_is_read_with_a_warning(self):
        with tempfile.TemporaryDirectory() as tmp:
            for d in ("c", "a"):
                os.makedirs(os.path.join(tmp, d))
            p = self.write(tmp, '[suite.architecture]\ncapabilityDir = "../c"\n[suite.aaa-rung]\ncapabilityDir = "../a"\nabbDir = "../a"\n')
            b = bindings.load(p)
            self.assertEqual(b["capabilityDir"], os.path.normpath(os.path.join(tmp, "c")))
            self.assertEqual(b["abbDir"], os.path.normpath(os.path.join(tmp, "a")))
            self.assertEqual(len(b.warnings), 1)
            self.assertIn("abbDir read from the old table [suite.aaa-rung]", b.warnings[0])

    def test_found_by_searching_upward(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = self.write(tmp, "[suite.architecture]\n")
            deep = os.path.join(tmp, "x", "y")
            os.makedirs(deep)
            self.assertEqual(os.path.normcase(bindings.find(deep)), os.path.normcase(p))

    def test_nonexistent_directory_and_unknown_key(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = self.write(tmp, "[suite.architecture]\n" + "\n".join(
                f'{k} = "../missing"' for k in ("capabilityDir", "abbDir", "sbbDir", "decisionDir",
                                                 "considerationDir", "patternDir")) + '\nextra = "x"\n')
            with self.assertRaises(bindings.BindingError) as cm:
                bindings.load(p)
            self.assertIn("which is not a directory", str(cm.exception))
            self.assertIn("extra is not a key", str(cm.exception))


class Cli(unittest.TestCase):
    def run_cli(self, *args):
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err):
            code = cli.main(["--bindings", BINDINGS, *args])
        return code, out.getvalue(), err.getvalue()

    def test_table(self):
        code, out, _ = self.run_cli()
        self.assertEqual(code, 0)
        self.assertIn("CAP-006     -              R6 In service", out)
        self.assertIn("credit-note    R2 Bounded       R4 claimed", out)
        self.assertIn("latent evidence at R4", out)

    def test_json(self):
        code, out, _ = self.run_cli("--json")
        self.assertEqual(code, 0)
        data = json.loads(out)
        self.assertEqual(data["result"], "ok")
        self.assertEqual([r["rung"] for r in data["ladder"]], [f"R{i}" for i in range(7)])
        self.assertEqual({c["id"]: c["rung"] for c in data["capabilities"]}["CAP-004"], "R4")

    def test_filter(self):
        _, out, _ = self.run_cli("CAP-003", "--json")
        self.assertEqual([c["id"] for c in json.loads(out)["capabilities"]], ["CAP-003"])

    def test_check_fails_on_a_claim_above_the_evidence(self):
        code, _, _ = self.run_cli("--check")
        self.assertEqual(code, 1)
        code, _, _ = self.run_cli("--check", "CAP-004")
        self.assertEqual(code, 0)

    def test_binding_error_exits_2(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = os.path.join(tmp, "skill-bindings.toml")
            with open(p, "w", encoding="utf-8") as fh:
                fh.write('[suite.architecture]\nabbDir = "missing"\n')
            err = io.StringIO()
            with redirect_stdout(io.StringIO()), redirect_stderr(err):
                code = cli.main(["--bindings", p])
            self.assertEqual(code, 2)
            self.assertIn("which is not a directory", err.getvalue())

    def test_no_section_runs_and_says_so(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = os.path.join(tmp, "skill-bindings.toml")
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("[suite.other]\n")
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(io.StringIO()):
                code = cli.main(["--bindings", p])
            self.assertEqual(code, 0)
            self.assertIn("capabilityDir is not bound", out.getvalue())
            self.assertIn("unbound  patternDir", out.getvalue())

    def test_doctor(self):
        code, out, _ = self.run_cli("--doctor", "--json")
        self.assertEqual(code, 0)
        self.assertEqual(set(json.loads(out)["resolved"]),
                         {"capabilityDir", "abbDir", "sbbDir", "decisionDir", "considerationDir", "patternDir"})


class CapabilityIdPattern(unittest.TestCase):
    """A repository that numbers its capabilities other than CAP-NNN binds capabilityIdPattern."""

    def workspace(self, tmp, pattern=None):
        cap = os.path.join(tmp, "capabilities", "CA-04-agent-interaction", "CP-102-agent-orchestration")
        os.makedirs(cap)
        # No id in the front matter: the folder names it.
        with open(os.path.join(cap, "index.md"), "w", encoding="utf-8") as fh:
            fh.write('---\ntitle: "CP-102 Agent Orchestration"\ncapability:\n  level: L2\n---\n'
                     "# CP-102 Agent Orchestration\n\n## 1  Purpose\n\nCoordinate agents.\n")
        # No id and a folder that names none: the title does.
        other = os.path.join(tmp, "capabilities", "CA-04-agent-interaction", "tools")
        os.makedirs(other)
        with open(os.path.join(other, "tools.md"), "w", encoding="utf-8") as fh:
            fh.write('---\ntitle: "CP-103 Tool Integration"\n---\n# CP-103 Tool Integration\n')
        # The capability area's own page is not a capability.
        with open(os.path.join(tmp, "capabilities", "CA-04-agent-interaction", "README.mdx"), "w",
                  encoding="utf-8") as fh:
            fh.write('---\ntitle: "CA-04 Agent Interaction"\n---\n# CA-04 Agent Interaction\n')
        pats = os.path.join(tmp, "patterns", "AP-001")
        os.makedirs(pats)
        with open(os.path.join(pats, "index.md"), "w", encoding="utf-8") as fh:
            fh.write("---\nid: AP-001\nkind: pattern\nrealises: [CP-102, CP-200]\n---\n# AP-001\n")
        p = os.path.join(tmp, "skill-bindings.toml")
        with open(p, "w", encoding="utf-8") as fh:
            fh.write('[suite.architecture]\ncapabilityDir = "capabilities"\npatternDir = "patterns"\n')
            if pattern:
                fh.write(f"capabilityIdPattern = '{pattern}'\n")
        return p

    def test_default_reads_only_cap_ids(self):
        with tempfile.TemporaryDirectory() as tmp:
            caps, ws, _ = derived(self.workspace(tmp))
            self.assertEqual(ws.capabilities, {})
            self.assertEqual(caps, {})

    def test_bound_pattern_reads_the_repositorys_ids(self):
        with tempfile.TemporaryDirectory() as tmp:
            caps, ws, _ = derived(self.workspace(tmp, r"^CP-\d{3}$"))
            self.assertEqual(set(ws.capabilities), {"CP-102", "CP-103"})
            self.assertEqual(set(caps), {"CP-102", "CP-103", "CP-200"})
            self.assertEqual(caps["CP-102"]["rung"], "R0")
            # Its level is in a nested capability: block, so R1 is blocked by the parent instead.
            self.assertNotIn("CP-102 has no level (L1, L2 or L3)", caps["CP-102"]["blockers"])
            self.assertIn("CP-102 is L2 but names no parent", caps["CP-102"]["blockers"])
            self.assertIn("CP-103 has no level (L1, L2 or L3)", caps["CP-103"]["blockers"])
            self.assertEqual(caps["CP-200"]["evidence_elsewhere"], ["pattern AP-001"])

    def test_pattern_must_match_in_full(self):
        with tempfile.TemporaryDirectory() as tmp:
            _, ws, _ = derived(self.workspace(tmp, r"CP-\d{2}"))
            self.assertEqual(ws.capabilities, {})

    def test_cli_filters_and_reports_the_pattern(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = self.workspace(tmp, r"^CP-\d{3}$")
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(io.StringIO()):
                code = cli.main(["--bindings", p, "CP-103", "--json"])
            self.assertEqual(code, 0)
            data = json.loads(out.getvalue())
            self.assertEqual([c["id"] for c in data["capabilities"]], ["CP-103"])
            self.assertEqual(data["bindings"]["capabilityIdPattern"], r"^CP-\d{3}$")

    def test_default_is_reported(self):
        b = bindings.load(BINDINGS)
        self.assertEqual(b.capability_id_pattern, derive.DEFAULT_CAPABILITY_ID)

    def test_invalid_regex_is_a_binding_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = self.workspace(tmp, "^CP-(")
            with self.assertRaises(bindings.BindingError) as cm:
                bindings.load(p)
            self.assertIn("capabilityIdPattern '^CP-(' is not a valid regex", str(cm.exception))


class NestedCapabilityBlock(unittest.TestCase):
    """level and parent may sit in a nested capability: block instead of at the top level."""

    def r1(self, front):
        doc = derive.docs.Doc("index.md", front, "# CAP-001\n\n## Purpose\n\nDo a thing.\n")
        return derive._r1(doc, "CAP-001")

    def test_nested_level_and_parent_pass_r1(self):
        got = self.r1({"capability": {"level": "L2", "parent": "CAP-000"},
                       "demand_assumption": "assumed"})
        self.assertEqual(got, [])

    def test_nested_level_without_parent_needs_one(self):
        got = self.r1({"capability": {"level": "L3"}, "demand_assumption": "assumed"})
        self.assertEqual(got, ["CAP-001 is L3 but names no parent"])

    def test_top_level_wins_over_nested(self):
        got = self.r1({"level": "L1", "capability": {"level": "L9"},
                       "demand_assumption": "assumed"})
        self.assertEqual(got, [])
        got = self.r1({"level": "L9", "capability": {"level": "L1"},
                       "demand_assumption": "assumed"})
        self.assertIn("CAP-001 has no level (L1, L2 or L3)", got)

    def test_a_scalar_capability_key_is_not_a_block(self):
        got = self.r1({"capability": "L2", "demand_assumption": "assumed"})
        self.assertEqual(got, ["CAP-001 has no level (L1, L2 or L3)"])

    def test_report_shows_the_nested_level(self):
        with tempfile.TemporaryDirectory() as tmp:
            cap = os.path.join(tmp, "capabilities", "CAP-001-thing")
            os.makedirs(cap)
            with open(os.path.join(cap, "index.md"), "w", encoding="utf-8") as fh:
                fh.write('---\ntitle: "CAP-001 Thing"\ndemand_assumption: assumed\n'
                         "capability:\n  level: L1\n---\n"
                         "# CAP-001 Thing\n\n## Purpose\n\nDo a thing.\n")
            p = os.path.join(tmp, "skill-bindings.toml")
            with open(p, "w", encoding="utf-8") as fh:
                fh.write('[suite.architecture]\ncapabilityDir = "capabilities"\n')
            caps, _, _ = derived(p)
            self.assertEqual(caps["CAP-001"]["level"], "L1")
            self.assertEqual(caps["CAP-001"]["rung"], "R1")


class PartlyBound(unittest.TestCase):
    """A repository that keeps only some kinds still gets a derivation, over what it keeps."""

    def test_unbound_kinds_are_read_as_empty(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = os.path.join(tmp, "skill-bindings.toml")
            rel = FIXTURE.replace(os.sep, "/")  # absolute: tmp may be on another drive
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("[suite.architecture]\n"
                         f'capabilityDir = "{rel}/capabilities"\n'
                         f'abbDir = "{rel}/building-blocks/abbs"\n')
            caps, ws, report = derived(p)
            self.assertEqual(set(report["unbound"]),
                             {"sbbDir", "decisionDir", "considerationDir", "patternDir"})
            self.assertEqual(ws.patterns, [])
            self.assertEqual(ws.decisions, {})
            # Nothing is evidenced above R2 without SBBs, decisions or patterns.
            self.assertTrue(caps)
            for c in caps.values():
                self.assertIn(c["rung"], ("R0", "R1", "R2"), c["id"])

    def test_doctor_names_unbound(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = os.path.join(tmp, "skill-bindings.toml")
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("[suite.architecture]\n")
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(io.StringIO()):
                code = cli.main(["--bindings", p, "--doctor"])
            self.assertEqual(code, 0)
            self.assertIn("capabilityDir     (not bound)", out.getvalue())


if __name__ == "__main__":
    unittest.main()
