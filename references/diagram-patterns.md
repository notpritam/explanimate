<!-- ABOUTME: The visual pattern library — each conceptual shape (fan-out, convergence, timeline…) as a concrete React/primitive recipe. -->
<!-- ABOUTME: Load when designing a scene; pick a DIFFERENT pattern per major concept, never uniform grids. -->

# Diagram Patterns

Map each concept to the pattern that **mirrors its behavior**. The recipes below assume the default
1280×720 `Stage` and the primitives from `src/shared/primitives`.

| If the concept…                | Pattern           |
| ------------------------------ | ----------------- |
| Spawns multiple outputs        | **Fan-out**       |
| Combines inputs into one       | **Convergence**   |
| Is a sequence of steps         | **Timeline**      |
| Has hierarchy/nesting          | **Tree**          |
| Loops or improves continuously | **Cycle**         |
| Transforms input to output     | **Assembly line** |
| Compares two things            | **Side-by-side**  |
| Needs overview + zoomed detail | **Multi-zoom**    |

## Fan-out (one-to-many)

Source on the left or center; targets arranged radially or in a column. Stagger target entrances —
the stagger IS the enumeration.

```tsx
const targets = ["build", "test", "deploy"];
<Node x={80} y={300} w={220} h={96} kind="start" title="PR merged" enter="rise" />;
{
  targets.map((t, i) => (
    <Fragment key={t}>
      <Edge
        from={{ x: 300, y: 348 }}
        to={{ x: 560, y: 140 + i * 180 }}
        curve="auto"
        enter="draw"
        delay={0.2 + i * 0.15}
      />
      <Node x={560} y={96 + i * 180} w={200} h={88} kind="process" title={t} enter="rise" delay={0.3 + i * 0.15} />
    </Fragment>
  ));
}
```

## Convergence (many-to-one)

Mirror of fan-out: inputs left, merged output right, edges arriving with sequential `delay` so the
eye watches the merge happen. Output node enters **last** (`delay` after all edges).

## Timeline (sequence)

A rail (one long `Edge` with `arrow={false}`), `Dot` markers, free-floating `Label`s. **No boxes** —
lines + typography beat contained text.

```tsx
<Edge from={{ x: 120, y: 400 }} to={{ x: 1160, y: 400 }} arrow={false} width={1.5} />;
{
  steps.map((s, i) => (
    <Fragment key={s.t}>
      <Dot x={180 + i * 240} y={400} r={7} color={theme.accent} />
      <Label x={180 + i * 240} y={356} level="body" align="center">
        {s.t}
      </Label>
      <Label x={180 + i * 240} y={424} level="caption" align="center">
        {s.detail}
      </Label>
    </Fragment>
  ));
}
```

## Tree (hierarchy)

Trunk + branch `Edge`s (`curve="ortho"`, `arrow={false}`), free-floating `Label`s at nodes. Reserve
`Node` boxes for the root or for leaves that need semantic color.

## Cycle (feedback loop)

3–5 nodes on a ring; the **closing edge is the meaning** — make it `width={2.5}`,
`color={theme.accent}`, and the last to draw. Place the loop's payoff label in the center.

```tsx
<Edge
  from={{ x: 400, y: 560 }}
  to={{ x: 240, y: 280 }}
  via={[{ x: 200, y: 480 }]}
  curve="auto"
  label="feedback"
  color={theme.accent}
  width={2.5}
  enter="draw"
  delay={1.0}
/>
```

## Assembly line (transformation)

Before → process → after, horizontally. **Show the actual before/after content** (evidence cards or
real values), not labeled boxes: chaos in, order out.

## Side-by-side (comparison)

Two parallel columns with identical internal layout so differences pop. Divide with a dashed
vertical `Edge`. Use `danger`/`start` kinds to encode bad/good. Animate the two columns with the
same delays — synchronized motion invites comparison.

## Multi-zoom (comprehensive scenes)

Three simultaneous levels — v1's rule, unchanged:

1. **Summary flow** — a one-line mini-map (small nodes/dots + edges) pinned to the top or bottom strip.
2. **Section boundaries** — `plain` container Nodes or background tint zones with `section` Labels.
3. **Detail inside sections** — evidence artifacts, real payloads, the teaching content.

Lay out sections first (they own coordinate regions), then place detail within each region.

## Evidence artifacts

Real formats prove the diagram and teach. Use `kind="evidence"` nodes; children are lines:

```tsx
<Node x={840} y={420} w={360} h={150} kind="evidence" title="event payload">
  <code>{`{ "type": "RUN_STARTED",`}</code>
  <code>{`  "runId": "run_8h2k",`}</code>
  <code>{`  "ts": 1718061822 }`}</code>
</Node>
```

Types: JSON/payloads · code snippets · event-name sequences · mini UI mockups (nested rounded divs)
· real input/output samples. Spot-check rendered size: 13px mono needs ~7.8px/char width.

## Container discipline

Default to free-floating `Label`s. Box an element only when: it is a focal point, edges connect to
it, the shape carries meaning (decision), or it groups elements. Target <30% of text boxed.
Typography (level + color) is the hierarchy tool, not rectangles.
