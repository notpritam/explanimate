// ABOUTME: Video registry — one list that feeds both Remotion's <Composition> (CLI renders) and the gallery <Player>.
// ABOUTME: Adding a video = one import + one entry; the id is the CLI argument and the player URL.

import type { ComponentType } from "react";
import { HowExplanimateWorksVideo } from "./compositions/HowExplanimateWorks";

export interface VideoDef {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export const VIDEOS: VideoDef[] = [
  {
    id: "how-explanimate-works",
    title: "How explanimate works",
    description: "Frame-driven retelling of the reference scene — 10s, 1080p.",
    component: HowExplanimateWorksVideo,
    durationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
  },
];
