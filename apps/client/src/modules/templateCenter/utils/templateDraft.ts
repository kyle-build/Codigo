import type { ComponentNode } from "@codigo/schema";
import type { TemplatePreset } from "../types/templates";

/**
 * 为模板组件生成本次应用所需的唯一节点 ID。
 */
function createId(index: number): string {
  return `tpl_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 将模板预设转换为编辑器可读取的 schema。
 */
export function buildTemplateSchema(template: TemplatePreset) {
  const components: ComponentNode[] = template.components.map(
    (component, index) => ({
      id: createId(index),
      type: component.type,
      props: component.props ?? {},
      styles: component.styles,
      children: [],
    }),
  );

  return {
    version: 2,
    components,
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

  localStorage.setItem(
    "pageSchema",
    JSON.stringify({
      version: schema.version,
      components: schema.components,
    }),
  );
  localStorage.setItem(
    "currentCompConfig",
    JSON.stringify((schema.components[0]?.id as string | null) ?? null),
  );
  localStorage.setItem(
    "pageSettings",
    JSON.stringify(createTemplatePageSettings(template)),
  );
  localStorage.setItem("store_time", String(Date.now()));
}
