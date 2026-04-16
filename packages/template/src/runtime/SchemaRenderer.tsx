import {
  getComponentByType,
  groupChildrenBySlot,
  type ComponentNode,
  type IPageSchema,
} from "@codigo/materials";
import { useMemo } from "react";

const interactiveComponentTypes = new Set([
  "input",
  "textArea",
  "radio",
  "checkbox",
]);

/**
 * 解析当前模板应渲染的页面节点集合，优先使用多页面 schema 的激活页。
 */
function resolveActiveNodes(schema: IPageSchema) {
  if (Array.isArray(schema.pages) && schema.pages.length > 0) {
    const activePage =
      schema.pages.find((page) => page.id === schema.activePageId) ??
      schema.pages[0];
    return activePage?.components ?? [];
  }

  return schema.components ?? [];
}

/**
 * 生成物料组件运行时所需的插槽映射。
 */
function resolveSlots(
  node: ComponentNode,
  renderNode: (childNode: ComponentNode) => JSX.Element | null,
) {
  const groupedSlots = groupChildrenBySlot(node);
  return Object.fromEntries(
    Object.entries(groupedSlots).map(([slotName, children]) => [
      slotName,
      children
        .map((childNode) => renderNode(childNode))
        .filter((childNode): childNode is JSX.Element => childNode != null),
    ]),
  );
}

/**
 * 渲染单个 schema 节点，并把子节点按 slot 透传给运行时物料。
 */
function renderSchemaNode(node: ComponentNode): JSX.Element | null {
  const MaterialComponent = getComponentByType(node.type);
  if (!MaterialComponent) {
    return null;
  }

  const slots = resolveSlots(node, renderSchemaNode);
  const materialProps = {
    ...(node.props ?? {}),
    slots,
    runtimePageState: {},
    onAction: () => {},
  };

  if (interactiveComponentTypes.has(node.type)) {
    return (
      <div key={node.id} style={node.styles ?? undefined}>
        <MaterialComponent {...materialProps} onUpdate={() => {}} />
      </div>
    );
  }

  return (
    <div key={node.id} style={node.styles ?? undefined}>
      <MaterialComponent {...materialProps} />
    </div>
  );
}

/**
 * 根据 schema.json 渲染当前模板工作区中的页面内容。
 */
export function SchemaRenderer({ schema }: { schema: IPageSchema }) {
  const nodes = useMemo(() => resolveActiveNodes(schema), [schema]);

  return (
    <div className="relative min-h-screen w-full bg-white">
      {nodes.map((node) => renderSchemaNode(node))}
    </div>
  );
}

