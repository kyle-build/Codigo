import type { ComponentNode, IEditorPageGroupSchema } from "@codigo/schema";
import type { TemplateComponent, TemplatePreset } from "../types/templates";
import type { TemplatePreviewSchema } from "./preview";

/**
 * 为模板组件生成本次应用所需的唯一节点 ID。
 */
function createId(prefix: string, index: number): string {
  return `${prefix}_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 递归克隆模板节点，并为当前应用生成新的运行时 ID。
 */
function cloneTemplateNode(
  component: TemplateComponent,
  pageIndex: number,
  pathStack: number[],
): ComponentNode {
  const nodeIndex = pathStack[pathStack.length - 1] ?? 0;
  const nodePrefix = `tpl_${pageIndex}_${pathStack.join("_") || nodeIndex}`;

  return {
    id: createId(nodePrefix, nodeIndex),
    type: component.type,
    name: component.name,
    props: JSON.parse(JSON.stringify(component.props ?? {})),
    styles: component.styles ? { ...component.styles } : undefined,
    events: component.events ? JSON.parse(JSON.stringify(component.events)) : undefined,
    slot: component.slot,
    meta: component.meta ? { ...component.meta } : undefined,
    children: (component.children ?? []).map((child, childIndex) =>
      cloneTemplateNode(child, pageIndex, [...pathStack, childIndex]),
    ),
  };
}

/**
 * 将模板预设转换为编辑器可读取的多页面 schema。
 */
export function buildTemplateSchema(template: TemplatePreset): TemplatePreviewSchema {
  const pages = template.pages.map((page, pageIndex) => ({
    id: createId(`tpl_page_${pageIndex}`, pageIndex),
    name: page.name,
    path: page.path,
    components: page.components.map((component, componentIndex) =>
      cloneTemplateNode(component, pageIndex, [componentIndex]),
    ),
  }));
  const activePage =
    pages.find((page) => page.path === template.activePagePath) ?? pages[0] ?? null;
  const pageGroups: IEditorPageGroupSchema[] = (template.pageGroups ?? []).map((group, index) => ({
    id: group.id || createId(`tpl_group_${index}`, index),
    name: group.name,
    path: group.path,
  }));

  return {
    version: 3,
    components: activePage?.components ?? [],
    pages,
    pageGroups,
    activePageId: activePage?.id ?? null,
  };
}

/**
 * 生成模板应用后的页面设置快照。
 */
export function createTemplatePageSettings(template: TemplatePreset) {
  return {
    title: template.pageTitle,
    description: template.desc,
    tdk: `${template.tags.join(",")},${template.key}`,
    pageCategory: template.pageCategory,
    layoutMode: template.layoutMode,
    grid: template.grid,
    shellLayout: template.shellLayout ?? "none",
    deviceType: template.deviceType,
    canvasWidth: template.canvasWidth,
    canvasHeight: template.canvasHeight,
  };
}

/**
 * 将模板直接写入本地草稿，供编辑器启动时恢复。
 */
export function writeTemplateToDraft(template: TemplatePreset) {
  const schema = buildTemplateSchema(template);
  const activePage =
    schema.pages?.find((page) => page.id === schema.activePageId) ??
    schema.pages?.[0] ??
    null;

  localStorage.setItem(
    "pageSchema",
    JSON.stringify({
      version: schema.version,
      components: schema.components,
      pages: schema.pages,
      pageGroups: schema.pageGroups,
      activePageId: schema.activePageId,
    }),
  );
  localStorage.setItem(
    "currentCompConfig",
    JSON.stringify((activePage?.components[0]?.id as string | null) ?? null),
  );
  localStorage.setItem(
    "pageSettings",
    JSON.stringify(createTemplatePageSettings(template)),
  );
  localStorage.setItem("store_time", String(Date.now()));
}
