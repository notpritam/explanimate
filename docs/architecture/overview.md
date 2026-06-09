<!-- ABOUTME: The architecture of the explanimate skill — what it is, how its pieces fit, and the key design decisions. -->
<!-- ABOUTME: Read this before changing the skill's structure; it records the WHY behind the layout. -->

# explanimate — Architecture

**explanimate** is a Claude/agent skill that produces **animated, React-based visual explainers**:
interactive diagram scenes and rendered MP4 videos, authored as real code. It is the v2 rewrite of
`excalidraw-diagram-skill`. The v1 skill made the agent hand-craft Excalidraw JSON elements; v2 makes
the agent **write React components** — SVG + Tailwind for structure, Motion (Framer Motion) for
interactive animation, Remotion for deterministic video.

## The core idea

A diagram is code. Instead of emitting a serialized canvas format, the agent:

1. Scaffolds (once per project) a **studio** — a Vite + React + TS + Tailwind app — from the bundled template.
2. Writes a **scene**: a React component composed of SVG primitives + Tailwind + Motion animations.
3. **Verifies visually** in a loop: screenshot script → Read the PNG → fix → repeat.
4. Optionally promotes the scene to a **Remotion composition** and renders an MP4 (or plays it
   in-browser via `@remotion/player`).

## Repository layout (the skill itself)

```
explanimate/
  SKILL.md                  ← agent-facing entrypoint: methodology + workflow + API
  README.md                 ← human-facing: what it is, install, setup
  CLAUDE.md                 ← project rules for working ON the skill repo
  references/               ← deep-dive docs the agent loads on demand
    design-language.md      ←   tokens: color semantics, typography, spacing
    diagram-patterns.md     ←   visual patterns (fan-out, convergence, timeline…) as React/SVG recipes
    motion-recipes.md       ←   Motion (Framer) recipes: stagger, draw-in, attention choreography
    remotion-video.md       ←   video compositions: sequences, springs, render pipeline
  templates/studio/         ← the scaffold copied by scripts/init.mjs (full Vite app)
    src/shared/primitives/  ←   Stage, Node, Edge, Label, Timeline… (animation-agnostic)
    src/scenes/             ←   agent-authored interactive scenes
    src/remotion/           ←   Remotion root + compositions (video targets)
  scripts/
    init.mjs                ← scaffold a studio into a target directory
    shoot.mjs               ← Playwright screenshot(s) of scenes → PNG for the verify loop
  tooling/scripts/
    check-headers.mjs       ← ABOUTME header enforcement (pre-commit)
  docs/
    architecture/overview.md  ← this file
    build-log/                ← append-only build record (sessions.jsonl + narratives)
```

## Key decisions

### D1 — Scenes are code, not data (v1 → v2 inversion)

v1's biggest costs: JSON coordinate math, no reusable abstractions, no animation, output-token
ceilings on large diagrams. v2 inverts it: the agent writes composable React. Layout comes from
flexbox/grid/SVG viewBox coordinates; reuse comes from primitives; animation is first-class.

### D2 — Two animation drivers, one set of primitives

- **Interactive scenes** (browser, exploration, demos): **Motion** (`motion/react`) — time-based,
  spring physics, `whileInView`, gestures.
- **Video** (deterministic, frame-accurate): **Remotion** — `useCurrentFrame()` + `interpolate()` +
  `spring()`. Time-based Motion animations are NOT frame-deterministic under Remotion's renderer,
  so compositions must drive animation from the frame clock.

Primitives are therefore **animation-agnostic**: they accept progress props (e.g. `draw={0..1}`,
`appear={0..1}`) with sensible static defaults. Interactive scenes wrap them in Motion; Remotion
compositions feed them frame-derived progress. One visual vocabulary, two drivers.

### D3 — One studio per consumer project, scaffolded from a bundled template

The skill ships a complete template (`templates/studio/`). `scripts/init.mjs` copies it into the
consumer project (default `./explanimate-studio`). Rationale: a persistent studio accumulates the
project's scenes as a living gallery; node_modules install once; the dev server doubles as the
deliverable ("open localhost:5173").

### D4 — Verification is mandatory and visual

Same philosophy as v1's render-validate loop, better tooling: `scripts/shoot.mjs` drives Playwright
against the Vite dev server, captures per-scene PNGs (`?shot=1` disables animation wait), and the
agent Reads the PNG. No scene ships without the agent having seen it. Videos are spot-checked by
rendering stills (`npx remotion still`) at key frames before committing to a full MP4 render.

### D5 — Tailwind v4, React 19, Vite 7, pinned-together Remotion 4

Tailwind v4 (CSS-first `@theme` tokens — no config file), React 19, Vite 7. All `remotion` /
`@remotion/*` packages must resolve to the same version (Remotion requirement) — install together.
Design tokens live in `src/shared/theme.css` as CSS variables so Tailwind utilities and raw SVG
attributes share one palette.

### D6 — The skill repo follows the card-against-humanity discipline

ABOUTME headers on every source file (enforced), husky pre-commit (lint-staged: headers + prettier),
commit-msg (commitlint, conventional commits), pre-push (full `pnpm validate`), append-only build
log in `docs/build-log/sessions.jsonl`. The skill repo practices what it preaches.

## What the agent consuming the skill experiences

```
User: "visualize how our auth flow works"
  → SKILL.md: assess depth → ensure studio exists (init.mjs) → design (patterns from references)
  → write src/scenes/auth-flow/Scene.tsx using primitives
  → pnpm shoot auth-flow → Read PNG → fix → repeat until right
  → (if video requested) add composition, npx remotion still spot-checks, then render MP4
  → deliver: dev-server URL + PNG + MP4 path
```

## Non-goals

- Not a charting library (no data-viz axes/legends; use real chart libs for that).
- Not a slide-deck generator — scenes are single coherent visual arguments.
- No canvas/WebGL drawing surface; everything is DOM/SVG so the agent can reason about it as code.
