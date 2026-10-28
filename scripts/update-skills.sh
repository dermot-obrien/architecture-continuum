#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
#
# Install Architecture Continuum and the skills it works with into a repository, or update an
# installation to the latest releases.
#
#   ./update-skills.sh [--check-only] [--with-portfolio] [--yes]
#
# Run from the root of the repository to install into (a git repository).
#
# With no .agents/skills.json (a fresh install): declares architecture and workspace from the
# latest architecture-continuum release, pattern, use-case and cross-reference from
# architecture-pattern, model from diagram-model and markdown-deck from markdown-deck, each at
# its latest release tag, then runs the workspace skill's init from that release.
# --with-portfolio also declares portfolio, draft and convert.
#
# With a .agents/skills.json (an update): moves every source it knows to its latest release tag
# (the continuum bundle to vX.Y.Z, a skill from its own repository to <skill>--vX.Y.Z; a source
# still naming ai-assisted-architecture moves to architecture-continuum), then reinstalls with the
# workspace's own installer. Sources it does not know are left as they are.
#
# --check-only shows what would change and changes nothing. --yes skips the confirmation.
# Needs bash, git and Node 18 or later.

set -euo pipefail

CONTINUUM_REPO="https://github.com/dermot-obrien/architecture-continuum.git"
PATTERN_REPO="https://github.com/dermot-obrien/architecture-pattern.git"
MODEL_REPO="https://github.com/dermot-obrien/diagram-model.git"
DECK_REPO="https://github.com/dermot-obrien/markdown-deck.git"
DECLARATION=".agents/skills.json"

CHECK_ONLY=0; WITH_PORTFOLIO=0; YES=0
for arg in "$@"; do
  case "$arg" in
    --check-only) CHECK_ONLY=1 ;;
    --with-portfolio) WITH_PORTFOLIO=1 ;;
    --yes) YES=1 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

# latest_tag <repo> <prefix>: the highest <prefix>X.Y.Z tag, or nothing.
latest_tag() {
  git ls-remote --tags "$1" 2>/dev/null \
    | sed -n "s#.*refs/tags/\($2[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)\$#\1#p" \
    | sort -V | tail -1
}

# latest_release: the continuum's latest published GitHub release, which a stray tag cannot
# outrank; the highest vX.Y.Z tag only if the API cannot be reached.
latest_release() {
  local tag
  tag=$(node -e '
    fetch("https://api.github.com/repos/dermot-obrien/architecture-continuum/releases/latest",
          { headers: { "User-Agent": "update-skills" } })
      .then(r => r.ok ? r.json() : {}).then(j => console.log(j.tag_name || ""))
      .catch(() => console.log(""));' 2>/dev/null || true)
  [ -n "$tag" ] && { echo "$tag"; return; }
  latest_tag "$CONTINUUM_REPO" v
}

confirm() {
  [ "$YES" = 1 ] && return 0
  read -r -p "$1 (y/N) " answer
  [ "$answer" = "y" ] || [ "$answer" = "Y" ]
}

for tool in git node; do
  command -v "$tool" >/dev/null || { echo "$tool is not on the PATH." >&2; exit 2; }
done
[ -d .git ] || { echo "Run this from the root of a git repository (git init a new folder first)." >&2; exit 2; }

if [ ! -f "$DECLARATION" ]; then
  echo "No $DECLARATION: a fresh install. Finding the latest releases..."
  continuum_tag=$(latest_release)
  names="pattern use-case cross-reference"
  [ "$WITH_PORTFOLIO" = 1 ] && names="$names portfolio draft convert"
  [ -n "$continuum_tag" ] || { echo "Could not find an architecture-continuum release. Check the network." >&2; exit 1; }
  printf '  %-24s %s\n' architecture-continuum "$continuum_tag"
  lines="    { \"bundle\": \"$CONTINUUM_REPO\", \"ref\": \"$continuum_tag\" }"
  add() {  # add <repo> <name>
    local tag; tag=$(latest_tag "$1" "$2--v")
    [ -n "$tag" ] || { echo "Could not find a release tag for $2. Check the network." >&2; exit 1; }
    printf '  %-24s %s\n' "$2" "$tag"
    lines="$lines,
    { \"repo\": \"$1\", \"ref\": \"$tag\", \"path\": \"skills/$2\", \"name\": \"$2\" }"
  }
  for name in $names; do add "$PATTERN_REPO" "$name"; done
  add "$MODEL_REPO" model
  add "$DECK_REPO" markdown-deck
  [ "$CHECK_ONLY" = 1 ] && { echo "Check only: nothing changed."; exit 0; }
  confirm "Declare these and install?" || { echo "Cancelled."; exit 0; }

  mkdir -p .agents
  printf '{\n  "sources": [\n%s\n  ]\n}\n' "$lines" > "$DECLARATION"
  echo "Wrote $DECLARATION."

  temp=".continuum-install-$(date +%Y%m%d%H%M%S)"
  git clone --quiet --depth 1 --branch "$continuum_tag" "$CONTINUUM_REPO" "$temp"
  status=0
  node "$temp/skills/workspace/bin/workspace.mjs" init --repo . || status=$?
  rm -rf "$temp"
  [ "$status" = 0 ] || { echo "workspace init stopped (exit $status); its output says why." >&2; exit "$status"; }
  echo
  echo "Installed. Bind the skills to folders next: see docs/quick-install.md, step 4."
  echo "Commit .agents/skills.json, .agents/skills.lock.json, scripts/, .gitignore and any package.json change."
  exit 0
fi

echo "Reading $DECLARATION and finding the latest releases..."
# Each source this script knows, as "index kind repo name ref": kind is continuum or skill.
plan=$(node -e '
  const d = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  d.sources.forEach((s, i) => {
    if (s.bundle && /dermot-obrien\/(architecture-continuum|ai-assisted-architecture)(\.git)?$/.test(s.bundle))
      console.log([i, "continuum", s.bundle, "-", s.ref].join(" "));
    else if (s.repo && s.name)
      console.log([i, "skill", s.repo, s.name, s.ref].join(" "));
  });' "$DECLARATION")

updates=""
while read -r index kind repo name ref; do
  [ -n "$index" ] || continue
  if [ "$kind" = continuum ]; then
    tag=$(latest_release)
    if [ -n "$tag" ] && { [ "$ref" != "$tag" ] || [ "$repo" != "$CONTINUUM_REPO" ]; }; then
      printf '  %-24s %s -> %s\n' architecture-continuum "$ref" "$tag"
      updates="$updates $index=bundle:$tag"
    fi
  else
    tag=$(latest_tag "$repo" "$name--v")
    if [ -n "$tag" ] && [ "$ref" != "$tag" ]; then
      printf '  %-24s %s -> %s\n' "$name" "$ref" "$tag"
      updates="$updates $index=repo:$tag"
    fi
  fi
done <<< "$plan"

[ -n "$updates" ] || echo "Every source this script knows is at its latest release."
[ "$CHECK_ONLY" = 1 ] && { echo "Check only: nothing changed."; exit 0; }
if [ -n "$updates" ]; then
  confirm "Move these pins and reinstall?" || { echo "Cancelled."; exit 0; }
  CONTINUUM_REPO="$CONTINUUM_REPO" node -e '
    const fs = require("fs"); const file = process.argv[1];
    const d = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const u of process.argv.slice(2)) {
      const [i, rest] = u.split("="); const [kind, tag] = rest.split(":");
      const s = d.sources[Number(i)];
      if (kind === "bundle") s.bundle = process.env.CONTINUUM_REPO;
      s.ref = tag;
    }
    fs.writeFileSync(file, JSON.stringify(d, null, 2) + "\n");' "$DECLARATION" $updates
  echo "Updated $DECLARATION."
fi

status=0
if [ -f scripts/architecture.mjs ]; then
  node scripts/architecture.mjs reinit || status=$?
elif [ -f scripts/skills.mjs ]; then
  node scripts/skills.mjs sync --copy || status=$?
else
  echo "This repository has no installer yet. Run workspace init once: see docs/quick-install.md, step 3." >&2
  exit 2
fi
[ "$status" = 0 ] || { echo "The reinstall stopped (exit $status); its output says why." >&2; exit "$status"; }
[ -f scripts/skills.mjs ] && node scripts/skills.mjs check
echo
echo "Done. Read each release's notes for anything a workspace must change, then commit .agents/skills.json and .agents/skills.lock.json."
