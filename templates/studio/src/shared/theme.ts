// ABOUTME: TypeScript mirror of the design tokens in styles.css — for SVG attributes and inline styles.
// ABOUTME: Semantic node color triples live here; scenes must use these, never hardcoded hex.

export const theme = {
  ink: "#0F172A",
  muted: "#475569",
  faint: "#94A3B8",
  line: "#CBD5E1",
  surface: "#FFFFFF",
  canvas: "#F8FAFC",
  grid: "#E2E8F0",
  accent: "#6366F1",
  evidence: {
    bg: "#0B1220",
    line: "#1E293B",
    text: "#E2E8F0",
    key: "#7DD3FC",
    value: "#86EFAC",
    dim: "#64748B",
  },
} as const;

export type NodeKind = "start" | "end" | "process" | "decision" | "data" | "danger" | "evidence" | "plain";

export interface NodeColor {
  fill: string;
  stroke: string;
  text: string;
}

export const nodeColors: Record<NodeKind, NodeColor> = {
  start: { fill: "#ECFDF5", stroke: "#10B981", text: "#065F46" },
  end: { fill: "#D1FAE5", stroke: "#059669", text: "#064E3B" },
  process: { fill: "#EEF2FF", stroke: "#6366F1", text: "#312E81" },
  decision: { fill: "#FFFBEB", stroke: "#F59E0B", text: "#78350F" },
  data: { fill: "#F5F3FF", stroke: "#8B5CF6", text: "#4C1D95" },
  danger: { fill: "#FFF1F2", stroke: "#F43F5E", text: "#881337" },
  evidence: { fill: theme.evidence.bg, stroke: theme.evidence.line, text: theme.evidence.text },
  plain: { fill: theme.surface, stroke: theme.line, text: theme.ink },
};
