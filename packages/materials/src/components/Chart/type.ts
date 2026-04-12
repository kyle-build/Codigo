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
  { name: "客服中心", value: 1280, pending: 36, completionRate: 0.96 },
  { name: "订单履约", value: 1040, pending: 42, completionRate: 0.93 },
  { name: "采购审批", value: 860, pending: 18, completionRate: 0.98 },
  { name: "仓储调度", value: 790, pending: 27, completionRate: 0.91 },
  { name: "财务结算", value: 640, pending: 11, completionRate: 0.99 },
  { name: "人事服务", value: 420, pending: 9, completionRate: 0.97 },
];

const defaultDataText = JSON.stringify(defaultData, null, 2);

export const chartComponentDefaultConfig: TChartComponentConfigResult = {
  title: {
    value: "部门业务处理概览",
    defaultValue: "部门业务处理概览",
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
