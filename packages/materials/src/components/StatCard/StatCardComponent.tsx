import { Card, Statistic, Tag, Typography } from "antd";
import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import { type IStatCardComponentProps, statCardComponentDefaultConfig } from ".";

const { Paragraph, Text } = Typography;

const trendColorMap = {
  up: "green",
  down: "red",
  flat: "default",
} as const;

/**
 * 渲染带趋势标签的统计卡片，用于突出展示单个核心指标。
 */
export default function StatCardComponent(_props: IStatCardComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(statCardComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  return (
    <Card
      style={{
        borderRadius: 20,
      }}
    >
      <Statistic
        title={props.title}
        value={props.value}
        suffix={props.suffix || undefined}
      />
      <div style={{ marginTop: 12 }}>
        <Tag color={trendColorMap[props.trendDirection]}>{props.trendText}</Tag>
      </div>
      <Paragraph style={{ marginBottom: 0, marginTop: 12 }}>
        <Text type="secondary">{props.description}</Text>
      </Paragraph>
    </Card>
  );
}
