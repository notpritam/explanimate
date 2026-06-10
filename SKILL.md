---
name: explanimate
description: Build animated, React-based visual explainers — hybrid HTML/SVG UI-workflow diagrams, flows, and motion-graphics videos — as real code (React + Tailwind + Motion + SVG primitives + Remotion). Use when the user wants to visualize, explain, animate, or make a video of a concept, system, architecture, or user/data flow.
---

# explanimate

Explain by animating. You write **scenes** — React components built from HTML/CSS, SVG primitives,
Motion, Tailwind, and Remotion — that argue visually, move meaningfully, and (when asked) render to
real MP4 video.

**This is not a canvas format.** There is no serialized JSON, no drawing surface. A diagram here is
code: composable, diffable, animatable. For UI, workflow, command, product, and app explainers,
use HTML for text, controls, panels, and editable state; use SVG primitives/icons/connectors for
diagram geometry and directional flow. Avoid canvas.

You produce three kinds of artifact, in increasing cost:

| Artifact              | What it is                                           | When                              |
| --------------------- | ---------------------------------------------------- | --------------------------------- |
| **Still**             | A scene screenshotted to PNG                         | Docs, PRs, quick answers          |
| **Interactive scene** | Animated diagram page on the studio dev server       | Exploration, demos, presentations |
| **Video**             | Remotion composition rendered to MP4 (or `<Player>`) | Only when explicitly requested    |

---

## Setup — the studio

Scenes live in a **studio**: a Vite + React 19 + TS + Tailwind v4 app scaffolded from this skill's
template. One studio per project; it accumulates scenes as a living gallery.

1. **Studio exists?** Look for `explanimate-studio/` (or a dir with `"name": "explanimate-studio"`
   in its `package.json`) in the project. If found, use it.
2. **No studio?** Scaffold one:

```bash
node <path-to-this-skill>/scripts/init.mjs [target-dir]   # default: ./explanimate-studio
cd explanimate-studio && pnpm install && pnpm exec playwright install chromium
```

3. **Dev server:** `pnpm dev` (background). The gallery lists every registered scene and video.

---

## Core philosophy

**Diagrams ARGUE, not display.** A diagram is a visual argument about relationships, causality, and
flow. The structure should BE the meaning.

- **The Isomorphism Test** — strip all text; does the structure alone still communicate the
  concept? If not, redesign.
- **The Education Test** — could someone learn something concrete (real formats, real event names,
  real examples), or does it just label boxes?
- **The Motion Test** (new in v2) — every animation must encode meaning: _order_ encodes causality,
  _stagger_ encodes enumeration, _draw direction_ encodes data flow, _emphasis_ encodes importance.
  If an animation is decoration, delete it.

---

## Workflow

### 1. Assess depth and target

- **Simple/conceptual** (mental models, abstractions) → few elements, strong patterns.
- **Comprehensive/technical** (real systems, tutorials) → must include **evidence artifacts**:
  real payloads, real event names, code snippets, UI mockups. Research the actual specs first —
  never draw "Protocol → Frontend" when you can draw the real event names.
- Pick the artifact: still / interactive / video. Video only when asked — it is 10× the cost.

### 2. Design before code

Map each concept to a visual pattern (fan-out, convergence, timeline, tree, cycle, assembly line,
side-by-side, multi-zoom…) — **each major concept gets a DIFFERENT pattern**, never a uniform card
grid. Sketch the eye's path through the scene. Plan which 2–4 moments animate.
→ Full pattern recipes: `references/diagram-patterns.md`

For interactive scenes, design the primary explanation first. Annotation, comment, approval, or
feedback loops are secondary controls; keep them collapsed or idle by default. A normal click on the
scene must never create a comment unless the user explicitly armed a Comment or Highlight mode.
The studio template already mounts `SceneAnnotationLayer` on scene pages for Replay, Feedback,
Comment, Highlight, edit/remove, and "Send to agent" payload generation; extend it only when the
scene needs a custom feedback contract.

### 3. Build the scene

Create `src/scenes/<scene-id>/Scene.tsx` in the studio and register it in
`src/scenes/registry.ts`. Compose primitives on a fixed 1280×720 (default) coordinate stage:

```tsx
// ABOUTME: Scene explaining <thing> — <one-line visual argument>.
// ABOUTME: Pattern: <patterns used>. Registered as "<scene-id>".
import { Stage, Node, Edge, Label, Reveal } from "../../shared/primitives";

export default function Scene() {
  return (
    <Stage w={1280} h={720} grid>
      <Label x={64} y={48} level="title">
        Title of the argument
      </Label>
      <Node x={64} y={160} w={220} h={88} kind="start" title="Trigger" sub="webhook fires" enter="rise" delay={0} />
      <Node
        x={420}
        y={160}
        w={240}
        h={88}
        kind="process"
        title="Worker"
        sub="validates + enriches"
        enter="rise"
        delay={0.15}
      />
      <Edge from={{ x: 284, y: 204 }} to={{ x: 420, y: 204 }} label="event" enter="draw" delay={0.3} />
      <Reveal delay={0.5}>{/* freeform Tailwind/SVG content */}</Reveal>
    </Stage>
  );
}
```

Layout rules carried from v1: hierarchy through scale (hero ≈ 300×150, primary ≈ 200×90,
secondary ≈ 140×64); whitespace = importance; every relationship gets an Edge — position alone is
not a relationship; default to **free-floating Labels** — box fewer than ~30% of text elements.

For hybrid HTML/SVG scenes, mark the root with `data-html-surface`. Mark important non-overlapping
regions with `data-ui-critical`. Use buttons, segmented controls, inputs, and panels as real HTML
controls. Use SVG for icons, arrows, connector paths, and vector relationships when it improves the
diagram. Do not put annotation capture over the scene unless an explicit tool mode is active.

### 4. Verify visually — MANDATORY loop

You cannot judge a scene from code. After every meaningful change:

```bash
pnpm shoot <scene-id>        # → shots/<scene-id>.png  (use --all for every scene)
```

Then **Read the PNG**. Audit: does the structure match the design? Text clipped/overlapping?
Edges landing where they should? Spacing balanced? Fix → reshoot → repeat until you would show it
without caveats (typically 2–4 iterations). `shot=1` mode renders animations at their **final
state** automatically (primitives handle this; gate any custom loops on `useShotMode()`).

For interactive scenes or scenes with HTML controls, also add or run a UI gate:

```bash
pnpm check:scene-ui <scene-id>
```

If the scene has custom interactions, write a scene-specific Playwright script that proves them:
step controls advance, normal clicks do not trigger annotation mode, comments/highlights require an
explicit arm action, edit/remove updates payload state, controls do not overlap critical content,
and button text does not overflow. Do not ask the user to view/play the scene until this gate and a
fresh screenshot pass.

### 5. Animate (interactive scenes)

Use Motion (`motion/react`) via primitive props (`enter`, `delay`) for the standard choreography;
drop to `motion.*` elements for custom work. Respect the Motion Test. Stagger 0.12–0.2s between
sequential elements; springs for emphasis, tweens for drawing.
→ Recipes (stagger, draw-in, attention, AnimatePresence): `references/motion-recipes.md`

### 6. Video (only when requested)

Add a composition in `src/remotion/compositions/`, register it in `src/remotion/videos.ts`
(this also puts it on the gallery's `<Player>` page — video in the browser).

**THE DETERMINISM RULE:** inside compositions, never use time-based Motion animations — Remotion
renders frame-by-frame and Motion's clock will not advance. Drive everything from
`useCurrentFrame()` → `interpolate()` / `spring()`, and feed primitives their progress props
(`draw={p}`, `appear={p}`). Primitives are animation-agnostic by design: Motion drives them in
scenes, the frame clock drives them in compositions.

```bash
pnpm video:still <comp-id> --frame=45   # spot-check key frames FIRST (cheap)
pnpm video:render <comp-id>             # then render out/<comp-id>.mp4
```

→ Composition anatomy, sequencing, audio, render flags: `references/remotion-video.md`

### 7. Deliver

State what exists and where: scene URL (`http://localhost:5173/#/scene/<id>`), shot PNG path,
MP4 path. Send the user the PNG/MP4 when that is the deliverable.

---

## Primitive API (quick reference)

All primitives accept `className` and live in `src/shared/primitives/`. Colors come from semantic
tokens — never hardcode hex in scenes. → Palette + typography: `references/design-language.md`

| Primitive | Key props                                                                                                              | Notes                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `Stage`   | `w=1280 h=720 grid scale`                                                                                              | Fixed coordinate space, auto-fits viewport. One per scene. `scale` is required in compositions. |
| `Node`    | `x y w h kind title sub` · `kind: start\|end\|process\|decision\|data\|danger\|evidence\|plain` · `enter delay appear` | `evidence` = dark code card (children = lines). `h` is a min-height.                            |
| `Edge`    | `from to via curve: auto\|ortho\|line` · `label dashed width color arrow` · `enter="draw" delay draw`                  | SVG connector with arrowhead; `draw` ∈ 0..1 for video. `ortho` elbows along the dominant axis.  |
| `Label`   | `x y level: title\|section\|body\|caption` · `align maxW color delay appear`                                           | Free-floating typography — the default for text.                                                |
| `Dot`     | `x y r color delay appear`                                                                                             | Timeline markers, anchors.                                                                      |
| `Reveal`  | `delay y appear`                                                                                                       | Motion wrapper for freeform content blocks.                                                     |

**Driver contract:** `enter`/`delay` = Motion entrance (interactive; auto-completes in shot mode).
`appear`/`draw` ∈ 0..1 = explicit progress (video; overrides `enter` when set).

---

## Quality checklist (gate before delivering)

**Depth** — researched real specs? evidence artifacts present (technical scenes)? multi-zoom
(summary + sections + detail) for comprehensive scenes?
**Concept** — passes Isomorphism + Education tests? every major concept a different pattern? no
uniform card grids?
**Motion** — passes the Motion Test? entrance order = causal order? nothing loops without meaning?
**Structure** — every relationship has an Edge? clear eye path? hierarchy through scale?
<30% of text boxed?
**Verification** — shot PNG actually Read and audited? no clipping/overlap/stray edges? video
spot-checked via stills before full render? UI/interaction gate passed when applicable?
Playwright-rendered proof image or live browser inspected?
**Code** — ABOUTME headers on every file? semantic tokens only? scene registered? typecheck passes?

---

## References

| File                             | Load when…                                                        |
| -------------------------------- | ----------------------------------------------------------------- |
| `references/diagram-patterns.md` | designing any scene — pattern recipes as React/SVG code           |
| `references/design-language.md`  | choosing colors/type — semantic tokens, hierarchy, evidence style |
| `references/motion-recipes.md`   | animating interactive scenes                                      |
| `references/remotion-video.md`   | building or rendering any video                                   |
