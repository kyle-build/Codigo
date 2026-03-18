import type { Widget } from "./index";

export function buildOption(widget: Widget, ds: any[]) {
  const c = widget.config.color || "#2563eb";
  const title = {
    text: widget.config.title,
    textStyle: {
      color: "#09090b",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "Geist, sans-serif",
    },
    top: 10,
    left: 12,
  };
  const grid = { left: 36, right: 16, top: 40, bottom: 28, containLabel: true };
  const text = {
    color: "#52525b",
    fontFamily: "Geist, sans-serif",
    fontSize: 11,
  };
  const split = { lineStyle: { color: "#e4e4e7", type: "dashed" } };
  const axisLine = { lineStyle: { color: "#e4e4e7" } };
  const tooltip = {
    backgroundColor: "#fff",
    borderColor: "#e4e4e7",
    textStyle: {
      color: "#09090b",
      fontSize: 11,
      fontFamily: "Geist, sans-serif",
    },
    extraCssText: "box-shadow:0 4px 12px rgba(0,0,0,.08)",
  };

  if (widget.type === "bar") {
    return {
      title,
      grid,
      tooltip: { ...tooltip, trigger: "axis" },
      xAxis: {
        type: "category",
        data: ds.map((r) => r[widget.config.xField!]),
        axisLine,
        axisLabel: text,
        axisTick: { show: false },
      },
      yAxis: { type: "value", splitLine: split, axisLabel: text },
      series: [
        {
          type: "bar",
          data: ds.map((r) => r[widget.config.yField!]),
          itemStyle: { color: c, borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 36,
        },
      ],
    };
  }

  if (widget.type === "line") {
    return {
      title,
      grid,
      tooltip: { ...tooltip, trigger: "axis" },
      xAxis: {
        type: "category",
        data: ds.map((r) => r[widget.config.xField!]),
        axisLine,
        axisLabel: text,
        axisTick: { show: false },
      },
      yAxis: { type: "value", splitLine: split, axisLabel: text },
      series: [
        {
          type: "line",
          smooth: true,
          data: ds.map((r) => r[widget.config.yField!]),
          itemStyle: { color: c },
          lineStyle: { color: c, width: 2 },
          symbol: "circle",
          symbolSize: 4,
        },
      ],
    };
  }

  if (widget.type === "area") {
    return {
      title,
      grid,
      tooltip: { ...tooltip, trigger: "axis" },
      xAxis: {
        type: "category",
        data: ds.map((r) => r[widget.config.xField!]),
        axisLine,
        axisLabel: text,
        axisTick: { show: false },
      },
      yAxis: { type: "value", splitLine: split, axisLabel: text },
      series: [
        {
          type: "line",
          smooth: true,
          data: ds.map((r) => r[widget.config.yField!]),
          symbol: "none",
          lineStyle: { color: c, width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${c}33` },
                { offset: 1, color: `${c}00` },
              ],
            },
          },
        },
      ],
    };
  }

  if (widget.type === "pie") {
    return {
      title,
      tooltip: { ...tooltip, trigger: "item" },
      legend: {
        bottom: 6,
        textStyle: text,
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#dc2626"],
      series: [
        {
          type: "pie",
          radius: ["36%", "64%"],
          center: ["50%", "46%"],
          data: ds.map((r) => ({
            name: r[widget.config.nameField!],
            value: r[widget.config.valueField!],
          })),
          label: { show: false },
          itemStyle: { borderRadius: 3, borderWidth: 2, borderColor: "#fff" },
        },
      ],
    };
  }

  if (widget.type === "hbar") {
    return {
      title,
      grid: { ...grid, left: 56 },
      tooltip: { ...tooltip, trigger: "axis" },
      xAxis: { type: "value", splitLine: split, axisLabel: text },
      yAxis: {
        type: "category",
        data: ds.map((r) => r[widget.config.xField!]),
        axisLine,
        axisLabel: text,
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: ds.map((r) => r[widget.config.yField!]),
          itemStyle: { color: c, borderRadius: [0, 3, 3, 0] },
          barMaxWidth: 24,
        },
      ],
    };
  }

  return {};
}
