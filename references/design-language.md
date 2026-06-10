<!-- ABOUTME: The single source of truth for explanimate's visual tokens — semantic colors, typography, spacing. -->
<!-- ABOUTME: Mirrors templates/studio/src/shared/theme.ts and styles.css; change all three together. -->

# Design Language

Colors encode **meaning**, not decoration. Every visual choice in a scene pulls from these tokens —
neutrals/evidence as Tailwind utilities (`text-ink`, `bg-canvas`, `text-evidence-dim`), node-kind
triples via `nodeColors[kind]` and the accent via `theme.accent` (imported from
`src/shared/primitives`) for SVG attributes and inline styles. **Never hardcode hex values in
scenes.** To rebrand every diagram, edit `theme.ts` + `styles.css` together.

## Neutrals

| Token     | Hex       | Tailwind     | Use                                  |
| --------- | --------- | ------------ | ------------------------------------ |
| `ink`     | `#0F172A` | `text-ink`   | Primary text, titles                 |
| `muted`   | `#475569` | `text-muted` | Secondary text, edge labels          |
| `faint`   | `#94A3B8` | `text-faint` | Captions, hints, de-emphasized notes |
| `line`    | `#CBD5E1` | `*-line`     | Default edge stroke, dividers        |
| `surface` | `#FFFFFF` | `bg-surface` | Node fills (plain), cards            |
| `canvas`  | `#F8FAFC` | `bg-canvas`  | Stage background                     |
| `grid`    | `#E2E8F0` | —            | Stage dot-grid                       |

## Semantic node colors (fill / stroke / text)

Each `Node` `kind` maps to a triple. Darker stroke + lighter fill, always.

| Kind       | Fill      | Stroke    | Text      | Meaning                       |
| ---------- | --------- | --------- | --------- | ----------------------------- |
| `start`    | `#ECFDF5` | `#10B981` | `#065F46` | Triggers, inputs, origins     |
| `end`      | `#D1FAE5` | `#059669` | `#064E3B` | Results, outputs, completion  |
| `process`  | `#EEF2FF` | `#6366F1` | `#312E81` | Actions, steps, services      |
| `decision` | `#FFFBEB` | `#F59E0B` | `#78350F` | Branches, conditions, gates   |
| `data`     | `#F5F3FF` | `#8B5CF6` | `#4C1D95` | Stores, payloads, state       |
| `danger`   | `#FFF1F2` | `#F43F5E` | `#881337` | Errors, failure paths, alerts |
| `plain`    | `surface` | `line`    | `ink`     | Neutral grouping, containers  |

**Accent** (`#6366F1`, indigo): emphasized edges, the "current step" highlight, focus rings.
Do not invent new hues — if a concept fits no category, use `plain` or `data`.

## Evidence artifacts (code/JSON cards)

Dark card so real payloads read as "terminal truth" against the light canvas:

| Token            | Hex       | Use                           |
| ---------------- | --------- | ----------------------------- |
| `evidence-bg`    | `#0B1220` | Card background               |
| `evidence-line`  | `#1E293B` | Card border                   |
| `evidence-text`  | `#E2E8F0` | Default code text             |
| `evidence-key`   | `#7DD3FC` | Keys, properties, event names |
| `evidence-value` | `#86EFAC` | Strings, literal values       |
| `evidence-dim`   | `#64748B` | Comments, punctuation         |

## Typography (Label levels, on a 1280×720 stage)

System font stack only — **no webfont network fetches** (renders must be deterministic).

| Level     | Size   | Weight | Color   | Extras                    | Use                       |
| --------- | ------ | ------ | ------- | ------------------------- | ------------------------- |
| `title`   | 30px   | 700    | `ink`   | tracking-tight            | One per scene             |
| `section` | 14px   | 600    | `muted` | uppercase, tracking-wider | Region/zone headers       |
| `body`    | 15px   | 500    | `ink`   | —                         | Node-adjacent annotations |
| `caption` | 12.5px | 400    | `faint` | —                         | Hints, footnotes, units   |

Code inside evidence cards: 13px `font-mono`, line-height 1.6.

## Spacing & scale

- Hierarchy through scale: hero ≈ 300×150 · primary ≈ 200×90 · secondary ≈ 140×64 · marker dots 8–16px.
- The most important element gets the most whitespace (≥120px clearance on a 1280 stage).
- Edge stroke widths: 1.5 default · 2.5 emphasized main flow · 1 dashed for weak/optional links.
- Corner radius: 10px nodes, 14px evidence cards. Shadows: none or `shadow-sm` — flat > skeuomorph.
