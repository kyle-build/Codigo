import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface IStatisticComponentProps {
  title: string;
  value: number;
  precision: number;
  prefix: string;
  suffix: string;
  trend: "up" | "down" | "none";
  trendText: string;
}

export type TStatisticComponentConfig = TBasicComponentConfig<
  "statistic",
  IStatisticComponentProps
>;

export type TStatisticComponentConfigResult =
  TransformedComponentConfig<IStatisticComponentProps>;

export const statisticComponentDefaultConfig: TStatisticComponentConfigResult = {
  title: {
    value: "今日订单",
    defaultValue: "今日订单",
    isHidden: false,
  },
  value: {
    value: 2458,
    defaultValue: 2458,
    isHidden: false,
  },
  precision: {
    value: 0,
    defaultValue: 0,
    isHidden: false,
  },
  prefix: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
  suffix: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
  trend: {
    value: "up",
    defaultValue: "up",
    isHidden: false,
  },
  trendText: {
    value: "较昨日 +12.5%",
    defaultValue: "较昨日 +12.5%",
    isHidden: false,
  },
};
