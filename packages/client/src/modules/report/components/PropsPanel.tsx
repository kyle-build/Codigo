import { observer } from "mobx-react-lite";
import { reportStore } from "../stores/reportStore";

export const PropsPanel = observer(() => {
  const selected = reportStore.selected;

  if (!selected) {
    return (
      <div className="w-[220px] shrink-0 bg-white border-l border-zinc-200 flex flex-col">
        <div className="h-[38px] px-3.5 border-b border-zinc-200 flex items-center text-[11px] font-semibold text-zinc-700 uppercase tracking-[0.07em] bg-zinc-50">
          配置
        </div>
        <div className="px-5 py-12 text-center text-zinc-500 text-xs leading-5">
          点击图表
          <br />
          配置数据与样式
        </div>
      </div>
    );
  }

  return (
    <aside className="w-[220px] shrink-0 bg-white border-l border-zinc-200 flex flex-col">
      <div className="h-[38px] px-3.5 border-b border-zinc-200 flex items-center text-[11px] font-semibold text-zinc-700 uppercase tracking-[0.07em] bg-zinc-50">
        配置
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-3.5 py-3 border-b border-zinc-200">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.07em] mb-2.5">
            图表
          </div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-[11px] text-zinc-700 min-w-10">标题</label>
            <input
              className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
              value={selected.config.title}
              onChange={(e) => (selected.config.title = e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-[11px] text-zinc-700 min-w-10">数据源</label>
            <select
              className="text-xs px-2 py-1 border border-zinc-300 rounded w-full bg-white"
              value={selected.config.dsId}
              onChange={(e) => (selected.config.dsId = e.target.value)}
            >
              {reportStore.dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name}
                </option>
              ))}
            </select>
          </div>
          {"color" in selected.config && (
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-zinc-700">主色</label>
              <input
                type="color"
                className="w-9 h-[26px] border border-zinc-300 rounded p-px bg-transparent cursor-pointer"
                value={selected.config.color}
                onChange={(e) => (selected.config.color = e.target.value)}
              />
            </div>
          )}
        </div>
        {!["kpi", "pie", "table"].includes(selected.type) && (
          <div className="px-3.5 py-3 border-b border-zinc-200">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.07em] mb-2.5">
              字段
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-[11px] text-zinc-700 min-w-10">X 轴</label>
              <input
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.config.xField || ""}
                onChange={(e) => (selected.config.xField = e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-zinc-700 min-w-10">Y 轴</label>
              <input
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.config.yField || ""}
                onChange={(e) => (selected.config.yField = e.target.value)}
              />
            </div>
          </div>
        )}
        {selected.type === "pie" && (
          <div className="px-3.5 py-3 border-b border-zinc-200">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.07em] mb-2.5">
              字段
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-[11px] text-zinc-700 min-w-10">名称</label>
              <input
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.config.nameField || ""}
                onChange={(e) => (selected.config.nameField = e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-zinc-700 min-w-10">数值</label>
              <input
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.config.valueField || ""}
                onChange={(e) => (selected.config.valueField = e.target.value)}
              />
            </div>
          </div>
        )}
        {selected.type === "kpi" && (
          <div className="px-3.5 py-3 border-b border-zinc-200">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.07em] mb-2.5">
              KPI
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-[11px] text-zinc-700 min-w-10">字段</label>
              <input
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.config.field || ""}
                onChange={(e) => (selected.config.field = e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-zinc-700 min-w-10">聚合</label>
              <select
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full bg-white"
                value={selected.config.agg || ""}
                onChange={(e) => (selected.config.agg = e.target.value)}
              >
                <option value="">求和</option>
                <option value="avg">平均</option>
                <option value="max">最大值</option>
                <option value="count_gt">计数</option>
              </select>
            </div>
          </div>
        )}
        <div className="px-3.5 py-3 border-b border-zinc-200">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.07em] mb-2.5">
            布局
          </div>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="block text-[10px] text-zinc-500 mb-1">列起始</label>
              <input
                type="number"
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.gridPos.x}
                min={0}
                max={11}
                onChange={(e) => (selected.gridPos.x = Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-zinc-500 mb-1">行起始</label>
              <input
                type="number"
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.gridPos.y}
                min={0}
                onChange={(e) => (selected.gridPos.y = Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-zinc-500 mb-1">列宽</label>
              <input
                type="number"
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.gridPos.w}
                min={1}
                max={12}
                onChange={(e) => (selected.gridPos.w = Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-zinc-500 mb-1">行高</label>
              <input
                type="number"
                className="text-xs px-2 py-1 border border-zinc-300 rounded w-full"
                value={selected.gridPos.h}
                min={2}
                onChange={(e) => (selected.gridPos.h = Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <div className="p-3.5">
          <button
            className="w-full text-xs h-8 border border-red-200 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            onClick={() => reportStore.removeWidget(selected.id)}
          >
            删除图表
          </button>
        </div>
      </div>
    </aside>
  );
});












