import React, { useMemo } from "react";
import { Card, Statistic } from "antd";
import { getDefaultValueByConfig } from "..";
import {
  type IStatisticComponentProps,
  statisticComponentDefaultConfig,
} from ".";

const trendColorMap = {
  up: "#16a34a",
  down: "#dc2626",
  none: "#64748b",
} as const;

export default function StatisticComponent(_props: IStatisticComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(statisticComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  return (
    <Card size="small">
      <Statistic
        title={props.title}
        value={props.value}
        precision={props.precision}
        prefix={props.prefix || undefined}
        suffix={props.suffix || undefined}
      />
      {props.trendText ? (
        <div style={{ marginTop: 8, color: trendColorMap[props.trend] }}>
          {props.trendText}
        </div>
      ) : null}
    </Card>
  );
}
