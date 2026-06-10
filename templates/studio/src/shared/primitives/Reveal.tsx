// ABOUTME: Reveal — the one entrance choreographer. Motion rise/fade in scenes; explicit `appear` progress in videos.
// ABOUTME: All other primitives delegate their entrances here so shot-mode and the driver contract live in one place.

import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { useShotMode } from "./shot";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface RevealProps {
  /** Motion driver: entrance delay in seconds (interactive scenes). */
  delay?: number;
  /** Rise distance in px (0 = pure fade). */
  y?: number;
  /** Progress driver 0..1 (videos / Remotion). When set, Motion is bypassed entirely. */
  appear?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function Reveal({ delay = 0, y = 14, appear, className, style, children }: RevealProps) {
  const shot = useShotMode();

  if (appear !== undefined) {
    const p = clamp01(appear);
    return (
      <div className={className} style={{ ...style, opacity: p, transform: `translateY(${(1 - p) * y}px)` }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={shot ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
