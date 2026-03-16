import type { Widget } from "./index";

export function buildOption(widget: Widget, ds: any[]) {
  const c = widget.config.color || "#2563eb";

  if (widget.type === "bar") {
    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: ds.map((r) => r[widget.config.xField!]),
      },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: ds.map((r) => r[widget.config.yField!]),
          itemStyle: { color: c },
        },
      ],
    };
  }

  if (widget.type === "line") {
    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: ds.map((r) => r[widget.config.xField!]),
      },
      yAxis: { type: "value" },
      series: [
        {
          type: "line",
          smooth: true,
          data: ds.map((r) => r[widget.config.yField!]),
          lineStyle: { color: c },
        },
      ],
    };
  }

  if (widget.type === "pie") {
    return {
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          data: ds.map((r) => ({
            name: r[widget.config.nameField!],
            value: r[widget.config.valueField!],
          })),
        },
      ],
    };
  }

  return {};
}
