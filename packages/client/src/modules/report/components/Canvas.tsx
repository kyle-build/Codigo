import { observer } from "mobx-react-lite";
import { reportStore } from "../stores/reportStore";
import { ChartWidget } from "./ChartWidget";
import { KPIWidget } from "./KPIWidget";
import { TableWidget } from "./TableWidget";

export const Canvas = observer(() => {
  return (
    <div className="grid grid-cols-12 auto-rows-[100px] gap-4 p-6 w-full h-full overflow-y-auto relative z-10">
      {reportStore.widgets.map((w) => {
        const style = {
          gridColumn: `${w.gridPos.x + 1}/span ${w.gridPos.w}`,
          gridRow: `${w.gridPos.y + 1}/span ${w.gridPos.h}`,
        };

        return (
          <div
            key={w.id}
            style={style}
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 overflow-hidden relative group"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Actions could go here */}
            </div>
            {w.type === "kpi" && <KPIWidget widget={w} />}

            {w.type === "table" && <TableWidget widget={w} />}

            {!["kpi", "table"].includes(w.type) && <ChartWidget widget={w} />}
          </div>
        );
      })}
    </div>
  );
});
