import type { ComponentNode } from "./components";

/**
 * 描述扁平化组件树后的节点结构。
 */
export interface FlatComponentNode extends Omit<ComponentNode, "children"> {
  parentId?: string | null;
}

/**
 * 深拷贝组件节点，避免在树转换过程中修改原始数据。
 */
function cloneNode(node: ComponentNode): ComponentNode {
  return {
    ...node,
    props: { ...(node.props ?? {}) },
    styles: node.styles ? { ...node.styles } : undefined,
    meta: node.meta ? { ...node.meta } : undefined,
    children: node.children?.map(cloneNode),
  };
}

/**
 * 将组件树拍平成带父节点信息的一维数组。
 */
export function flattenComponentTree(
  nodes: ComponentNode[],
  parentId: string | null = null,
): FlatComponentNode[] {
  return nodes.flatMap((node) => {
    const current: FlatComponentNode = {
      ...node,
      props: { ...(node.props ?? {}) },
      styles: node.styles ? { ...node.styles } : undefined,
      meta: node.meta ? { ...node.meta } : undefined,
      parentId,
    };
    delete (current as { children?: ComponentNode[] }).children;
    return [current, ...flattenComponentTree(node.children ?? [], node.id)];
  });
}

/**
 * 将扁平节点列表重新组装为树形组件结构。
 */
export function buildComponentTree(
  nodes: FlatComponentNode[],
  rootIds?: string[],
): ComponentNode[] {
  const nodeMap = new Map<string, ComponentNode>();
  const childrenMap = new Map<string | null, ComponentNode[]>();

  for (const item of nodes) {
    nodeMap.set(item.id, {
      ...item,
      props: { ...(item.props ?? {}) },
      styles: item.styles ? { ...item.styles } : undefined,
      meta: item.meta ? { ...item.meta } : undefined,
      children: [],
    });
  }

  for (const item of nodes) {
    const node = nodeMap.get(item.id);
    if (!node) continue;
    const parentKey = item.parentId ?? null;
    const list = childrenMap.get(parentKey) ?? [];
    list.push(node);
    childrenMap.set(parentKey, list);
  }

  /**
   * 按根节点顺序对顶层节点排序。
   */
  const sortByRoot = (list: ComponentNode[]) => {
    if (!rootIds?.length) return list;
    const orderMap = new Map(rootIds.map((id, index) => [id, index]));
    return [...list].sort((left, right) => {
      const leftIndex = orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex;
    });
  };

  /**
   * 递归为节点挂载子节点列表。
   */
  const attachChildren = (node: ComponentNode) => {
    const children = childrenMap.get(node.id) ?? [];
    node.children = children.map((child) => attachChildren(child));
    return node;
  };

  return sortByRoot(childrenMap.get(null) ?? []).map((node) =>
    attachChildren(cloneNode(node)),
  );
}

/**
 * 按插槽名称对节点的子组件进行分组。
 */
export function groupChildrenBySlot(
  node: Pick<ComponentNode, "children">,
  defaultSlot = "default",
) {
  return (node.children ?? []).reduce<Record<string, ComponentNode[]>>(
    (acc, child) => {
      const slotName = child.slot || defaultSlot;
      if (!acc[slotName]) {
        acc[slotName] = [];
      }
      acc[slotName].push(child);
      return acc;
    },
    {},
  );
}
