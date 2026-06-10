<!-- ABOUTME: Studio README — what this scaffolded app is and the commands that matter. -->
<!-- ABOUTME: Scaffolded by the explanimate skill; scenes/videos accumulate here per project. -->

# explanimate studio

Animated visual explainers as code. **Scenes** are interactive React diagram pages (SVG + Tailwind +
Motion). **Videos** are deterministic Remotion compositions rendered to MP4 (and playable in-browser
via the gallery's Player).

Scaffolded from the [explanimate](https://github.com/) skill template — the authoring methodology
lives in the skill's `SKILL.md`, not here.

## Commands

| Command                           | Does                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                        | Studio dev server: gallery, scenes, video player            |
| `pnpm shoot <id…\|--all>`         | Screenshot scene(s) → `shots/<id>.png` (the verify loop)    |
| `pnpm typecheck` / `pnpm build`   | TS check / production build                                 |
| `pnpm video:still <id> --frame=N` | One frame of a composition → PNG (cheap video verification) |
| `pnpm video:render <id>`          | Render a composition → `out/<id>.mp4`                       |
| `pnpm video:studio`               | Remotion Studio (timeline scrubbing)                        |

First-time setup: `pnpm install && pnpm exec playwright install chromium`.

## Where things go

- `src/scenes/<scene-id>/Scene.tsx` + an entry in `src/scenes/registry.ts`
- `src/remotion/compositions/<Name>.tsx` + an entry in `src/remotion/videos.ts`
- Shared visual vocabulary: `src/shared/primitives/` — Stage, Node, Edge, Label, Dot, Reveal
- Design tokens: `src/shared/theme.ts` + `src/styles.css` (change together)

## The one rule that bites

Interactive scenes animate with Motion (`enter`/`delay` props). Remotion compositions must be
frame-deterministic: drive primitives with `appear`/`draw` (0..1) computed from `useCurrentFrame()`
— never Motion. Mixing them produces videos with frozen or torn animation.
