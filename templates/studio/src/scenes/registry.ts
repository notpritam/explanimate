// ABOUTME: Scene registry — the single list the gallery, router, and shoot script all read.
// ABOUTME: Adding a scene = one import + one entry here; the id doubles as the URL and the shot filename.

import type { ComponentType } from "react";
import HowExplanimateWorks from "./how-explanimate-works/Scene";

export interface SceneDef {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
}

export const SCENES: SceneDef[] = [
  {
    id: "how-explanimate-works",
    title: "How explanimate works",
    description: "The skill's own pipeline — a scene is code: designed, animated, verified, shipped.",
    component: HowExplanimateWorks,
  },
];
