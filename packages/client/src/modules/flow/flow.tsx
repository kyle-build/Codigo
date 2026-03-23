import { observer } from "mobx-react-lite";
import { useRef, useState, useEffect } from "react";
import { ApartmentOutlined, EditOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import type { FlowEdge, FlowNode, NodeType } from "./types";
import { flowStore } from "./stores/flowStore";

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
  shape: "pill" | "rect";
}

interface NodeColorMeta {
  bg: string;
  border: string;
  text: string;
}

const NODE_TYPES: Record<NodeType, NodeTypeMeta> = {
  start: { label: "开始", w: 90, h: 40, shape: "pill" },
  end: { label: "结束", w: 90, h: 40, shape: "pill" },
  process: { label: "处理", w: 130, h: 48, shape: "rect" },
  approval: { label: "审批", w: 130, h: 48, shape: "rect" },
  condition: { label: "条件判断", w: 120, h: 52, shape: "rect" },
  notify: { label: "通知", w: 130, h: 48, shape: "rect" },
};

const NODE_COLORS: Record<NodeType, NodeColorMeta> = {
  start: { bg: "#f0fdf4", border: "#86efac", text: "#15803d" },
  end: { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626" },
  process: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  approval: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  condition: { bg: "#faf5ff", border: "#d8b4fe", text: "#7c3aed" },
  notify: { bg: "#ecfeff", border: "#67e8f9", text: "#0e7490" },
};

export default observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
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

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
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
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [movingNode, drawingEdge]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        document.activeElement === document.body
      ) {
        flowStore.removeSelected();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navItems = [
    {
      key: "/editor",
      label: "Editor",
      desc: "编辑器",
      icon: <EditOutlined />,
    },
    {
      key: "/flow",
      label: "Flow",
      desc: "工作流",
      icon: <ApartmentOutlined />,
    },
  ];

  return (
    <div className="flex h-full bg-slate-50">
      <aside className="flex w-20 flex-shrink-0 flex-col gap-2 border-r border-slate-200 bg-white/70 p-3 backdrop-blur-md">
        {navItems.map((item) => {
          const active = location.pathname === item.key;

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`group flex h-14 flex-col items-center justify-center rounded-lg border text-[10px] font-medium transition-all ${
                active
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="mt-1 leading-none">{item.label}</span>
              <span className="mt-0.5 leading-none text-[9px] opacity-80">
                {item.desc}
              </span>
            </button>
          );
        })}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Flow</span>
            <span className="h-4 w-px bg-zinc-200" />
            <span className="text-[11px] text-zinc-500">
              {flowStore.nodes.length} 节点 · {flowStore.edges.length} 连线
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-zinc-500">添加节点：</span>
            {Object.entries(NODE_TYPES).map(([key, t]) => (
              <button
                key={key}
                className="h-7 rounded-md border px-2.5 text-xs transition-colors"
                style={{
                  color: NODE_COLORS[key as NodeType].text,
                  borderColor: NODE_COLORS[key as NodeType].border,
                  background: NODE_COLORS[key as NodeType].bg,
                }}
                onClick={() =>
                  flowStore.addNode(
                    key as NodeType,
                    t.label,
                    120 + Math.random() * 300,
                    80 + Math.random() * 180,
                  )
                }
              >
                {t.label}
              </button>
            ))}
            {(flowStore.selectedNodeId || flowStore.selectedEdgeId) && (
              <button
                className="h-7 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs text-red-600 transition-colors hover:bg-red-100"
                onClick={() => flowStore.removeSelected()}
              >
                删除
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="relative min-h-[500px] min-w-[800px] flex-1 overflow-auto bg-white">
            <div
              className="relative min-h-[500px] min-w-[800px]"
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
                        flowStore.selectedEdgeId === edge.id
                          ? "#18181b"
                          : "#d1d5db"
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
                    } ${flowStore.selectedNodeId === node.id ? "shadow-[0_0_0_3px_rgba(24,24,27,.08)]" : ""}`}
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
          <aside className="flex w-[220px] flex-shrink-0 flex-col border-l border-zinc-200 bg-white">
            <div className="flex h-[38px] flex-shrink-0 items-center border-b border-zinc-200 bg-zinc-50 px-[14px] text-[11px] font-semibold uppercase tracking-[0.07em] text-zinc-600">
              属性
            </div>
            {!flowStore.selectedNode && !flowStore.selectedEdge && (
              <div className="px-5 py-12 text-center text-sm text-zinc-500">
                <p>点击节点或连线</p>
                <p className="mt-3">拖拽右侧圆点</p>
                <p>可连接两个节点</p>
              </div>
            )}
            {flowStore.selectedNode && (
              <div className="flex-1 overflow-y-auto">
                <div className="border-b border-zinc-200 px-[14px] pb-2 pt-3">
                  <div
                    className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.07em]"
                    style={{
                      color: NODE_COLORS[flowStore.selectedNode.type].text,
                    }}
                  >
                    {NODE_TYPES[flowStore.selectedNode.type].label}
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                      名称
                    </label>
                    <input
                      className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                      value={flowStore.selectedNode.label}
                      onChange={(e) => {
                        if (flowStore.selectedNode) {
                          flowStore.selectedNode.label = e.target.value;
                        }
                      }}
                    />
                  </div>
                  {flowStore.selectedNode.type === "approval" && (
                    <>
                      <div className="mb-2 flex items-center gap-2">
                        <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                          审批人
                        </label>
                        <input
                          className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                          value={
                            (flowStore.selectedNode.props.assignee ??
                              "") as string
                          }
                          placeholder="角色/人员"
                          onChange={(e) => {
                            if (flowStore.selectedNode) {
                              flowStore.selectedNode.props.assignee =
                                e.target.value;
                            }
                          }}
                        />
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                          超时(天)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                          value={Number(
                            flowStore.selectedNode.props.timeout ?? 0,
                          )}
                          onChange={(e) => {
                            if (flowStore.selectedNode) {
                              flowStore.selectedNode.props.timeout = Number(
                                e.target.value,
                              );
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                  {flowStore.selectedNode.type === "process" && (
                    <div className="mb-2 flex items-center gap-2">
                      <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                        处理人
                      </label>
                      <input
                        className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                        value={
                          (flowStore.selectedNode.props.assignee ??
                            "") as string
                        }
                        placeholder="角色/人员"
                        onChange={(e) => {
                          if (flowStore.selectedNode) {
                            flowStore.selectedNode.props.assignee =
                              e.target.value;
                          }
                        }}
                      />
                    </div>
                  )}
                  {flowStore.selectedNode.type === "condition" && (
                    <div className="mb-2 flex items-center gap-2">
                      <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                        表达式
                      </label>
                      <input
                        className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs font-mono outline-none focus:border-zinc-400"
                        value={
                          (flowStore.selectedNode.props.expr ?? "") as string
                        }
                        placeholder="x > 1000"
                        onChange={(e) => {
                          if (flowStore.selectedNode) {
                            flowStore.selectedNode.props.expr = e.target.value;
                          }
                        }}
                      />
                    </div>
                  )}
                  {flowStore.selectedNode.type === "notify" && (
                    <div className="mb-2 flex items-center gap-2">
                      <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                        消息内容
                      </label>
                      <input
                        className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                        value={
                          (flowStore.selectedNode.props.message ?? "") as string
                        }
                        onChange={(e) => {
                          if (flowStore.selectedNode) {
                            flowStore.selectedNode.props.message = e.target.value;
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className="mb-2 flex items-center gap-2">
                    <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                      ID
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      {flowStore.selectedNode.id}
                    </span>
                  </div>
                </div>
                <div className="p-[14px]">
                  <button
                    className="h-8 w-full rounded-md border border-red-200 bg-red-50 px-2.5 text-xs text-red-600 transition-colors hover:bg-red-100"
                    onClick={() => flowStore.removeSelected()}
                  >
                    删除节点
                  </button>
                </div>
              </div>
            )}
            {flowStore.selectedEdge && (
              <div className="flex-1 overflow-y-auto">
                <div className="border-b border-zinc-200 px-[14px] pb-2 pt-3">
                  <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-zinc-500">
                    连线
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                      标签
                    </label>
                    <input
                      className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                      value={flowStore.selectedEdge.label}
                      placeholder="（可选）"
                      onChange={(e) => {
                        if (flowStore.selectedEdge) {
                          flowStore.selectedEdge.label = e.target.value;
                        }
                      }}
                    />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                      来源
                    </label>
                    <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600">
                      {
                        flowStore.nodes.find(
                          (n) => n.id === flowStore.selectedEdge?.source,
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                      目标
                    </label>
                    <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600">
                      {
                        flowStore.nodes.find(
                          (n) => n.id === flowStore.selectedEdge?.target,
                        )?.label
                      }
                    </span>
                  </div>
                </div>
                <div className="p-[14px]">
                  <button
                    className="h-8 w-full rounded-md border border-red-200 bg-red-50 px-2.5 text-xs text-red-600 transition-colors hover:bg-red-100"
                    onClick={() => flowStore.removeSelected()}
                  >
                    删除连线
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
        <div className="flex h-[30px] flex-shrink-0 items-center border-t border-zinc-200 bg-zinc-50 px-4 text-[11px] text-zinc-500">
          拖拽节点移动 · 拖拽节点右侧圆点连线 · Delete 键删除选中
        </div>
      </div>
    </div>
  );
});












