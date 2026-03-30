import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { getDefaultValueByConfig } from "..";
import { chartComponentDefaultConfig, type IChartComponentProps } from "./type";
import { getDefaultEChartsTheme } from "../../utils/echartsTheme";
import { deepMerge } from "../../utils/deepMerge";

function parseJsonText<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export default function PieChartComponent(_props: IChartComponentProps) {
  const echartsTheme = _props.echartsTheme ?? getDefaultEChartsTheme();
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(chartComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const defaultDs = useMemo(() => {
    return parseJsonText<Record<string, unknown>[]>(
      getDefaultValueByConfig(chartComponentDefaultConfig).dataText,
      [],
    );
  }, []);

  const ds = useMemo(() => {
    return parseJsonText<Record<string, unknown>[]>(props.dataText, defaultDs);
  }, [props.dataText, defaultDs]);

  const userOption = useMemo(() => {
    const text = props.optionText?.trim();
    if (!text) return {};
    const parsed = parseJsonText<unknown>(text, {});
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }
    return parsed as Record<string, unknown>;
  }, [props.optionText]);

  const baseOption = useMemo(() => {
    return {
      title: {
        text: props.title,
        textStyle: { fontSize: 14, fontWeight: 600 },
        top: 10,
        left: 10,
      },
      tooltip: { trigger: "item" },
      legend: { bottom: 10 },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "50%"],
          data: ds.map((r) => ({
            name: r[props.nameKey],
            value: r[props.valueKey],
          })),
          itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
          label: { show: false },
        },
      ],
    };
  }, [props, ds]);

  const option = useMemo(() => {
    return deepMerge(baseOption, userOption);
  }, [baseOption, userOption]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        backgroundColor: "#fff",
      }}
    >
      <ReactECharts
        option={option}
        theme={echartsTheme}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
