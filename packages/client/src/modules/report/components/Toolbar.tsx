import { chartTemplates } from "../types/widgetTemplates";
import { reportStore } from "../stores/reportStore";
import { DeleteOutlined } from "@ant-design/icons";

export function Toolbar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 h-14 px-6 bg-white/80 backdrop-blur-md z-10 relative">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-white font-mono text-xs font-bold shadow-sm">
          R
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">
          报表设计器
        </span>
      </div>

      <div className="flex gap-2">
        {chartTemplates.map((t) => (
          <button
            key={t.type}
            onClick={() => reportStore.addWidget(t)}
            className="text-xs font-medium border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
          >
            {t.label}
          </button>
        ))}

        <button
          onClick={() => reportStore.clearAll()}
          className="text-xs font-medium border border-red-200 bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition-all shadow-sm flex items-center gap-1"
        >
          <DeleteOutlined /> 清空
        </button>
      </div>
    </div>
  );
}
