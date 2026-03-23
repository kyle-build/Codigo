/* 节点类型定义 */
export type NodeType =
  | "start"
  | "process"
  | "approval"
  | "condition"
  | "notify"
  | "end";

/* 节点属性（宽松版） */
export interface NodeProps {
  [key: string]: any;
}

/* 节点结构 */
export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  props: NodeProps;
}

/* 边结构 */
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}












