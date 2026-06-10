// ABOUTME: Barrel for the primitive vocabulary — Stage, Node, Edge, Label, Dot, Reveal + shot-mode + theme.
// ABOUTME: Scenes and compositions import everything from here; the public API of the skill lives at this surface.

export { Stage, type StageProps } from "./Stage";
export { Node, type NodeProps } from "./Node";
export { Edge, type EdgeProps, type Pt } from "./Edge";
export { Label, type LabelProps, type LabelLevel } from "./Label";
export { Dot, type DotProps } from "./Dot";
export { Reveal, type RevealProps, EASE } from "./Reveal";
export { useShotMode, isShotMode } from "./shot";
export { theme, nodeColors, type NodeKind, type NodeColor } from "../theme";
