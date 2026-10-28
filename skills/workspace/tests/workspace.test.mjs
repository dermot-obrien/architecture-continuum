// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0
// The workspace skill against throwaway git repositories: what clean removes and keeps, that
// install is idempotent and never overwrites what it did not write, and that the repository's
// door script and the skill's own steps skip quietly when the skills are not installed.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyClean, applyInstall, check, lockMismatches, planClean, planInstall, readToml, regenerate, removeTopLevelKey, SHIM_MARK,
} from "../src/workspace.mjs";

const CLI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "workspace.mjs");
let repo;
const write = (rel, text) => {
  const p = path.join(repo, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
};
const git = (...args) => {
  const r = spawnSync("git", ["-C", repo, ...args], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
};
const run = (args, env = {}) => spawnSync(process.execPath, args, { cwd: repo, encoding: "utf8", env: { ...process.env, ...env } });
const status = () => git("status", "--porcelain");

beforeEach(() => {
  repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "ws-")));
  git("init", "-q", "-b", "main");
  git("config", "user.email", "t@example.org");
  git("config", "user.name", "Test");
  git("config", "commit.gpgsign", "false");
});
afterEach(() => fs.rmSync(repo, { recursive: true, force: true }));

const AAW = `modules:
  aaw:
    name: AI-Assisted Work
    source_root: .ai-assisted-work

# Thread store, and the project root threads opened here go under.
threads_remote: https://example.org/threads.git
threads_project: t-4wd
`;

test("readToml reads tables, strings, booleans and lists, and reads past arrays of tables", () => {
  const t = readToml(`[suite.workspace]\ndecks = "../site/static/decks" # out\npdf = true\ndiagrams = [\n  "../a",\n  '../b',\n]\n[[markdown.tables]]\nsection = "x"\n[model]\nedge_id_attr = "iface_id"\n`);
  assert.deepEqual(t["suite.workspace"], { decks: "../site/static/decks", pdf: true, diagrams: ["../a", "../b"] });
  assert.deepEqual(t.model, { edge_id_attr: "iface_id" });
});

test("removeTopLevelKey drops the block and keeps every other line, comments included", () => {
  const out = removeTopLevelKey(AAW, "modules");
  assert.equal(out, "# Thread store, and the project root threads opened here go under.\nthreads_remote: https://example.org/threads.git\nthreads_project: t-4wd\n");
  assert.equal(removeTopLevelKey("a: 1\n", "modules"), null);
});

function leftovers() {
  write(".gitignore", ".agents/skills/\nbuild/\n");
  write(".aaw-config.yaml", AAW);
  write(".claude/skills/own/SKILL.md", "---\nname: own\n---\n");
  write(".claude/skills/aaw-start-work/SKILL.md", "---\nname: aaw-start-work\n---\n");
  write(".claude/skills/aar-frame/SKILL.md", "old\n");
  write("package.json", JSON.stringify({ scripts: { build: "npm run pub && docusaurus build", pub: "python .agents/skills/pattern/scripts/publish.py x" }, dependencies: { "@docusaurus/core": "^3.0.0" } }, null, 2));
  write(".claude/settings.json", JSON.stringify({ hooks: { SessionStart: [{ hooks: [{ type: "command", command: "npx aaw install --quiet" }] }] } }));
  git("add", "-A");
  git("commit", "-q", "-m", "init");
  // A gitlink for a framework submodule.
  const sha = git("rev-parse", "HEAD").trim();
  write(".gitmodules", '[submodule ".ai-assisted-work"]\n\tpath = .ai-assisted-work\n\turl = https://example.org/aaw.git\n');
  git("update-index", "--add", "--cacheinfo", `160000,${sha},.ai-assisted-work`);
  git("add", ".gitmodules");
  git("commit", "-q", "-m", "submodule");
  // Untracked: an ignored installed copy, an ignored build, a stray skill nobody declared, a dangling link.
  write(".agents/skills/old-skill/SKILL.md", "x\n");
  write("build/index.html", "x\n");
  write(".claude/skills/stray/SKILL.md", "x\n");
  fs.symlinkSync(path.join(repo, ".agents", "skills", "gone"), path.join(repo, ".claude", "skills", "gone"));
}

test("clean plans the leftovers, keeps what is someone's, and reports what it will not change", () => {
  leftovers();
  const { actions, notes } = planClean(repo, { self: "/nowhere" });
  const by = Object.fromEntries(actions.map((a) => [a.path, a.op]));
  assert.equal(by[".ai-assisted-work"], "submodule");
  assert.equal(by[".claude/skills/aaw-start-work"], "git-rm");
  assert.equal(by[".claude/skills/aar-frame"], "git-rm");
  assert.equal(by[".claude/skills/gone"], "rm");
  assert.equal(by[".agents/skills/old-skill"], "rm");
  assert.equal(by.build, "rm");
  assert.equal(by[".aaw-config.yaml"], "edit");
  assert.ok(!(".claude/skills/own" in by), "a committed skill of the repository's own is kept");
  assert.ok(!(".claude/skills/stray" in by), "an untracked skill that is not ignored is kept");
  const said = notes.map((n) => `${n.path}: ${n.why}`).join("\n");
  assert.match(said, /\.claude\/skills\/stray: an untracked skill folder/);
  assert.match(said, /settings\.json: a hook runs a framework installer/);
  assert.match(said, /script "pub" calls an installed skill directly.*npm run build runs it/);
});

test("clean --apply removes them through git, so every removal of a tracked file is staged", () => {
  leftovers();
  applyClean(repo, planClean(repo, { self: "/nowhere" }).actions, () => {});
  for (const p of [".ai-assisted-work", ".gitmodules", ".claude/skills/aaw-start-work", ".claude/skills/gone", ".agents/skills/old-skill", "build"]) {
    assert.throws(() => fs.lstatSync(path.join(repo, p)), `${p} is gone`);
  }
  assert.ok(fs.existsSync(path.join(repo, ".claude/skills/own/SKILL.md")));
  assert.ok(fs.existsSync(path.join(repo, ".claude/skills/stray/SKILL.md")));
  assert.equal(fs.readFileSync(path.join(repo, ".aaw-config.yaml"), "utf8").startsWith("# Thread store"), true);
  const s = status();
  assert.match(s, /^D  \.claude\/skills\/aaw-start-work\/SKILL\.md$/m);
  assert.match(s, /^D  \.ai-assisted-work$/m);
  assert.match(s, /^ M \.aaw-config\.yaml$/m);
  assert.equal(planClean(repo, { self: "/nowhere" }).actions.length, 0, "a second clean has nothing to do");
});

test("clean keeps a tracked leftover with uncommitted changes, and says why", () => {
  leftovers();
  write(".claude/skills/aaw-start-work/SKILL.md", "edited\n");
  const { actions, notes } = planClean(repo, { self: "/nowhere" });
  assert.ok(!actions.some((a) => a.path === ".claude/skills/aaw-start-work"));
  assert.ok(notes.some((n) => n.path === ".claude/skills/aaw-start-work" && /uncommitted/.test(n.why)));
});

test("install writes the door and the installer, wires package.json and .gitignore, and a second run has nothing to do", () => {
  write(".agents/skills.json", '{ "sources": [] }\n');
  write("package.json", `${JSON.stringify({ name: "site", dependencies: { "@docusaurus/core": "^3.0.0" } }, null, 2)}\n`);
  git("add", "-A");
  git("commit", "-q", "-m", "init");
  const plan = planInstall(repo);
  assert.deepEqual(plan.writes.map((w) => w.path).sort(), ["scripts/architecture.mjs", "scripts/skills.mjs"]);
  assert.deepEqual(plan.ignore, [".agents/skills/", ".agents/.skill-sources/", ".claude/skills/"]);
  applyInstall(repo, plan, () => {});
  const pkg = JSON.parse(fs.readFileSync(path.join(repo, "package.json"), "utf8"));
  assert.equal(pkg.scripts.prebuild, "node scripts/architecture.mjs regenerate");
  assert.equal(pkg.scripts.build, "docusaurus build");
  assert.equal(pkg.scripts.skills, "node scripts/skills.mjs sync --locked --copy");
  assert.match(fs.readFileSync(path.join(repo, "scripts/architecture.mjs"), "utf8"), /const INSTALLER = "scripts\/skills\.mjs";/);
  const again = planInstall(repo);
  assert.equal(again.writes.length + Object.keys(again.scripts).length + again.ignore.length, 0);
});

test("install keeps what it did not write unless forced, and uses the installer the repository already runs", () => {
  write(".agents/skills.json", '{ "sources": [] }\n');
  write("tools/scripts/skills.mjs", "// an installer copy\n");
  write("scripts/architecture.mjs", "// someone else's\n");
  write("package.json", JSON.stringify({ scripts: { "skills:install": "node tools/scripts/skills.mjs sync --locked", prebuild: "echo mine" } }));
  const plan = planInstall(repo);
  assert.ok(!plan.writes.some((w) => w.path === "scripts/architecture.mjs"));
  assert.ok(plan.notes.some((n) => n.path === "scripts/architecture.mjs"));
  assert.ok(plan.notes.some((n) => /script "prebuild" is "echo mine"/.test(n.why)));
  assert.equal(plan.scripts.skills, "node tools/scripts/skills.mjs sync --locked --copy");
  const forced = planInstall(repo, { force: true });
  assert.ok(forced.writes.some((w) => w.path === "scripts/architecture.mjs" && w.content.includes(SHIM_MARK)));
  assert.equal(forced.scripts.prebuild, "node scripts/architecture.mjs regenerate");
});

test("install without a declaration stops, and --declare writes one at the tag given", () => {
  assert.match(planInstall(repo).problems[0], /declares no skills/);
  const w = planInstall(repo, { declare: "v0.6.0" }).writes.find((x) => x.path === ".agents/skills.json");
  assert.equal(JSON.parse(w.content).sources[0].ref, "v0.6.0");
});

test("without the skill installed, the door script says so in one line and exits 0 for every command but reinit", () => {
  write(".agents/skills.json", '{ "sources": [] }\n');
  write("package.json", "{}\n");
  applyInstall(repo, planInstall(repo), () => {});
  for (const cmd of ["check", "regenerate", "doctor"]) {
    const r = run(["scripts/architecture.mjs", cmd]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, new RegExp(`^${cmd} skipped: the workspace skill is not installed`));
  }
});

test("regenerate writes the portfolio's inventory page when it is bound and the portfolio skill is installed", () => {
  write(".agents/skill-bindings.toml", '[suite.portfolio]\ninventory = "../docs/portfolio.md"\n');
  // A stand-in for the portfolio skill: it records how it was run, where the real one writes the page.
  write(".agents/skills/portfolio/scripts/portfolio.py",
    "import os, sys\nos.makedirs('docs', exist_ok=True)\nopen('docs/portfolio.md', 'w').write(' '.join(sys.argv[1:]) + '\\n')\n");
  const lines = [];
  const err = console.error;
  console.error = (m) => lines.push(m);
  try {
    assert.equal(regenerate(repo, { env: {} }), 0);
  } finally {
    console.error = err;
  }
  assert.equal(fs.readFileSync(path.join(repo, "docs", "portfolio.md"), "utf8"), "inventory\n");
  assert.ok(!lines.some((l) => l.startsWith("inventory skipped")), lines.join("\n"));
});

test("with the skill but none of the others, regenerate and check skip each step in one line and exit 0", () => {
  write(".agents/skill-bindings.toml", '[suite.architecture]\nroot = "../docs"\n[suite.use-case]\noutputDir = "../docs/uc"\n[suite.workspace]\ndecks = "../static/decks"\n');
  fs.mkdirSync(path.join(repo, "docs", "uc"), { recursive: true });
  const lines = [];
  const err = console.error;
  console.error = (m) => lines.push(m);
  try {
    assert.equal(regenerate(repo, { env: {} }), 0);
    assert.equal(check(repo), 0);
    assert.equal(regenerate(repo, { env: { REGENERATE: "0" } }), 0);
  } finally {
    console.error = err;
  }
  assert.deepEqual(lines, [
    "diagram regeneration skipped: the pattern and model skills are not installed",
    "inventory skipped: no inventory page is bound ([suite.portfolio] inventory)",
    "deck publishing skipped: the markdown-deck skill is not installed",
    "continuum check skipped: the architecture skill is not installed",
    "cross-reference check skipped: the cross-reference skill is not installed",
    "regeneration skipped: REGENERATE=0",
  ]);
});

test("init --dry-run prints the plan and changes nothing", () => {
  leftovers();
  write(".agents/skills.json", '{ "sources": [] }\n');
  git("add", "-A");
  git("commit", "-q", "-m", "declare");
  write(".agents/skills/old-skill/SKILL.md", "x\n");
  const before = status();
  const r = run([CLI, "init", "--dry-run", "--repo", repo]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /would remove \.claude\/skills\/aaw-start-work/);
  assert.match(r.stdout, /would write scripts\/architecture\.mjs/);
  assert.equal(status(), before);
  assert.ok(fs.existsSync(path.join(repo, ".agents/skills/old-skill")));
});

test("an old aaa- skill is retired unless the lock still installs it", () => {
  write(".gitignore", ".agents/skills/\n");
  write(".agents/skills.lock.json", JSON.stringify({ lockfile: 1, skills: { "aaa-rung": { version: "0.5.3" } } }));
  git("add", "-A");
  git("commit", "-q", "-m", "init");
  write(".agents/skills/aaa-create-abb/SKILL.md", "x\n");
  write(".agents/skills/aaa-rung/SKILL.md", "x\n");
  const why = Object.fromEntries(planClean(repo, { self: "/nowhere" }).actions.map((a) => [a.path, a.why]));
  assert.match(why[".agents/skills/aaa-create-abb"], /folded into the architecture skill/);
  assert.match(why[".agents/skills/aaa-rung"], /a retired skill; install puts it back only if the declared release still has it/);
});

test("a lock the declaration has moved past is found, so install rewrites it rather than installing the old commits", () => {
  const B = "https://example.org/architecture-continuum.git";
  const R = "https://example.org/markdown-deck.git";
  write(".agents/skills.lock.json", JSON.stringify({ lockfile: 1, skills: {
    "aaa-rung": { source: "bundle", bundle: B, bundleRef: "v0.5.0", ref: null },
    "markdown-deck": { source: R, ref: "markdown-deck--v0.6.8", path: "skills/markdown-deck" },
  } }));
  const declare = (bundleRef, deckRef) => write(".agents/skills.json", JSON.stringify({ sources: [
    { bundle: B, ref: bundleRef },
    { repo: R, ref: deckRef, path: "skills/markdown-deck", name: "markdown-deck" },
  ] }));
  declare("v0.5.0", "markdown-deck--v0.6.8");
  assert.deepEqual(lockMismatches(repo), []);
  declare("v0.6.0", "markdown-deck--v0.6.8");
  assert.deepEqual(lockMismatches(repo), [`${B} at v0.6.0`]);
  declare("v0.6.0", "6e8e180");
  assert.deepEqual(lockMismatches(repo), [`${B} at v0.6.0`, "markdown-deck at 6e8e180"]);
});
