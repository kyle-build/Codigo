import { Space, Tag, Typography } from "antd";
import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  type IPageHeaderComponentProps,
  pageHeaderComponentDefaultConfig,
} from ".";

const { Title, Text } = Typography;

/**
 * 将标签文本按常见分隔符拆分为标签数组。
 */
function parseTags(tagsText: string) {
  return tagsText
    .split(/[、,，|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * 渲染页面头部物料，聚合标题、副标题、标签与补充信息。
 */
export default function PageHeaderComponent(_props: IPageHeaderComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(pageHeaderComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const tags = parseTags(props.tagsText);

  return (
    <div
      style={{
        borderRadius: 28,
        background: "#ffffff",
        padding: 28,
        border: "1px solid #eef1f6",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Space direction="vertical" size={6}>
          <Title level={2} style={{ margin: 0, fontSize: 28, lineHeight: 1.15 }}>
            {props.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            {props.subtitle}
          </Text>
          {!!tags.length && (
            <Space wrap>
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  color="processing"
                  style={{
                    borderRadius: 999,
                    paddingInline: 10,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          )}
        </Space>

        <Text type="secondary" style={{ fontSize: 13 }}>
          {props.extraText}
        </Text>
      </div>
    </div>
  );
}
