// ABOUTME: Scene explaining explanimate itself — the pipeline from prompt to verified, animated artifact.
// ABOUTME: Patterns: assembly line (main flow) + cycle (verify loop) + evidence artifacts. The reference scene.

import { Stage, Node, Edge, Label, theme, nodeColors } from "../../shared/primitives";

const FLOW_Y = 170;
const MID_Y = FLOW_Y + 46;

export default function Scene() {
  return (
    <Stage w={1280} h={720} grid>
      <Label x={64} y={40} level="title" delay={0}>
        How explanimate works
      </Label>
      <Label x={64} y={86} level="caption" delay={0.1}>
        a diagram is code — designed, animated, verified, shipped
      </Label>

      {/* zone headers */}
      <Label x={64} y={138} level="section" delay={0}>
        author
      </Label>
      <Label x={700} y={138} level="section" delay={0.55}>
        prove
      </Label>
      <Label x={1020} y={138} level="section" delay={0.85}>
        deliver
      </Label>

      {/* main flow — assembly line */}
      <Node x={64} y={FLOW_Y} w={190} h={92} kind="start" title="Prompt" sub="user intent" enter="rise" delay={0} />
      <Edge from={{ x: 254, y: MID_Y }} to={{ x: 350, y: MID_Y }} label="design" enter="draw" delay={0.2} />
      <Node
        x={350}
        y={FLOW_Y}
        w={250}
        h={92}
        kind="process"
        title="Scene as code"
        sub="React · SVG · Tailwind · Motion"
        enter="rise"
        delay={0.3}
      />
      <Edge from={{ x: 600, y: MID_Y }} to={{ x: 700, y: MID_Y }} label="render" enter="draw" delay={0.45} />
      <Node
        x={700}
        y={FLOW_Y}
        w={220}
        h={92}
        kind="process"
        title="Verify loop"
        sub="shoot → Read → fix"
        enter="rise"
        delay={0.55}
      />
      <Edge from={{ x: 920, y: MID_Y }} to={{ x: 1020, y: MID_Y }} label="approve" enter="draw" delay={0.75} />
      <Node
        x={1020}
        y={FLOW_Y}
        w={190}
        h={92}
        kind="end"
        title="Ship"
        sub="PNG · URL · MP4"
        enter="rise"
        delay={0.85}
      />

      {/* the verify cycle — the hero idea */}
      <Edge
        from={{ x: 810, y: FLOW_Y + 92 }}
        to={{ x: 475, y: FLOW_Y + 92 }}
        via={[{ x: 640, y: 380 }]}
        label="fix & reshoot"
        color={theme.accent}
        width={2.5}
        enter="draw"
        delay={1.1}
      />
      <Label x={640} y={398} level="caption" align="center" delay={1.3}>
        2–4 iterations, typically
      </Label>

      {/* evidence artifacts — what things actually look like */}
      <Edge from={{ x: 430, y: FLOW_Y + 92 }} to={{ x: 280, y: 430 }} dashed width={1} />
      <Edge from={{ x: 845, y: FLOW_Y + 92 }} to={{ x: 855, y: 430 }} dashed width={1} />

      <Node x={64} y={430} w={380} h={172} kind="evidence" title="Scene.tsx — what the agent writes" delay={0.95}>
        <code>{`<Stage w={1280} h={720} grid>`}</code>
        <code>
          {`  <Node kind=`}
          <span className="v">{`"start"`}</span>
          {` title=`}
          <span className="v">{`"Prompt"`}</span>
          {` />`}
        </code>
        <code>
          {`  <Edge from={a} to={b} enter=`}
          <span className="v">{`"draw"`}</span>
          {` />`}
        </code>
        <code>
          {`  <Label level=`}
          <span className="v">{`"title"`}</span>
          {`>…</Label>`}
        </code>
        <code>{`</Stage>`}</code>
      </Node>

      <Node x={700} y={430} w={310} h={172} kind="plain" enter="rise" delay={1.05} className="!px-2 !py-2">
        <div className="px-2 pt-1 pb-1.5 font-mono text-[10.5px] text-faint">shots/how-explanimate-works.png</div>
        <div className="relative h-[118px] overflow-hidden rounded-[6px] border border-line bg-surface">
          <div
            className="absolute top-1/2 left-4 h-8 w-18 -translate-y-1/2 rounded-[4px] border-[1.5px]"
            style={{ borderColor: nodeColors.start.stroke, background: nodeColors.start.fill }}
          />
          <div className="absolute top-1/2 left-[96px] h-px w-12 bg-line" />
          <div
            className="absolute top-1/2 left-[152px] h-8 w-18 -translate-y-1/2 rounded-[4px] border-[1.5px]"
            style={{ borderColor: nodeColors.process.stroke, background: nodeColors.process.fill }}
          />
          <div className="absolute right-3 bottom-2 font-mono text-[10px] text-faint">what the agent Reads</div>
        </div>
      </Node>

      <Node x={1040} y={430} w={216} h={108} kind="evidence" title="verify" delay={1.15}>
        <code>
          <span className="d">$</span>
          {` pnpm shoot --all`}
        </code>
        <code>
          <span className="v">{`✓`}</span>
          {` 1 scene captured`}
        </code>
      </Node>

      <Label x={1216} y={688} level="caption" align="right" delay={1.4}>
        explanimate · the reference scene
      </Label>
    </Stage>
  );
}
