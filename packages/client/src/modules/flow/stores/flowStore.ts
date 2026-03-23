import { makeAutoObservable, toJS } from "mobx";
import type { FlowNode, FlowEdge, NodeType } from "../types";
import { trackUndo } from "mobx-shallow-undo";

function genId(p: string = "e"): string {
  return `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

class FlowStore {
  // 节点
  nodes: FlowNode[] = [
    { id: "start_1", type: "start", label: "开始", x: 60, y: 180, props: {} },

    {
      id: "proc_1",
      type: "process",
      label: "填写申请",
      x: 220,
      y: 168,
      props: { assignee: "申请人" },
    },

    {
      id: "appr_1",
      type: "approval",
      label: "部门审批",
      x: 420,
      y: 168,
      props: { assignee: "部门经理", timeout: 3 },
    },

    {
      id: "cond_1",
      type: "condition",
      label: "金额判断",
      x: 620,
      y: 164,
      props: { expr: "amount > 10000" },
    },

    {
      id: "appr_2",
      type: "approval",
      label: "总监审批",
      x: 820,
      y: 100,
      props: { assignee: "总监" },
    },

    {
      id: "notify_1",
      type: "notify",
      label: "发送通知",
      x: 820,
      y: 250,
      props: { message: "审批完成" },
    },

    { id: "end_1", type: "end", label: "结束", x: 1020, y: 180, props: {} },
  ];

  // 边
  edges: FlowEdge[] = [
    { id: genId(), source: "start_1", target: "proc_1", label: "" },
    { id: genId(), source: "proc_1", target: "appr_1", label: "" },
    { id: genId(), source: "appr_1", target: "cond_1", label: "同意" },
    { id: genId(), source: "cond_1", target: "appr_2", label: ">1万" },
    { id: genId(), source: "cond_1", target: "notify_1", label: "≤1万" },
    { id: genId(), source: "appr_2", target: "end_1", label: "" },
    { id: genId(), source: "notify_1", target: "end_1", label: "" },
  ];

  selectedNodeId: string = "";
  selectedEdgeId: string | null = null;

  undoer: any;

  constructor() {
    makeAutoObservable(this);
    this.undoer = trackUndo(
      () => ({ nodes: toJS(this.nodes), edges: toJS(this.edges) }),
      (value) => {
        this.nodes = value.nodes;
        this.edges = value.edges;
      },
    );
  }

  /* 计算属性：选中节点 */
  get selectedNode(): FlowNode | undefined {
    return this.nodes.find((n) => n.id === this.selectedNodeId);
  }

  /* 计算属性：选中边 */
  get selectedEdge(): FlowEdge | undefined {
    return this.edges.find((e) => e.id === this.selectedEdgeId);
  }

  addNode(type: NodeType, label: string, x: number, y: number): void {
    const node: FlowNode = {
      id: genId(type),
      type,
      label,
      x,
      y,
      props: {},
    };

    this.nodes.push(node);

    this.selectedNodeId = node.id;
    this.selectedEdgeId = null;
  }

  updateNodePos(id: string, x: number, y: number): void {
    const n = this.nodes.find((n) => n.id === id);

    if (n) {
      n.x = Math.max(0, x);
      n.y = Math.max(0, y);
    }
  }

  addEdge(sourceId: string, targetId: string): void {
    const exists = this.edges.some(
      (e) => e.source === sourceId && e.target === targetId,
    );

    if (!exists) {
      this.edges.push({
        id: genId(),
        source: sourceId,
        target: targetId,
        label: "",
      });
    }
  }

  removeSelected(): void {
    if (this.selectedNodeId) {
      const idx = this.nodes.findIndex((n) => n.id === this.selectedNodeId);

      if (idx > -1) {
        this.nodes.splice(idx, 1);
      }

      const toRemove = this.edges
        .filter(
          (e) =>
            e.source === this.selectedNodeId ||
            e.target === this.selectedNodeId,
        )
        .map((e) => e.id);

      toRemove.forEach((id) => {
        const i = this.edges.findIndex((e) => e.id === id);

        if (i > -1) {
          this.edges.splice(i, 1);
        }
      });

      this.selectedNodeId = "";
    }

    if (this.selectedEdgeId) {
      const idx = this.edges.findIndex((e) => e.id === this.selectedEdgeId);

      if (idx > -1) {
        this.edges.splice(idx, 1);
      }

      this.selectedEdgeId = null;
    }
  }
}

export const flowStore = new FlowStore();












