# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
"""Front matter YAML, read with every scalar kept as a string.

A skill is copied into a tool's skills folder, not installed, so it cannot count on
PyYAML being present. When PyYAML is importable it is used with BaseLoader, which reads
every scalar as a string and never turns a date or `no` into something else. Otherwise a
small parser covers the subset that architecture front matter uses: block mappings and
sequences, flow `[...]` and `{...}`, quoted and plain scalars, comments, and `|` or `>`
block scalars.

Both paths return the same shapes (dict, list, str), so derivation never depends on which
one ran. Set STAGE_PURE_YAML=1 (or the older RUNG_PURE_YAML=1 or AAA_RUNG_PURE_YAML=1) to force the
built-in parser.
"""
from __future__ import annotations

import os
import re

try:  # pragma: no cover - exercised by whichever environment runs the tests
    import yaml as _pyyaml
except ImportError:  # pragma: no cover
    _pyyaml = None


class YamlError(ValueError):
    pass


def _pure() -> bool:
    return any(os.environ.get(k) for k in ("STAGE_PURE_YAML", "RUNG_PURE_YAML", "AAA_RUNG_PURE_YAML"))


def load(text: str):
    """Parse YAML text into dicts, lists and strings. Empty text is {}."""
    if _pyyaml is not None and not _pure():
        try:
            data = _pyyaml.load(text, Loader=_pyyaml.BaseLoader)
        except _pyyaml.YAMLError as ex:
            raise YamlError(str(ex)) from ex
        return {} if data is None else data
    return parse(text)


# ------------------------------------------------------------------ built-in parser

_KEY_RE = re.compile(r"""^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#'"\[\]{},|>][^:]*?)\s*:(?:\s+|$)""")
_ESCAPES = {"n": "\n", "t": "\t"}


def _strip_comment(line: str) -> str:
    """Drop a trailing `# comment` that sits outside quotes."""
    quote, skip = None, False
    for i, ch in enumerate(line):
        if skip:
            skip = False
            continue
        if quote:
            if ch == "\\" and quote == '"':
                skip = True
            elif ch == quote:
                quote = None
        elif ch in ("'", '"'):
            # A quote only opens a string at the start of a token.
            if i == 0 or line[i - 1] in " \t[{,:-":
                quote = ch
        elif ch == "#" and (i == 0 or line[i - 1] in " \t"):
            return line[:i].rstrip()
    return line.rstrip()


def _lines(text: str):
    out = []
    for raw in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        if "\t" in raw[: len(raw) - len(raw.lstrip())]:
            raise YamlError("tabs are not allowed in YAML indentation")
        stripped = raw.strip()
        if not stripped or stripped.startswith("#"):
            out.append((None, raw))  # kept for block scalars
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        out.append((indent, raw))
    return out


class _Parser:
    def __init__(self, text: str):
        self.raw = _lines(text)
        # Content lines only, as [indent, text] (text comment-stripped), with the raw index.
        self.items = []
        for idx, (ind, raw) in enumerate(self.raw):
            if ind is None:
                continue
            body = _strip_comment(raw.strip())
            if body in ("---", "..."):
                continue
            self.items.append([ind, body, idx])

    def parse(self):
        if not self.items:
            return {}
        value, i = self.block(0, self.items[0][0])
        if i < len(self.items):
            raise YamlError(f"unexpected content: {self.items[i][1]!r}")
        return value

    # A block starting at item i, at the given indent.
    def block(self, i, indent):
        text = self.items[i][1]
        if text == "-" or text.startswith("- "):
            return self.sequence(i, indent)
        if _KEY_RE.match(text):
            return self.mapping(i, indent)
        # A lone scalar (rare in front matter, but legal).
        return _scalar(text), i + 1

    def mapping(self, i, indent):
        out = {}
        while i < len(self.items):
            ind, text, raw_idx = self.items[i]
            if ind < indent:
                break
            if ind > indent:
                raise YamlError(f"bad indentation at {text!r}")
            if text == "-" or text.startswith("- "):
                break
            m = _KEY_RE.match(text)
            if not m:
                raise YamlError(f"expected 'key: value', found {text!r}")
            key = _scalar(m.group(1))
            rest = text[m.end():].strip()
            i += 1
            if rest in ("|", ">", "|-", ">-", "|+", ">+"):
                value, i = self.block_scalar(i, indent, raw_idx, rest)
            elif rest:
                value = _inline(rest)
            elif i < len(self.items) and self.items[i][0] > indent:
                value, i = self.block(i, self.items[i][0])
            elif (i < len(self.items) and self.items[i][0] == indent
                  and (self.items[i][1] == "-" or self.items[i][1].startswith("- "))):
                value, i = self.sequence(i, indent)
            else:
                value = ""
            out[key] = value
        return out, i

    def sequence(self, i, indent):
        out = []
        while i < len(self.items):
            ind, text, raw_idx = self.items[i]
            if ind != indent or not (text == "-" or text.startswith("- ")):
                break
            rest = text[1:].lstrip()
            if not rest:
                i += 1
                if i < len(self.items) and self.items[i][0] > indent:
                    value, i = self.block(i, self.items[i][0])
                else:
                    value = ""
                out.append(value)
                continue
            col = ind + (len(text) - len(rest))
            if rest[0] not in "[{" and _KEY_RE.match(rest):
                # "- key: value" opens a mapping whose keys sit at the column of `key`.
                self.items[i] = [col, rest, raw_idx]
                value, i = self.mapping(i, col)
            elif rest == "-" or rest.startswith("- "):
                self.items[i] = [col, rest, raw_idx]
                value, i = self.sequence(i, col)
            else:
                value = _inline(rest)
                i += 1
            out.append(value)
        return out, i

    def block_scalar(self, i, indent, raw_idx, style):
        # Consume raw lines after raw_idx that are blank or indented deeper than `indent`.
        lines, j = [], raw_idx + 1
        while j < len(self.raw):
            ind, raw = self.raw[j]
            if ind is not None and ind <= indent:
                break
            lines.append(raw)
            j += 1
        while lines and not lines[-1].strip():
            lines.pop()
        body = [ln for ln in lines if ln.strip()]
        strip = min((len(ln) - len(ln.lstrip(" ")) for ln in body), default=0)
        lines = [ln[strip:] if ln.strip() else "" for ln in lines]
        text = "\n".join(lines) if style[0] == "|" else " ".join(ln for ln in lines if ln)
        if text and not style.endswith("-"):
            text += "\n"
        # Skip the parsed items the block scalar swallowed.
        while i < len(self.items) and self.items[i][2] < j:
            i += 1
        return text, i


def _scalar(s: str) -> str:
    s = s.strip()
    if len(s) >= 2 and s[0] == s[-1] == '"':
        body = s[1:-1]
        if "\\" not in body:
            return body
        return re.sub(r"\\(.)", lambda m: _ESCAPES.get(m.group(1), m.group(1)), body)
    if len(s) >= 2 and s[0] == s[-1] == "'":
        return s[1:-1].replace("''", "'")
    return s


def _inline(s: str):
    s = s.strip()
    if s and s[0] in "[{":
        value, pos = _flow(s, 0)
        if s[pos:].strip():
            raise YamlError(f"trailing text after flow collection: {s!r}")
        return value
    return _scalar(s)


def _skip_ws(s, pos):
    while pos < len(s) and s[pos] in " \t\n":
        pos += 1
    return pos


def _flow(s, pos):
    pos = _skip_ws(s, pos)
    if pos >= len(s):
        raise YamlError("unexpected end of flow collection")
    ch = s[pos]
    if ch == "[":
        out, pos = [], pos + 1
        while True:
            pos = _skip_ws(s, pos)
            if pos < len(s) and s[pos] == "]":
                return out, pos + 1
            value, pos = _flow(s, pos)
            out.append(value)
            pos = _skip_ws(s, pos)
            if pos < len(s) and s[pos] == ",":
                pos += 1
                continue
            if pos < len(s) and s[pos] == "]":
                return out, pos + 1
            raise YamlError(f"expected ',' or ']' in {s!r}")
    if ch == "{":
        out, pos = {}, pos + 1
        while True:
            pos = _skip_ws(s, pos)
            if pos < len(s) and s[pos] == "}":
                return out, pos + 1
            key, pos = _flow_scalar(s, pos, key=True)
            pos = _skip_ws(s, pos)
            if pos >= len(s) or s[pos] != ":":
                raise YamlError(f"expected ':' after key {key!r} in {s!r}")
            value, pos = _flow(s, pos + 1)
            out[key] = value
            pos = _skip_ws(s, pos)
            if pos < len(s) and s[pos] == ",":
                pos += 1
                continue
            if pos < len(s) and s[pos] == "}":
                return out, pos + 1
            raise YamlError(f"expected ',' or '}}' in {s!r}")
    return _flow_scalar(s, pos)


def _flow_scalar(s, pos, key=False):
    pos = _skip_ws(s, pos)
    if pos < len(s) and s[pos] in "\"'":
        q = s[pos]
        j = pos + 1
        while j < len(s):
            if s[j] == "\\" and q == '"':
                j += 2
                continue
            if s[j] == q:
                if q == "'" and j + 1 < len(s) and s[j + 1] == "'":
                    j += 2
                    continue
                break
            j += 1
        return _scalar(s[pos:j + 1]), j + 1
    j = pos
    stops = ",]}:" if key else ",]}"
    while j < len(s) and s[j] not in stops:
        j += 1
    return s[pos:j].strip(), j


def parse(text: str):
    return _Parser(text).parse()
