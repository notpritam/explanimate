# explanimate — Project Rules

Agent skill that builds animated, React-based visual explainers: hybrid HTML/SVG diagram scenes
animated with Motion, rendered to deterministic video with Remotion. v2 rewrite of
`excalidraw-diagram-skill` — scenes are **code**, not serialized canvas JSON.

## Non-negotiable rules

1. **Every source file starts with an ABOUTME header** (>=2 lines containing `ABOUTME:`).
   Enforced by `tooling/scripts/check-headers.mjs` in pre-commit. Markdown docs use HTML comments;
   CSS uses block comments; TS/JS use line comments.
2. **Two animation drivers, one set of primitives.** Primitives in `templates/studio/src/shared/`
   are animation-agnostic (progress props). Interactive scenes drive them with Motion
   (`motion/react`); Remotion compositions drive them from `useCurrentFrame()`. Never use
   time-based Motion animations inside a Remotion composition — they are not frame-deterministic.
3. **All `remotion` / `@remotion/*` packages stay on the same version.** Bump them together.
4. **Nothing visual ships unseen.** Any change to template primitives, the example scene, or the
   example composition must be re-verified with `scripts/shoot.mjs` (and `npx remotion still` for
   compositions) before commit.
5. **Conventional Commits**, scoped (`repo|skill|references|template|scripts|docs|tooling|release`
   — see `commitlint.config.mjs`). Hooks block non-conforming messages. Never use `--no-verify`.
6. **The build log is mandatory.** After a meaningful prompt or decision, append an event to
   `docs/build-log/sessions.jsonl` (verbatim prompt + rationale).
7. **SKILL.md is the product.** It must stay self-sufficient for a consuming agent: workflow,
   primitive API, verify loop, and pointers into `references/`. If template APIs change, SKILL.md
   and `references/` change in the same commit.

## Commands

- `pnpm validate` — format check + ABOUTME headers (the pre-push gate).
- `pnpm format` — prettier across the repo.
- Template (inside `templates/studio/` or a scaffolded studio): `pnpm dev` (Vite),
  `pnpm shoot <scene-id>` (screenshot), `pnpm typecheck`, `pnpm build`,
  `pnpm video:still` / `pnpm video:render` (Remotion).

## Layout

`SKILL.md` (agent entrypoint) · `references/` (deep dives) · `templates/studio/` (the scaffold) ·
`scripts/` (init + shoot) · `tooling/scripts/` (repo enforcement) · `docs/` (architecture + build log).

## Conventions mirrored from card-against-humanity

Prettier: 120 width, double quotes, trailing commas, semicolons. Husky v9. ABOUTME headers.
Append-only build log. Step-by-step conventional commits.
