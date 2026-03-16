import { observer } from "mobx-react-lite";
import type { Widget } from "../types";
import { reportStore } from "../stores/reportStore";

export const KPIWidget = observer(({ widget }: { widget: Widget }) => {
  const val = reportStore.calcKpi(widget.config);

  return (
    <div className="kpi-wrap">
      <div className="kpi-num" style={{ color: widget.config.color }}>
        {val}
      </div>
      <div>{widget.config.title}</div>
    </div>
  );
});
