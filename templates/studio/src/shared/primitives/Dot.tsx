// ABOUTME: Dot — small circular marker centered on (x, y): timeline points, anchors, connection nodes.
// ABOUTME: Use instead of full Nodes when the element is a visual anchor, not a container.

import { theme } from "../theme";
import { Reveal } from "./Reveal";

export interface DotProps {
  x: number;
  y: number;
  r?: number;
  color?: string;
  delay?: number;
  appear?: number;
  className?: string;
}

export function Dot({ x, y, r = 6, color = theme.accent, delay = 0, appear, className }: DotProps) {
  return (
    <div className="absolute" style={{ left: x - r, top: y - r }}>
      <Reveal delay={delay} appear={appear} y={6}>
        <div className={`rounded-full ${className ?? ""}`} style={{ width: r * 2, height: r * 2, background: color }} />
      </Reveal>
    </div>
  );
}
