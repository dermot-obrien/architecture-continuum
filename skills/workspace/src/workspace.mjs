// SPDX-FileCopyrightText: 2026 Dermot O'Brien
// SPDX-License-Identifier: Apache-2.0
/**
 * workspace: initialise or reinitialise a repository that uses the architecture skills.
 *
 * clean     removes what retired tooling left behind, and the installed copies the installer puts back
 * install   writes the repository's two scripts, wires package.json and .gitignore, installs the skills
 * regenerate  diagrams and decks from the pages, each step skipped in one line when its skill is absent
 * check     the continuum and cross-reference checks, each skipped when its skill is absent
 * build     the Docusaurus build, which runs regenerate as npm's prebuild
 * init      clean, install, build
 * doctor    what is declared, installed, wired and left over; read-only
 *
 * Every change is planned before it is made, so a dry run prints exactly what a real run does.
 * Nothing is deleted that git cannot give back or the installer cannot put back: an untracked file
 * that is not ignored, and a tracked file with uncommitted changes, are reported and kept.
 * Zero dependencies; Node 18+ and git.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Read at load, so a clean that removes installed copies cannot take the assets from under a run.
const readAsset = (...p) => fs.readFileSync(path.join(SKILL_DIR, ...p), "utf8");
export const RETIRED = JSON.parse(readAsset("references", "retired.json"));
const SHIM = readAsset("assets", "architecture.mjs");
const INSTALLER = readAsset("assets", "skills.mjs");
export const SHIM_PATH = "scripts/architecture.mjs";
export const SHIM_MARK = "Written by the workspace skill";
export const INSTALLER_MARK = "Copied from dermot-obrien/ai-assisted-work bin/skills.mjs";
const IGNORES = [".agents/skills/", ".agents/.skill-sources/", ".claude/skills/"];

const posix = (p) => p.split(path.sep).join("/");
const exists = (p) => fs.existsSync(p);
const lexists = (p) => {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
};

// ------------------------------------------------------------------ bindings

/**
 * The tables of a TOML file as { "a.b": { key: value } }, for the string, boolean and
 * string-array values a bindings file uses here. An array of tables is read past, and a
 * multi-line string skipped, since neither holds a key this skill reads.
 */
export function readToml(text) {
  const out = {};
  let table = (out[""] = {});
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("#")) continue;
    if (t.startsWith("[[")) {
      table = {};
      continue;
    }
    const h = /^\[\s*([^\]]+?)\s*\]$/.exec(t);
    if (h) {
      table = out[h[1]] ??= {};
      continue;
    }
    const m = /^([A-Za-z0-9_-]+)\s*=\s*(.*)$/.exec(t);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"""') || v.startsWith("'''")) {
      const q = v.slice(0, 3);
      if (!v.slice(3).includes(q)) while (i + 1 < lines.length && !lines[++i].includes(q));
      continue;
    }
    if (v.startsWith("[")) {
      let buf = v;
      while (!buf.includes("]") && i + 1 < lines.length) buf += " " + lines[++i].trim();
      table[m[1]] = [...buf.matchAll(/"([^"]*)"|'([^']*)'/g)].map((x) => x[1] ?? x[2]);
      continue;
    }
    if (v[0] === '"' || v[0] === "'") v = v.slice(1, v.indexOf(v[0], 1));
    else {
      v = v.replace(/\s+#.*$/, "");
      v = v === "true" ? true : v === "false" ? false : v;
    }
    table[m[1]] = v;
  }
  return out;
}

/** The repository's bindings, with paths resolved against the file's directory, or null. */
export function loadBindings(repo) {
  const file = path.join(repo, ".agents", "skill-bindings.toml");
  if (!exists(file)) return null;
  const tables = readToml(fs.readFileSync(file, "utf8"));
  const dir = path.dirname(file);
  return { file, dir, tables, suite: (s) => tables[`suite.${s}`] ?? {}, resolve: (p) => path.resolve(dir, p) };
}

// ------------------------------------------------------------------ git

const git = (repo, args) => spawnSync("git", ["-C", repo, ...args], { encoding: "utf8" });
export const isGitRepo = (repo) => git(repo, ["rev-parse", "--is-inside-work-tree"]).stdout?.trim() === "true";
const tracked = (repo, rel) => (git(repo, ["ls-files", "-z", "--", rel]).stdout || "").length > 0;
const ignored = (repo, rel) => git(repo, ["check-ignore", "-q", "--", rel]).status === 0;
const changed = (repo, rel) => (git(repo, ["status", "--porcelain", "--", rel]).stdout || "").trim().length > 0;
const gitDir = (repo) => path.resolve(repo, git(repo, ["rev-parse", "--git-dir"]).stdout.trim());

// ------------------------------------------------------------------ reading the repository

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};
const glob = (pattern) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

/** The submodule paths .gitmodules lists. */
function submodulePaths(repo) {
  const file = path.join(repo, ".gitmodules");
  return exists(file) ? [...fs.readFileSync(file, "utf8").matchAll(/^\s*path\s*=\s*(.+?)\s*$/gm)].map((m) => m[1]) : [];
}

/** The installer the repository already runs from package.json, or the default path. */
export function installerPath(repo) {
  const pkg = readJson(path.join(repo, "package.json"));
  for (const v of Object.values(pkg?.scripts ?? {})) {
    const m = /\bnode\s+(\S*skills\.mjs)\b/.exec(v);
    if (m && exists(path.join(repo, m[1]))) return posix(m[1]);
  }
  return "scripts/skills.mjs";
}

/** The scripts a script reaches through npm run, itself included, with npm's pre and post hooks. */
function reach(scripts, name, seen = new Set()) {
  if (seen.has(name) || !(name in scripts)) return seen;
  seen.add(name);
  for (const hook of [`pre${name}`, `post${name}`]) reach(scripts, hook, seen);
  for (const m of scripts[name].matchAll(/\bnpm\s+run(?:-script)?\s+([^\s&|;]+)/g)) reach(scripts, m[1], seen);
  return seen;
}

/** Scripts that call an installed skill directly, so they fail on a clone without the skills. */
export function directSkillScripts(pkg) {
  const scripts = pkg?.scripts ?? {};
  const direct = Object.keys(scripts).filter((k) => /\.agents[\\/]skills[\\/]/.test(scripts[k]));
  const fromBuild = reach(scripts, "build");
  return direct.map((name) => ({ name, inBuild: fromBuild.has(name) }));
}

// ------------------------------------------------------------------ clean

/**
 * Remove a top-level key and the indented block under it from YAML text, keeping every other
 * line, comments included. Returns null when the key is not there.
 */
export function removeTopLevelKey(text, key) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const head = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*(#.*)?$`);
  const out = [];
  let skipping = false;
  let removed = false;
  for (const line of lines) {
    if (skipping) {
      if (line.trim() === "" || /^\s/.test(line)) continue;
      skipping = false;
    }
    if (head.test(line)) {
      skipping = removed = true;
      continue;
    }
    out.push(line);
  }
  return removed ? out.join("\n").replace(/^\n+/, "") : null;
}

/**
 * What clean would do: { actions, notes }. An action is { op, path, why } with op one of rm (a
 * file or folder git does not track), git-rm (tracked and unchanged, so git gives it back),
 * submodule, or edit (with the new text). A note is something to know or to do by hand.
 */
export function planClean(repo, { self = SKILL_DIR } = {}) {
  const actions = [];
  const notes = [];
  const selfReal = exists(self) ? fs.realpathSync(self) : self;
  const lock = readJson(path.join(repo, ".agents", "skills.lock.json"))?.skills ?? {};
  const remove = (rel, why) => {
    if (tracked(repo, rel)) {
      if (changed(repo, rel)) notes.push({ path: rel, why: `${why}, but it has uncommitted changes: commit or discard them, then clean again` });
      else actions.push({ op: "git-rm", path: rel, why });
    } else if (ignored(repo, rel)) actions.push({ op: "rm", path: rel, why });
    else return false;
    return true;
  };

  // 1. Framework clones, as submodules or as plain folders.
  const listed = submodulePaths(repo);
  for (const s of RETIRED.submodules) {
    if (listed.includes(s.path)) actions.push({ op: "submodule", path: s.path, why: s.why });
    else if (lexists(path.join(repo, s.path)) && !remove(s.path, s.why)) {
      // Untracked and not ignored: it may be a clone with work in it, so it is for a person to delete.
      notes.push({ path: s.path, why: `${s.why}; untracked and not ignored, so it is kept: delete it once nothing in it is needed` });
    }
  }

  // 2. Skill folders: retired skills, links to nothing, and installed copies.
  for (const dir of RETIRED.skillDirs) {
    const abs = path.join(repo, dir);
    if (!exists(abs)) continue;
    for (const name of fs.readdirSync(abs).sort()) {
      const rel = `${dir}/${name}`;
      const full = path.join(abs, name);
      const st = fs.lstatSync(full);
      if (st.isSymbolicLink() && !exists(full)) {
        actions.push({ op: "rm", path: rel, why: "a link to a skill that is not there" });
        continue;
      }
      if (fs.realpathSync(full) === selfReal) {
        notes.push({ path: rel, why: "kept: this run is using it, and install refreshes it" });
        continue;
      }
      const retired = !lock[name] && RETIRED.skills.find((r) => glob(r.pattern).test(name));
      if (retired) {
        if (!remove(rel, retired.why)) actions.push({ op: "rm", path: rel, why: retired.why });
        continue;
      }
      if (tracked(repo, rel)) continue; // the repository's own skill, or a copy it commits
      if (ignored(repo, rel)) {
        const retiredName = RETIRED.skills.some((r) => glob(r.pattern).test(name));
        actions.push({
          op: "rm",
          path: rel,
          why: !lock[name] ? "an installed copy the lock does not name; install puts it back if .agents/skills.json declares it"
            : retiredName ? "an installed copy of a retired skill; install puts it back only if the declared release still has it"
            : "an installed copy; install puts it back from the lock",
        });
      } else {
        notes.push({ path: rel, why: "an untracked skill folder that is neither declared nor ignored: declare it in .agents/skills.json, commit it, or delete it" });
      }
    }
  }

  // 3. Blocks of configuration the framework installers wrote.
  for (const c of RETIRED.configBlocks) {
    const abs = path.join(repo, c.file);
    if (!exists(abs)) continue;
    const next = removeTopLevelKey(fs.readFileSync(abs, "utf8"), c.key);
    if (next === null) continue;
    if (tracked(repo, c.file) && changed(repo, c.file)) {
      notes.push({ path: c.file, why: `its ${c.key} block is ${c.why}, but the file has uncommitted changes` });
    } else if (next.split("\n").every((l) => !l.trim() || l.trim().startsWith("#"))) {
      actions.push({ op: tracked(repo, c.file) ? "git-rm" : "rm", path: c.file, why: `nothing but its ${c.key} block, ${c.why}` });
    } else actions.push({ op: "edit", path: c.file, why: `remove its ${c.key} block: ${c.why}`, text: next });
  }

  // 4. Build output, when git ignores it.
  for (const g of RETIRED.generated) {
    if (exists(path.join(repo, g.path)) && !tracked(repo, g.path) && ignored(repo, g.path)) actions.push({ op: "rm", path: g.path, why: g.why });
  }

  // 5. Things clean does not change, because they are someone's decision.
  const settings = readJson(path.join(repo, ".claude", "settings.json"));
  const commands = [];
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) k === "command" && typeof x === "string" ? commands.push(x) : walk(x);
  };
  walk(settings?.hooks);
  for (const cmd of commands) {
    for (const h of RETIRED.hookPatterns) {
      if (new RegExp(h.pattern).test(cmd)) notes.push({ path: ".claude/settings.json", why: `a hook ${h.why}: ${cmd}` });
    }
  }
  const pkg = readJson(path.join(repo, "package.json"));
  for (const s of directSkillScripts(pkg)) {
    notes.push({
      path: "package.json",
      why: `script "${s.name}" calls an installed skill directly, so it fails on a clone without the skills${s.inBuild ? ", and npm run build runs it" : ""}; run it through ${SHIM_PATH}, or bind its folders under [suite.workspace] and let regenerate do it`,
    });
  }
  for (const src of readJson(path.join(repo, ".agents", "skills.json"))?.sources ?? []) {
    if (["main", "master", "HEAD"].includes(src.ref)) notes.push({ path: ".agents/skills.json", why: `${src.bundle || src.repo} is declared at ${src.ref}; pin a release tag` });
  }
  return { actions, notes };
}

export function applyClean(repo, actions, log = console.log) {
  for (const a of actions) {
    const abs = path.join(repo, a.path);
    if (a.op === "rm") fs.rmSync(abs, { recursive: true, force: true });
    else if (a.op === "git-rm") {
      const r = git(repo, ["rm", "-r", "-q", "--", a.path]);
      if (r.status !== 0) throw new Error(`git rm ${a.path}: ${r.stderr.trim()}`);
      fs.rmSync(abs, { recursive: true, force: true });
    } else if (a.op === "submodule") {
      git(repo, ["submodule", "deinit", "-f", "-q", "--", a.path]);
      if (tracked(repo, a.path)) {
        const r = git(repo, ["rm", "-f", "-q", "--", a.path]);
        if (r.status !== 0) throw new Error(`git rm ${a.path}: ${r.stderr.trim()}`);
      }
      fs.rmSync(path.join(gitDir(repo), "modules", a.path), { recursive: true, force: true });
      fs.rmSync(abs, { recursive: true, force: true });
      const gm = path.join(repo, ".gitmodules");
      if (exists(gm) && !fs.readFileSync(gm, "utf8").trim()) {
        if (tracked(repo, ".gitmodules")) git(repo, ["rm", "-f", "-q", "--", ".gitmodules"]);
        fs.rmSync(gm, { force: true });
      }
    } else if (a.op === "edit") fs.writeFileSync(abs, a.text);
    log(`  ${a.op === "edit" ? "edited " : "removed"} ${a.path}: ${a.why}`);
  }
}

// ------------------------------------------------------------------ install

/** The two scripts the repository carries, with the installer path the shim names. */
export function repoScripts(repo) {
  const installer = installerPath(repo);
  return [
    { path: installer, content: INSTALLER, mark: INSTALLER_MARK, why: "the skill installer" },
    { path: SHIM_PATH, content: SHIM.replace("__INSTALLER__", installer), mark: SHIM_MARK, why: "the door to the skills, quiet when they are missing" },
  ];
}

export const wantedScripts = (installer) => ({
  skills: `node ${installer} sync --locked --copy`,
  "skills:check": `node ${installer} check`,
  "check:architecture": `node ${SHIM_PATH} check`,
  regenerate: `node ${SHIM_PATH} regenerate`,
  prebuild: `node ${SHIM_PATH} regenerate`,
  reinit: `node ${SHIM_PATH} reinit`,
});

/**
 * What install would change: { writes, scripts, ignore, notes, problems }. An existing file or
 * script is replaced only when the skill wrote it (its mark is there), or with force.
 */
export function planInstall(repo, { force = false, declare = null } = {}) {
  const writes = [];
  const notes = [];
  const problems = [];
  const decl = path.join(repo, ".agents", "skills.json");
  if (!exists(decl)) {
    if (declare) {
      writes.push({ path: ".agents/skills.json", content: `${JSON.stringify({ sources: [{ bundle: "https://github.com/dermot-obrien/architecture-continuum.git", ref: declare }] }, null, 2)}\n`, why: `declares the architecture-continuum bundle at ${declare}` });
    } else problems.push(".agents/skills.json declares no skills: write it, or pass --declare vX.Y.Z to declare the architecture-continuum bundle at that release");
  }
  for (const f of repoScripts(repo)) {
    const abs = path.join(repo, f.path);
    if (!exists(abs)) writes.push({ ...f, why: `${f.why} (new)` });
    else {
      const now = fs.readFileSync(abs, "utf8");
      if (now === f.content) continue;
      if (force || now.includes(f.mark)) writes.push({ ...f, why: `${f.why} (updated)` });
      else notes.push({ path: f.path, why: "exists and the skill did not write it; kept (--force replaces it)" });
    }
  }

  const pkgFile = path.join(repo, "package.json");
  const pkg = readJson(pkgFile);
  const scripts = {};
  if (!pkg) notes.push({ path: "package.json", why: "none, so there is no site to build and no npm scripts to wire" });
  else {
    const have = pkg.scripts ?? {};
    for (const [k, v] of Object.entries(wantedScripts(installerPath(repo)))) {
      if (have[k] === v) continue;
      if (!(k in have) || force) scripts[k] = v;
      else notes.push({ path: "package.json", why: `script "${k}" is "${have[k]}"; the skill's is "${v}" (--force replaces it)` });
    }
    const docusaurus = { ...pkg.dependencies, ...pkg.devDependencies }["@docusaurus/core"];
    const buildDirect = directSkillScripts(pkg).some((s) => s.inBuild);
    if (docusaurus && (!have.build || (force && buildDirect))) scripts.build = "docusaurus build";
  }

  const ignore = [];
  if (isGitRepo(repo)) {
    for (const dir of IGNORES) {
      if (tracked(repo, dir)) continue;
      if (!ignored(repo, `${dir}probe`)) ignore.push(dir);
    }
  }
  return { writes, scripts, ignore, notes, problems, pkgFile, pkg };
}

export function applyInstall(repo, plan, log = console.log) {
  for (const w of plan.writes) {
    const abs = path.join(repo, w.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, w.content);
    log(`  wrote   ${w.path}: ${w.why}`);
  }
  if (plan.pkg && Object.keys(plan.scripts).length) {
    const text = fs.readFileSync(plan.pkgFile, "utf8");
    const indent = /^(\s+)"/m.exec(text)?.[1] ?? "  ";
    plan.pkg.scripts = { ...plan.pkg.scripts, ...plan.scripts };
    fs.writeFileSync(plan.pkgFile, `${JSON.stringify(plan.pkg, null, indent)}\n`);
    for (const [k, v] of Object.entries(plan.scripts)) log(`  script  ${k}: ${v}`);
  }
  if (plan.ignore.length) {
    const gi = path.join(repo, ".gitignore");
    const before = exists(gi) ? fs.readFileSync(gi, "utf8") : "";
    const block = `${before && !before.endsWith("\n") ? "\n" : ""}${before ? "\n" : ""}# Installed skills and the installer's clones; .agents/skills.json and its lock are committed\n${plan.ignore.join("\n")}\n`;
    fs.writeFileSync(gi, before + block);
    log(`  ignored ${plan.ignore.join(", ")}`);
  }
}

/** Run the repository's installer: the locked commits when there is a lock. */
/**
 * The declared sources the lock does not record at their declared ref: a bundle or repository
 * whose ref has moved, or one added since the lock was written. Empty when the lock matches, or
 * when there is no lock or no declaration. A skill kept in a folder of the workspace is never locked.
 */
export function lockMismatches(repo) {
  const decl = readJson(path.join(repo, ".agents", "skills.json"));
  const lock = readJson(path.join(repo, ".agents", "skills.lock.json"));
  if (!decl || !lock) return [];
  const entries = Object.entries(lock.skills ?? {});
  const out = [];
  for (const src of decl.sources ?? []) {
    const ref = src.ref ?? null;
    if (src.bundle) {
      const hit = entries.some(([, e]) => e.source === "bundle" && e.bundle === src.bundle && (e.bundleRef ?? null) === ref);
      if (!hit) out.push(`${src.bundle} at ${ref ?? "its default branch"}`);
    } else if (src.repo) {
      const name = src.name ?? path.basename(src.path ?? src.repo).replace(/\.git$/, "");
      const e = lock.skills?.[name];
      if (!e || e.source !== src.repo || (e.ref ?? null) !== ref) out.push(`${name} at ${ref ?? "its default branch"}`);
    }
  }
  return out;
}

/**
 * Run the repository's installer. With a lock that matches the declaration, exactly the locked
 * commits (--locked); with no lock, or one the declaration has moved past, what the declaration
 * names, and the lock is rewritten to match.
 */
export function runInstaller(repo, { from = null, log = console.log } = {}) {
  const installer = installerPath(repo);
  const hasLock = exists(path.join(repo, ".agents", "skills.lock.json"));
  const moved = hasLock ? lockMismatches(repo) : [];
  if (moved.length) log(`  the lock does not match .agents/skills.json (${moved.join("; ")}), so the declared refs are installed and the lock rewritten`);
  const args = [path.join(repo, installer), "sync", ...(hasLock && !moved.length ? ["--locked"] : []), "--copy"];
  if (from) args.push("--from", path.resolve(from));
  log(`  running node ${installer} ${args.slice(1).join(" ")}`);
  return spawnSync(process.execPath, args, { cwd: repo, stdio: "inherit" }).status ?? 1;
}

/** Install each installed skill's npm dependencies where neither it nor the workspace has them. */
export function installSkillDependencies(repo, { log = console.log, dryRun = false } = {}) {
  const dir = path.join(repo, ".agents", "skills");
  if (!exists(dir)) return 0;
  for (const name of fs.readdirSync(dir).sort()) {
    const pkg = readJson(path.join(dir, name, "package.json"));
    const deps = Object.keys(pkg?.dependencies ?? {});
    const missing = deps.filter((d) => !exists(path.join(dir, name, "node_modules", d)) && !exists(path.join(repo, "node_modules", d)));
    if (!missing.length) continue;
    log(`  ${dryRun ? "would install" : "installing"} ${missing.join(", ")} for ${name}`);
    if (dryRun) continue;
    const r = npm(path.join(dir, name), ["install", "--omit=dev", "--no-audit", "--no-fund", "--no-package-lock"]);
    if (r.status !== 0) return r.status ?? 1;
  }
  return 0;
}

// ------------------------------------------------------------------ running things

function npm(cwd, args) {
  const cli = process.env.npm_execpath;
  if (cli && /npm-cli\.js$/.test(cli)) return spawnSync(process.execPath, [cli, ...args], { cwd, stdio: "inherit" });
  return spawnSync("npm", args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
}

const python = () => ["python3", "python", "py"].find((p) => spawnSync(p, ["--version"], { stdio: "ignore", shell: false }).status === 0) ?? null;
const skillPath = (repo, ...p) => path.join(repo, ".agents", "skills", ...p);
const skip = (what, why) => console.error(`${what} skipped: ${why}`);
/** The architecture root: [suite.architecture] root, or the old [suite.aaa-continuum] root. */
const architectureRoot = (b) => b.suite("architecture").root ?? b.suite("aaa-continuum").root;

/**
 * Regenerate what the pages derive: diagrams, their stamped exports and walkthroughs (the pattern
 * skill over the model skill), then decks and PDFs (markdown-deck). A step whose skill or binding is
 * missing is skipped in one line; a step that runs and fails returns its exit code.
 */
export function regenerate(repo, { env = process.env } = {}) {
  if (env.REGENERATE === "0") return skip("regeneration", "REGENERATE=0"), 0;
  const b = loadBindings(repo);
  if (!b) return skip("regeneration", "no .agents/skill-bindings.toml"), 0;
  const ws = b.suite("workspace");
  const run = (what, cmd, args) => {
    const r = spawnSync(cmd, args, { cwd: repo, stdio: "inherit", env });
    if (r.status !== 0) console.error(`${what} failed (exit ${r.status ?? "signal"}); fix the page it names, or build with REGENERATE=0`);
    return r.status ?? 1;
  };

  const folders = (ws.diagrams ? [].concat(ws.diagrams) : [b.suite("use-case").outputDir, b.suite("pattern").outputDir])
    .filter(Boolean)
    .map((p) => b.resolve(p))
    .filter(exists);
  const publishPy = skillPath(repo, "pattern", "scripts", "publish.py");
  const py = python();
  if (!folders.length) skip("diagram regeneration", "no use case or pattern folder is bound");
  else if (!exists(publishPy) || !exists(skillPath(repo, "model", "bin", "model.py"))) skip("diagram regeneration", "the pattern and model skills are not installed");
  else if (!py) skip("diagram regeneration", "no python on PATH");
  else {
    for (const f of folders) {
      const s = run(`diagram regeneration (${posix(path.relative(repo, f))})`, py, [publishPy, posix(path.relative(repo, f)), "--recursive", "--render", String(ws.render ?? "never"), "--no-deck"]);
      if (s) return s;
    }
  }

  const deck = skillPath(repo, "markdown-deck", "bin", "markdown-deck.mjs");
  const source = ws.deckSource ?? architectureRoot(b);
  if (!ws.decks) skip("deck publishing", "no deck folder is bound ([suite.workspace] decks)");
  else if (!source) skip("deck publishing", "no deck source is bound ([suite.workspace] deckSource, or [suite.architecture] root)");
  else if (!exists(deck)) skip("deck publishing", "the markdown-deck skill is not installed");
  else if (!exists(skillPath(repo, "markdown-deck", "node_modules"))) skip("deck publishing", "markdown-deck's packages are not installed (install installs them)");
  else {
    const pdf = env.DECK_PDF !== "0" && (ws.pdf ?? b.suite("markdown-deck").pdf) === true;
    const s = run("deck publishing", process.execPath, [deck, "publish", posix(path.relative(repo, b.resolve(source))), "--out", posix(path.relative(repo, b.resolve(ws.decks))), ...(pdf ? ["--pdf"] : [])]);
    if (s) return s;
  }
  return 0;
}

/** The continuum check and the cross-reference check, each skipped when its skill or binding is missing. */
export function check(repo, { extra = [] } = {}) {
  const b = loadBindings(repo);
  let status = 0;
  // The architecture skill, or the aaa-continuum skill it replaced where a repository still pins an older release.
  const continuum = [skillPath(repo, "architecture", "bin", "continuum.mjs"), skillPath(repo, "aaa-continuum", "bin", "continuum.mjs")].find(exists);
  if (!continuum) skip("continuum check", "the architecture skill is not installed");
  else if (!b || !architectureRoot(b)) skip("continuum check", "[suite.architecture] root is not bound");
  else status ||= spawnSync(process.execPath, [continuum, "check", "--strict", ...extra], { cwd: repo, stdio: "inherit" }).status ?? 1;
  const xref = skillPath(repo, "cross-reference", "scripts", "check.cjs");
  if (!exists(xref)) skip("cross-reference check", "the cross-reference skill is not installed");
  else if (!b || !b.tables["suite.cross-reference"]) skip("cross-reference check", "[suite.cross-reference] is not bound");
  else status ||= spawnSync(process.execPath, [xref], { cwd: repo, stdio: "inherit" }).status ?? 1;
  return status;
}

/** A clean install of the site's packages: npm ci where there is a lock, else npm install. */
export function installSitePackages(repo, { log = console.log } = {}) {
  if (!exists(path.join(repo, "package.json"))) return 0;
  const ci = exists(path.join(repo, "package-lock.json")) ? ["ci", "--no-audit", "--no-fund"] : ["install", "--no-audit", "--no-fund"];
  log(`  running npm ${ci[0]}`);
  return npm(repo, ci).status ?? 1;
}

/** The site's build: a clean install of its packages when asked or missing, then npm run build. */
export function build(repo, { fresh = false, log = console.log } = {}) {
  if (!exists(path.join(repo, "package.json"))) return log("  build skipped: no package.json"), 0;
  if (fresh || !exists(path.join(repo, "node_modules"))) {
    const s = installSitePackages(repo, { log });
    if (s) return s;
  }
  log("  running npm run build");
  return npm(repo, ["run", "build"]).status ?? 1;
}

// ------------------------------------------------------------------ doctor

export function doctor(repo, log = console.log) {
  const decl = readJson(path.join(repo, ".agents", "skills.json"));
  const lock = readJson(path.join(repo, ".agents", "skills.lock.json"))?.skills ?? {};
  const installedDir = path.join(repo, ".agents", "skills");
  const installed = exists(installedDir) ? fs.readdirSync(installedDir).filter((n) => exists(path.join(installedDir, n, "SKILL.md"))) : [];
  log(`repository   ${repo}${isGitRepo(repo) ? "" : " (not a git repository: clean needs git)"}`);
  log(`declared     ${decl ? `${decl.sources?.length ?? 0} source(s) in .agents/skills.json` : "nothing: .agents/skills.json is missing"}`);
  log(`locked       ${Object.keys(lock).length} skill(s)`);
  const missing = Object.keys(lock).filter((n) => !installed.includes(n));
  log(`installed    ${installed.length} skill(s)${missing.length ? `; locked but not installed: ${missing.join(", ")}` : ""}`);
  const ins = planInstall(repo);
  const wiring = [...ins.writes.map((w) => `${w.path} ${w.why}`), ...Object.entries(ins.scripts).map(([k, v]) => `package.json script ${k}: ${v}`), ...ins.ignore.map((i) => `.gitignore ${i}`)];
  log(`install      ${wiring.length ? `would change ${wiring.length} thing(s):` : "nothing to change"}`);
  for (const w of wiring) log(`  ${w}`);
  const { actions, notes } = isGitRepo(repo) ? planClean(repo) : { actions: [], notes: [] };
  log(`clean        ${actions.length ? `would remove or edit ${actions.length} thing(s):` : "nothing left over"}`);
  for (const a of actions) log(`  ${a.op.padEnd(9)} ${a.path}: ${a.why}`);
  const all = [...ins.problems.map((p) => ({ path: "", why: p })), ...ins.notes, ...notes];
  if (all.length) log("to know or do by hand:");
  for (const n of all) log(`  ${n.path ? `${n.path}: ` : ""}${n.why}`);
  const py = python();
  log(`tools        node ${process.versions.node}; ${py ? `${py}${spawnSync(py, ["-c", "import yaml"], { stdio: "ignore" }).status === 0 ? " with PyYAML" : " without PyYAML (pip install pyyaml, for the model skill)"}` : "no python (the pattern and model skills need it)"}`);
  return { actions, notes: all, wiring };
}
