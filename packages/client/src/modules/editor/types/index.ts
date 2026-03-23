export type NodeType =
  | "text"
  | "button"
  | "input"
  | "image"
  | "card"
  | "divider"
  | "badge";

export interface NodeStyle {
  width?: number;
  height?: number;
  background?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  borderRadius?: number;
  padding?: number;
  border?: string;
  content?: string;
  placeholder?: string;
  src?: string;
}

export interface CanvasNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  style: NodeStyle;
}












