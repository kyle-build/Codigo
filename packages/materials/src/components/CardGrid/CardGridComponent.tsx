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
              borderRadius: 24,
              borderColor: "#eef1f6",
              boxShadow: "0 22px 48px rgba(15, 23, 42, 0.06)",
            }}
            styles={{ body: { padding: 22 } }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>
                {item.title}
              </Text>
              <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                {item.subtitle}
              </Title>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>{item.value}</div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.extra}
              </Text>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
