import { Empty, Tag } from "antd";
import type { CSSProperties, ReactNode } from "react";
import type { ComponentNode } from "@codigo/schema";
import type { PreviewSchema } from "../types/appManagement";

const componentLabelMap: Record<string, string> = {
  titleText: "文本组件",
  richText: "富文本组件",
  split: "分割组件",
  card: "卡片组件",
  list: "列表组件",
  image: "图片组件",
  input: "输入框组件",
  textArea: "文本域组件",
  radio: "单选框组件",
  checkbox: "多选框组件",
  button: "按钮组件",
  breadcrumbBar: "面包屑组件",
  pageHeader: "页面头组件",
  queryFilter: "搜索区组件",
  statCard: "统计卡片组件",
  cardGrid: "卡片网格组件",
  dataTable: "数据表格组件",
  container: "容器组件",
  table: "表格组件",
  qrcode: "二维码组件",
  alert: "提示组件",
  empty: "空状态组件",
  chart: "图表组件",
  swiper: "轮播组件",
  statistic: "统计组件",
  twoColumn: "双栏组件",
};

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeProps(props?: Record<string, unknown>) {
  if (!props) {
    return "未配置内容";
  }

  const pieces: string[] = [];

  if (typeof props.title === "string" && props.title.trim()) {
    pieces.push(props.title.trim());
  }

  if (typeof props.description === "string" && props.description.trim()) {
    pieces.push(props.description.trim());
  }

  if (typeof props.text === "string" && props.text.trim()) {
    pieces.push(props.text.trim());
  }

  if (typeof props.placeholder === "string" && props.placeholder.trim()) {
    pieces.push(`占位：${props.placeholder.trim()}`);
  }

  if (typeof props.content === "string" && props.content.trim()) {
    const contentText = stripHtml(props.content);
    if (contentText) {
      pieces.push(contentText);
    }
  }

  if (Array.isArray(props.items) && props.items.length) {
    pieces.push(`列表项 ${props.items.length} 个`);
  }

  if (Array.isArray(props.options) && props.options.length) {
    pieces.push(`选项 ${props.options.length} 个`);
  }

  if (!pieces.length) {
    return "未配置内容";
  }

  return pieces.join(" · ").slice(0, 120);
}

export function resolveSchemaFromReleasePayload(
  payload: Record<string, unknown> | null | undefined,
): PreviewSchema {
  if (!payload) {
    return {
      version: 2,
      components: [],
    };
  }

  const schemaPayload = payload as {
    schema?: {
      version?: number;
      activePageId?: string | number;
      pages?: Array<{ id?: string | number; components?: ComponentNode[] }>;
      components?: ComponentNode[];
    };
    schema_version?: number;
    components?: Array<{
      id?: string | number;
      node_id?: string;
      type: string;
      options?: Record<string, unknown>;
      styles?: Record<string, unknown>;
    }>;
  };

  if (schemaPayload.schema) {
    const activePage =
      schemaPayload.schema.pages?.find(
        (page) => page.id === schemaPayload.schema?.activePageId,
      ) ?? schemaPayload.schema.pages?.[0];

    return {
      version: schemaPayload.schema.version ?? 2,
      components:
        activePage?.components ?? schemaPayload.schema.components ?? [],
    };
  }

  const components = Array.isArray(schemaPayload.components)
    ? schemaPayload.components.map((component) => ({
        id: component.node_id ?? String(component.id),
        type: component.type,
        props: component.options ?? {},
        styles: component.styles,
        children: [],
      }))
    : [];

  return {
    version: schemaPayload.schema_version ?? 1,
    components,
  };
}

interface SchemaOutlineProps {
  nodes: ComponentNode[];
  depth?: number;
}

export function renderSchemaOutline({
  nodes,
  depth = 0,
}: SchemaOutlineProps): ReactNode {
  if (!nodes.length) {
    return (
      <Empty
        description="暂无可展示内容"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="space-y-3">
      {nodes.map((node) => {
        const cardStyle: CSSProperties = {
          marginLeft: depth * 16,
        };

        return (
          <div
            key={node.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            style={cardStyle}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Tag color="green">
                {componentLabelMap[node.type] ?? node.type ?? "组件"}
              </Tag>
              <span className="text-sm font-medium text-slate-700">
                {summarizeProps(
                  node.props as Record<string, unknown> | undefined,
                )}
              </span>
            </div>
            {!!node.children?.length && (
              <div className="mt-3">
                {renderSchemaOutline({
                  nodes: node.children,
                  depth: depth + 1,
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
