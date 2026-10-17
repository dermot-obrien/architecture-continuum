# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
"""stage: report each capability's definition stage on the ladder, and what blocks the next.

    python bin/stage.py                     table of every capability and its flows
    python bin/stage.py --json              the same, for tools
    python bin/stage.py CAP-012 --verbose   one capability, every blocker
    python bin/stage.py --check             exit 1 if a recorded stage claims more than the evidence
    python bin/stage.py --doctor            resolve the bindings and stop

bin/rung.py, the former name, runs the same command.

Exit codes: 0 done, 1 --check found a claim above the evidence, 2 the bindings did not resolve.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from . import __version__
from . import bindings as bindings_mod
from .derive import DIR_KEYS, Workspace, derive_all


def _args(argv):
    p = argparse.ArgumentParser(prog="stage", description=__doc__.split("\n")[0])
    p.add_argument("capabilities", nargs="*", metavar="ID",
                   help="only these capabilities, by id: CAP-NNN unless capabilityIdPattern "
                   "binds another (default: every one)")
    p.add_argument("--bindings", help="path to skill-bindings.toml (default: nearest "
                   ".agents/skill-bindings.toml above the working directory)")
    p.add_argument("--json", action="store_true", help="machine-readable output")
    p.add_argument("--verbose", "-v", action="store_true", help="every blocker, not just the first")
    p.add_argument("--check", action="store_true",
                   help="exit 1 when a recorded flow stage is above the derived one")
    p.add_argument("--doctor", action="store_true", help="resolve the bindings, report, and stop")
    p.add_argument("--version", action="version", version=f"architecture stage {__version__}")
    return p.parse_args(argv)


def main(argv=None) -> int:
    a = _args(sys.argv[1:] if argv is None else argv)
    try:
        b = bindings_mod.load(a.bindings)
    except bindings_mod.BindingError as ex:
        if a.json:
            print(json.dumps({"result": "error", "errors": str(ex).split("\n")}, indent=2))
        else:
            print("  ! bindings did not resolve:", file=sys.stderr)
            for line in str(ex).split("\n"):
                print(f"    {line}", file=sys.stderr)
        return 2
    for w in b.warnings:
        print(f"  warning: {w}", file=sys.stderr)

    if a.doctor:
        payload = {"result": "ok", **b.to_dict()}
        if a.json:
            print(json.dumps(payload, indent=2))
        else:
            print(f"  bindings  {b.path}")
            for k, v in b.paths.items():
                print(f"  {k:<17} {v}")
            for k in b.unbound:
                print(f"  {k:<17} (not bound)")
            print(f"  localPattern      {b.local_pattern}")
            print(f"  capabilityIdPattern {b.capability_id_pattern}")
        return 0

    ws = Workspace(b.paths, b.local_pattern, b.capability_id_pattern)
    report = derive_all(ws, a.capabilities or None)
    report = {"result": "ok", "bindings": b.to_dict(), **report}

    claims = [(c["id"], f["id"], f["recorded"], f["stage"])
              for c in report["capabilities"] for f in c["flows"] if f.get("claim") == "above"]

    if a.json:
        print(json.dumps(report, indent=2))
    else:
        print(render(report, verbose=a.verbose))
    return 1 if (a.check and claims) else 0


def _wrap(s: str, width: int) -> str:
    return s if len(s) <= width else s[: width - 3] + "..."


def render(report: dict, verbose: bool = False) -> str:
    rows = [("Capability", "Flow", "Stage", "Recorded", "Blocking the next stage")]
    notes = []
    for c in report["capabilities"]:
        first = (c["blockers"][0] if c["blockers"] else "top of the ladder")
        more = f" (+{len(c['blockers']) - 1} more)" if len(c["blockers"]) > 1 and not verbose else ""
        rows.append((c["id"], "(all flows)" if c["flows"] else "-",
                     f"{c['stage']} {c['name']}", "", first + more))
        if verbose:
            for extra in c["blockers"][1:]:
                rows.append(("", "", "", "", extra))
        for f in c["flows"]:
            fb = f["blockers"][0] if f["blockers"] else "top of the ladder"
            fmore = f" (+{len(f['blockers']) - 1} more)" if len(f["blockers"]) > 1 and not verbose else ""
            rec = f["recorded"] or ""
            if f.get("claim") == "above":
                rec += " claimed"
            elif f.get("claim") == "below":
                rec += " stale"
            rows.append(("", f["id"], f"{f['stage']} {f['name']}", rec, fb + fmore))
            if verbose:
                for extra in f["blockers"][1:]:
                    rows.append(("", "", "", "", extra))
        if c.get("latent"):
            notes.append(f"{c['id']}: latent evidence at {', '.join(c['latent'])}, "
                         f"not counted until the stages below hold")
        if c.get("evidence_elsewhere"):
            notes.append(f"{c['id']}: named by {', '.join(c['evidence_elsewhere'])} "
                         f"but has no capability document")
    widths = [max(len(r[i]) for r in rows) for i in range(4)]
    lines = []
    for n, r in enumerate(rows):
        lead = "  ".join(r[i].ljust(widths[i]) for i in range(4))
        lines.append(f"{lead}  {_wrap(r[4], 110)}".rstrip())
        if n == 0:
            lines.append("  ".join("-" * w for w in widths) + "  " + "-" * 22)
    if not report["capabilities"]:
        where = ("capabilityDir is not bound" if "capabilityDir" in report.get("unbound", [])
                 else "no capabilities found under capabilityDir")
        lines.append(f"({where}, and none named by a pattern or consideration)")
    for k in report.get("unbound", []):
        lines.append(f"  unbound  {k}: no {DIR_KEYS[k]}")
    for note in notes:
        lines.append(f"  note  {note}")
    for w in report.get("warnings", []):
        lines.append(f"  warn  {w}")
    return "\n".join(lines)


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
