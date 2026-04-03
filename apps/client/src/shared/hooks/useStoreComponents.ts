import { ulid } from "ulid";
import { action, computed, toJS } from "mobx";
import type {
  ActionConfig,
  ComponentNode,
  ComponentNodeRecord,
  IEditorPageSchema,
  IPageSchema,
  PageCategory,
  TBasicComponentConfig,
  TComponentTypes,
} from "@codigo/schema";
import {
  calcValueByString,
  flattenComponentTree,
  getComponentContainerMeta,
} from "@codigo/materials";
import { createStoreComponents } from "@/shared/stores";
import { arrayMove } from "@dnd-kit/sortable";
import { trackUndo } from "mobx-shallow-undo";
import { message } from "antd";
import type { TStoreComponents } from "@/shared/stores";
import { useStorePage } from ".";
import { useStorePermission } from "./useStorePermission";
import {
  codeSyncComponentTypes,
  type PageLayoutPresetKey,
} from "@/modules/editor/registry/components";

const storeComponents = createStoreComponents();
const codeSupportedTypes: TComponentTypes[] = codeSyncComponentTypes;

const layoutGapX = 380;
const layoutGapY = 200;
const layoutStartX = 32;
const layoutStartY = 24;
const schemaStorageKey = "pageSchema";

type CodeSyncNode = {
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

type LayoutPresetNode = ComponentNode & {
  slot?: string;
  children?: LayoutPresetNode[];
};

const defaultEditorPageName = "页面 1";
const defaultEditorPagePath = "home";

function getDefaultWidthByType(type: TComponentTypes, isFlow = false): string {
  if (isFlow) {
    switch (type) {
      case "statCard":
        return "320px";
      case "breadcrumbBar":
      case "pageHeader":
      case "queryFilter":
      case "cardGrid":
      case "dataTable":
        return "100%";
      default:
        return "100%";
    }
  }

  switch (type) {
    case "twoColumn":
      return "960px";
    case "container":
      return "720px";
    case "table":
    case "card":
    case "list":
    case "image":
    case "video":
    case "swiper":
    case "richText":
      return "420px";
    case "input":
    case "button":
    case "textArea":
    case "radio":
    case "checkbox":
    case "statistic":
      return "360px";
    case "split":
      return "520px";
    default:
      return "320px";
  }
}

function getDefaultPosition(index: number) {
  return {
    left: `${layoutStartX + (index % 3) * layoutGapX}px`,
    top: `${layoutStartY + Math.floor(index / 3) * layoutGapY}px`,
  };
}

function createContainerNode(
  title: string,
  options?: {
    minHeight?: number;
    backgroundColor?: string;
    borderColor?: string;
    padding?: number;
    borderRadius?: number;
    styles?: ComponentNode["styles"];
    children?: LayoutPresetNode[];
    slot?: string;
  },
): LayoutPresetNode {
  return {
    id: ulid(),
    type: "container",
    props: {
      title,
      minHeight: options?.minHeight ?? 240,
      backgroundColor: options?.backgroundColor ?? "#ffffff",
      borderColor: options?.borderColor ?? "#d9d9d9",
      padding: options?.padding ?? 24,
      borderRadius: options?.borderRadius ?? 16,
    },
    styles: {
      width: "100%",
      ...(options?.styles ?? {}),
    },
    slot: options?.slot,
    children: options?.children ?? [],
  };
}

function createTwoColumnNode(
  title: string,
  options?: {
    leftWidth?: number;
    gap?: number;
    minHeight?: number;
    backgroundColor?: string;
    styles?: ComponentNode["styles"];
    children?: LayoutPresetNode[];
  },
): LayoutPresetNode {
  return {
    id: ulid(),
    type: "twoColumn",
    props: {
      title,
      leftWidth: options?.leftWidth ?? 280,
      gap: options?.gap ?? 20,
      minHeight: options?.minHeight ?? 360,
      backgroundColor: options?.backgroundColor ?? "#ffffff",
    },
    styles: {
      width: "100%",
      ...(options?.styles ?? {}),
    },
    children: options?.children ?? [],
  };
}

function createPageLayoutPreset(
  preset: PageLayoutPresetKey,
  pageCategory: PageCategory,
) {
  if (preset === "sidebarLayout") {
    const header = createContainerNode(
      pageCategory === "admin" ? "页面头部" : "页面横幅",
      {
        minHeight: pageCategory === "admin" ? 160 : 200,
        backgroundColor: "#f8fafc",
        borderColor: "#cbd5e1",
        styles: { marginBottom: 16 },
      },
    );
    const main = createTwoColumnNode(
      pageCategory === "admin" ? "主工作区" : "分栏主体",
      {
        leftWidth: pageCategory === "admin" ? 280 : 300,
        minHeight: 420,
        styles: { marginBottom: 16 },
      },
    );
    const footer = createContainerNode(
      pageCategory === "admin" ? "补充操作区" : "页面页脚",
      {
        minHeight: 140,
        backgroundColor: "#f8fafc",
        borderColor: "#cbd5e1",
      },
    );

    return {
      nodes: [header, main, footer],
      focusId: main.id,
    };
  }

  if (preset === "dashboardLayout") {
    const summary = createContainerNode("概览区", {
      minHeight: 180,
      backgroundColor: "#f8fafc",
      borderColor: "#bfdbfe",
      styles: { marginBottom: 16 },
    });
    const workspace = createTwoColumnNode("工作台主体", {
      leftWidth: 320,
      minHeight: 420,
      backgroundColor: "#ffffff",
      styles: { marginBottom: 16 },
      children: [
        createContainerNode("左侧导航/筛选", {
          minHeight: 340,
          slot: "left",
          backgroundColor: "#ffffff",
          borderColor: "#d9d9d9",
        }),
        createContainerNode("右侧主内容", {
          minHeight: 340,
          slot: "right",
          backgroundColor: "#ffffff",
          borderColor: "#d9d9d9",
        }),
      ],
    });
    const footer = createContainerNode("底部补充区", {
      minHeight: 160,
      backgroundColor: "#f8fafc",
      borderColor: "#bfdbfe",
    });

    return {
      nodes: [summary, workspace, footer],
      focusId: workspace.id,
    };
  }

  const header = createContainerNode(
    pageCategory === "admin" ? "页面头部" : "页面头图",
    {
      minHeight: pageCategory === "admin" ? 160 : 200,
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
      styles: { marginBottom: 16 },
    },
  );
  const main = createContainerNode(
    pageCategory === "admin" ? "主内容区" : "内容区",
    {
      minHeight: 360,
      backgroundColor: "#ffffff",
      borderColor: "#d9d9d9",
      styles: { marginBottom: 16 },
    },
  );
  const footer = createContainerNode("页脚区域", {
    minHeight: 140,
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
  });

  return {
    nodes: [header, main, footer],
    focusId: main.id,
  };
}

function normalizeLayout(
  compConfigs: Record<string, ComponentNodeRecord>,
  ids: string[],
  layoutMode = useStorePage().store.layoutMode,
) {
  const isFlow = layoutMode === "flow";
  ids.forEach((id, index) => {
    const comp = compConfigs[id];
    if (!comp) return;
    const nextStyles = { ...(comp.styles ?? {}) };
    const hasPosition =
      nextStyles.left !== undefined && nextStyles.top !== undefined;
    const fallbackPosition = getDefaultPosition(index);

    if (isFlow) {
      nextStyles.position = "relative";
      delete nextStyles.left;
      delete nextStyles.top;
      nextStyles.width =
        nextStyles.width ?? getDefaultWidthByType(comp.type, true);
    } else {
      nextStyles.position = "absolute";
      nextStyles.left = hasPosition ? nextStyles.left : fallbackPosition.left;
      nextStyles.top = hasPosition ? nextStyles.top : fallbackPosition.top;
      nextStyles.width =
        nextStyles.width === "100%" && !hasPosition
          ? getDefaultWidthByType(comp.type)
          : (nextStyles.width ?? getDefaultWidthByType(comp.type));
    }

    comp.styles = nextStyles;
    normalizeLayout(compConfigs, comp.childIds, layoutMode);
  });
}

function createRecordFromNode(
  node: ComponentNode,
  parentId: string | null,
): ComponentNodeRecord {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    props: JSON.parse(JSON.stringify(node.props ?? {})),
    styles: node.styles ? { ...node.styles } : undefined,
    events: node.events
      ? JSON.parse(JSON.stringify(node.events))
      : undefined,
    slot: node.slot,
    meta: node.meta ? { ...node.meta } : undefined,
    parentId,
    childIds: (node.children ?? []).map((child) => child.id),
  };
}

function serializeComponentTree(store: TStoreComponents) {
  return store.sortableCompConfig
    .map((id) => buildTreeNode(store.compConfigs, id))
    .filter(Boolean) as ComponentNode[];
}

function sanitizePagePath(path: string) {
  const normalized = path
    .trim()
    .toLowerCase()
    .replace(/^page:/, "")
    .replace(/[^\w-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "page";
}

function ensureUniquePagePath(
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

function createEditorPageDefinition(
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

function normalizeEditorPages(schema?: IPageSchema | null) {
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
      pages.find((page) => page.id === schema.activePageId)?.id ?? pages[0]?.id ?? null;

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

function normalizeFromSchema(
  schema?: IPageSchema | null,
  layoutMode?: "absolute" | "flow",
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

  normalizeLayout(nextCompConfigs, nextSortableCompConfig, layoutMode);
  return {
    compConfigs: nextCompConfigs,
    sortableCompConfig: nextSortableCompConfig,
  };
}

function sanitizeCodeSyncNodes(nodes: CodeSyncNode[]): ComponentNode[] {
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

function normalizeFromFlatComponents(
  components: CodeSyncNode[],
  layoutMode?: "absolute" | "flow",
) {
  return normalizeFromSchema(
    {
      version: 2,
      components: sanitizeCodeSyncNodes(components),
    },
    layoutMode,
  );
}

function serializeStore(store: TStoreComponents): IPageSchema {
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
      pages.find((page) => page.id === store.activePageId)?.components ?? pages[0]?.components ?? [],
    pages,
    activePageId:
      pages.find((page) => page.id === store.activePageId)?.id ?? pages[0]?.id ?? null,
  };
}

function gatherSubtreeIds(
  compConfigs: Record<string, ComponentNodeRecord>,
  id: string,
): string[] {
  const current = compConfigs[id];
  if (!current) return [];
  return [
    id,
    ...current.childIds.flatMap((childId) =>
      gatherSubtreeIds(compConfigs, childId),
    ),
  ];
}

function duplicateTreeNode(node: ComponentNode): ComponentNode {
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

function offsetNodePosition(node: ComponentNode, delta = 24) {
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

function buildTreeNode(
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
    events: current.events
      ? JSON.parse(JSON.stringify(current.events))
      : undefined,
    slot: current.slot,
    meta: current.meta ? { ...current.meta } : undefined,
    children: current.childIds
      .map((childId) => buildTreeNode(compConfigs, childId))
      .filter(Boolean) as ComponentNode[],
  };
}

// 撤销前进的插件
const sotreComponentsUndoer = trackUndo(
  () => toJS(storeComponents),
  (value) => {
    const { _replace } = useStoreComponents();
    _replace(value);
  },
);

export function useStoreComponents() {
  const { ensurePermission, addOperationLog } = useStorePermission();

  const setCurrentComponent = action((id: string) => {
    storeComponents.currentCompConfig = id;
  });

  const getSiblingIds = (id: string) => {
    const current = storeComponents.compConfigs[id];
    if (!current) return storeComponents.sortableCompConfig;
    const siblings = current.parentId
      ? (storeComponents.compConfigs[current.parentId]?.childIds ?? [])
      : storeComponents.sortableCompConfig;
    return siblings.filter((siblingId) => {
      const sibling = storeComponents.compConfigs[siblingId];
      if (!sibling) return false;
      return (sibling.slot ?? "default") === (current.slot ?? "default");
    });
  };

  const insertIntoOrderedIds = action(
    (ids: string[], nodeId: string, targetIndex?: number) => {
      const nextIds = ids.filter((item) => item !== nodeId);
      const insertAt =
        typeof targetIndex === "number"
          ? Math.max(0, Math.min(targetIndex, nextIds.length))
          : nextIds.length;
      nextIds.splice(insertAt, 0, nodeId);
      return nextIds;
    },
  );

  const insertChildIdBySlot = action(
    (parentId: string, nodeId: string, slot: string, targetIndex?: number) => {
      const parent = storeComponents.compConfigs[parentId];
      if (!parent) return;
      const childIds = parent.childIds.filter((item) => item !== nodeId);
      const slotSiblingIds = childIds.filter((childId) => {
        const child = storeComponents.compConfigs[childId];
        return child && (child.slot ?? "default") === slot;
      });
      const nextSlotIds = insertIntoOrderedIds(
        slotSiblingIds,
        nodeId,
        targetIndex,
      );

      if (!slotSiblingIds.length) {
        parent.childIds = [...childIds, nodeId];
        return;
      }

      const firstIndex = childIds.findIndex(
        (item) => item === slotSiblingIds[0],
      );
      const lastIndex = childIds.findIndex(
        (item) => item === slotSiblingIds[slotSiblingIds.length - 1],
      );
      const before = childIds.slice(0, firstIndex);
      const after = childIds.slice(lastIndex + 1);
      const middle = childIds
        .slice(firstIndex, lastIndex + 1)
        .filter((item) => {
          const child = storeComponents.compConfigs[item];
          return child && (child.slot ?? "default") !== slot;
        });
      parent.childIds = [...before, ...nextSlotIds, ...middle, ...after];
    },
  );

  const syncSchema = (keepCurrentId?: string | null) => {
    normalizeLayout(
      storeComponents.compConfigs,
      storeComponents.sortableCompConfig,
    );
    if (
      keepCurrentId &&
      !storeComponents.compConfigs[keepCurrentId] &&
      storeComponents.currentCompConfig === keepCurrentId
    ) {
      storeComponents.currentCompConfig =
        storeComponents.sortableCompConfig[0] ?? null;
    }
  };

  const getComponentTree = computed(() => {
    return serializeComponentTree(storeComponents);
  });

  const ensureEditorPages = action(() => {
    if (storeComponents.pages.length) {
      if (
        storeComponents.activePageId &&
        storeComponents.pages.some(
          (page) => page.id === storeComponents.activePageId,
        )
      ) {
        return;
      }

      storeComponents.activePageId = storeComponents.pages[0]?.id ?? null;
      return;
    }

    const initialPage = createEditorPageDefinition([], {
      id: storeComponents.activePageId ?? ulid(),
      name: defaultEditorPageName,
      path: defaultEditorPagePath,
      components: serializeComponentTree(storeComponents),
    });

    storeComponents.pages = [initialPage];
    storeComponents.activePageId = initialPage.id;
  });

  const getPages = computed(() => {
    ensureEditorPages();
    return serializeStore(storeComponents).pages ?? [];
  });

  const getActivePage = computed(() => {
    return (
      getPages.get().find((page) => page.id === storeComponents.activePageId) ??
      getPages.get()[0] ??
      null
    );
  });

  const hydrateCanvasFromPage = action((page: IEditorPageSchema) => {
    const { store: storePage } = useStorePage();
    const normalized = normalizeFromSchema(
      {
        version: 3,
        components: page.components ?? [],
      },
      storePage.layoutMode,
    );

    storeComponents.compConfigs = normalized.compConfigs;
    storeComponents.sortableCompConfig = normalized.sortableCompConfig;
    storeComponents.currentCompConfig =
      normalized.sortableCompConfig[0] ?? null;
    storeComponents.activePageId = page.id;
  });

  const persistActivePageSnapshot = action(() => {
    ensureEditorPages();
    const snapshot = serializeComponentTree(storeComponents);
    storeComponents.pages = getPages.get().map((page) =>
      page.id === storeComponents.activePageId
        ? {
            ...page,
            components: snapshot,
          }
        : page,
    );
  });

  const buildReplaceAllPayload = () => ({
    compConfigs: storeComponents.compConfigs,
    sortableCompConfig: storeComponents.sortableCompConfig,
    pages: getPages.get(),
    activePageId: storeComponents.activePageId,
  });

  const switchEditorPage = action((pageId: string) => {
    ensureEditorPages();
    if (
      !pageId ||
      pageId === storeComponents.activePageId ||
      !getPages.get().some((page) => page.id === pageId)
    ) {
      return;
    }

    persistActivePageSnapshot();
    const targetPage = getPages.get().find((page) => page.id === pageId);
    if (!targetPage) {
      return;
    }

    hydrateCanvasFromPage(targetPage);
    const { store: storePermission, broadcastComponentUpdate } =
      useStorePermission();
    broadcastComponentUpdate(
      Number(new URLSearchParams(window.location.hash.split("?")[1]).get("id")),
      Number(storePermission.currentUserId),
      "replace_all",
      buildReplaceAllPayload(),
    );
    addOperationLog("update_page", `切换到${targetPage.name}`);
  });

  const createEditorPage = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能新增页面")) {
      return null;
    }

    ensureEditorPages();
    persistActivePageSnapshot();
    const pages = getPages.get();
    const nextPage = createEditorPageDefinition(pages);
    storeComponents.pages = [...pages, nextPage];
    hydrateCanvasFromPage(nextPage);
    const { store: storePermission, broadcastComponentUpdate } =
      useStorePermission();
    broadcastComponentUpdate(
      Number(new URLSearchParams(window.location.hash.split("?")[1]).get("id")),
      Number(storePermission.currentUserId),
      "replace_all",
      buildReplaceAllPayload(),
    );
    addOperationLog("update_page", `新增页面:${nextPage.name}`);
    return nextPage;
  });

  const updateEditorPageMeta = action(
    (pageId: string, patch: Partial<Pick<IEditorPageSchema, "name" | "path">>) => {
      if (!ensurePermission("edit_content", "当前角色不能修改页面信息")) {
        return;
      }

      ensureEditorPages();
      persistActivePageSnapshot();
      const nextPages = getPages.get().map((page) => {
        if (page.id !== pageId) {
          return page;
        }

        return {
          ...page,
          name: patch.name?.trim() || page.name,
          path: patch.path
            ? ensureUniquePagePath(getPages.get(), patch.path, pageId)
            : page.path,
        };
      });

      storeComponents.pages = nextPages;
      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(new URLSearchParams(window.location.hash.split("?")[1]).get("id")),
        Number(storePermission.currentUserId),
        "replace_all",
        buildReplaceAllPayload(),
      );
      addOperationLog("update_page", patch.path ? "页面路径" : "页面名称");
    },
  );

  const insertNodeTree = action(
    (
      node: ComponentNode,
      args?: {
        parentId?: string | null;
        slot?: string | null;
        index?: number;
      },
    ) => {
      const parentId = args?.parentId ?? null;
      const targetIndex = args?.index;
      const flatNodes = flattenComponentTree([node], parentId);

      for (const flatNode of flatNodes) {
        const { parentId: nextParentId = null, ...recordNode } = flatNode;
        storeComponents.compConfigs[recordNode.id] = createRecordFromNode(
          recordNode as ComponentNode,
          nextParentId,
        );
      }

      if (parentId) {
        insertChildIdBySlot(
          parentId,
          node.id,
          args?.slot ?? "default",
          targetIndex,
        );
      } else {
        storeComponents.sortableCompConfig = insertIntoOrderedIds(
          storeComponents.sortableCompConfig,
          node.id,
          targetIndex,
        );
      }

      const current = storeComponents.compConfigs[node.id];
      if (current) {
        current.parentId = parentId;
        current.slot = args?.slot ?? current.slot ?? undefined;
      }

      syncSchema();
    },
  );

  const getAvailableSlots = action((type: string) => {
    const { slots } = getComponentContainerMeta(type as TComponentTypes);
    return slots.length
      ? slots
      : [{ name: "default", title: "默认区域", multiple: true }];
  });

  const insertNodeIntoContainer = action(
    (
      type: TComponentTypes,
      args: {
        parentId: string;
        slot?: string | null;
        position?: { left: number; top: number };
      },
    ) => {
      const parent = storeComponents.compConfigs[args.parentId];
      if (!parent) return null;
      const siblings = parent.childIds
        .map((childId) => storeComponents.compConfigs[childId])
        .filter(Boolean)
        .filter(
          (item) => (item.slot ?? "default") === (args.slot ?? "default"),
        );
      const defaultPosition = getDefaultPosition(siblings.length);
      const comp: ComponentNode = {
        id: ulid(),
        type,
        props: {},
        styles: {
          position: "absolute",
          left:
            args.position?.left !== undefined
              ? `${Math.max(0, Math.round(args.position.left))}px`
              : defaultPosition.left,
          top:
            args.position?.top !== undefined
              ? `${Math.max(0, Math.round(args.position.top))}px`
              : defaultPosition.top,
          width: getDefaultWidthByType(type),
        },
        slot: args.slot ?? "default",
        children: [],
      };

      insertNodeTree(comp, {
        parentId: args.parentId,
        slot: comp.slot,
      });
      setCurrentComponent(comp.id);
      return comp.id;
    },
  );

  const moveExistingNode = action(
    (args: {
      nodeId: string;
      targetParentId?: string | null;
      targetSlot?: string | null;
      targetIndex?: number;
    }) => {
      const node = storeComponents.compConfigs[args.nodeId];
      if (!node) return;
      const subtreeIds = gatherSubtreeIds(
        storeComponents.compConfigs,
        args.nodeId,
      );
      if (args.targetParentId && subtreeIds.includes(args.targetParentId)) {
        message.warning("不能把组件移动到自己的子节点下");
        return;
      }
      const prevParentId = node.parentId;
      const prevSlot = node.slot ?? "default";
      const nextParentId = args.targetParentId ?? null;
      const nextSlot = args.targetSlot ?? (nextParentId ? "default" : null);

      if (prevParentId) {
        const prevParent = storeComponents.compConfigs[prevParentId];
        if (prevParent) {
          prevParent.childIds = prevParent.childIds.filter(
            (id) => id !== args.nodeId,
          );
        }
      } else {
        storeComponents.sortableCompConfig =
          storeComponents.sortableCompConfig.filter((id) => id !== args.nodeId);
      }

      if (nextParentId) {
        insertChildIdBySlot(
          nextParentId,
          args.nodeId,
          nextSlot ?? "default",
          args.targetIndex,
        );
      } else {
        storeComponents.sortableCompConfig = insertIntoOrderedIds(
          storeComponents.sortableCompConfig,
          args.nodeId,
          args.targetIndex,
        );
      }

      node.parentId = nextParentId;
      node.slot = nextSlot ?? undefined;
      syncSchema(args.nodeId);

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "replace_all",
        buildReplaceAllPayload(),
      );

      addOperationLog(
        "move_component",
        `${args.nodeId}:${prevParentId ?? "root"}/${prevSlot} -> ${nextParentId ?? "root"}/${nextSlot ?? "root"}`,
      );
    },
  );

  const push = action(
    (
      type: TComponentTypes,
      position?: { left: number; top: number },
      target?: { parentId?: string | null; slot?: string | null },
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能新增组件")) return;
      if (target?.parentId) {
        const insertedId = insertNodeIntoContainer(type, {
          parentId: target.parentId,
          slot: target.slot,
          position,
        });
        if (!insertedId) return;
        const { store: storePermission, broadcastComponentUpdate } =
          useStorePermission();
        broadcastComponentUpdate(
          Number(
            new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
          ),
          Number(storePermission.currentUserId),
          "add",
          storeComponents.compConfigs[insertedId],
        );
        addOperationLog("add_component", type);
        return;
      }
      const defaultPosition = getDefaultPosition(
        storeComponents.sortableCompConfig.length,
      );
      const comp: ComponentNode = {
        id: ulid(),
        type,
        props: {},
        styles: {
          position: "absolute",
          left:
            position?.left !== undefined
              ? `${Math.max(0, Math.round(position.left))}px`
              : defaultPosition.left,
          top:
            position?.top !== undefined
              ? `${Math.max(0, Math.round(position.top))}px`
              : defaultPosition.top,
          width: getDefaultWidthByType(type),
        },
        children: [],
      };

      insertNodeTree(comp);
      setCurrentComponent(comp.id);

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "add",
        storeComponents.compConfigs[comp.id],
      );

      addOperationLog("add_component", type);
    },
  );

  const applyLayoutPreset = action((preset: PageLayoutPresetKey) => {
    if (!ensurePermission("edit_structure", "当前角色不能创建页面布局")) return;
    const { store: storePage, setLayoutMode } = useStorePage();
    const wasEmpty = storeComponents.sortableCompConfig.length === 0;
    const presetTree = createPageLayoutPreset(preset, storePage.pageCategory);
    const insertStartIndex = storeComponents.sortableCompConfig.length;

    if (storePage.layoutMode !== "flow") {
      setLayoutMode("flow");
    }

    presetTree.nodes.forEach((node, index) => {
      insertNodeTree(node, {
        index: insertStartIndex + index,
      });
    });

    if (presetTree.focusId) {
      setCurrentComponent(presetTree.focusId);
    }

    const { store: storePermission, broadcastComponentUpdate } =
      useStorePermission();
    broadcastComponentUpdate(
      Number(new URLSearchParams(window.location.hash.split("?")[1]).get("id")),
      Number(storePermission.currentUserId),
      "replace_all",
      buildReplaceAllPayload(),
    );

    message.success(
      wasEmpty
        ? "已创建页面布局，直接把组件拖到布局区域即可"
        : "已插入布局骨架，可把现有组件拖到新的布局区域",
    );
    addOperationLog("add_component", `layout:${preset}`);
  });

  const getComponentById = action((id: string) => {
    return storeComponents.compConfigs[id];
  });

  const isCurrentComponent = action((compConfig: { id: string }) => {
    return getCurrentComponentConfig.get()?.id === compConfig.id;
  });

  const getCurrentComponentConfig = computed(() => {
    return storeComponents.currentCompConfig
      ? storeComponents.compConfigs[storeComponents.currentCompConfig]
      : null;
  });

  const normalizeActionConfig = (actionConfig: ActionConfig): ActionConfig => {
    if (actionConfig.type !== "setState") {
      return actionConfig;
    }

    return {
      ...actionConfig,
      value: calcValueByString(actionConfig.value as any),
    };
  };

  const updateCurrentComponent = action(
    (compConfig: Record<string, unknown>) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) return;
      const curCompConfig = getCurrentComponentConfig.get();
      if (!curCompConfig) return;
      const nextProps = curCompConfig.props as Record<string, unknown>;

      for (const [key, value] of Object.entries(compConfig)) {
        nextProps[key] = calcValueByString(value as any);
      }

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "update",
        curCompConfig,
      );

      addOperationLog("update_component", curCompConfig.type);
    },
  );

  const updateCurrentComponentStyles = action((styles: Record<string, any>) => {
    if (!ensurePermission("edit_content", "当前角色不能修改组件样式")) return;
    const curCompConfig = getCurrentComponentConfig.get();
    if (!curCompConfig) return;

    if (!curCompConfig.styles) {
      curCompConfig.styles = {};
    }
    const nextStyles = curCompConfig.styles as Record<string, unknown>;

    for (const [key, value] of Object.entries(styles)) {
      nextStyles[key] = calcValueByString(value);
    }

    const { store: storePermission, broadcastComponentUpdate } =
      useStorePermission();
    broadcastComponentUpdate(
      Number(new URLSearchParams(window.location.hash.split("?")[1]).get("id")),
      Number(storePermission.currentUserId),
      "update",
      curCompConfig,
    );

    addOperationLog("update_style", curCompConfig.type);
  });

  const updateCurrentComponentEvents = action(
    (eventName: "onClick", actions: ActionConfig[]) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件事件")) return;
      const curCompConfig = getCurrentComponentConfig.get();
      if (!curCompConfig) return;

      if (!curCompConfig.events) {
        curCompConfig.events = {};
      }

      curCompConfig.events[eventName] = actions.map(normalizeActionConfig);

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "update",
        curCompConfig,
      );

      addOperationLog("update_component", `${curCompConfig.type}:${eventName}`);
    },
  );

  const updateComponentPosition = action(
    (id: string, left: number, top: number, silent: boolean = false) => {
      if (!ensurePermission("edit_structure", "当前角色不能拖拽组件")) return;
      const curCompConfig = storeComponents.compConfigs[id];
      if (!curCompConfig) return;

      if (!curCompConfig.styles) {
        curCompConfig.styles = {};
      }

      curCompConfig.styles.position = "absolute";
      curCompConfig.styles.left = `${Math.max(0, Math.round(left))}px`;
      curCompConfig.styles.top = `${Math.max(0, Math.round(top))}px`;
      curCompConfig.styles.width =
        curCompConfig.styles.width ?? getDefaultWidthByType(curCompConfig.type);

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "update",
        curCompConfig,
      );

      if (!silent) {
        addOperationLog("move_component", curCompConfig.type);
      }
    },
  );

  type TUpdateCurrentCompConfigWithArray = (args: {
    key: string;
    index: number;
    field: string;
    value: string;
  }) => void;
  const updateCurrentCompConfigWithArray: TUpdateCurrentCompConfigWithArray =
    action(({ key, index, field, value }) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) return;
      const curCompConfig = getCurrentComponentConfig.get();
      if (!curCompConfig) return;
      const nextProps = curCompConfig.props as Record<string, unknown>;

      if (!Array.isArray(nextProps[key])) nextProps[key] = [];
      const targetArray = nextProps[key] as Array<Record<string, unknown>>;
      targetArray[index][field] = calcValueByString(value);

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "update",
        curCompConfig,
      );

      addOperationLog("update_component", curCompConfig.type);
    });

  type TRemoveComponentByIdWithArray = (args: {
    key: string;
    index: number;
  }) => void;
  const removeComponentByIdWithArray: TRemoveComponentByIdWithArray = action(
    ({ key, index }) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) return;
      const curCompConfig = getCurrentComponentConfig.get();
      if (!curCompConfig) return;
      const nextProps = curCompConfig.props as Record<string, unknown>;

      if (!Array.isArray(nextProps[key])) return;
      const targetArray = nextProps[key] as Array<Record<string, unknown>>;
      targetArray.splice(index, 1);

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "update",
        curCompConfig,
      );

      addOperationLog("remove_component", curCompConfig.type);
    },
  );

  const setItemsExpandIndex = action((index: number) => {
    storeComponents.itemsExpandIndex = index;
  });

  const undo = action(() => {
    if (!ensurePermission("edit_content", "当前角色不能撤销操作")) return;
    if (!sotreComponentsUndoer.hasUndo) {
      message.warning("没有可撤销的操作");
      return;
    }
    sotreComponentsUndoer.undo();
    addOperationLog("undo", "画布");
  });

  const redo = action(() => {
    if (!ensurePermission("edit_content", "当前角色不能重做操作")) return;
    if (!sotreComponentsUndoer.hasRedo) {
      message.warning("没有可重做的操作");
      return;
    }
    sotreComponentsUndoer.redo();
    addOperationLog("redo", "画布");
  });

  const moveComponent: (pos: { oldIndex: number; newIndex: number }) => void =
    action(({ oldIndex, newIndex }) => {
      if (!ensurePermission("edit_structure", "当前角色不能调整组件顺序"))
        return;
      const currentId = storeComponents.currentCompConfig;
      if (!currentId) return;
      const siblingIds = getSiblingIds(currentId);
      const nextIds = arrayMove(siblingIds, oldIndex, newIndex);
      const current = storeComponents.compConfigs[currentId];
      if (current?.parentId) {
        const parent = storeComponents.compConfigs[current.parentId];
        if (parent) parent.childIds = nextIds;
      } else {
        storeComponents.sortableCompConfig = nextIds;
      }
      syncSchema(currentId);
      addOperationLog("move_component", `${oldIndex + 1} -> ${newIndex + 1}`);
    });

  const moveUpComponent = action(() => {
    const oldIndex = getCurrentComponentIndex.get();
    if (getCurrentComponentIndex.get() !== 0) {
      moveComponent({
        oldIndex,
        newIndex: oldIndex - 1,
      });
    } else {
      message.warning("此组件已经是第一个了");
    }
  });

  const moveDownComponent = action(() => {
    const oldIndex = getCurrentComponentIndex.get();
    if (
      getCurrentComponentIndex.get() !==
      getSiblingIds(storeComponents.currentCompConfig!).length - 1
    ) {
      moveComponent({
        oldIndex,
        newIndex: oldIndex + 1,
      });
    } else {
      message.warning("此组件已经是最后一个了");
    }
  });

  const copyCurrentComponent = action(() => {
    const curCompConfig = getCurrentComponentConfig.get();
    if (!curCompConfig) return;
    const nodeTree = buildTreeNode(
      storeComponents.compConfigs,
      curCompConfig.id,
    );
    if (!nodeTree) return;
    storeComponents.copyedCompConig = nodeTree;
  });

  const pasteCopyedComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能粘贴组件")) return;
    if (!storeComponents.copyedCompConig) return;

    const currentId = storeComponents.currentCompConfig;
    const current = currentId ? storeComponents.compConfigs[currentId] : null;
    const parentId = current?.parentId ?? null;
    const siblingIds = currentId
      ? getSiblingIds(currentId)
      : storeComponents.sortableCompConfig;
    const insertIndex = currentId
      ? siblingIds.indexOf(currentId) + 1
      : siblingIds.length;
    const copiedTree = duplicateTreeNode(storeComponents.copyedCompConig);
    offsetNodePosition(copiedTree);
    insertNodeTree(copiedTree, {
      parentId,
      slot: current?.slot ?? null,
      index: insertIndex,
    });
    setCurrentComponent(copiedTree.id);
    addOperationLog("add_component", "粘贴组件");
  });

  const removeCurrentComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能删除组件")) return;
    const curCompConfig = getCurrentComponentConfig.get();
    if (!curCompConfig) return;

    const subtreeIds = gatherSubtreeIds(
      storeComponents.compConfigs,
      curCompConfig.id,
    );
    if (curCompConfig.parentId) {
      const parent = storeComponents.compConfigs[curCompConfig.parentId];
      if (parent) {
        parent.childIds = parent.childIds.filter(
          (id) => id !== curCompConfig.id,
        );
      }
    } else {
      storeComponents.sortableCompConfig =
        storeComponents.sortableCompConfig.filter(
          (id) => id !== curCompConfig.id,
        );
    }

    for (const targetId of subtreeIds) {
      delete storeComponents.compConfigs[targetId];
    }

    storeComponents.currentCompConfig =
      storeComponents.sortableCompConfig[0] ?? null;

    const { store: storePermission, broadcastComponentUpdate } =
      useStorePermission();
    broadcastComponentUpdate(
      Number(new URLSearchParams(window.location.hash.split("?")[1]).get("id")),
      Number(storePermission.currentUserId),
      "remove",
      { id: curCompConfig.id, subtreeIds },
    );

    addOperationLog("remove_component", curCompConfig.type);
  });

  const _replace = action((value: TStoreComponents) => {
    storeComponents.compConfigs = value.compConfigs;
    storeComponents.currentCompConfig = value.currentCompConfig;
    storeComponents.sortableCompConfig = value.sortableCompConfig;
    storeComponents.copyedCompConig = value.copyedCompConig;
    storeComponents.itemsExpandIndex = value.itemsExpandIndex;
    storeComponents.pages = value.pages;
    storeComponents.activePageId = value.activePageId;
    syncSchema(value.currentCompConfig);
  });

  const replaceByCode = action(
    (
      components: Array<{
        id?: string;
        type: string;
        props?: Record<string, any>;
        styles?: TBasicComponentConfig["styles"];
        slot?: string;
        children?: CodeSyncNode[];
      }>,
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能覆盖组件结构"))
        return;
      const currentId = storeComponents.currentCompConfig;
      const normalized = normalizeFromFlatComponents(components);
      storeComponents.compConfigs = normalized.compConfigs;
      storeComponents.sortableCompConfig = normalized.sortableCompConfig;
      storeComponents.currentCompConfig =
        currentId && normalized.compConfigs[currentId]
          ? currentId
          : (normalized.sortableCompConfig[0] ?? null);

      const { store: storePermission, broadcastComponentUpdate } =
        useStorePermission();
      broadcastComponentUpdate(
        Number(
          new URLSearchParams(window.location.hash.split("?")[1]).get("id"),
        ),
        Number(storePermission.currentUserId),
        "replace_all",
        buildReplaceAllPayload(),
      );

      addOperationLog(
        "ai_replace",
        `共 ${Object.keys(normalized.compConfigs).length} 个组件`,
      );
    },
  );

  const getCurrentComponentIndex = computed(() => {
    const current = getCurrentComponentConfig.get();
    if (!current) return -1;
    return getSiblingIds(current.id).indexOf(current.id);
  });

  const storeInLocalStorage = action(() => {
    if (!ensurePermission("save_draft", "当前角色不能保存草稿")) return;
    const pageSchema = JSON.stringify(serializeStore(storeComponents));
    const currentCompConfig = JSON.stringify(
      toJS(storeComponents.currentCompConfig),
    );

    // Get current page store state
    const { store: pageStore } = useStorePage();
    const pageSettings = JSON.stringify({
      title: pageStore.title,
      description: pageStore.description,
      tdk: pageStore.tdk,
      pageCategory: pageStore.pageCategory,
      layoutMode: pageStore.layoutMode,
      deviceType: pageStore.deviceType,
      canvasWidth: pageStore.canvasWidth,
      canvasHeight: pageStore.canvasHeight,
      codeFramework: pageStore.codeFramework,
    });

    localStorage.setItem(schemaStorageKey, pageSchema);
    localStorage.setItem("currentCompConfig", currentCompConfig);
    localStorage.setItem("pageSettings", pageSettings);
    localStorage.setItem("store_time", String(Date.now()));

    message.success("保存成功");
    addOperationLog("save_draft", "本地草稿");
  });

  const hydrateStoreFromSchema = action(
    (
      schema: IPageSchema,
      layoutMode: "absolute" | "flow",
      preferredCurrentCompId?: string | null,
    ) => {
      const { pages, activePageId } = normalizeEditorPages(schema);
      const activePage =
        pages.find((page) => page.id === activePageId) ?? pages[0] ?? null;
      const normalized = normalizeFromSchema(
        {
          version: schema.version ?? 3,
          components: activePage?.components ?? [],
        },
        layoutMode,
      );

      storeComponents.pages = pages;
      storeComponents.activePageId = activePage?.id ?? null;
      storeComponents.compConfigs = normalized.compConfigs;
      storeComponents.sortableCompConfig = normalized.sortableCompConfig;
      storeComponents.currentCompConfig =
        preferredCurrentCompId && normalized.compConfigs[preferredCurrentCompId]
          ? preferredCurrentCompId
          : (normalized.sortableCompConfig[0] ?? null);
    },
  );

  const initFromServerData = action((data: any) => {
    const schema = data?.schema
      ? (data.schema as IPageSchema)
      : ({
          version: 2,
          components: sanitizeCodeSyncNodes(
            (data?.components ?? []).map((comp: any) => ({
              id: comp.node_id || ulid(),
              type: comp.type,
              props: comp.options ?? {},
              styles: comp.styles ?? comp.options?.styles,
              slot: comp.slot,
            })),
          ),
        } satisfies IPageSchema);

    hydrateStoreFromSchema(schema, data?.layoutMode ?? "absolute");
    const { updatePage } = useStorePage();
    updatePage({
      tdk: data?.tdk || "",
      title: data?.page_name,
      description: data?.desc,
      pageCategory: data?.pageCategory ?? "marketing",
      layoutMode: data?.layoutMode ?? "absolute",
      deviceType: data?.deviceType ?? "mobile",
      canvasWidth: data?.canvasWidth ?? 380,
      canvasHeight: data?.canvasHeight ?? 700,
    });

    message.success("已自动从服务器读取数据");
  });

  const loadPageData = action(
    async (fetchServerData?: () => Promise<{ data: any }>) => {
      const pageSchema = localStorage.getItem(schemaStorageKey);
      const compConfig = localStorage.getItem("compConfig");
      const sortableCompConfig = localStorage.getItem("sortableCompConfig");
      const currentCompConfig = localStorage.getItem("currentCompConfig");
      const pageSettings = localStorage.getItem("pageSettings");

      const storeTime = localStorage.getItem("store_time");
      const releaseTime = localStorage.getItem("release_time");

      let serverData = null;
      if (fetchServerData) {
        try {
          const { data } = await fetchServerData();
          serverData = data;
        } catch (e) {
          console.error("获取服务端数据失败", e);
        }
      }

      if (pageSchema) {
        if (
          storeTime &&
          Number(storeTime) > (releaseTime ? Number(releaseTime) : 0)
        ) {
          const settings = pageSettings ? JSON.parse(pageSettings) : null;
          hydrateStoreFromSchema(
            JSON.parse(pageSchema),
            settings?.layoutMode ?? "absolute",
            currentCompConfig ? JSON.parse(currentCompConfig) : null,
          );

          if (settings) {
            const { updatePage, setCodeFramework } = useStorePage();
            updatePage({
              title: settings.title ?? "Codigo低代码平台",
              description: settings.description ?? "Codigo低代码开发页面详情",
              tdk:
                settings.tdk ??
                "lowcode platform, lowcode development, lowcode page details",
              pageCategory: settings.pageCategory ?? "marketing",
              layoutMode: settings.layoutMode ?? "absolute",
              deviceType: settings.deviceType ?? "mobile",
              canvasWidth: settings.canvasWidth ?? 380,
              canvasHeight: settings.canvasHeight ?? 700,
            });
            if (settings.codeFramework)
              setCodeFramework(settings.codeFramework);
          }

          message.success("已自动从草稿中读取数据");
          return serverData;
        } else if (serverData) {
          initFromServerData(serverData);
          return serverData;
        }
      }

      if (compConfig && compConfig !== "{}") {
        if (
          storeTime &&
          Number(storeTime) > (releaseTime ? Number(releaseTime) : 0)
        ) {
          const legacyComponents = JSON.parse(compConfig);
          const legacyOrder = JSON.parse(sortableCompConfig!);
          const settings = pageSettings ? JSON.parse(pageSettings) : null;
          const legacySchema = {
            version: 2,
            components: sanitizeCodeSyncNodes(
              legacyOrder
                .map((id: string) => legacyComponents[id])
                .filter(Boolean),
            ),
          } satisfies IPageSchema;
          hydrateStoreFromSchema(
            legacySchema,
            settings?.layoutMode ?? "absolute",
            currentCompConfig ? JSON.parse(currentCompConfig) : null,
          );

          if (settings) {
            const { updatePage, setCodeFramework } = useStorePage();
            updatePage({
              title: settings.title ?? "Codigo低代码平台",
              description: settings.description ?? "Codigo低代码开发页面详情",
              tdk:
                settings.tdk ??
                "lowcode platform, lowcode development, lowcode page details",
              pageCategory: settings.pageCategory ?? "marketing",
              layoutMode: settings.layoutMode ?? "absolute",
              deviceType: settings.deviceType ?? "mobile",
              canvasWidth: settings.canvasWidth ?? 380,
              canvasHeight: settings.canvasHeight ?? 700,
            });
            if (settings.codeFramework)
              setCodeFramework(settings.codeFramework);
          }

          message.success("已自动从草稿中读取数据");
          return serverData;
        } else if (serverData) {
          initFromServerData(serverData);
          return serverData;
        }
      } else if (serverData) {
        initFromServerData(serverData);
        return serverData;
      }
      return serverData;
    },
  );

  ensureEditorPages();

  return {
    _replace,
    applyLayoutPreset,
    replaceByCode,
    push,
    getPages,
    getActivePage,
    getComponentById,
    getComponentTree,
    getAvailableSlots,
    isCurrentComponent,
    getCurrentComponentConfig,
    setCurrentComponent,
    createEditorPage,
    switchEditorPage,
    updateEditorPageMeta,
    store: storeComponents,
    updateCurrentComponent,
    updateCurrentComponentEvents,
    updateCurrentComponentStyles,
    updateComponentPosition,
    updateCurrentCompConfigWithArray,
    removeComponentByIdWithArray,
    setItemsExpandIndex,
    // 导出撤销操作的函数
    undo,
    // 导出重做操作的函数
    redo,
    // 导出是否有上一步
    hasUndo: sotreComponentsUndoer.hasUndo,
    // 导出是否有下一步
    hasRedo: sotreComponentsUndoer.hasRedo,
    moveComponent,
    moveUpComponent,
    moveDownComponent,
    copyCurrentComponent,
    pasteCopyedComponent,
    removeCurrentComponent,
    moveExistingNode,
    getCurrentComponentIndex,
    storeInLocalStorage,
    loadPageData,
    initFromServerData,
    initPageData: initFromServerData,
    serializeSchema: () => serializeStore(storeComponents),
    insertNodeIntoContainer,
  };
}
