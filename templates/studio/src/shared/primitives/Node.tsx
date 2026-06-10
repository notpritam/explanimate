// ABOUTME: Node — the semantic box primitive: start/end/process/decision/data/danger/evidence/plain kinds.
// ABOUTME: Colors come from theme.nodeColors; `evidence` renders a dark code card whose <code> children are lines.

import type { ReactNode } from "react";
import { nodeColors, type NodeKind } from "../theme";
import { Reveal } from "./Reveal";

export interface NodeProps {
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: NodeKind;
  title?: ReactNode;
  sub?: ReactNode;
  /** Motion driver: entrance style + delay (seconds). */
  enter?: "rise" | "none";
  delay?: number;
  /** Progress driver 0..1 (videos). Overrides `enter`. */
  appear?: number;
  className?: string;
  children?: ReactNode;
}

export function Node({
  x,
  y,
  w = 200,
  h = 88,
  kind = "process",
  title,
  sub,
  enter = "rise",
  delay = 0,
  appear,
  className,
  children,
}: NodeProps) {
  const c = nodeColors[kind];
  const evidence = kind === "evidence";

  const box = evidence ? (
    <div
      data-evidence
      className={`flex flex-col rounded-[14px] border-[1.5px] px-4 py-3 text-left ${className ?? ""}`}
      style={{ minHeight: h, width: w, background: c.fill, borderColor: c.stroke, color: c.text }}
    >
      {title ? (
        <div className="mb-1.5 font-mono text-[11px] font-medium tracking-wider uppercase text-evidence-dim">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  ) : (
    <div
      className={`flex flex-col justify-center rounded-[10px] border-[1.5px] px-4 py-3 ${className ?? ""}`}
      style={{ minHeight: h, width: w, background: c.fill, borderColor: c.stroke, color: c.text }}
    >
      {title ? (
        <div className="text-[15px] leading-tight font-semibold">
          {kind === "decision" ? (
            <span className="mr-1.5 text-[11px] align-middle" style={{ color: c.stroke }}>
              ◆
            </span>
          ) : null}
          {title}
        </div>
      ) : null}
      {sub ? <div className="mt-0.5 text-[12.5px] leading-snug opacity-75">{sub}</div> : null}
      {children}
    </div>
  );

  if (enter === "none" && appear === undefined) {
    return (
      <div className="absolute" style={{ left: x, top: y }}>
        {box}
      </div>
    );
  }

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <Reveal delay={delay} appear={appear}>
        {box}
      </Reveal>
    </div>
  );
}
