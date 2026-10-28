# SPDX-FileCopyrightText: 2026 Dermot O'Brien
# SPDX-License-Identifier: Apache-2.0
#
# Install Architecture Continuum and the skills it works with into a repository, or update an
# installation to the latest releases.
#
#   .\update-skills.ps1 [-CheckOnly] [-WithPortfolio] [-Yes]
#
# Run from the root of the repository to install into (a git repository).
#
# With no .agents/skills.json (a fresh install): declares architecture and workspace from the
# latest architecture-continuum release, pattern, use-case and cross-reference from
# architecture-pattern, model from diagram-model and markdown-deck from markdown-deck, each at
# its latest release tag, then runs the workspace skill's init from that release.
# -WithPortfolio also declares portfolio, draft and convert.
#
# With a .agents/skills.json (an update): moves every source it knows to its latest release tag
# (the continuum bundle to vX.Y.Z, a skill from its own repository to <skill>--vX.Y.Z; a source
# still naming ai-assisted-architecture moves to architecture-continuum), then reinstalls with the
# workspace's own installer. Sources it does not know are left as they are.
#
# -CheckOnly shows what would change and changes nothing. -Yes skips the confirmation.
# Windows PowerShell 5 or later; needs git and Node 18 or later.

param(
    [switch]$CheckOnly,
    [switch]$WithPortfolio,
    [switch]$Yes
)

$ErrorActionPreference = "Stop"

$ContinuumRepo = "https://github.com/dermot-obrien/architecture-continuum.git"
$PatternRepo   = "https://github.com/dermot-obrien/architecture-pattern.git"
$ModelRepo     = "https://github.com/dermot-obrien/diagram-model.git"
$DeckRepo      = "https://github.com/dermot-obrien/markdown-deck.git"
$Declaration   = ".agents\skills.json"

function Get-LatestTag {
    param([string]$Repo, [string]$Prefix)
    $lines = git ls-remote --tags $Repo 2>$null
    if ($LASTEXITCODE -ne 0) { return $null }
    $pattern = "refs/tags/(" + [regex]::Escape($Prefix) + "(\d+\.\d+\.\d+))$"
    $best = $null; $bestVersion = $null
    foreach ($line in $lines) {
        if ($line -match $pattern) {
            $version = [version]$Matches[2]
            if (-not $bestVersion -or $version -gt $bestVersion) { $bestVersion = $version; $best = $Matches[1] }
        }
    }
    return $best
}

# The continuum's latest published GitHub release, which a stray tag cannot outrank; the highest
# vX.Y.Z tag only if the API cannot be reached.
function Get-LatestRelease {
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/dermot-obrien/architecture-continuum/releases/latest" -Headers @{ "User-Agent" = "update-skills" } -UseBasicParsing
        if ($release.tag_name) { return $release.tag_name }
    } catch { }
    return (Get-LatestTag $ContinuumRepo "v")
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $Text)
}

function Confirm-Step {
    param([string]$Question)
    if ($Yes) { return $true }
    $answer = Read-Host "$Question (y/N)"
    return ($answer -eq "y" -or $answer -eq "Y")
}

foreach ($tool in @("git", "node")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { Write-Host "$tool is not on the PATH." -ForegroundColor Red; exit 2 }
}
if (-not (Test-Path ".git")) {
    Write-Host "Run this from the root of a git repository (git init a new folder first)." -ForegroundColor Red
    exit 2
}

if (-not (Test-Path $Declaration)) {
    # Fresh install.
    Write-Host "No ${Declaration}: a fresh install. Finding the latest releases..." -ForegroundColor Cyan
    $continuumTag = Get-LatestRelease
    $names = @("pattern", "use-case", "cross-reference")
    if ($WithPortfolio) { $names += @("portfolio", "draft", "convert") }
    $sources = @(@{ bundle = $ContinuumRepo; ref = $continuumTag })
    foreach ($name in $names) {
        $sources += @{ repo = $PatternRepo; ref = (Get-LatestTag $PatternRepo "$name--v"); path = "skills/$name"; name = $name }
    }
    $sources += @{ repo = $ModelRepo; ref = (Get-LatestTag $ModelRepo "model--v"); path = "skills/model"; name = "model" }
    $sources += @{ repo = $DeckRepo; ref = (Get-LatestTag $DeckRepo "markdown-deck--v"); path = "skills/markdown-deck"; name = "markdown-deck" }
    foreach ($s in $sources) {
        if (-not $s.ref) { Write-Host "Could not find a release tag for $($s.bundle)$($s.repo) $($s.name). Check the network and try again." -ForegroundColor Red; exit 1 }
        $label = if ($s.name) { $s.name } else { "architecture-continuum" }
        Write-Host ("  {0,-24} {1}" -f $label, $s.ref)
    }
    if ($CheckOnly) { Write-Host "Check only: nothing changed."; exit 0 }
    if (-not (Confirm-Step "Declare these and install?")) { Write-Host "Cancelled."; exit 0 }

    $lines = @()
    foreach ($s in $sources) {
        if ($s.bundle) { $lines += "    { ""bundle"": ""$($s.bundle)"", ""ref"": ""$($s.ref)"" }" }
        else { $lines += "    { ""repo"": ""$($s.repo)"", ""ref"": ""$($s.ref)"", ""path"": ""$($s.path)"", ""name"": ""$($s.name)"" }" }
    }
    New-Item -ItemType Directory -Force ".agents" | Out-Null
    Write-Utf8NoBom $Declaration ("{`n  ""sources"": [`n" + ($lines -join ",`n") + "`n  ]`n}`n")
    Write-Host "Wrote $Declaration."

    $temp = ".continuum-install-" + (Get-Date -Format "yyyyMMddHHmmss")
    git clone --quiet --depth 1 --branch $continuumTag $ContinuumRepo $temp
    if ($LASTEXITCODE -ne 0) { Write-Host "Could not fetch architecture-continuum $continuumTag." -ForegroundColor Red; exit 1 }
    try {
        node "$temp/skills/workspace/bin/workspace.mjs" init --repo .
        $status = $LASTEXITCODE
    } finally {
        Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
    }
    if ($status -ne 0) { Write-Host "workspace init stopped (exit $status); its output says why." -ForegroundColor Red; exit $status }
    Write-Host ""
    Write-Host "Installed. Bind the skills to folders next: see docs/quick-install.md, step 4." -ForegroundColor Green
    Write-Host "Commit .agents/skills.json, .agents/skills.lock.json, scripts/, .gitignore and any package.json change."
    exit 0
}

# Update an existing declaration.
Write-Host "Reading $Declaration and finding the latest releases..." -ForegroundColor Cyan
$json = Get-Content -Raw $Declaration | ConvertFrom-Json
$changes = 0
foreach ($s in $json.sources) {
    $before = "$($s.bundle)$($s.repo)@$($s.ref)"
    if ($s.bundle -and $s.bundle -match "dermot-obrien/(architecture-continuum|ai-assisted-architecture)(\.git)?$") {
        $tag = Get-LatestRelease
        if ($tag -and ($s.ref -ne $tag -or $s.bundle -ne $ContinuumRepo)) {
            Write-Host ("  architecture-continuum   {0} -> {1}" -f $s.ref, $tag)
            $s.bundle = $ContinuumRepo; $s.ref = $tag; $changes++
        }
    } elseif ($s.repo -and $s.name) {
        $tag = Get-LatestTag $s.repo "$($s.name)--v"
        if ($tag -and $s.ref -ne $tag) {
            Write-Host ("  {0,-24} {1} -> {2}" -f $s.name, $s.ref, $tag)
            $s.ref = $tag; $changes++
        }
    }
}
if ($changes -eq 0) { Write-Host "Every source this script knows is at its latest release." -ForegroundColor Green }
if ($CheckOnly) { Write-Host "Check only: nothing changed."; exit 0 }
if ($changes -gt 0) {
    if (-not (Confirm-Step "Move these pins and reinstall?")) { Write-Host "Cancelled."; exit 0 }
    Write-Utf8NoBom $Declaration (($json | ConvertTo-Json -Depth 10) + "`n")
    Write-Host "Updated $Declaration."
}

if (Test-Path "scripts/architecture.mjs") {
    node scripts/architecture.mjs reinit
} elseif (Test-Path "scripts/skills.mjs") {
    node scripts/skills.mjs sync --copy
} else {
    Write-Host "This repository has no installer yet. Run workspace init once: see docs/quick-install.md, step 3." -ForegroundColor Yellow
    exit 2
}
if ($LASTEXITCODE -ne 0) { Write-Host "The reinstall stopped (exit $LASTEXITCODE); its output says why." -ForegroundColor Red; exit $LASTEXITCODE }
if (Test-Path "scripts/skills.mjs") { node scripts/skills.mjs check }
Write-Host ""
Write-Host "Done. Read each release's notes for anything a workspace must change, then commit .agents/skills.json and .agents/skills.lock.json." -ForegroundColor Green
