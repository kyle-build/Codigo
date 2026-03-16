import { observer } from "mobx-react-lite";
import type { Widget as WidgetType } from "../types";
import { reportStore } from "../stores/reportStore";
import { ChartWidget } from "./ChartWidget";
import { KPIWidget } from "./KPIWidget";
import { TableWidget } from "./TableWidget";

interface Props {
  widget: WidgetType;
}

export const Widget = observer(({ widget }: Props) => {
  const renderBody = () => {
    switch (widget.type) {
      case "kpi":
        return <KPIWidget widget={widget} />;

      case "table":
        return <TableWidget widget={widget} />;

      default:
        return <ChartWidget widget={widget} />;
    }
  };

  return (
    <div
      className="rd-widget"
      style={{
        gridColumn: `${widget.gridPos.x + 1} / span ${widget.gridPos.w}`,
        gridRow: `${widget.gridPos.y + 1} / span ${widget.gridPos.h}`,
      }}
      onClick={() => (reportStore.selectedId = widget.id)}
    >
      <div className="widget-hd">
        {widget.config.title}

        <button
          onClick={(e) => {
            e.stopPropagation();
            reportStore.removeWidget(widget.id);
          }}
        >
          ×
        </button>
      </div>

      <div className="widget-bd">{renderBody()}</div>
    </div>
  );
});
