import { observer } from "mobx-react-lite";
import { useRef, useState, useEffect } from "react";
import { flowStore } from "../stores/flow-store";
import { NODE_TYPES, NODE_COLORS } from "../constants";
import type { FlowEdge, FlowNode } from "../types";

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

function Canvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [movingNode, setMovingNode] = useState<MovingNodeState | null>(null);
  const [drawingEdge, setDrawingEdge] = useState<DrawingEdgeState | null>(null);

  // Helper functions
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
    return `M${s.x},${s.y} C${s.x + dx},${s.y} ${t.x - dx},${t.y} ${t.x},${t.y}`;
  }

  function edgeMid(edge: FlowEdge) {
    const s = nRight(edge.source);
    const t = nLeft(edge.target);
    return {
      x: (s.x + t.x) / 2,
      y: (s.y + t.y) / 2,
    };
  }

  // Event Handlers
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

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (movingNode) {
        flowStore.updateNodePos(
          movingNode.id,
          movingNode.origX + e.clientX - movingNode.startX,
          movingNode.origY + e.clientY - movingNode.startY,
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
    };

    const onMouseUp = (e: MouseEvent) => {
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
    };

    if (movingNode || drawingEdge) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [movingNode, drawingEdge]);

  return (
    <div className="flex-auto flex items-center justify-center bg-slate-100/50 relative overflow-auto p-8">
      <div className="absolute w-[400px] h-[720px] bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
      <div className="editor-canvas-container relative z-10 bg-white text-left overflow-hidden shadow-2xl rounded-lg border border-slate-200 transition-all duration-300 w-full h-full flex flex-col">
        <div
          className="relative w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e4e4e7 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
          onClick={() => {
            flowStore.selectedNodeId = "";
            flowStore.selectedEdgeId = null;
          }}
        >
          <svg
            ref={svgRef}
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <marker
                id="arr"
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#d1d5db" />
              </marker>
              <marker
                id="arr-sel"
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#18181b" />
              </marker>
            </defs>
            {flowStore.edges.map((edge) => (
              <g
                key={edge.id}
                onClick={(e) => {
                  e.stopPropagation();
                  flowStore.selectedEdgeId = edge.id;
                  flowStore.selectedNodeId = "";
                }}
              >
                <path
                  d={edgePath(edge)}
                  fill="none"
                  stroke={
                    flowStore.selectedEdgeId === edge.id ? "#18181b" : "#d1d5db"
                  }
                  strokeWidth="1.5"
                  markerEnd={
                    flowStore.selectedEdgeId === edge.id
                      ? "url(#arr-sel)"
                      : "url(#arr)"
                  }
                  style={{ cursor: "pointer" }}
                />
                {edge.label && (
                  <text
                    x={edgeMid(edge).x}
                    y={edgeMid(edge).y - 5}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="10"
                    fontFamily="Geist, sans-serif"
                  >
                    {edge.label}
                  </text>
                )}
                <path
                  d={edgePath(edge)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="12"
                  style={{ cursor: "pointer" }}
                />
              </g>
            ))}
            {drawingEdge && (
              <line
                x1={nRight(drawingEdge.sourceId).x}
                y1={nRight(drawingEdge.sourceId).y}
                x2={drawingEdge.curX}
                y2={drawingEdge.curY}
                stroke="#18181b"
                strokeWidth="1.5"
                strokeDasharray="5,3"
              />
            )}
          </svg>

          {flowStore.nodes.map((node) => {
            const t = NODE_TYPES[node.type];
            const color = NODE_COLORS[node.type];

            return (
              <div
                key={node.id}
                className={`absolute z-10 flex cursor-move select-none items-center justify-center border-[1.5px] text-xs font-medium transition-shadow hover:shadow-md ${
                  t.shape === "pill" ? "rounded-full" : "rounded-md"
                } ${
                  flowStore.selectedNodeId === node.id
                    ? "shadow-[0_0_0_3px_rgba(24,24,27,.08)]"
                    : ""
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: t.w,
                  height: t.h,
                  background: color.bg,
                  borderColor:
                    flowStore.selectedNodeId === node.id
                      ? "#18181b"
                      : color.border,
                  color: color.text,
                }}
                onMouseDown={(e) => startMove(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  flowStore.selectedNodeId = node.id;
                  flowStore.selectedEdgeId = null;
                }}
              >
                <span>{node.label}</span>
                <div
                  className="absolute right-[-6px] top-1/2 z-20 h-[10px] w-[10px] -translate-y-1/2 cursor-crosshair rounded-full border-2 border-white bg-zinc-900 transition-transform hover:scale-150"
                  onMouseDown={(e) => startDrawEdge(e, node.id)}
                  title="拖拽连线"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const CanvasComponent = observer(Canvas);

export { CanvasComponent as Canvas };
