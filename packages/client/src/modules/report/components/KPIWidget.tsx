import { observer } from "mobx-react-lite";
import type { Widget } from "../types";
import { reportStore } from "../stores/reportStore";

export const KPIWidget = observer(({ widget }: { widget: Widget }) => {
  const val = reportStore.calcKpi(widget.config);

  return (
    <div className="h-full flex flex-col items-center justify-center px-3">
      <div
        className="text-[26px] font-semibold tracking-tight"
        style={{ color: widget.config.color, fontFamily: "'Geist Mono', monospace" }}
      >
        {val}
      </div>
      <div className="text-[11px] text-zinc-500 mt-1">{widget.config.title}</div>
      <div className="w-[72%] h-[3px] bg-zinc-200 rounded mt-2.5 overflow-hidden">
        <div
          className="h-full rounded"
          style={{ background: widget.config.color, width: "62%" }}
        />
      </div>
    </div>
  );
});












