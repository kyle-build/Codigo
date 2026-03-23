import { makeAutoObservable } from "mobx";

export interface NodeStyle {
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  style: NodeStyle;
}

export interface WidgetDef {
  type: string;
  defaultStyle: NodeStyle;
}

function genId(p = "n"): string {
  return `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class PageStore {
  nodes: Node[] = [];
  selectedId: string | null = null;
  previewMode = false;

  constructor() {
    makeAutoObservable(this);
  }

  get selected(): Node | undefined {
    return this.nodes.find((n) => n.id === this.selectedId);
  }

  addNode(widgetDef: WidgetDef, x = 60, y = 60): Node {
    const node: Node = {
      id: genId(),
      type: widgetDef.type,
      x,
      y,
      style: deepClone(widgetDef.defaultStyle),
    };

    this.nodes.push(node);
    this.selectedId = node.id;
    return node;
  }

  removeNode(id: string) {
    const idx = this.nodes.findIndex((n) => n.id === id);
    if (idx > -1) this.nodes.splice(idx, 1);

    if (this.selectedId === id) {
      this.selectedId = null;
    }
  }

  updateStyle(id: string, key: string, value: any) {
    const node = this.nodes.find((n) => n.id === id);
    if (node) {
      node.style[key] = value;
    }
  }

  updatePosition(id: string, x: number, y: number) {
    const node = this.nodes.find((n) => n.id === id);
    if (node) {
      node.x = Math.max(0, x);
      node.y = Math.max(0, y);
    }
  }

  updateSize(id: string, w: number, h: number) {
    const node = this.nodes.find((n) => n.id === id);

    if (node) {
      node.style.width = Math.max(60, w);
      node.style.height = Math.max(20, h);
    }
  }

  bringForward(id: string) {
    const i = this.nodes.findIndex((n) => n.id === id);

    if (i < this.nodes.length - 1) {
      const [n] = this.nodes.splice(i, 1);
      this.nodes.splice(i + 1, 0, n);
    }
  }

  sendBackward(id: string) {
    const i = this.nodes.findIndex((n) => n.id === id);

    if (i > 0) {
      const [n] = this.nodes.splice(i, 1);
      this.nodes.splice(i - 1, 0, n);
    }
  }

  clearAll() {
    this.nodes = [];
    this.selectedId = null;
  }
}

export const pageStore = new PageStore();












