// ABOUTME: Label — free-floating typographic text at stage coordinates; the DEFAULT way to put text in a scene.
// ABOUTME: Levels (title/section/body/caption) encode hierarchy so scenes never invent font sizes.

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export type LabelLevel = "title" | "section" | "body" | "caption";

export interface LabelProps {
  x: number;
  y: number;
  level?: LabelLevel;
  align?: "left" | "center" | "right";
  /** Wrap width in px; unset = single line. */
  maxW?: number;
  color?: string;
  delay?: number;
  appear?: number;
  className?: string;
  children?: ReactNode;
}

const LEVEL_CLASS: Record<LabelLevel, string> = {
  title: "text-[30px] font-bold tracking-tight text-ink",
  section: "text-[14px] font-semibold uppercase tracking-wider text-muted",
  body: "text-[15px] font-medium text-ink",
  caption: "text-[12.5px] font-normal text-faint",
};

const ALIGN_TRANSFORM = { left: "0%", center: "-50%", right: "-100%" } as const;

export function Label({
  x,
  y,
  level = "body",
  align = "left",
  maxW,
  color,
  delay = 0,
  appear,
  className,
  children,
}: LabelProps) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        transform: `translateX(${ALIGN_TRANSFORM[align]})`,
        // max-content stops the containing block's edges from forcing shrink-to-fit wrapping.
        width: "max-content",
        maxWidth: maxW,
      }}
    >
      <Reveal delay={delay} appear={appear} y={10}>
        <div
          className={`${LEVEL_CLASS[level]} ${className ?? ""}`}
          style={{ color, textAlign: align, width: maxW ? "max-content" : undefined, maxWidth: maxW }}
        >
          {children}
        </div>
      </Reveal>
    </div>
  );
}
