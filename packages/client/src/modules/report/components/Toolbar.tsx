import { chartTemplates } from "../types/widgetTemplates";
import { reportStore } from "../stores/reportStore";
import { DeleteOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";

export const Toolbar = observer(() => {
  return (
    <div className="h-12 px-4 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Report</span>
        <span className="w-px h-4 bg-zinc-200" />
        <span className="text-[11px] text-zinc-500">{reportStore.widgets.length} 个图表</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-zinc-500">添加：</span>
        {chartTemplates.map((t) => (
          <button
            key={t.type}
            onClick={() => reportStore.addWidget(t)}
            className="text-xs px-2.5 h-7 border border-zinc-200 bg-white rounded-md hover:bg-zinc-50 transition-colors"
          >
            {t.label}
          </button>
        ))}

        <button
          onClick={() => reportStore.clearAll()}
          className="text-xs h-7 px-2.5 border border-red-200 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
        >
          <DeleteOutlined /> 清空
        </button>
      </div>
    </div>
  );
});












