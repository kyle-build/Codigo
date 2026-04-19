import type {
  ComponentNode,
  IEditorPageSchema,
  IEditorPageGroupSchema,
  IPageSchema,
  PageGridConfig,
  PageLayoutMode,
  PageShellLayout,
  TemplateComponent,
  TemplatePreset,
} from "@codigo/schema";

/**
 * 清洗组件节点中的运行时 ID，仅保留模板所需的结构字段。
 */
function toTemplateComponent(node: ComponentNode): TemplateComponent {
  return {
    type: node.type,
    name: node.name,
    props: node.props ? JSON.parse(JSON.stringify(node.props)) : undefined,
    styles: node.styles ? { ...node.styles } : undefined,
    events: node.events ? JSON.parse(JSON.stringify(node.events)) : undefined,
    slot: node.slot ?? undefined,
    meta: node.meta ? { ...node.meta } : undefined,
    children: node.children?.map(toTemplateComponent),
  };
}

/**
 * 将编辑器页面列表转换为模板页面定义。
 */
function toTemplatePages(pages: IEditorPageSchema[] | undefined, schema: IPageSchema) {
  if (pages?.length) {
    return pages.map((page) => ({
      name: page.name,
      path: page.path,
      components: page.components.map(toTemplateComponent),
    }));
  }

  return [
    {
      name: "首页",
      path: "/",
      components: (schema.components ?? []).map(toTemplateComponent),
    },
  ];
}

function toTemplatePageGroups(pageGroups?: IEditorPageGroupSchema[]) {
  return (pageGroups ?? []).map((group) => ({
    id: group.id,
    name: group.name,
    path: group.path,
  }));
}

/**
 * 基于输入标题生成模板 key 建议值。
 */
export function createTemplateKeySuggestion(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || `template-${Date.now()}`;
}

/**
 * 将当前编辑器页面状态转换为模板发布请求所需的预设数据。
 */
export function buildTemplatePresetFromEditor(params: {
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  pageCategory: "admin";
  layoutMode: PageLayoutMode;
  grid?: PageGridConfig;
  shellLayout?: PageShellLayout;
  deviceType: "pc" | "mobile";
  canvasWidth: number;
  canvasHeight: number;
  schema: IPageSchema;
}): TemplatePreset {
  const pages = toTemplatePages(params.schema.pages, params.schema);
  const activePagePath =
    params.schema.pages?.find((page) => page.id === params.schema.activePageId)?.path ??
    pages[0]?.path ??
    "/";

  return {
    key: params.key,
    name: params.name,
    desc: params.desc,
    tags: params.tags,
    pageTitle: params.pageTitle,
    pageCategory: params.pageCategory,
    layoutMode: params.layoutMode,
    grid: params.grid,
    shellLayout: params.shellLayout,
    deviceType: params.deviceType,
    canvasWidth: params.canvasWidth,
    canvasHeight: params.canvasHeight,
    activePagePath,
    pageGroups: toTemplatePageGroups(params.schema.pageGroups),
    pages,
  };
}
