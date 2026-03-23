import { observer } from "mobx-react-lite";
import { reportStore } from "../stores/reportStore";
import { ChartWidget } from "./ChartWidget";
import { KPIWidget } from "./KPIWidget";
import { TableWidget } from "./TableWidget";

export const Canvas = observer(() => {
  return (
    <div className="flex-1 overflow-auto bg-zinc-50">
      <div className="p-4 min-w-[800px]">
        {!reportStore.widgets.length && (
          <div className="h-[400px] bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
            <p className="text-[13px] font-medium text-zinc-600">点击顶部按钮添加图表</p>
          </div>
        )}
        <div className="grid grid-cols-12 auto-rows-[56px] gap-2.5">
          {reportStore.widgets.map((w) => {
            const style = {
              gridColumn: `${w.gridPos.x + 1}/span ${w.gridPos.w}`,
              gridRow: `${w.gridPos.y + 1}/span ${w.gridPos.h}`,
            };

            return (
              <div
                key={w.id}
                style={style}
                className={`bg-white border rounded-lg overflow-hidden flex flex-col cursor-pointer transition-colors ${
                  reportStore.selectedId === w.id
                    ? "border-blue-500 shadow-[0_0_0_2px_rgba(37,99,235,.12)]"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
                onClick={() => (reportStore.selectedId = w.id)}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 bg-zinc-50 shrink-0">
                  <span className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide">
                    {w.config.title}
                  </span>
                  <button
                    className="text-zinc-500 text-base leading-none px-1 rounded hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      reportStore.removeWidget(w.id);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  {w.type === "kpi" && <KPIWidget widget={w} />}
                  {w.type === "table" && <TableWidget widget={w} />}
                  {!["kpi", "table"].includes(w.type) && <ChartWidget widget={w} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});












