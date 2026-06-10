// ABOUTME: Stage — fixed-coordinate scene container (default 1280×720) that scales to fit its viewport.
// ABOUTME: Children position absolutely in stage pixels; signals data-scene-ready for shoot.mjs.

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface StageProps {
  w?: number;
  h?: number;
  /** Dot-grid backdrop. */
  grid?: boolean;
  /**
   * Fixed scale factor. REQUIRED inside Remotion compositions (e.g. scale={1.5} maps a 1280×720
   * scene onto 1920×1080) — the auto-fit ResizeObserver is async and not frame-deterministic.
   */
  scale?: number;
  className?: string;
  children?: ReactNode;
}

export function Stage({ w = 1280, h = 720, grid = true, scale: fixedScale, className, children }: StageProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);
  const [ready, setReady] = useState(false);
  const scale = fixedScale ?? autoScale;

  useEffect(() => {
    if (fixedScale !== undefined) return;
    const el = outerRef.current;
    if (!el) return;
    const fit = () => {
      const rect = el.getBoundingClientRect();
      setAutoScale(Math.min(rect.width / w, rect.height / h, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, fixedScale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={outerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div style={{ width: w * scale, height: h * scale }}>
        <div
          data-stage-root
          data-scene-ready={ready}
          className={`relative isolate overflow-hidden bg-canvas ${className ?? ""}`}
          style={{
            width: w,
            height: h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundImage: grid ? "radial-gradient(circle, var(--color-grid) 1px, transparent 1px)" : undefined,
            backgroundSize: grid ? "24px 24px" : undefined,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
