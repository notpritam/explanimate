// ABOUTME: Shot-mode detection — true when shoot.mjs is capturing, or inside Remotion render/player.
// ABOUTME: In shot mode, primitives skip Motion entrances and render their FINAL state (deterministic pixels).

import { getRemotionEnvironment } from "remotion";

declare global {
  interface Window {
    __EXPLANIMATE_SHOT__?: boolean;
  }
}

export function isShotMode(): boolean {
  const env = getRemotionEnvironment();
  if (env.isRendering || env.isPlayer) return true;
  if (typeof window === "undefined") return true;
  return Boolean(window.__EXPLANIMATE_SHOT__) || window.location.href.includes("shot=1");
}

/** Hook flavor for scene code. Gate any looping/repeating animation on this. */
export function useShotMode(): boolean {
  return isShotMode();
}
