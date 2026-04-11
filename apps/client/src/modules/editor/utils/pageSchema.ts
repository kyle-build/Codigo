import { ulid } from "ulid";
import type {
  ActionConfig,
  ComponentNode,
  ComponentNodeRecord,
  IEditorPageSchema,
  IPageSchema,
  TBasicComponentConfig,
  TComponentTypes,
} from "@codigo/schema";
import { flattenComponentTree } from "@codigo/materials";
import {
  codeSyncComponentTypes,
} from "@/modules/editor/registry/components";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { getDefaultWidthByType, normalizeLayout } from "./pageLayout";

const codeSupportedTypes: TComponentTypes[] = codeSyncComponentTypes;
const defaultEditorPageName = "页面 1";
const defaultEditorPagePath = "home";

export type CodeSyncNode = {
  id?: string;
  type: string;
  props?: Record<string, any>;
  styles?: TBasicComponentConfig["styles"];
  events?: {
    onClick?: ActionConfig[];
  };
  slot?: string;
  children?: CodeSyncNode[];
};

/**
 * 把组件树节点转成扁平记录。
 */
export function createRecordFromNode(
  node: ComponentNode,
  parentId: string | null,
): ComponentNodeRecord {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    props: JSON.parse(JSON.stringify(node.props ?? {})),
    styles: node.styles ? { ...node.styles } : undefined,
    events: node.events ? JSON.parse(JSON.stringify(node.events)) : undefined,
    slot: node.slot,
    meta: node.meta ? { ...node.meta } : undefined,
    parentId,
    childIds: (node.children ?? []).map((child) => child.id),
  };
}

/**
 * 从扁平 store 构建树形组件结构。
 */
export function buildTreeNode(
  compConfigs: Record<string, ComponentNodeRecord>,
  id: string,
): ComponentNode | null {
  const current = compConfigs[id];
  if (!current) return null;
  return {
    id: current.id,
    type: current.type,
    name: current.name,
    props: JSON.parse(JSON.stringify(current.props ?? {})),
    styles: current.styles ? { ...current.styles } : undefined,
    events: current.events ? JSON.parse(JSON.stringify(current.events)) : undefined,
    slot: current.slot,
    meta: current.meta ? { ...current.meta } : undefined,
    children: current.childIds
      .map((childId) => buildTreeNode(compConfigs, childId))
      .filter(Boolean) as ComponentNode[],
  };
}

/**
 * 把当前扁平 store 序列化成组件树。
 */
export function serializeComponentTree(store: TEditorComponentsStore) {
  return store.sortableCompConfig
    .map((id) => buildTreeNode(store.compConfigs, id))
    .filter(Boolean) as ComponentNode[];
}

/**
 * 规范化页面路径。
 */
export function sanitizePagePath(path: string) {
  const normalized = path
    .trim()
    .toLowerCase()
    .replace(/^page:/, "")
    .replace(/[^\w-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "page";
}

/**
 * 生成不重复的页面路径。
 */
export function ensureUniquePagePath(
  pages: IEditorPageSchema[],
  candidate: string,
  excludeId?: string | null,
) {
  const basePath = sanitizePagePath(candidate);
  let nextPath = basePath;
  let suffix = 2;

  while (
    pages.some(
      (page) => page.id !== excludeId && sanitizePagePath(page.path) === nextPath,
    )
  ) {
    nextPath = `${basePath}-${suffix}`;
    suffix += 1;
  }

  return nextPath;
}

/**
 * 生成编辑器页面定义。
 */
export function createEditorPageDefinition(
  pages: IEditorPageSchema[],
  options?: Partial<Pick<IEditorPageSchema, "id" | "name" | "path">> & {
    components?: ComponentNode[];
  },
): IEditorPageSchema {
  const pageIndex = pages.length + 1;
  const name = options?.name?.trim() || `页面 ${pageIndex}`;
  const preferredPath =
    options?.path?.trim() ||
    (pageIndex === 1 ? defaultEditorPagePath : `page-${pageIndex}`);

  return {
    id: options?.id ?? ulid(),
    name,
    path: ensureUniquePagePath(pages, preferredPath, options?.id ?? null),
    components: JSON.parse(JSON.stringify(options?.components ?? [])),
  };
}

/**
 * 统一整理 schema 中的多页面结构。
 */
export function normalizeEditorPages(schema?: IPageSchema | null) {
  if (Array.isArray(schema?.pages) && schema.pages.length) {
    const pages = schema.pages.reduce<IEditorPageSchema[]>((result, page) => {
      result.push(
        createEditorPageDefinition(result, {
          id: page.id,
          name: page.name,
          path: page.path,
          components: page.components ?? [],
        }),
      );
      return result;
    }, []);
    const activePageId =
      pages.find((page) => page.id === schema.activePageId)?.id ??
      pages[0]?.id ??
      null;

    return {
      pages,
      activePageId,
    };
  }

  const initialPage = createEditorPageDefinition([], {
    id: schema?.activePageId ?? ulid(),
    name: defaultEditorPageName,
    path: defaultEditorPagePath,
    components: schema?.components ?? [],
  });

  return {
    pages: [initialPage],
    activePageId: initialPage.id,
  };
}

/**
 * 从 schema 归一化得到编辑器扁平结构。
 */
export function normalizeFromSchema(
  schema: IPageSchema | null | undefined,
  _layoutMode: "absolute",
) {
  const nextCompConfigs: Record<string, ComponentNodeRecord> = {};
  const nextSortableCompConfig: string[] = [];

  if (!schema?.components?.length) {
    return {
      compConfigs: nextCompConfigs,
      sortableCompConfig: nextSortableCompConfig,
    };
  }

  const flatNodes = flattenComponentTree(schema.components);
  for (const flatNode of flatNodes) {
    const { parentId = null, ...node } = flatNode;
    nextCompConfigs[node.id] = createRecordFromNode(
      node as ComponentNode,
      parentId,
    );
  }

  for (const node of schema.components) {
    nextSortableCompConfig.push(node.id);
  }

  normalizeLayout(nextCompConfigs, nextSortableCompConfig);
  return {
    compConfigs: nextCompConfigs,
    sortableCompConfig: nextSortableCompConfig,
  };
}

/**
 * 清洗代码模式回填的组件树节点。
 */
export function sanitizeCodeSyncNodes(nodes: CodeSyncNode[]): ComponentNode[] {
  return nodes
    .filter((item) => codeSupportedTypes.includes(item.type as TComponentTypes))
    .map((item) => ({
      id: item.id || ulid(),
      type: item.type as TComponentTypes,
      props: item.props ?? {},
      styles: item.styles,
      events: item.events,
      slot: item.slot,
      children: sanitizeCodeSyncNodes(item.children ?? []),
    }));
}

/**
 * 从代码同步节点重建编辑器扁平结构。
 */
export function normalizeFromFlatComponents(
  components: CodeSyncNode[],
  layoutMode: "absolute",
) {
  return normalizeFromSchema(
    {
      version: 2,
      components: sanitizeCodeSyncNodes(components),
    },
    layoutMode,
  );
}

/**
 * 将编辑器 store 序列化成多页面 schema。
 */
export function serializeStore(store: TEditorComponentsStore): IPageSchema {
  const pages =
    store.pages.length > 0
      ? store.pages.map((page) => ({
          ...page,
          path: sanitizePagePath(page.path),
          components:
            page.id === store.activePageId
              ? serializeComponentTree(store)
              : JSON.parse(JSON.stringify(page.components ?? [])),
        }))
      : [
          createEditorPageDefinition([], {
            id: store.activePageId ?? ulid(),
            name: defaultEditorPageName,
            path: defaultEditorPagePath,
            components: serializeComponentTree(store),
          }),
        ];

  return {
    version: 3,
    components:
      pages.find((page) => page.id === store.activePageId)?.components ??
      pages[0]?.components ??
      [],
    pages,
    activePageId:
      pages.find((page) => page.id === store.activePageId)?.id ??
      pages[0]?.id ??
      null,
  };
}

/**
 * 复制整棵组件树并生成新的节点 ID。
 */
export function duplicateTreeNode(node: ComponentNode): ComponentNode {
  return {
    ...node,
    id: ulid(),
    props: JSON.parse(JSON.stringify(node.props ?? {})),
    styles: node.styles ? { ...node.styles } : undefined,
    events: node.events ? JSON.parse(JSON.stringify(node.events)) : undefined,
    meta: node.meta ? { ...node.meta } : undefined,
    children: (node.children ?? []).map((child) => duplicateTreeNode(child)),
  };
}

/**
 * 为复制后的节点添加位置偏移。
 */
export function offsetNodePosition(node: ComponentNode, delta = 24) {
  const left = Number.parseInt(String(node.styles?.left ?? "0"), 10);
  const top = Number.parseInt(String(node.styles?.top ?? "0"), 10);
  node.styles = {
    ...(node.styles ?? {}),
    position: "absolute",
    left: `${Number.isNaN(left) ? delta : left + delta}px`,
    top: `${Number.isNaN(top) ? delta : top + delta}px`,
    width: node.styles?.width ?? getDefaultWidthByType(node.type),
  };
}
