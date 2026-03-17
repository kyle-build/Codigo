import { observer } from "mobx-react-lite";
import { useRef, useState, useEffect } from "react";
import { flowStore } from "./stores/flowStore";

type NodeType =
  | "start"
  | "end"
  | "process"
  | "approval"
  | "condition"
  | "notify";

interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

interface MovingNodeState {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface DrawingEdgeState {
  sourceId: string;
  curX: number;
  curY: number;
}

interface NodeTypeMeta {
  label: string;
  w: number;
  h: number;
}

const NODE_TYPES: Record<NodeType, NodeTypeMeta> = {
  start: { label: "开始", w: 90, h: 40 },
  end: { label: "结束", w: 90, h: 40 },
  process: { label: "处理", w: 130, h: 48 },
  approval: { label: "审批", w: 130, h: 48 },
  condition: { label: "条件判断", w: 120, h: 52 },
  notify: { label: "通知", w: 130, h: 48 },
};

export default observer(() => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [movingNode, setMovingNode] = useState<MovingNodeState | null>(null);

  const [drawingEdge, setDrawingEdge] = useState<DrawingEdgeState | null>(null);

  function nRight(id: string) {
    const n = flowStore.nodes.find((n) => n.id === id);

    if (!n) return { x: 0, y: 0 };

    const t = NODE_TYPES[n.type];

    return {
      x: n.x + t.w,
      y: n.y + t.h / 2,
    };
  }

  function nLeft(id: string) {
    const n = flowStore.nodes.find((n) => n.id === id);

    if (!n) return { x: 0, y: 0 };

    const t = NODE_TYPES[n.type];

    return {
      x: n.x,
      y: n.y + t.h / 2,
    };
  }

  function edgePath(edge: FlowEdge) {
    const s = nRight(edge.source);
    const t = nLeft(edge.target);

    const dx = Math.abs(t.x - s.x) * 0.45;

    return `M${s.x},${s.y} C${s.x + dx},${s.y} ${t.x - dx},${t.y} ${t.x},${
      t.y
    }`;
  }

  function startMove(e: React.MouseEvent, node: FlowNode) {
    e.stopPropagation();

    flowStore.selectedNodeId = node.id;
    flowStore.selectedEdgeId = null;

    setMovingNode({
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.x,
      origY: node.y,
    });
  }

  function startDrawEdge(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation();

    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();

    setDrawingEdge({
      sourceId: nodeId,
      curX: e.clientX - rect.left,
      curY: e.clientY - rect.top,
    });
  }

  function onMouseMove(e: MouseEvent) {
    if (movingNode) {
      flowStore.updateNodePos(
        movingNode.id,
        movingNode.origX + e.clientX - movingNode.startX,
        movingNode.origY + e.clientY - movingNode.startY
      );
    }

    if (drawingEdge && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();

      setDrawingEdge({
        ...drawingEdge,
        curX: e.clientX - rect.left,
        curY: e.clientY - rect.top,
      });
    }
  }

  function onMouseUp(e: MouseEvent) {
    if (drawingEdge && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();

      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const target = flowStore.nodes.find((n) => {
        const t = NODE_TYPES[n.type];

        return mx >= n.x && mx <= n.x + t.w && my >= n.y && my <= n.y + t.h;
      });

      if (target && target.id !== drawingEdge.sourceId) {
        flowStore.addEdge(drawingEdge.sourceId, target.id);
      }

      setDrawingEdge(null);
    }

    setMovingNode(null);
  }

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [movingNode, drawingEdge]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 h-14 px-6 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-white font-mono text-xs font-bold shadow-sm">
            F
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            流程设计器
          </span>
        </div>

        <div className="flex gap-2">
          {Object.entries(NODE_TYPES).map(([key, t]) => (
            <button
              key={key}
              className="text-xs font-medium border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
              onClick={() =>
                flowStore.addNode(
                  key as NodeType,
                  t.label,
                  120 + Math.random() * 300,
                  80 + Math.random() * 180
                )
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 relative bg-slate-50"
          onClick={() => {
            flowStore.selectedNodeId = "";
            flowStore.selectedEdgeId = null;
          }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {flowStore.edges.map((edge) => (
              <path
                key={edge.id}
                d={edgePath(edge)}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
            ))}
          </svg>

          {flowStore.nodes.map((node) => {
            const t = NODE_TYPES[node.type];

            return (
              <div
                key={node.id}
                className="absolute flex items-center justify-center border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-700 cursor-move shadow-sm hover:shadow-md hover:border-emerald-400 transition-all"
                style={{
                  left: node.x,
                  top: node.y,
                  width: t.w,
                  height: t.h,
                }}
                onMouseDown={(e) => startMove(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  flowStore.selectedNodeId = node.id;
                }}
              >
                {t.label}

                <div
                  className="absolute right-[-4px] top-1/2 -mt-1 w-2 h-2 bg-emerald-500 rounded-full cursor-crosshair hover:scale-125 transition-transform"
                  onMouseDown={(e) => startDrawEdge(e, node.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
