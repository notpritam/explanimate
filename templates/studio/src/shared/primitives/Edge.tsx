// ABOUTME: Edge — SVG connector between stage points: smooth/ortho/straight routing, arrowhead, haloed label.
// ABOUTME: Draw contract: `enter="draw"` = Motion pathLength (scenes); `draw` 0..1 = dash-offset progress (videos).

import { motion } from "motion/react";
import { theme } from "../theme";
import { useShotMode } from "./shot";

export interface Pt {
  x: number;
  y: number;
}

export interface EdgeProps {
  from: Pt;
  to: Pt;
  /** Intermediate waypoints for routing around elements. */
  via?: Pt[];
  /** auto = smooth curve · ortho = elbow (H-V-H) · line = straight segments. */
  curve?: "auto" | "ortho" | "line";
  color?: string;
  width?: number;
  /** Dashed edges render statically (no draw animation) — weak/optional links. */
  dashed?: boolean;
  arrow?: boolean;
  label?: string;
  labelOffset?: Pt;
  /** Motion driver: draw-in on mount (interactive scenes). */
  enter?: "draw" | "none";
  delay?: number;
  /** Progress driver 0..1 (videos). Overrides `enter`. */
  draw?: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function buildPath(pts: Pt[], curve: "auto" | "ortho" | "line"): { d: string; endDir: Pt } {
  const from = pts[0];
  const to = pts[pts.length - 1];

  if (curve === "ortho" && pts.length === 2) {
    const midX = (from.x + to.x) / 2;
    return {
      d: `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`,
      endDir: { x: to.x - midX, y: 0 },
    };
  }

  if (curve === "auto" && pts.length === 2) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const c1 = horizontal ? { x: from.x + dx * 0.5, y: from.y } : { x: from.x, y: from.y + dy * 0.5 };
    const c2 = horizontal ? { x: to.x - dx * 0.5, y: to.y } : { x: to.x, y: to.y - dy * 0.5 };
    return {
      d: `M ${from.x} ${from.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`,
      endDir: { x: to.x - c2.x, y: to.y - c2.y },
    };
  }

  if (curve === "auto" && pts.length > 2) {
    // Smooth through waypoints: quadratic segments through successive midpoints.
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
      d += ` Q ${pts[i].x} ${pts[i].y} ${mid.x} ${mid.y}`;
    }
    d += ` L ${to.x} ${to.y}`;
    const last = pts[pts.length - 2];
    return { d, endDir: { x: to.x - last.x, y: to.y - last.y } };
  }

  // "line" (and ortho with explicit via): straight segments through every point.
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const last = pts[pts.length - 2];
  return { d, endDir: { x: to.x - last.x, y: to.y - last.y } };
}

export function Edge({
  from,
  to,
  via,
  curve = "auto",
  color = theme.line,
  width = 1.5,
  dashed = false,
  arrow = true,
  label,
  labelOffset,
  enter = "none",
  delay = 0,
  draw,
}: EdgeProps) {
  const shot = useShotMode();

  const arrowLen = arrow ? 4 + width * 3.2 : 0;
  const arrowHalf = arrowLen * 0.42;
  const points = [from, ...(via ?? []), to];

  // Shorten the path so the line never pokes past the arrow tip.
  const { endDir } = buildPath(points, curve);
  const mag = Math.hypot(endDir.x, endDir.y) || 1;
  const lineEnd = arrow
    ? { x: to.x - (endDir.x / mag) * arrowLen * 0.8, y: to.y - (endDir.y / mag) * arrowLen * 0.8 }
    : to;
  const { d } = buildPath([from, ...(via ?? []), lineEnd], curve);
  const angle = (Math.atan2(endDir.y, endDir.x) * 180) / Math.PI;

  const anchor = via && via.length > 0 ? via[Math.floor((via.length - 1) / 2)] : null;
  const labelPos = {
    x: (anchor ? anchor.x : (from.x + to.x) / 2) + (labelOffset?.x ?? 0),
    y: (anchor ? anchor.y : (from.y + to.y) / 2) - 9 + (labelOffset?.y ?? 0),
  };

  const animated = !dashed && draw === undefined && enter === "draw" && !shot;
  const p = draw !== undefined ? clamp01(draw) : 1;

  const arrowHead = arrow ? (
    <polygon
      points={`${-arrowLen},${-arrowHalf} 0,0 ${-arrowLen},${arrowHalf}`}
      transform={`translate(${to.x}, ${to.y}) rotate(${angle})`}
      fill={color}
    />
  ) : null;

  const text = label ? (
    <text
      x={labelPos.x}
      y={labelPos.y}
      textAnchor="middle"
      fontSize={12.5}
      fontWeight={500}
      fill={theme.muted}
      stroke="var(--color-canvas)"
      strokeWidth={4}
      strokeLinejoin="round"
      style={{ paintOrder: "stroke" }}
    >
      {label}
    </text>
  ) : null;

  return (
    <svg className="pointer-events-none absolute inset-0 overflow-visible" width="100%" height="100%">
      {animated ? (
        <>
          <motion.path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay, ease: "easeInOut" }}
          />
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: delay + 0.38 }}
          >
            {arrowHead}
            {text}
          </motion.g>
        </>
      ) : (
        <>
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            opacity={dashed ? p : undefined}
            pathLength={dashed ? undefined : 1}
            strokeDasharray={dashed ? "6 5" : "1 1"}
            strokeDashoffset={dashed ? undefined : 1 - p}
          />
          <g opacity={p >= 0.97 ? 1 : 0}>{arrowHead}</g>
          {text ? <g opacity={p}>{text}</g> : null}
        </>
      )}
    </svg>
  );
}
