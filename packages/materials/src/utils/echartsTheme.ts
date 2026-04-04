import { registerTheme } from "echarts";

export type EChartsThemeName = string | undefined;

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

export const codigoEChartsTheme = {
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
  legend: {
    textStyle: {
      color: "#646A73",
      fontSize: 12,
    },
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
  },
  tooltip: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#D0D3D8",
    borderWidth: 1,
    padding: [10, 14],
    textStyle: {
      color: "#1F2329",
      fontSize: 12,
    },
    extraCssText:
      "box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border-radius: 4px;",
  },
  grid: {
    left: "10%",
    right: "10%",
    top: "15%",
    bottom: "15%",
    containLabel: true,
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: "#D0D3D8",
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: "#646A73",
      fontSize: 12,
    },
    splitLine: {
      show: false,
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: "#646A73",
      fontSize: 12,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: "#F2F3F5",
        type: "dashed",
      },
    },
  },
  line: {
    symbol: "circle",
    symbolSize: 6,
    lineStyle: {
      width: 2,
    },
  },
  bar: {
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
    },
  },
  pie: {
    itemStyle: {
      borderColor: "#FFFFFF",
      borderWidth: 2,
    },
    label: {
      color: "#1F2329",
      fontSize: 12,
    },
    labelLine: {
      lineStyle: {
        color: "#D0D3D8",
      },
    },
  },
  radar: {
    axisLine: {
      lineStyle: {
        color: "#D0D3D8",
      },
    },
    splitLine: {
      lineStyle: {
        color: "#F2F3F5",
      },
    },
    splitArea: {
      show: false,
    },
  },
  gauge: {
    axisLine: {
      lineStyle: {
        width: 10,
        color: [
          [0.3, "#F54A45"],
          [0.7, "#FFC60A"],
          [1, "#1BCEBF"],
        ],
      },
    },
    axisLabel: {
      color: "#646A73",
      fontSize: 12,
    },
    detail: {
      color: "#1F2329",
      fontSize: 16,
      fontWeight: "bold",
    },
  },
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

let builtinThemesInitialized = false;
let defaultTheme: EChartsThemeName = "codigoTheme";

/**
 * 注册物料包内置的 ECharts 主题，并保证初始化过程仅执行一次。
 */
export function initBuiltinEChartsThemes() {
  if (builtinThemesInitialized) return;
  registerTheme("codigoTheme", codigoEChartsTheme);
  builtinThemesInitialized = true;
}

/**
 * 设置图表物料默认使用的主题名称。
 */
export function setDefaultEChartsTheme(theme: EChartsThemeName) {
  defaultTheme = theme;
}

/**
 * 获取当前图表物料默认主题名称。
 */
export function getDefaultEChartsTheme(): EChartsThemeName {
  return defaultTheme;
}

/**
 * 返回内置图表主题下拉选项，供表单配置直接使用。
 */
export function getBuiltinEChartsThemeOptions() {
  return [
    { value: "codigoTheme", label: "Codigo" },
    { value: "", label: "ECharts Default" },
  ] as const;
}
