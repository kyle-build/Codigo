import { observer } from "mobx-react-lite";
import { flowStore } from "../stores/flow-store";
import { NODE_TYPES, NODE_COLORS } from "../constants";
import type { NodeType } from "../types";

function Toolbar() {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 bg-white/60 backdrop-blur-md px-4 py-2 relative z-10">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">事件编排</span>
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
            className="h-7 rounded-md border px-2.5 text-xs transition-colors hover:opacity-80"
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
  );
}

const ToolbarComponent = observer(Toolbar);

export { ToolbarComponent as Toolbar };
