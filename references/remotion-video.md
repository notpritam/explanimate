<!-- ABOUTME: Remotion guide — composition anatomy, frame-driven animation, the determinism rule, stills spot-check, render commands. -->
<!-- ABOUTME: Load before building or rendering any video. Compositions live in src/remotion/compositions/. -->

# Remotion Video

Remotion renders React **frame by frame** in a headless browser and stitches the frames into an
MP4. Everything on screen must be a pure function of `useCurrentFrame()`.

## THE DETERMINISM RULE

**Never use time-based Motion animations inside a composition.** Motion's clock does not advance
with Remotion's frame clock — you would render frozen or torn animation. Inside
`src/remotion/**`: no `motion.*` with `animate`/`transition`, no `setTimeout`, no `Math.random()`
(use `random(seed)` from `remotion`), no network fetches mid-render. Drive primitives through their
progress props (`appear`, `draw`) computed from the frame.

## Anatomy — register in `src/remotion/videos.ts`

```ts
export const VIDEOS: VideoDef[] = [
  {
    id: "how-explanimate-works",
    title: "How explanimate works",
    component: HowExplanimateWorks,
    durationInFrames: 270,
    fps: 30,
    width: 1920,
    height: 1080,
  },
];
```

`Root.tsx` maps `VIDEOS` → `<Composition>` (for the CLI) and the gallery maps it → `<Player>`
(video in the browser, instantly — no render needed). One registry, both targets.

## Composition skeleton

```tsx
// ABOUTME: Video composition for <thing> — frame-driven retelling of the <scene-id> scene.
// ABOUTME: Determinism: all animation derives from useCurrentFrame(); no Motion, no wall-clock.
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = (at: number) => spring({ frame: frame - at, fps, config: { damping: 200 } });
  const draw = (at: number, len = 20) =>
    interpolate(frame, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="bg-canvas">
      <Sequence from={0}>
        <Node x={120} y={420} w={300} h={130} kind="start" title="Prompt" appear={rise(10)} />
      </Sequence>
      <Sequence from={30}>
        <Edge from={{ x: 420, y: 485 }} to={{ x: 700, y: 485 }} draw={draw(40)} />
      </Sequence>
    </AbsoluteFill>
  );
};
```

`spring()` here is Remotion's — frame-driven, deterministic. Reuse the scene's layout coordinates
(scale ×1.5 from a 1280×720 stage to 1920×1080) so video and scene stay visual twins. Wrap a
`Stage w={1920} h={1080}` inside `AbsoluteFill` to keep the same coordinate model.

## Pacing

30fps. Entrances ≈ 15–20 frames; edge draws ≈ 18–25; hold a finished section ≈ 30–45 frames before
the next `Sequence`. A 4-beat explainer lands around 240–320 frames (8–11s). End on a 45-frame
hold of the complete picture.

## Verify cheap, render once

```bash
pnpm video:still <comp-id> --frame=45    # PNG of one frame → Read it. Check 3-4 key frames.
pnpm video:render <comp-id>              # full MP4 → out/<comp-id>.mp4
```

Stills are the video's verify loop — spot-check the start, each beat's landing frame, and the final
hold BEFORE paying for a full render. The first render downloads a headless Chrome (~one-time).

## Rules of the studio setup

- **Version lockstep:** `remotion` and every `@remotion/*` package must resolve to the same
  version. Bump together or builds break with cryptic mismatches.
- **Tailwind works in renders** because `remotion.config.ts` applies `enableTailwind` from
  `@remotion/tailwind-v4` and `src/remotion/index.ts` imports `styles.css`. Don't remove either.
- **Fonts:** system stack only by default. If a brand font is required, use `@remotion/google-fonts`
  (deterministic loading) — never a `<link>` tag.
- **Audio:** `<Audio src={staticFile("vo.mp3")} />` from `remotion`; assets go in `public/`.
- **Player page:** every `VIDEOS` entry is playable at `#/video/<id>` via `@remotion/player` —
  use it to demo motion without rendering.
