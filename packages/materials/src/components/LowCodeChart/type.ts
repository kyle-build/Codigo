import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface IChartComponentProps {
  title: string;
  dataText: string;
  optionText?: string;
  xAxisKey: string;
  yAxisKey: string;
  nameKey: string;
  valueKey: string;
  color: string;
  echartsTheme?: string;
}

export type TBarChartComponentConfig = TBasicComponentConfig<
  "barChart",
  IChartComponentProps
>;

export type TLineChartComponentConfig = TBasicComponentConfig<
  "lineChart",
  IChartComponentProps
>;

export type TPieChartComponentConfig = TBasicComponentConfig<
  "pieChart",
  IChartComponentProps
>;

export type TChartComponentConfigResult =
  TransformedComponentConfig<IChartComponentProps>;

const defaultData = [
  { name: "华东", value: 32840, orders: 1240, yoy: 0.18 },
  { name: "华南", value: 24120, orders: 980, yoy: 0.12 },
  { name: "华北", value: 19560, orders: 760, yoy: 0.09 },
  { name: "西南", value: 16280, orders: 640, yoy: 0.15 },
  { name: "东北", value: 11450, orders: 430, yoy: 0.06 },
  { name: "西北", value: 8920, orders: 310, yoy: 0.08 },
];

const defaultDataText = JSON.stringify(defaultData, null, 2);

export const chartComponentDefaultConfig: TChartComponentConfigResult = {
  title: {
    value: "图表标题",
    defaultValue: "图表标题",
    isHidden: false,
  },
  dataText: {
    value: defaultDataText,
    defaultValue: defaultDataText,
    isHidden: false,
  },
  optionText: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
  xAxisKey: {
    value: "name",
    defaultValue: "name",
    isHidden: false,
  },
  yAxisKey: {
    value: "value",
    defaultValue: "value",
    isHidden: false,
  },
  nameKey: {
    value: "name",
    defaultValue: "name",
    isHidden: false,
  },
  valueKey: {
    value: "value",
    defaultValue: "value",
    isHidden: false,
  },
  color: {
    value: "#2563eb",
    defaultValue: "#2563eb",
    isHidden: false,
  },
};
