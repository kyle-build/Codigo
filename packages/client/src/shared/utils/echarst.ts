import { registerTheme } from "echarts";
interface FunnelTooltipParams {
  name: string;
  value: number;
  percent: number;
}
interface ECharts {
  registerTheme: (name: string, theme: Record<string, unknown>) => void;
}

interface TooltipSize {
  contentSize: number[];
}

//默认调色板颜色
const baseColors = [
  "#3370EB",
  "#1BCEBF",
  "#FFC60A",
  "#ED6D0C",
  "#DCA1E4",
  "#25B2E5",
  "#6DCDEB",
  "#288FCB",
  "#94B5F5",
  "#8F61D1",
  "#BF78E9",
  "#008280",
  "#27AD8E",
  "#7BC335",
  "#2E65D3",
  "#18B9AC",
  "#E5B209",
  "#D5620B",
  "#C691CD",
  "#21A0CE",
  "#62B8D3",
  "#2481B7",
  "#85A3DC",
  "#8157BC",
  "#AC6CD2",
  "#007573",
  "#239C80",
  "#6FAF30",
];

const codigoTheme = {
  color: baseColors,
  backgroundColor: "#FFFFFF",
  title: {
    textStyle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#1F2329",
    },
    subtextStyle: {
      fontSize: 12,
      color: "#646A73",
    },
  },
  label: {
    show: false,
    position: "top",
    distance: 8,
  },
  tooltip: {
    position(
      point: [number, number],
      _params: undefined,
      _dom: unknown,
      _rect: unknown,
      size: TooltipSize,
    ) {
      return [point[0], point[1] - (size.contentSize[1] ?? 0)];
    },
  },
  legend: {
    itemGap: 12,
    top: "auto",
    bottom: 0,
    left: "center",
    icon: "circle",
    itemWidth: 8,
    itemHeight: 8,
    formatter(name: unknown) {
      const safeName = typeof name === "string" ? name : String(name);
      return safeName.length > 8 ? `${safeName.substring(0, 8)}...` : safeName;
    },
    itemStyle: {
      borderRadius: 13,
    },
    type: "scroll",
    pageButtonItemGap: 2,
    pageButtonPosition: "end",
    pageFormatter: "{current}/{total}",
    pageIconColor: "#333",
    pageIconInactiveColor: "#aaa",
    pageTextStyle: { color: "#666" },
    orient: "horizontal",
    textStyle: {
      color: "#646A73",
      fontSize: 12,
    },
  },
  dataZoom: [
    {
      type: "inside",
      start: 94,
      end: 100,
    },
    {
      type: "slider",
      show: true,
      yAxisIndex: 0,
      filterMode: "empty",
      width: 12,
      height: "70%",
      handleSize: 8,
      showDataShadow: false,
      left: "93%",
    },
  ],
  grid: {
    left: "20px",
    right: "16px",
    top: "46px",
    bottom: "36px",
    tooltip: {
      show: true,
      trigger: "axis",
    },
    containLabel: true,
  },
  categoryAxis: {
    type: "category",
    axisTick: { show: false },
    axisLine: {
      show: false,
    },
    axisLabel: { color: "#8F959E", fontSize: 12 },
  },
  valueAxis: {
    type: "value",
    axisTick: { show: false },
    axisLabel: { color: "#646A73", fontSize: 12 },
    splitLine: {
      show: true,
      lineStyle: { color: "#1F232921", type: "solid", lineWidth: 0.5 },
    },
  },

  //仪表盘
  gauge: {},
  // 折线图
  line: {
    smooth: true,

    legend: {
      itemWidth: 100,
      itemHeight: 10,
    },
    itemStyle: {
      borderWidth: 3,
    },
    lineStyle: {
      width: 2,
    },
    showSymbol: false,

    emphasis: {
      showSymbol: true,
    },
  },
  // 柱状图
  bar: {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        label: {
          show: true,
        },
      },
    },
    itemStyle: { borderRadius: [4, 4, 4, 4] },
    barWidth: "25%",
    barGap: "10%",
  },
  // 词云
  wordCloud: {
    color: baseColors,
    sizeRange: [16, 48],
    rotationRange: [0, 0],
    textStyle: {
      opacity: 0.5,

      fontWeight: "normal",
    },
    emphasis: {
      textStyle: {
        fontWeight: "bold",
        opacity: 1,
      },
    },
    gridSize: 6,
    drawOutOfBound: false,
    shape: "cardioid",
    layoutAnimation: true,
  },
  // 饼图
  pie: {
    itemStyle: {
      borderRadius: 4,
      borderColor: "#FFFFFF",
      borderWidth: 1.5,
    },
    label: {
      show: true,
      position: "outside",
      formatter: "{b}: {d}%",
      fontSize: 12,
    },
    labelLine: {
      show: true,
      length: 20,
      width: 1,
      smooth: true,
    },
    radius: "60%",
    tooltip: {
      trigger: "item",
      borderWidth: 1,
    },
    emphasis: {
      itemSize: 1.08,
    },
  },
  // 散点图
  scatter: {
    symbolSize: 8,
    emphasis: {
      itemStyle: {
        borderWidth: 2,
        borderColor: baseColors,
        color: "#FFFFFF",
      },
    },
    valueAxis: {
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    },
  },
  // 雷达图
  radar: {
    label: {
      position: "insideStart",
      formatter: "{c}",
    },
    itemStyle: {
      opacity: 0.5,
      borderWidth: 2,
    },
    lineStyle: {
      width: 2,
    },
    splitArea: {
      show: false,
    },
    areaStyle: {
      opacity: 0.2,
    },
    emphasis: {
      itemStyle: {
        opacity: 1,
      },
    },
  },
  // 面积
  area: {
    areaStyle: {
      color: {
        type: "linear",
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: baseColors[0],
          },
          {
            offset: 1,
            color: `#FFFFFF00`,
          },
        ],
      },
    },
  },
  // 漏斗图
  funnel: {
    height: "80%",
    minSize: "3%",
    tooltip: {
      show: true,
      borderColor: "#E6E6E6",
      borderWidth: 1,
      padding: [10, 15],
      formatter: (params: FunnelTooltipParams) =>
        `${params.name}<br/>数量：${String(
          params.value,
        )}<br/>转化率：${params.percent.toFixed(2)}%`,
    },
    label: {
      show: true,
      textStyle: {
        fontSize: 14,
        lineHeight: 1.5,
        color: "#fff",
      },
    },
    itemStyle: {
      borderRadius: [8, 8, 0, 0],
      borderColor: "#fff",
      borderWidth: 2,
    },
    emphasis: { itemStyle: { opacity: 0.9 } },
    xAxis: {
      show: false,
    },
  },
  // 图形元素配置
  graphic: {
    elements: [
      {
        type: "text",
        style: {
          fontSize: 14,
          fill: "#646A73",
          fontWeight: "normal",
        },
      },
      {
        type: "text",
        style: {
          fontSize: 24,
          fill: "#333",
          fontWeight: "bold",
        },
      },
    ],
  },
  // 系列配置
  series: [
    {
      type: "bar",
      emphasis: {
        itemStyle: {
          color: "#4E83FD",
        },
      },
    },
    {
      type: "wordCloud",
      sizeRange: [16, 48],
      rotationRange: [0, 0],
      textStyle: {
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
      },
      emphasis: {
        textStyle: {
          fontSize(data: { value: number }) {
            return data.value * 1.2;
          },
          fontWeight: "bold",
        },
      },
      gridSize: 6,
      drawOutOfBound: false,
      shape: "cardioid",
      layoutAnimation: true,
    },
    {
      type: "funnel",
      sort: "descending",
    },
  ],
};

registerTheme("codigoTheme", codigoTheme);

export default codigoTheme;












