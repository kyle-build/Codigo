import { Empty } from "antd";
import type { CSSProperties, ReactNode } from "react";
import type { ComponentNode, IEditorPageGroupSchema, TComponentTypes } from "@codigo/schema";

export interface TemplatePreviewPage {
  id: string;
  name: string;
  path: string;
  components: ComponentNode[];
}

export interface TemplatePreviewSchema {
  version: number;
  activePageId?: string | null;
  components: ComponentNode[];
  pages: TemplatePreviewPage[];
  pageGroups?: IEditorPageGroupSchema[];
}

const componentLabelMap: Record<TComponentTypes | string, string> = {
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

/**
 * 去除富文本中的 HTML 标记，便于预览摘要。
 */
function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 汇总组件属性中的主要展示信息。
 */
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

/**
 * 兼容发布数据与模板 schema 的预览结构。
 */
export function resolveSchemaFromReleasePayload(
  payload: Record<string, unknown> | null | undefined,
): TemplatePreviewSchema {
  if (!payload) {
    return {
      version: 2,
      components: [],
      pages: [],
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
      type: TComponentTypes;
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
      activePageId:
        schemaPayload.schema.activePageId != null
          ? String(schemaPayload.schema.activePageId)
          : activePage?.id != null
            ? String(activePage.id)
            : null,
      components: activePage?.components ?? schemaPayload.schema.components ?? [],
      pages:
        schemaPayload.schema.pages?.map((page, index) => ({
          id: page.id != null ? String(page.id) : `page-${index + 1}`,
          name:
            typeof (page as { name?: unknown }).name === "string"
              ? ((page as { name?: string }).name as string)
              : `页面 ${index + 1}`,
          path:
            typeof (page as { path?: unknown }).path === "string"
              ? ((page as { path?: string }).path as string)
              : index === 0
                ? "home"
                : `page-${index + 1}`,
          components: page.components ?? [],
        })) ?? [],
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
    activePageId: "preview-page",
    pages: [
      {
        id: "preview-page",
        name: "当前页面",
        path: "home",
        components,
      },
    ],
  };
}

/**
 * 从预览 schema 中整理出可展示的页面列表。
 */
export function getPreviewPages(schema: TemplatePreviewSchema) {
  if (schema.pages.length) {
    return schema.pages;
  }

  return [
    {
      id: schema.activePageId ?? "preview-page",
      name: "当前页面",
      path: "home",
      components: schema.components,
    },
  ];
}

interface SchemaOutlineProps {
  nodes: ComponentNode[];
  depth?: number;
}

/**
 * 渲染模板或发布页 schema 的结构化预览。
 */
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
            className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] p-3"
            style={cardStyle}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--ide-accent)]">
                {componentLabelMap[node.type] ?? node.type ?? "组件"}
              </span>
              <span className="text-sm font-medium text-[var(--ide-text)]">
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
