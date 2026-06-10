<!-- ABOUTME: Shareable installation guide for installing explanimate into agent skill directories. -->
<!-- ABOUTME: Includes copy-paste commands for humans and agents bootstrapping the skill from a clean machine. -->

# Install Explanimate

This guide installs `explanimate` as an agent skill and shows how to scaffold the first studio in a
project. It is written so a human can follow it directly, or paste it into an agent and ask the
agent to perform the setup.

## What You Are Installing

`explanimate` is a folder-based skill. The important file is `SKILL.md`; agent runtimes discover the
skill by reading that file from their skills directory.

The repo also includes:

- `scripts/init.mjs`: copies a ready-to-run studio into a project.
- `templates/studio/`: Vite + React + Tailwind + Motion + Remotion template.
- `references/`: design, motion, diagram, and video guidance loaded by the skill when needed.

## Prerequisites

Install these first:

- Git
- Node.js `>=22`
- pnpm `>=9`

Check versions:

```bash
git --version
node --version
pnpm --version
```

If `pnpm` is missing and Node has Corepack:

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

## Choose An Install Location

Use a stable folder that you will not delete. These examples use `~/agent-skills`.

```bash
mkdir -p ~/agent-skills
git clone https://github.com/notpritam/explanimate.git ~/agent-skills/explanimate
cd ~/agent-skills/explanimate
pnpm install
pnpm validate
```

`pnpm validate` checks formatting and repo headers. It does not install the skill into an agent; the
next sections do that.

## Install For Claude Code

User-scope install for all Claude Code projects:

```bash
mkdir -p ~/.claude/skills
ln -sfn ~/agent-skills/explanimate ~/.claude/skills/explanimate
```

Project-scope install for one repository:

```bash
cd /path/to/your/project
mkdir -p .claude/skills
ln -sfn ~/agent-skills/explanimate .claude/skills/explanimate
```

Copy install instead of symlink:

```bash
mkdir -p ~/.claude/skills
rm -rf ~/.claude/skills/explanimate
cp -R ~/agent-skills/explanimate ~/.claude/skills/explanimate
```

Use symlinks while developing the skill, because `git pull` updates the installed skill in place.
Use copies when you need a fixed snapshot.

## Install For Codex

User-scope install for all Codex projects:

```bash
mkdir -p ~/.codex/skills
ln -sfn ~/agent-skills/explanimate ~/.codex/skills/explanimate
```

Project-local install if your Codex setup loads project skills:

```bash
cd /path/to/your/project
mkdir -p .codex/skills
ln -sfn ~/agent-skills/explanimate .codex/skills/explanimate
```

Copy install instead of symlink:

```bash
mkdir -p ~/.codex/skills
rm -rf ~/.codex/skills/explanimate
cp -R ~/agent-skills/explanimate ~/.codex/skills/explanimate
```

Restart the Codex session after installation so the skill list reloads.

## Install For Both Claude And Codex

Run this on macOS/Linux:

```bash
mkdir -p ~/agent-skills ~/.claude/skills ~/.codex/skills

if [ ! -d ~/agent-skills/explanimate/.git ]; then
  git clone https://github.com/notpritam/explanimate.git ~/agent-skills/explanimate
else
  git -C ~/agent-skills/explanimate pull --ff-only
fi

ln -sfn ~/agent-skills/explanimate ~/.claude/skills/explanimate
ln -sfn ~/agent-skills/explanimate ~/.codex/skills/explanimate

cd ~/agent-skills/explanimate
pnpm install
pnpm validate
```

Then restart Claude/Codex.

## Windows PowerShell

These commands use a clone location under your user profile:

```powershell
$SkillRoot = "$HOME\agent-skills\explanimate"
New-Item -ItemType Directory -Force "$HOME\agent-skills" | Out-Null
git clone https://github.com/notpritam/explanimate.git $SkillRoot
Set-Location $SkillRoot
pnpm install
pnpm validate
```

Claude Code copy install:

```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
Remove-Item -Recurse -Force "$HOME\.claude\skills\explanimate" -ErrorAction SilentlyContinue
Copy-Item -Recurse $SkillRoot "$HOME\.claude\skills\explanimate"
```

Codex copy install:

```powershell
New-Item -ItemType Directory -Force "$HOME\.codex\skills" | Out-Null
Remove-Item -Recurse -Force "$HOME\.codex\skills\explanimate" -ErrorAction SilentlyContinue
Copy-Item -Recurse $SkillRoot "$HOME\.codex\skills\explanimate"
```

PowerShell symlinks require Developer Mode or elevated permissions. Copy install is the safer
default on Windows.

## Verify The Skill Is Discoverable

Start a fresh agent session and ask:

```text
What skills are available that can create animated visual explainers?
```

You should see `explanimate` or a matching description. Then ask:

```text
Use the explanimate skill. Tell me the first command you would run to scaffold a studio in this project.
```

The expected scaffold command is:

```bash
node <path-to-explanimate>/scripts/init.mjs explanimate-studio
```

## Create The First Studio In A Project

Go to the project where you want diagrams and videos to live:

```bash
cd /path/to/your/project
node ~/agent-skills/explanimate/scripts/init.mjs explanimate-studio
cd explanimate-studio
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Open:

```text
http://localhost:5173/
```

The gallery should show the example scenes and videos.

## Verify The Studio

In the studio folder:

```bash
pnpm typecheck
pnpm check:scene-ui how-explanimate-works
pnpm shoot how-explanimate-works
pnpm build
```

Expected outputs:

- `shots/how-explanimate-works-ui.png`
- `shots/how-explanimate-works.png`
- a successful Vite build

Vite may warn that a JavaScript chunk is larger than `500 kB`. That warning is expected for the
Remotion/React studio bundle and does not mean the studio failed.

## Use The Skill With An Agent

Paste this into Claude Code, Codex, or another agent that can read installed skills:

```text
Use the explanimate skill to create an animated visual explainer for:

<describe the system, flow, concept, or product workflow>

Requirements:
- If there is no explanimate-studio in this project, scaffold one with scripts/init.mjs.
- Build the primary explanation first; keep feedback/comment controls secondary and idle by default.
- Use HTML controls/panels for UI and SVG primitives/connectors for the diagram flow.
- Do not use canvas.
- Run pnpm shoot <scene-id> and inspect the PNG.
- Run pnpm check:scene-ui <scene-id> for interactive scenes.
- Run pnpm typecheck and pnpm build before saying it is complete.
- Give me the scene URL and screenshot path.
```

## Update The Skill Later

If you installed by symlink:

```bash
cd ~/agent-skills/explanimate
git pull --ff-only
pnpm install
pnpm validate
```

If you installed by copy:

```bash
cd ~/agent-skills/explanimate
git pull --ff-only
pnpm install
pnpm validate

rm -rf ~/.claude/skills/explanimate ~/.codex/skills/explanimate
cp -R ~/agent-skills/explanimate ~/.claude/skills/explanimate
cp -R ~/agent-skills/explanimate ~/.codex/skills/explanimate
```

Restart any running agent session after updating.

## Troubleshooting

**The agent does not see the skill**

- Confirm `SKILL.md` exists at `~/.claude/skills/explanimate/SKILL.md` or
  `~/.codex/skills/explanimate/SKILL.md`.
- Restart the agent session.
- If you used a symlink, confirm it resolves:

```bash
ls -la ~/.claude/skills/explanimate
ls -la ~/.codex/skills/explanimate
```

**`pnpm install` fails**

- Check Node and pnpm versions.
- Run `corepack enable`.
- Delete `node_modules` in the studio and retry.

**Playwright cannot launch Chromium**

Run this inside the studio:

```bash
pnpm exec playwright install chromium
```

**The studio starts on another port**

Vite chooses another port if `5173` is busy. Use the URL printed by `pnpm dev`.

**The UI gate fails after editing a scene**

Open the generated `shots/<scene-id>-ui.png`, inspect the overlap or interaction problem, patch the
scene, then rerun:

```bash
pnpm check:scene-ui <scene-id>
pnpm shoot <scene-id>
```

## Agent Bootstrap Prompt

Use this when asking an agent to install the skill from scratch:

```text
Install the explanimate skill from https://github.com/notpritam/explanimate.git.

Use a stable clone path, preferably ~/agent-skills/explanimate.
Install it for both Claude Code and Codex if those folders exist:
- ~/.claude/skills/explanimate
- ~/.codex/skills/explanimate

Prefer symlinks on macOS/Linux so git pull updates the installed skill.
Use copy install if symlinks are not available.

After installing:
1. Run pnpm install in the skill repo.
2. Run pnpm validate in the skill repo.
3. Show me the final installed SKILL.md paths.
4. Tell me whether I need to restart the agent session.
```
