# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
"""The definition ladder, derived from the artefacts that exist.

A capability sits on the highest rung for which it, and every rung below, has evidence.
Each rung's check returns the specific artefacts that are missing or say the wrong thing,
so the result is never just a number: it is the rung held and what blocks the next one.

The rules are those of the Definition Ladder Standard
(standards/capabilities/standard-definition-ladder.md, section 2).
"""
from __future__ import annotations

import os
import re

from . import docs
from .docs import as_list, text

RUNGS = (
    ("R0", "Unrecognised"),
    ("R1", "Named"),
    ("R2", "Bounded"),
    ("R3", "Decided"),
    ("R4", "Buildable"),
    ("R5", "Proven"),
    ("R6", "In service"),
)
RUNG_NAMES = dict(RUNGS)
LIVE = ("accepted", "active")

# A capability's identifier, unless [suite.architecture] capabilityIdPattern binds another.
DEFAULT_CAPABILITY_ID = r"^CAP-\d{3}$"
INDEX_NAMES = ("index.md", "index.mdx", "readme.md", "readme.mdx")
# The directories a repository may bind, each optional, and what leaving one unbound costs.
DIR_KEYS = {
    "capabilityDir": "capability documents, so every capability is R0",
    "abbDir": "ABBs, so R2 cannot be evidenced",
    "sbbDir": "SBBs, so R4 cannot be evidenced",
    "decisionDir": "decision records, so a resolved consideration cannot be confirmed at R3",
    "considerationDir": "considerations, so R2 needs open_questions: none on the capability",
    "patternDir": "patterns, so R3 and above cannot be evidenced",
}
ABB_RE = re.compile(r"ABB-\d{3}")
SBB_RE = re.compile(r"SBB-\d{3}(?:\.\d+){0,2}")
ANY_ID_RE = re.compile(r"\b[A-Z][A-Z0-9]*-\d{3}\b")

# Kinds written in a Building Blocks table's Kind column, as the model skill reads them.
# External context is outside the pattern's scope and contributes nothing.
KIND_LEVELS = {
    "local": "conceptual", "conceptual": "conceptual",
    "logical": "logical",
    "product": "physical", "physical": "physical",
    "external": None, "context": None,
}
BOX_SECTION_RE = re.compile(r"^(required\s+)?building\s+blocks$", re.I)


def rung_index(rung: str) -> int:
    return int(rung[1:])


def rung_id(i: int) -> str:
    return f"R{i}"


# ------------------------------------------------------------------------ patterns

class Box:
    __slots__ = ("cell", "ident", "level", "note")

    def __init__(self, cell, ident, level, note=""):
        self.cell, self.ident, self.level, self.note = cell, ident, level, note

    def to_dict(self):
        return {"cell": self.cell, "id": self.ident, "level": self.level, "note": self.note}


class Pattern:
    def __init__(self, doc: docs.Doc, root: str, ws: "Workspace"):
        self.doc = doc
        self.path = os.path.relpath(doc.path, root).replace(os.sep, "/")
        self.id = self._ident()
        self.realises = [text(x) for x in as_list(doc.get("realises")) if text(x)]
        self.flows = [text(x) for x in as_list(doc.get("flows")) if text(x)]
        self.boxes = self._boxes(ws)
        self.abstraction = abstraction([b.level for b in self.boxes])

    def _ident(self) -> str:
        own = text(self.doc.get("id"))
        if own:
            return own
        for candidate in (text(self.doc.get("title")), self._h1()):
            m = ANY_ID_RE.match(candidate or "")
            if m:
                return m.group(0)
        return self.path

    def _h1(self) -> str:
        for lv, title, _ in docs.sections(self.doc.body):
            if lv == 1:
                return title
        return ""

    def _boxes(self, ws) -> list:
        out = []
        for _lv, title, content in docs.sections(self.doc.body):
            if not BOX_SECTION_RE.match(title):
                continue
            for rows in docs.tables(content):
                for row in rows:
                    if not row:
                        continue
                    keys = list(row)
                    idcol = next((k for k in keys if k.lower() == "building block"), keys[0])
                    kindcol = next((k for k in keys if k.lower() == "kind"), None)
                    cell = row.get(idcol, "").strip()
                    if not cell:
                        continue
                    out.append(ws.classify(cell, row.get(kindcol, "") if kindcol else ""))
        return out

    def has_reference(self, rtype: str) -> bool:
        return has_reference(self.doc, rtype)

    @property
    def all_abb(self) -> bool:
        return bool(self.boxes) and all(b.level in ("logical", None) for b in self.boxes) \
            and any(b.level == "logical" for b in self.boxes)

    @property
    def physical(self) -> bool:
        return self.abstraction == "physical"

    def why_not(self, want: str) -> str:
        """Which boxes stop this pattern being all-ABB (want=logical) or all-SBB (physical)."""
        if not self.boxes:
            return "has no Building Blocks table"
        target = "an ABB" if want == "logical" else "an SBB"
        wrong = [b for b in self.boxes if b.level is not None and b.level != want]
        shown = ", ".join(f"{b.ident or b.cell}{' (' + b.note + ')' if b.note else ''}" for b in wrong[:4])
        more = f" and {len(wrong) - 4} more" if len(wrong) > 4 else ""
        return f"is {self.abstraction or 'unclassified'}: {shown}{more} not {target}"

    def to_dict(self):
        return {"id": self.id, "path": self.path, "abstraction": self.abstraction,
                "realises": self.realises, "flows": self.flows,
                "references": sorted({text(r.get("type")) for r in as_list(self.doc.get("references"))
                                      if isinstance(r, dict) and text(r.get("type"))}),
                "boxes": [b.to_dict() for b in self.boxes]}


def abstraction(levels: list) -> str:
    """The model skill's rule. All conceptual is conceptual; logical boxes, with or without
    conceptual ones, is logical; all physical is physical; anything else, or any box whose
    level is unknown, is mixed. Boxes outside scope (None) are ignored."""
    got = [lv for lv in levels if lv is not None]
    if not got:
        return ""
    s = set(got)
    if "" in s:
        return "mixed"
    if s == {"conceptual"}:
        return "conceptual"
    if s <= {"conceptual", "logical"}:
        return "logical"
    if s == {"physical"}:
        return "physical"
    return "mixed"


def has_reference(doc, rtype: str) -> bool:
    return any(isinstance(r, dict) and text(r.get("type")) == rtype
               for r in as_list(doc.get("references")))


# ------------------------------------------------------------------------ workspace

class Workspace:
    """Every artefact the ladder reads, indexed by identifier."""

    def __init__(self, paths: dict, local_pattern: str = "[0-9]{1,3}",
                 capability_id_pattern: str = DEFAULT_CAPABILITY_ID):
        self.paths = paths
        self.warnings = []
        # A directory left unbound means the repository does not keep that kind: it is read
        # as empty, and the report names it so the blockers it causes are not misread.
        self.unbound = [k for k in DIR_KEYS if not paths.get(k)]
        self.local_re = re.compile(rf"^\s*({local_pattern})(?=\s|$)")
        self.cap_re = re.compile(capability_id_pattern)
        self.capabilities = self._index(paths.get("capabilityDir"), "capability", self.cap_re,
                                        self._capability_ident)
        self.abbs = self._index(paths.get("abbDir"), "abb", r"^ABB-\d{3}$")
        self.sbbs = self._index(paths.get("sbbDir"), "sbb", r"^SBB-\d{3}(\.\d+){0,2}$")
        self.decisions = self._index(paths.get("decisionDir"), "decision-record", r"^DR-\d{3}$")
        self.considerations = self._index(paths.get("considerationDir"), "consideration", r"^CN-\d{3}$")
        root = paths.get("patternDir")
        self.patterns = [Pattern(d, root, self) for d in (docs.scan(root) if root else [])
                         if not d.problems and text(d.get("kind")) in ("", "pattern")
                         and (d.get("realises") is not None or text(d.get("document_type")) == "pattern")]

    def is_capability(self, ident: str) -> bool:
        return bool(self.cap_re.fullmatch(ident))

    def _capability_ident(self, d) -> str:
        """A capability's id: its front matter id, else the folder an index page names, else
        the first word of its title or H1, whichever matches the capability id pattern."""
        if d.id:
            return d.id
        name = os.path.basename(d.path)
        if name.lower() in INDEX_NAMES:
            parts = os.path.basename(os.path.dirname(d.path)).split("-")
            for i in range(1, len(parts) + 1):
                if self.is_capability("-".join(parts[:i])):
                    return "-".join(parts[:i])
        h1 = next((t for lv, t, _ in docs.sections(d.body) if lv == 1), "")
        for candidate in (text(d.get("title")), h1):
            word = (candidate or "").split(" ", 1)[0]
            if word and self.is_capability(word):
                return word
        return ""

    def _index(self, root: str | None, kind: str, id_re, ident=None) -> dict:
        rx = re.compile(id_re)
        out = {}
        if not root:
            return out
        for d in docs.scan(root):
            for p in d.problems:
                self.warnings.append(f"{d.path}: {p}")
            k = text(d.get("kind"))
            if k and k != kind:
                continue
            i = ident(d) if ident else d.id
            if not rx.fullmatch(i):
                continue
            prior = out.get(i)
            if prior is None or _prefer(d, prior):
                out[i] = d
        return out

    def classify(self, cell: str, kind: str = "") -> Box:
        k = (kind or "").strip().lower()
        if k in KIND_LEVELS:
            m = self.local_re.match(cell) or ABB_RE.search(cell) or SBB_RE.search(cell)
            ident = (m.group(1) if m and m.re is self.local_re else m.group(0)) if m else ""
            return Box(cell, ident, KIND_LEVELS[k], f"kind {k}")
        m = self.local_re.match(cell)
        if m:
            return Box(cell, m.group(1), "conceptual", "local role")
        a, s = ABB_RE.search(cell), SBB_RE.search(cell)
        first = min((x for x in (a, s) if x), key=lambda x: x.start(), default=None)
        if first is None:
            return Box(cell, "", "", "no catalogue identifier")
        ident = first.group(0)
        if first is a:
            return Box(cell, ident, "logical" if ident in self.abbs else "",
                       "" if ident in self.abbs else "no ABB document")
        base = ident.split(".")[0]
        known = ident in self.sbbs or base in self.sbbs
        return Box(cell, ident, "physical" if known else "", "" if known else "no SBB document")

    # -------------------------------------------------------------- relations

    def sbbs_realising(self, abb: str) -> list:
        return [d for d in self.sbbs.values()
                if abb in [text(x) for x in as_list(d.get("realises"))]]

    def considerations_affecting(self, ids: set) -> list:
        out = []
        for cid, d in sorted(self.considerations.items()):
            if text(d.get("consideration_status")) == "withdrawn":
                continue
            if ids & {text(x) for x in as_list(d.get("affects"))}:
                out.append(d)
        return out

    def patterns_realising(self, cap: str) -> list:
        return [p for p in self.patterns if cap in p.realises]

    def referenced_capabilities(self) -> dict:
        """Capability ids named by patterns or considerations: where latent evidence points."""
        out = {}
        for p in self.patterns:
            for c in p.realises:
                if self.is_capability(c):
                    out.setdefault(c, []).append(f"pattern {p.id}")
        for cid, d in self.considerations.items():
            for c in as_list(d.get("affects")):
                c = text(c)
                if self.is_capability(c):
                    out.setdefault(c, []).append(f"consideration {cid}")
        return out


def _prefer(new, old) -> bool:
    """Of two documents with one id, the baseline one wins (standard-frontmatter.md §4)."""
    def score(d):
        state = text(d.get("lifecycle_state")) or "baseline"
        return 0 if state == "baseline" else 1
    return score(new) < score(old)


# ------------------------------------------------------------------------ the rungs

class Derivation:
    """One capability, or one flow of it."""

    def __init__(self, checks: dict, recorded: str = ""):
        self.checks = checks                # rung index -> list of blockers
        held = 0
        for i in range(1, 7):
            if checks[i]:
                break
            held = i
        self.held = held
        self.next = held + 1 if held < 6 else None
        self.blockers = checks[self.next] if self.next else []
        self.latent = [rung_id(i) for i in range(held + 2, 7) if not checks[i]]
        self.recorded = recorded
        if recorded and re.fullmatch(r"R[0-6]", recorded):
            r = rung_index(recorded)
            self.claim = "matches" if r == held else ("above" if r > held else "below")
        else:
            self.claim = None

    def to_dict(self):
        return {
            "rung": rung_id(self.held), "name": RUNG_NAMES[rung_id(self.held)],
            "next": rung_id(self.next) if self.next else None,
            "blockers": list(self.blockers),
            "latent": list(self.latent),
            "recorded": self.recorded or None,
            "claim": self.claim,
            "checks": {rung_id(i): list(v) for i, v in self.checks.items()},
        }


def derive_capability(ws: Workspace, cid: str) -> dict:
    doc = ws.capabilities.get(cid)
    if doc is None:
        where = ws.referenced_capabilities().get(cid, [])
        checks = {i: [] for i in range(1, 7)}
        checks[1] = [f"no capability document for {cid} under capabilityDir"]
        for i in range(2, 7):
            checks[i] = [f"needs R{i - 1} first"]
        d = Derivation(checks)
        out = {"id": cid, "title": "", "path": None, **d.to_dict(), "flows": [], "patterns": [],
               "evidence_elsewhere": where}
        return out

    abb_ids = [text(x) for x in as_list(doc.get("realised_by_abbs")) if text(x)]
    shared = {1: _r1(doc, cid), 2: _r2(ws, doc, cid, abb_ids)}
    considerations = ws.considerations_affecting({cid, *abb_ids})
    r3_questions = _r3_questions(ws, considerations)
    r4_sbbs = _r4_sbbs(ws, abb_ids)
    patterns = ws.patterns_realising(cid)

    def checks_for(pats, label):
        return {
            1: shared[1], 2: shared[2],
            3: r3_questions + _r3_pattern(pats, cid, label),
            4: r4_sbbs + _r4_pattern(pats, cid, label),
            5: _r5(pats, cid, label),
            6: _r6(doc, cid, pats),
        }

    whole = Derivation(checks_for(patterns, ""))
    flows_out = []
    declared = []
    for f in as_list(doc.get("flows")):
        if not isinstance(f, dict) or not text(f.get("id")):
            continue
        fid = text(f.get("id"))
        declared.append(fid)
        pats = [p for p in patterns if not p.flows or fid in p.flows]
        d = Derivation(checks_for(pats, f" for flow {fid}"), text(f.get("rung")))
        flows_out.append({"id": fid, "name": text(f.get("name")), **d.to_dict(),
                          "patterns": [p.id for p in pats]})

    warnings = []
    for p in patterns:
        for fl in p.flows:
            if fl not in declared:
                warnings.append(f"pattern {p.id} names flow {fl}, which {cid} does not declare")

    if flows_out:
        lowest = min(flows_out, key=lambda f: rung_index(f["rung"]))
        summary = {k: lowest[k] for k in ("rung", "name", "next", "blockers")}
        summary["latent"] = sorted({x for f in flows_out for x in f["latent"]}, key=rung_index)
        summary["limited_by_flow"] = lowest["id"]
        summary["checks"] = whole.to_dict()["checks"]
    else:
        summary = whole.to_dict()
        summary["limited_by_flow"] = None

    return {
        "id": cid,
        "title": text(doc.get("title")),
        "path": doc.path,
        "level": text(capability_field(doc, "level")),
        "status": text(doc.get("status")),
        **summary,
        "recorded": None,
        "claim": None,
        "flows": flows_out,
        "patterns": [p.to_dict() for p in patterns],
        "considerations": [c.id for c in considerations],
        "warnings": warnings,
    }


def capability_field(doc, key):
    """A capability's own field: the top-level key, else the same key in a nested capability:
    block, which some repositories use to keep the capability's attributes apart from the
    page's. A top-level key always wins."""
    value = doc.get(key)
    if value is None:
        block = doc.get("capability")
        if isinstance(block, dict):
            value = block.get(key)
    return value


def _r1(doc, cid) -> list:
    out = []
    level = text(capability_field(doc, "level"))
    if level not in ("L1", "L2", "L3"):
        out.append(f"{cid} has no level (L1, L2 or L3)")
    if level in ("L2", "L3") and not text(capability_field(doc, "parent")):
        out.append(f"{cid} is {level} but names no parent")
    purpose = text(doc.get("description"))
    if not purpose:
        body = docs.section_text(doc.body, r"\bpurpose\b")
        purpose = (body or "").strip()
    if not purpose:
        out.append(f"{cid} states no purpose: add a description, or a Purpose section")
    demand = [x for x in as_list(doc.get("required_by_outcomes")) if text(x)]
    if not demand and not text(doc.get("demand_assumption")):
        out.append(f"{cid} names no demand: add required_by_outcomes, or record demand_assumption")
    return out


def _r2(ws, doc, cid, abb_ids) -> list:
    out = []
    if not abb_ids:
        out.append(f"{cid} names no ABB in realised_by_abbs")
    for a in abb_ids:
        d = ws.abbs.get(a)
        if d is None:
            out.append(f"{a} is named by {cid} but has no ABB document under abbDir")
        elif "requires" not in d.meta:
            out.append(f"{a} does not declare requires (an empty list is enough)")
    if not ws.considerations_affecting({cid, *abb_ids}) and text(doc.get("open_questions")) != "none":
        out.append(f"no consideration affects {cid} or its ABBs, and it does not declare "
                   f"open_questions: none")
    return out


def _r3_questions(ws, considerations) -> list:
    out = []
    for c in considerations:
        st = text(c.get("consideration_status")) or "open"
        if st != "resolved":
            out.append(f"{c.id} is {st}: it needs an accepted decision record in resolved_by")
            continue
        dr = text(c.get("resolved_by"))
        if not dr:
            out.append(f"{c.id} is resolved but names no resolved_by decision record")
            continue
        d = ws.decisions.get(dr)
        if d is None:
            out.append(f"{c.id} is resolved by {dr}, which has no document under decisionDir")
        elif text(d.get("status")) not in LIVE:
            out.append(f"{c.id} is resolved by {dr}, whose status is "
                       f"{text(d.get('status')) or 'unset'}, not accepted or active")
    return out


def _r3_pattern(pats, cid, label) -> list:
    if any(p.all_abb or p.physical for p in pats):
        return []
    if not pats:
        return [f"no pattern realises {cid}{label}: add realises: [{cid}] to a logical pattern"]
    return [f"pattern {p.id} {p.why_not('logical')}" for p in pats]


def _r4_sbbs(ws, abb_ids) -> list:
    out = []
    for a in abb_ids:
        sbbs = ws.sbbs_realising(a)
        live = [s for s in sbbs if text(s.get("status")) in LIVE]
        if live:
            continue
        if sbbs:
            shown = ", ".join(f"{s.id} ({text(s.get('status')) or 'unset'})" for s in sbbs)
            out.append(f"{a} is realised only by {shown}: an SBB must be accepted or active")
        else:
            out.append(f"no SBB realises {a}")
    return out


def _r4_pattern(pats, cid, label) -> list:
    physical = [p for p in pats if p.physical]
    if any(p.has_reference("cost-model") for p in physical):
        return []
    if physical:
        return [f"pattern {p.id} is physical but has no cost-model reference" for p in physical]
    if not pats:
        return [f"no pattern realises {cid}{label}"]
    return [f"no physical pattern realises {cid}{label}: pattern {p.id} {p.why_not('physical')}"
            for p in pats]


def _r5(pats, cid, label) -> list:
    physical = [p for p in pats if p.physical]
    if any(p.has_reference("evidence") for p in physical):
        return []
    if physical:
        return [f"pattern {p.id} links no evidence: add a reference of type evidence" for p in physical]
    return [f"no physical pattern realises {cid}{label} to link evidence from"]


def _r6(doc, cid, pats) -> list:
    out = []
    st = text(doc.get("status"))
    if st != "active":
        out.append(f"{cid} status is {st or 'unset'}, not active")
    if not has_reference(doc, "runbook") and not any(p.has_reference("runbook") for p in pats):
        out.append(f"no runbook reference on {cid} or a pattern that realises it")
    return out


def derive_all(ws: Workspace, only: list | None = None) -> dict:
    ids = set(ws.capabilities) | set(ws.referenced_capabilities())
    if only:
        ids = {i for i in ids if i in only} | {i for i in only if ws.is_capability(i)}
    caps = [derive_capability(ws, cid) for cid in sorted(ids)]
    warnings = list(ws.warnings)
    for c in caps:
        warnings.extend(c.get("warnings", []))
    return {
        "ladder": [{"rung": r, "name": n} for r, n in RUNGS],
        "capabilities": caps,
        "unbound": list(ws.unbound),
        "warnings": warnings,
    }
