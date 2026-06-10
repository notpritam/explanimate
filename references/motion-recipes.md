<!-- ABOUTME: Motion (motion/react) recipes for interactive scenes — choreography defaults, stagger, draw-in, step-through. -->
<!-- ABOUTME: Interactive scenes ONLY. Remotion compositions must never use these (see remotion-video.md). -->

# Motion Recipes (interactive scenes)

The library is **Motion** — the successor to Framer Motion. Import from `motion/react`:

```tsx
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
```

Primitives already implement the standard choreography via `enter` + `delay` props — reach for raw
`motion.*` only for custom work. **Every recipe must pass the Motion Test** (order = causality,
stagger = enumeration, draw = flow, emphasis = importance).

## Defaults

- Entrances: `duration: 0.5`, `ease: [0.22, 1, 0.36, 1]` (easeOutQuint-ish), y-rise 12–16px.
- Stagger between sequential elements: **0.12–0.2s**. Whole-scene choreography ≤ 2.5s total —
  `shoot.mjs` settles for 2.5s by default.
- Springs (`type: "spring", stiffness: 260, damping: 24`) for emphasis pops; tweens for draws.

## Choreographed entrance (what `enter`/`delay` do internally)

```tsx
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
/>
```

Order the `delay`s along the causal chain: trigger → edge → consumer → result. The viewer should be
able to narrate the system from the entrance order alone.

## Edge draw-in (what `enter="draw"` does internally)

```tsx
<motion.path
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.45, delay, ease: "easeInOut" }}
/>
```

Draw **in the direction the data flows**. Arrowheads fade in at draw completion.

## Attention (use at most once per scene)

Pulse the single most important element after the entrance choreography lands:

```tsx
<motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ delay: 1.8, duration: 0.6 }} />
```

## Step-through scenes (interactive walkthroughs)

For "explain this flow step by step", hold `step` state, advance on click/keys, and let
`AnimatePresence` swap annotations while the structure stays put:

```tsx
const [step, setStep] = useState(0);
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    {STEPS[step].annotation}
  </motion.div>
</AnimatePresence>;
```

Highlight the active node by toggling its `className` (ring + accent) from the same `step` state.

## Shot mode & reduced motion — the two escape hatches

- `useShotMode()` (from `src/shared/primitives`) is `true` when `pnpm shoot` is capturing.
  Primitives auto-complete their animations in shot mode. **Any custom loop or
  `repeat: Infinity` animation MUST be gated:** `animate={shot ? undefined : {...}}` — otherwise
  screenshots catch mid-frame smear.
- Respect `useReducedMotion()` for human viewers: collapse entrances to opacity-only.

## Anti-patterns

- Looping/floating/breathing decoration — fails the Motion Test, pollutes screenshots.
- Animating layout properties (`width`, `left`) — animate `transform`/`opacity` only.
- Staggering > 0.25s apart — the scene feels broken, and shots may capture it unfinished.
- `whileInView` inside a `Stage` — stages are fixed-viewport; use plain `animate` with delays.
