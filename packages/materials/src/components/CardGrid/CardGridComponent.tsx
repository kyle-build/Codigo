import { Card, Col, Row, Typography } from "antd";
import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import { type ICardGridComponentProps, cardGridComponentDefaultConfig } from ".";

const { Text, Title } = Typography;

/**
 * 按配置列数渲染统计卡片网格，适合展示多项摘要指标。
 */
export default function CardGridComponent(_props: ICardGridComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(cardGridComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const span = props.columns === 2 ? 12 : props.columns === 3 ? 8 : 6;

  return (
    <Row gutter={[16, 16]}>
      {props.items.map((item) => (
        <Col span={span} key={item.id}>
          <Card
            style={{
              borderRadius: 18,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Title level={5} style={{ margin: 0 }}>
                {item.title}
              </Title>
              <Text type="secondary">{item.subtitle}</Text>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{item.value}</div>
              <Text type="secondary">{item.extra}</Text>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
