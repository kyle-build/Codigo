import { observer } from "mobx-react-lite";
import type { Widget } from "../types";
import { reportStore } from "../stores/reportStore";
import { useEChart } from "../hooks/useEChart";
import { buildOption } from "../types/chartOptionBuilder";

interface Props {
  widget: Widget;
}

export const ChartWidget = observer(({ widget }: Props) => {
  const ds = reportStore.getDs(widget.config.dsId);

  const option = buildOption(widget, ds);

  const ref = useEChart(option);

  return <div className="chart-el" ref={ref} />;
});
