# Quick start

From an empty folder to a derived capability stage in about ten minutes. You will install the skills into a scratch workspace, seed a starter capability model, bind the skills to folders, and have `/architecture stage` tell you how far each capability has been defined and what blocks the next step. Then you hand the workspace to your agent.

Every command below works as written in PowerShell and in bash. Where the two shells differ, both forms are given. On macOS and Linux use the bash form, and type `python3` where it says `python`.

## 0. Check the prerequisites

You need git, Node.js 18 or later and Python 3.11 or later. draw.io desktop is only needed later, when a skill exports diagrams to PNG.

```bash
git --version
node --version
python --version
```

You should see three version numbers, with Node at `v18` or above and Python at `3.11` or above. If `python` is not found on Windows, try `py -3 --version` and use `py -3` wherever this guide says `python`.

## 1. Make a scratch workspace

A workspace is any folder your agent opens. A git repository is detected as the workspace root, so initialise one inside a folder that will also hold the two clones.

```powershell
mkdir architecture-quickstart
cd architecture-quickstart
mkdir workspace
cd workspace
git init
```

```bash
mkdir -p architecture-quickstart/workspace && cd architecture-quickstart/workspace
git init
```

If you use Claude Code, also create its folder now, so the installer links the skills into it (`mkdir .claude`). Other agents need nothing extra.

## 2. Get the repositories

The skills come from this repository, and the installer that copies them into a workspace, `bin/skills.mjs`, from AI-Assisted Work (AAW). Clone both beside the workspace. The commands are the same in both shells.

```bash
git clone https://github.com/dermot-obrien/ai-assisted-work ../ai-assisted-work
git clone https://github.com/dermot-obrien/ai-assisted-architecture ../ai-assisted-architecture
```

## 3. Install the skills

```bash
node ../ai-assisted-work/bin/skills.mjs install --bundle ../ai-assisted-architecture
```

It prints one line per skill:

```text
installed architecture 0.7.0 from bundle ai-assisted-architecture (.claude/skills linked)
installed workspace 0.1.0 from bundle ai-assisted-architecture (.claude/skills linked)
```

You now have the two skills in `.agents/skills/` and a lock file, `.agents/skills.lock.json`, recording where they came from. The architecture skill is complete on its own: it carries the standards it reads and its own binding resolver. `(.claude/skills linked)` appears only when you created `.claude`.

## 4. Seed a starter model

The foundation catalogue is optional content that no skill needs, but it gives `/architecture stage` something to report on. Copy its `core` profile into the workspace:

```bash
node ../ai-assisted-architecture/scripts/seed-foundation.mjs --workspace .
```

It ends with:

```text
  seed complete — capabilities: 7, ABBs: 3, SBBs: 0
```

You now have `capabilities/` with seven capabilities and the capability model files, and `building-blocks/` with three ABBs.

## 5. Bind the skill to folders

The skill has no default location for what it writes. You say where each kind of artefact
lives in one table of `.agents/skill-bindings.toml`, and paths resolve against that file's folder. This
layout matches what the seed created, plus folders for the kinds the seed does not include.

```powershell
mkdir strategy/outcomes, strategy/use-cases, platforms, contexts, runtime/services, decisions, considerations, patterns
@'
[suite.architecture]
outcomeDir       = "../strategy/outcomes"
useCaseDir       = "../strategy/use-cases"
platformDir      = "../platforms"
capabilityDir    = "../capabilities"
contextDir       = "../contexts"
abbDir           = "../building-blocks/architecture-building-blocks"
sbbDir           = "../building-blocks/solution-building-blocks"
serviceDir       = "../runtime/services"
decisionDir      = "../decisions"
considerationDir = "../considerations"
patternDir       = "../patterns"
'@ | Set-Content -Encoding ascii .agents/skill-bindings.toml
```

```bash
mkdir -p strategy/outcomes strategy/use-cases platforms contexts runtime/services decisions considerations patterns
cat > .agents/skill-bindings.toml <<'EOF'
[suite.architecture]
outcomeDir       = "../strategy/outcomes"
useCaseDir       = "../strategy/use-cases"
platformDir      = "../platforms"
capabilityDir    = "../capabilities"
contextDir       = "../contexts"
abbDir           = "../building-blocks/architecture-building-blocks"
sbbDir           = "../building-blocks/solution-building-blocks"
serviceDir       = "../runtime/services"
decisionDir      = "../decisions"
considerationDir = "../considerations"
patternDir       = "../patterns"
EOF
```

In PowerShell 5.1, write these files with `-Encoding ascii` as shown. The default UTF-8
encoding there adds a byte order mark, and the TOML reader rejects a bindings file that starts
with one.

## 6. Check the installation

Each skill ships a post-install check. Run them the way an installer does:

```bash
node ../ai-assisted-architecture/scripts/validate-bundle.mjs --run-checks . ../ai-assisted-architecture
```

You should see two `ok` lines. Each also prints `warning: .aaa-config.yaml: not found`, which is harmless: the file is optional and only sets a workspace ontology schema (see [Configuration](configuration.md#aaa-configyaml)).

```text
  ok   architecture: node bin/check.mjs exited 0
        warning: .aaa-config.yaml: not found in <workspace>, so no workspace ontology schema is set. ...
        architecture: ok
  ok   workspace: node bin/check.mjs exited 0
        ...
        workspace: ok
```

Ask one flow what it will use. This is the first thing every create flow runs in your agent:

```bash
node .agents/skills/architecture/bin/check.mjs --flow abb --json
```

It prints one JSON object: `status` (`ok`), the `bindingsFile`, each binding (`abbDir`, `contextDir`, `capabilityDir`) as an absolute path, and any `problems` and `warnings`.

## 7. Derive the stages of the starter model

```bash
python .agents/skills/architecture/bin/stage.py
```

```text
Capability  Flow  Stage            Recorded  Blocking the next stage
----------  ----  ---------------  --------  ----------------------
CAP-001     -     R0 Unrecognised            CAP-001 names no demand: add required_by_outcomes, or record demand_assumption
CAP-002     -     R0 Unrecognised            CAP-002 names no demand: add required_by_outcomes, or record demand_assumption
CAP-003     -     R0 Unrecognised            CAP-003 names no demand: add required_by_outcomes, or record demand_assumption
CAP-004     -     R1 Named                   ABB-001 does not declare requires (an empty list is enough) (+3 more)
CAP-005     -     R1 Named                   ABB-001 does not declare requires (an empty list is enough) (+3 more)
CAP-006     -     R1 Named                   ABB-002 does not declare requires (an empty list is enough) (+3 more)
CAP-007     -     R1 Named                   ABB-003 does not declare requires (an empty list is enough) (+3 more)
```

That is your first real result. Each row is a capability, the stage it has earned from the
documents that exist, and the specific thing stopping it from moving up. The seed is
deliberately incomplete, so there is work to do. [Concepts](concepts.md#the-definition-ladder)
explains the stages.

## 8. Add a capability of your own

Here is a tiny capability document. It claims its one flow is already at R2. It carries only
the fields the ladder reads; a document written by `/architecture capability` carries the full
set the capability standard requires.

```powershell
mkdir capabilities/CAP-100
@'
---
id: CAP-100
kind: capability
title: Order Notifications
level: L1
status: draft
description: Tell each customer when their order ships and when it arrives.
demand_assumption: Customer service asked for fewer where-is-my-order calls.
flows:
  - id: shipping
    name: Shipping update
    stage: R2
---

# Order Notifications
'@ | Set-Content -Encoding ascii capabilities/CAP-100/index.md
```

```bash
mkdir -p capabilities/CAP-100
cat > capabilities/CAP-100/index.md <<'EOF'
---
id: CAP-100
kind: capability
title: Order Notifications
level: L1
status: draft
description: Tell each customer when their order ships and when it arrives.
demand_assumption: Customer service asked for fewer where-is-my-order calls.
flows:
  - id: shipping
    name: Shipping update
    stage: R2
---

# Order Notifications
EOF
```

Derive it, with every blocker, then check the claim. The first command prints:

```bash
python .agents/skills/architecture/bin/stage.py CAP-100 -v
python .agents/skills/architecture/bin/stage.py CAP-100 --check
```

```text
Capability  Flow         Stage     Recorded    Blocking the next stage
----------  -----------  --------  ----------  ----------------------
CAP-100     (all flows)  R1 Named              CAP-100 names no ABB in realised_by_abbs
                                               no consideration affects CAP-100 or its ABBs, and it does not declare open_questions: none
            shipping     R1 Named  R2 claimed  CAP-100 names no ABB in realised_by_abbs
                                               no consideration affects CAP-100 or its ABBs, and it does not declare open_questions: none
```

The capability is R1 Named: it has a level, a purpose and a demand. The recorded R2 is marked
`claimed` because the evidence does not back it, and `--check` exits with code 1, which is
how a CI job would catch it.

## 9. Earn R2

R2 needs a named building block that declares what it requires, and either a consideration
or an explicit statement that there are no open questions. Add a minimal ABB and link it.

```powershell
mkdir building-blocks/architecture-building-blocks/ABB-100
@'
---
id: ABB-100
kind: abb
title: Notification Dispatcher
status: draft
requires: []
---

# Notification Dispatcher
'@ | Set-Content -Encoding ascii building-blocks/architecture-building-blocks/ABB-100/index.md
(Get-Content capabilities/CAP-100/index.md) -replace '^(demand_assumption:.*)$', "`$1`nrealised_by_abbs: [ABB-100]`nopen_questions: none" | Set-Content -Encoding ascii capabilities/CAP-100/index.md
```

```bash
mkdir -p building-blocks/architecture-building-blocks/ABB-100
cat > building-blocks/architecture-building-blocks/ABB-100/index.md <<'EOF'
---
id: ABB-100
kind: abb
title: Notification Dispatcher
status: draft
requires: []
---

# Notification Dispatcher
EOF
sed -i.bak 's/^demand_assumption:.*/&\nrealised_by_abbs: [ABB-100]\nopen_questions: none/' capabilities/CAP-100/index.md && rm capabilities/CAP-100/index.md.bak
```

```bash
python .agents/skills/architecture/bin/stage.py CAP-100 --check
```

```text
Capability  Flow         Stage       Recorded  Blocking the next stage
----------  -----------  ----------  --------  ----------------------
CAP-100     (all flows)  R2 Bounded            no pattern realises CAP-100 for flow shipping: add realises: [CAP-100] to a logical pattern
            shipping     R2 Bounded  R2        no pattern realises CAP-100 for flow shipping: add realises: [CAP-100] to a logical pattern
```

The recorded stage is now backed by evidence, `--check` exits 0, and the blocker names the next
artefact to write.

## 10. Hand it to your agent

Open the `workspace` folder in your agent (VS Code with GitHub Copilot, Cursor, Claude Code, Codex, Gemini CLI or any other Agent Skills host) and type `/` to see the skills. Then try:

```text
/architecture abb Create an ABB for the Notification Dispatcher's delivery channel router,
under capability CAP-100.
```

The flow runs the `check.mjs --json --flow abb` you ran in step 6, finds that no bounded context exists yet, proposes one rather than inventing it, and asks before creating anything. Once you agree it writes `building-blocks/architecture-building-blocks/ABB-NNN/index.md` and its diagrams, following the standards it loads from its own `references/standards/`. Run `stage.py` again afterwards to see what changed.

## Where next

- [Concepts](concepts.md): the golden thread, bindings and the definition ladder.
- [Skills](skills/README.md): what each skill asks, writes and needs.
- [Configuration](configuration.md): every binding and config key.
- [Troubleshooting](troubleshooting.md): the messages you may meet, and what to do.

To throw the scratch workspace away, delete the `architecture-quickstart` folder, which holds the workspace and both clones. Nothing was written outside it.
