import type { NodeType } from "./types";

export interface NodeTypeMeta {
  label: string;
  w: number;
  h: number;
  shape: "pill" | "rect";
}

export interface NodeColorMeta {
  bg: string;
  border: string;
  text: string;
}

export const NODE_TYPES: Record<NodeType, NodeTypeMeta> = {
  start: { label: "开始", w: 90, h: 40, shape: "pill" },
  end: { label: "结束", w: 90, h: 40, shape: "pill" },
  process: { label: "处理", w: 130, h: 48, shape: "rect" },
  approval: { label: "审批", w: 130, h: 48, shape: "rect" },
  condition: { label: "条件判断", w: 120, h: 52, shape: "rect" },
  notify: { label: "通知", w: 130, h: 48, shape: "rect" },
};

export const NODE_COLORS: Record<NodeType, NodeColorMeta> = {
  start: { bg: "#f0fdf4", border: "#86efac", text: "#15803d" },
  end: { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626" },
  process: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  approval: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  condition: { bg: "#faf5ff", border: "#d8b4fe", text: "#7c3aed" },
  notify: { bg: "#ecfeff", border: "#67e8f9", text: "#0e7490" },
};
