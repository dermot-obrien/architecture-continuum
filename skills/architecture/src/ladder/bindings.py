# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
"""Where the repository keeps the artefacts this skill reads.

The skill carries no layout of its own. The repository answers the contract in
`inputs.toml` in `[suite.architecture]` of its `.agents/skill-bindings.toml`, and every
relative path resolves against that file's directory, never the working directory. The stage
flow reads only the options inputs.toml gives it; a key the table holds for another
flow is left to that flow. For one release a key missing there is read from the old
`[suite.aaa-rung]`, with a warning.
Every directory is optional: one left unset means the repository does not keep that kind,
and nothing is read for it. A path that is set but does not exist stops the run: a derived
stage computed over the wrong directory would look exactly like a real one.
"""
from __future__ import annotations

import os
import re

from .derive import DEFAULT_CAPABILITY_ID

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python < 3.11
    tomllib = None

SUITE = "architecture"
LEGACY = "aaa-rung"
FLOW = "stage"
CONFIG_NAMES = (os.path.join(".agents", "skill-bindings.toml"), "skill-bindings.toml")
SKILL_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class BindingError(Exception):
    pass


def find(start: str) -> str | None:
    """The nearest bindings file, searching upward from start."""
    d = os.path.abspath(start if os.path.isdir(start) else os.path.dirname(start) or ".")
    while True:
        for n in CONFIG_NAMES:
            p = os.path.join(d, n)
            if os.path.isfile(p):
                return p
        parent = os.path.dirname(d)
        if parent == d:
            return None
        d = parent


def contract(skill_dir: str = SKILL_DIR) -> dict:
    p = os.path.join(skill_dir, "inputs.toml")
    if tomllib is None:
        raise BindingError("reading bindings needs Python 3.11 or newer (tomllib)")
    with open(p, "rb") as fh:
        return tomllib.load(fh)


class Bindings:
    def __init__(self, path: str, paths: dict, local_pattern: str, unbound: list | None = None,
                 warnings: list | None = None, capability_id_pattern: str = DEFAULT_CAPABILITY_ID):
        self.path = path
        self.warnings = list(warnings or [])
        self.root = os.path.dirname(os.path.abspath(path))
        self.paths = paths
        self.local_pattern = local_pattern
        self.capability_id_pattern = capability_id_pattern
        self.unbound = list(unbound or [])

    def __getitem__(self, key):
        return self.paths[key]

    def to_dict(self):
        return {"bindingFile": self.path, "resolved": dict(self.paths),
                "unbound": list(self.unbound), "localPattern": self.local_pattern,
                "capabilityIdPattern": self.capability_id_pattern,
                "warnings": list(self.warnings)}


def load(path: str | None = None, start: str | None = None) -> Bindings:
    """Resolve the stage flow's bindings against its contract. Raises BindingError naming each problem."""
    if tomllib is None:
        raise BindingError("reading bindings needs Python 3.11 or newer (tomllib)")
    path = path or find(start or os.getcwd())
    if not path or not os.path.isfile(path):
        raise BindingError(
            "no .agents/skill-bindings.toml found above the working directory. Add "
            f"[suite.{SUITE}] to the repository's bindings file, or pass --bindings")
    try:
        with open(path, "rb") as fh:
            raw = tomllib.load(fh)
    except tomllib.TOMLDecodeError as ex:
        raise BindingError(f"{path} is not valid TOML: {ex}")

    every = contract().get("inputs", {}).get("options", {})
    options = {k: v for k, v in every.items() if FLOW in (v.get("flows") or [])}
    suites = raw.get("suite") or {}
    current = suites.get(SUITE) or {}
    legacy = suites.get(LEGACY) or {}
    problems, resolved, unbound, warnings = [], {}, [], []
    for key in current:
        if key not in every:
            problems.append(f"[suite.{SUITE}] {key} is not a key this skill declares")
    for key in legacy:
        if key not in options:
            problems.append(f"[suite.{LEGACY}] {key} is not a key this skill declares")
    # No section is the same as a section binding nothing: every kind is unbound.
    section = {k: v for k, v in current.items() if k in options}
    old = [k for k in legacy if k in options and k not in section]
    for k in old:
        section[k] = legacy[k]
    if old:
        warnings.append(f"{path}: {', '.join(old)} read from the old table [suite.{LEGACY}]; "
                        f"move them to [suite.{SUITE}], which this release still falls back from")

    root = os.path.dirname(os.path.abspath(path))
    for key, spec in options.items():
        table = LEGACY if key in old else SUITE
        value = section.get(key)
        if value in (None, ""):
            if spec.get("type") == "dir":
                unbound.append(key)
            continue
        if spec.get("type") in ("dir", "file", "path"):
            full = os.path.normpath(os.path.join(root, str(value)))
            if spec.get("type") == "dir" and not os.path.isdir(full):
                problems.append(f"[suite.{table}] {key} = {value!r} resolves to {full}, which is not a directory")
            elif spec.get("type") == "file" and not os.path.isfile(full):
                problems.append(f"[suite.{table}] {key} = {value!r} resolves to {full}, which is not a file")
            resolved[key] = full
    if problems:
        raise BindingError("\n".join(problems))

    local = str(section.get("localPattern") or (raw.get("model") or {}).get("local_pattern") or "[0-9]{1,3}")
    try:
        re.compile(local)
    except re.error as ex:
        raise BindingError(f"local pattern {local!r} is not a valid regex: {ex}")
    cap = str(section.get("capabilityIdPattern") or DEFAULT_CAPABILITY_ID)
    try:
        re.compile(cap)
    except re.error as ex:
        raise BindingError(f"capabilityIdPattern {cap!r} is not a valid regex: {ex}")
    return Bindings(os.path.abspath(path), resolved, local, unbound, warnings, cap)
