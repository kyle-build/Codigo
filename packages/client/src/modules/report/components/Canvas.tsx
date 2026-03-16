import { observer } from "mobx-react-lite";
import { reportStore } from "../stores/reportStore";
import { ChartWidget } from "./ChartWidget";
import { KPIWidget } from "./KPIWidget";
import { TableWidget } from "./TableWidget";

export const Canvas = observer(() => {
  return (
    <div className="rd-grid">
      {reportStore.widgets.map((w) => {
        const style = {
          gridColumn: `${w.gridPos.x + 1}/span ${w.gridPos.w}`,
          gridRow: `${w.gridPos.y + 1}/span ${w.gridPos.h}`,
        };

        return (
          <div key={w.id} style={style} className="rd-widget">
            {w.type === "kpi" && <KPIWidget widget={w} />}

            {w.type === "table" && <TableWidget widget={w} />}

            {!["kpi", "table"].includes(w.type) && <ChartWidget widget={w} />}
          </div>
        );
      })}
    </div>
  );
});
