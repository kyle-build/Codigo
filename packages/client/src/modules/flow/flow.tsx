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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b h-12 px-4">
        <div className="text-sm font-semibold">Flow</div>

        <div className="flex gap-2">
          {Object.entries(NODE_TYPES).map(([key, t]) => (
            <button
              key={key}
              className="text-xs border px-2 py-1 rounded hover:bg-gray-100"
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
          className="flex-1 relative bg-gray-50"
          onClick={() => {
            flowStore.selectedNodeId = "";
            flowStore.selectedEdgeId = null;
          }}
        >
          <svg ref={svgRef} className="absolute inset-0 w-full h-full">
            {flowStore.edges.map((edge) => (
              <path
                key={edge.id}
                d={edgePath(edge)}
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
              />
            ))}
          </svg>

          {flowStore.nodes.map((node) => {
            const t = NODE_TYPES[node.type];

            return (
              <div
                key={node.id}
                className="absolute flex items-center justify-center border rounded bg-white text-xs cursor-move"
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
                {node.label}

                <div
                  className="absolute right-[-6px] top-1/2 w-2 h-2 bg-black rounded-full cursor-crosshair"
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
