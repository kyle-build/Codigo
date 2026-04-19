import { action, computed, makeAutoObservable, observable, toJS } from "mobx";
import { message } from "antd";
import type { IEditorPageSchema } from "@codigo/schema";
import type { TemplatePreset } from "@/modules/templateCenter/types/templates";
import {
  buildTemplateSchema,
  createTemplatePageSettings,
} from "@/modules/templateCenter/utils/templateDraft";
import {
  createEditorComponentsStore,
  type TEditorComponentsStore,
} from "@/modules/editor/stores";
import {
  normalizeFromSchema,
  serializeComponentTree,
  serializeStore,
} from "@/modules/editor/utils/pageSchema";
import { createEditorComponentCanvasActions } from "./useEditorComponentCanvasActions";
import { createEditorComponentMutations } from "./useEditorComponentMutations";
import { createEditorComponentPageActions } from "./useEditorComponentPages";
import { createEditorComponentPersistence } from "./useEditorComponentPersistence";
import { createEditorSidebarLayoutActions } from "./useEditorSidebarLayoutActions";
import { createEditorComponentStructure } from "./useEditorComponentStructure";
import { useEditorPage } from "./useEditorPage";
import { useEditorPermission } from "./useEditorPermission";

const storeComponents = createEditorComponentsStore();

type OperationHistoryEntry = {
  id: string;
  label: string;
  createdAt: number;
  snapshot: TEditorComponentsStore;
};

const UNDOABLE_HISTORY_EVENTS = new Set<string>([
  "add_block",
  "add_component",
  "move_component",
  "remove_component",
  "update_component",
  "update_style",
  "update_page",
  "ai_replace",
]);

function formatHistoryLabel(event: string, detail: string) {
  switch (event) {
    case "add_block":
      return `新增区块：${detail}`;
    case "add_component":
      return `新增：${detail}`;
    case "move_component":
      return `移动：${detail}`;
    case "remove_component":
      return `删除：${detail}`;
    case "update_component":
      return `修改：${detail}`;
    case "update_style":
      return `样式：${detail}`;
    case "update_page":
      return `页面：${detail}`;
    case "ai_replace":
      return `AI 替换：${detail}`;
    default:
      return `${event}:${detail}`;
  }
}

function toNumber(value: unknown, fallback: number) {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function isPlainTemplateContainer(props: Record<string, any> | undefined) {
  const safe = props ?? {};
  const showChrome =
    safe.showChrome === true || safe.showChrome === "true" || safe.showChrome === 1;
  const title = typeof safe.title === "string" ? safe.title.trim() : "";
  const backgroundColor =
    typeof safe.backgroundColor === "string" ? safe.backgroundColor.trim() : "";
  const borderColor = typeof safe.borderColor === "string" ? safe.borderColor.trim() : "";
  const borderRadius = toNumber(safe.borderRadius, 0);
  const padding = toNumber(safe.padding, 0);
  const minHeight = toNumber(safe.minHeight, 0);

  return (
    !showChrome &&
    !title &&
    (backgroundColor === "" || backgroundColor === "transparent") &&
    (borderColor === "" || borderColor === "transparent") &&
    borderRadius === 0 &&
    padding === 0 &&
    minHeight === 0
  );
}

function stripPlainTemplateContainers(
  components: IEditorPageSchema["components"],
): IEditorPageSchema["components"] {
  const walk = (node: IEditorPageSchema["components"][number]) => {
    const children = (node.children ?? []).flatMap(walk);
    if (node.type === "container" && isPlainTemplateContainer(node.props)) {
      return children;
    }
    return [
      {
        ...node,
        children: children.length ? children : undefined,
      },
    ];
  };

  return components.flatMap(walk);
}

const operationHistoryStore = makeAutoObservable(
  {
    entries: [] as OperationHistoryEntry[],
    cursor: -1,
    maxSize: 80,
    get canUndo() {
      return this.cursor > 0;
    },
    get canRedo() {
      return this.cursor >= 0 && this.cursor < this.entries.length - 1;
    },
    ensureInitialized(snapshot: TEditorComponentsStore) {
      if (this.entries.length) {
        return;
      }
      const now = Date.now();
      this.entries = [
        {
          id: `${now}_${Math.random().toString(36).slice(2, 8)}`,
          label: "初始化",
          createdAt: now,
          snapshot,
        },
      ];
      this.cursor = 0;
    },
    reset(snapshot: TEditorComponentsStore, label = "初始化") {
      const now = Date.now();
      this.entries = [
        {
          id: `${now}_${Math.random().toString(36).slice(2, 8)}`,
          label,
          createdAt: now,
          snapshot,
        },
      ];
      this.cursor = 0;
    },
    commit(snapshot: TEditorComponentsStore, label: string) {
      this.ensureInitialized(snapshot);
      const now = Date.now();
      const nextEntries = this.entries.slice(0, this.cursor + 1);
      nextEntries.push({
        id: `${now}_${Math.random().toString(36).slice(2, 8)}`,
        label,
        createdAt: now,
        snapshot,
      });
      const overflow = Math.max(0, nextEntries.length - this.maxSize);
      this.entries = overflow ? nextEntries.slice(overflow) : nextEntries;
      this.cursor = this.entries.length - 1;
    },
    stepUndo() {
      if (!this.canUndo) {
        return null;
      }
      this.cursor -= 1;
      return this.entries[this.cursor]?.snapshot ?? null;
    },
    stepRedo() {
      if (!this.canRedo) {
        return null;
      }
      this.cursor += 1;
      return this.entries[this.cursor]?.snapshot ?? null;
    },
    jump(index: number) {
      if (!Number.isFinite(index)) {
        return null;
      }
      const targetIndex = Math.max(0, Math.min(this.entries.length - 1, index));
      const entry = this.entries[targetIndex];
      if (!entry) {
        return null;
      }
      this.cursor = targetIndex;
      return entry.snapshot;
    },
  },
  { entries: observable.shallow },
  { autoBind: true },
);

/**
 * 构建广播 replace_all 所需的完整 payload。
 */
function buildReplaceAllPayload(store: TEditorComponentsStore, pages: IEditorPageSchema[]) {
  return {
    compConfigs: store.compConfigs,
    sortableCompConfig: store.sortableCompConfig,
    pages,
    activePageId: store.activePageId,
  };
}

/**
 * 获取当前协作广播所需的页面与用户上下文。
 */
function getCollaborationContext(currentUserId: string) {
  return {
    pageId: Number(new URLSearchParams(window.location.hash.split("?")[1]).get("id")),
    currentUserId: Number(currentUserId),
  };
}

/**
 * 暴露 editor 域的组件树读写能力。
 */
export function useEditorComponents() {
  const { store: pageStore, updatePage, setCodeFramework } = useEditorPage();
  const {
    ensurePermission,
    addOperationLog,
    broadcastComponentUpdate,
    store: permissionStore,
  } = useEditorPermission();

  const addOperationLogWithHistory = (event: any, detail: string) => {
    addOperationLog(event, detail);
    const eventKey = String(event);
    if (!UNDOABLE_HISTORY_EVENTS.has(eventKey)) {
      return;
    }
    operationHistoryStore.commit(
      toJS(storeComponents) as TEditorComponentsStore,
      formatHistoryLabel(eventKey, detail),
    );
  };

  /**
   * 设置当前选中的组件。
   */
  const setCurrentComponent = action((id: string) => {
    const config = storeComponents.compConfigs[id];
    if (config?.type === "container") {
      const nextId = config.childIds?.[0] ?? config.parentId ?? null;
      storeComponents.currentCompConfig = nextId;
      storeComponents.selectedCompIds = nextId ? [nextId] : [];
      return;
    }
    storeComponents.currentCompConfig = id;
    storeComponents.selectedCompIds = [id];
  });

  /**
   * 清空当前选中的组件。
   */
  const clearCurrentComponent = action(() => {
    storeComponents.currentCompConfig = null;
    storeComponents.selectedCompIds = [];
  });

  /**
   * 设置当前选中的组件集合。
   */
  const setSelectedComponents = action((ids: string[]) => {
    const nextIds = Array.from(
      new Set(ids.filter((id) => Boolean(id && storeComponents.compConfigs[id]))),
    );
    storeComponents.selectedCompIds = nextIds;
    if (!nextIds.length) {
      storeComponents.currentCompConfig = null;
      return;
    }
    if (storeComponents.currentCompConfig && nextIds.includes(storeComponents.currentCompConfig)) {
      return;
    }
    storeComponents.currentCompConfig = nextIds[0] ?? null;
  });

  /**
   * 全选当前页面的根组件。
   */
  const selectAllComponents = action(() => {
    const allRootIds = storeComponents.sortableCompConfig.filter((id) =>
      Boolean(id && storeComponents.compConfigs[id]),
    );
    storeComponents.selectedCompIds = allRootIds;
    if (!allRootIds.length) {
      storeComponents.currentCompConfig = null;
      return;
    }
    if (storeComponents.currentCompConfig && allRootIds.includes(storeComponents.currentCompConfig)) {
      return;
    }
    storeComponents.currentCompConfig = allRootIds[0] ?? null;
  });

  /**
   * 广播 replace_all 类型的协作变更。
   */
  const broadcastReplaceAll = () => {
    const { pageId, currentUserId } = getCollaborationContext(
      permissionStore.currentUserId,
    );
    broadcastComponentUpdate(
      pageId,
      currentUserId,
      "replace_all",
      buildReplaceAllPayload(storeComponents, getPages.get()),
    );
  };

  /**
   * 广播通用组件变更。
   */
  const broadcastNodeChange = (actionType: string, payload: any) => {
    const { pageId, currentUserId } = getCollaborationContext(
      permissionStore.currentUserId,
    );
    broadcastComponentUpdate(pageId, currentUserId, actionType, payload);
  };

  /**
   * 获取当前组件树。
   */
  const getComponentTree = computed(() => {
    return serializeComponentTree(storeComponents);
  });

  /**
   * 获取当前选中的组件配置。
   */
  const getCurrentComponentConfig = computed(() => {
    return storeComponents.currentCompConfig
      ? storeComponents.compConfigs[storeComponents.currentCompConfig]
      : null;
  });

  /**
   * 获取当前组件配置的即时快照。
   */
  const getCurrentComponent = () => {
    return getCurrentComponentConfig.get();
  };

  const {
    getAvailableSlots,
    getSiblingIds,
    insertNodeIntoContainer,
    insertNodeTree,
    moveExistingNode,
    push,
    pushBlock,
    syncLayoutMode,
    syncSchema,
  } = createEditorComponentStructure({
    addOperationLog: addOperationLogWithHistory,
    broadcastNodeChange,
    broadcastReplaceAll,
    ensurePermission,
    pageStore,
    setCurrentComponent,
    storeComponents,
  });

  const {
    clearActivePageCanvas,
    createEditorPage,
    createEditorPageGroup,
    ensureEditorPages,
    getActivePage,
    getPageGroups,
    getPages,
    switchEditorPage,
    updateEditorPageMeta,
    updateEditorPageLayoutBlocks,
  } = createEditorComponentPageActions({
    addOperationLog: addOperationLogWithHistory,
    broadcastReplaceAll,
    ensurePermission,
    insertNodeTree,
    pageStore,
    setCurrentComponent,
    storeComponents,
  });

  /**
   * 按 ID 获取组件配置。
   */
  const getComponentById = action((id: string) => {
    return storeComponents.compConfigs[id];
  });

  /**
   * 判断某个节点是否为当前选中节点。
   */
  const isCurrentComponent = action((compConfig: { id: string }) => {
    return getCurrentComponentConfig.get()?.id === compConfig.id;
  });

  const {
    removeComponentByIdWithArray,
    updateComponentPosition,
    updateComponentSize,
    updateCurrentCompConfigWithArray,
    updateCurrentComponent,
    updateCurrentComponentEvents,
    updateCurrentComponentStyles,
  } = createEditorComponentMutations({
    addOperationLog: addOperationLogWithHistory,
    broadcastNodeChange,
    ensurePermission,
    getCurrentComponent,
    pageStore,
    storeComponents,
  });

  /**
   * 设置属性面板展开项。
   */
  const setItemsExpandIndex = action((index: number) => {
    storeComponents.itemsExpandIndex = index;
  });

  /**
   * 用指定快照替换当前组件 store。
   */
  const _replace = action((value: TEditorComponentsStore) => {
    storeComponents.compConfigs = value.compConfigs;
    storeComponents.currentCompConfig = value.currentCompConfig;
    storeComponents.sortableCompConfig = value.sortableCompConfig;
    storeComponents.copyedCompConig = value.copyedCompConig;
    storeComponents.selectedCompIds = Array.isArray((value as any).selectedCompIds)
      ? (value as any).selectedCompIds
      : (value.currentCompConfig ? [value.currentCompConfig] : []);
    storeComponents.itemsExpandIndex = value.itemsExpandIndex;
    storeComponents.pages = value.pages;
    storeComponents.pageGroups = value.pageGroups ?? [];
    storeComponents.activePageId = value.activePageId;
    syncSchema(value.currentCompConfig);
  });

  /**
   * 暴露撤销能力。
   */
  const undo = action(() => {
    if (!ensurePermission("edit_content", "当前角色不能撤销操作")) {
      return;
    }
    const snapshot = operationHistoryStore.stepUndo();
    if (!snapshot) {
      message.warning("没有可撤销的操作");
      return;
    }
    _replace(snapshot);
    addOperationLog("undo", "画布");
  });

  /**
   * 暴露重做能力。
   */
  const redo = action(() => {
    if (!ensurePermission("edit_content", "当前角色不能重做操作")) {
      return;
    }
    const snapshot = operationHistoryStore.stepRedo();
    if (!snapshot) {
      message.warning("没有可重做的操作");
      return;
    }
    _replace(snapshot);
    addOperationLog("redo", "画布");
  });

  /**
   * 获取当前选中组件在同级中的序号。
   */
  const getCurrentComponentIndex = computed(() => {
    const current = getCurrentComponentConfig.get();
    if (!current) {
      return -1;
    }

    return getSiblingIds(current.id).indexOf(current.id);
  });

  const {
    copyCurrentComponent,
    moveComponent,
    moveDownComponent,
    moveUpComponent,
    pasteCopyedComponent,
    removeCurrentComponent,
    replaceByCode,
  } = createEditorComponentCanvasActions({
    addOperationLog: addOperationLogWithHistory,
    broadcastNodeChange,
    broadcastReplaceAll,
    ensurePermission,
    getCurrentComponent,
    getSiblingIds,
    insertNodeTree,
    pageStore,
    setCurrentComponent,
    storeComponents,
    syncSchema,
  });

  const {
    initFromServerData,
    loadPageData,
    storeInLocalStorage,
  } = createEditorComponentPersistence({
    addOperationLog: addOperationLogWithHistory,
    ensurePermission,
    pageStore,
    setCodeFramework,
    storeComponents,
    updatePage,
  });

  const {
    appendSidebarSection,
    getSidebarSections,
    moveSidebarSection,
    removeSidebarSection,
    syncSidebarPanels,
    updateSidebarSectionLabel,
  } = createEditorSidebarLayoutActions({
    addOperationLog: addOperationLogWithHistory,
    broadcastReplaceAll,
    ensurePermission,
    insertNodeTree,
    setCurrentComponent,
    storeComponents,
    syncSchema,
  });

  /**
   * 将模板整体应用到当前工作区，并替换现有页面集合。
   */
  const applyTemplateToWorkspace = action((template: TemplatePreset) => {
    if (!ensurePermission("edit_structure", "当前角色不能应用模板")) {
      return false;
    }

    const schema = buildTemplateSchema(template);
    const nextPageSettings = createTemplatePageSettings(template);
    const activeTemplatePage =
      schema.pages?.find((page) => page.id === schema.activePageId) ??
      schema.pages?.[0] ??
      null;

    if (!activeTemplatePage || !schema.pages?.length) {
      message.warning("模板页面不可用，暂时无法应用模板");
      return false;
    }

    const normalized = normalizeFromSchema(
      {
        version: schema.version,
        components: stripPlainTemplateContainers(activeTemplatePage.components),
      },
      nextPageSettings.layoutMode,
      nextPageSettings.grid,
    );

    storeComponents.compConfigs = normalized.compConfigs;
    storeComponents.sortableCompConfig = normalized.sortableCompConfig;
    storeComponents.currentCompConfig = normalized.sortableCompConfig[0] ?? null;
    storeComponents.selectedCompIds = storeComponents.currentCompConfig
      ? [storeComponents.currentCompConfig]
      : [];
    storeComponents.pages = schema.pages ?? [];
    storeComponents.pageGroups = schema.pageGroups ?? [];
    storeComponents.activePageId = activeTemplatePage.id;

    updatePage(nextPageSettings);
    broadcastReplaceAll();
    addOperationLogWithHistory("update_page", `应用模板:${template.name}`);
    message.success(`已应用“${template.name}”模板，当前工作区已切换为多页面后台骨架`);
    return true;
  });

  ensureEditorPages();
  operationHistoryStore.ensureInitialized(toJS(storeComponents) as TEditorComponentsStore);

  const loadPageDataWithHistory = async (...args: Parameters<typeof loadPageData>) => {
    const result = await loadPageData(...args);
    operationHistoryStore.reset(toJS(storeComponents) as TEditorComponentsStore, "加载页面");
    return result;
  };

  const initFromServerDataWithHistory = (...args: Parameters<typeof initFromServerData>) => {
    const result = initFromServerData(...args);
    operationHistoryStore.reset(
      toJS(storeComponents) as TEditorComponentsStore,
      "初始化页面",
    );
    return result;
  };

  const rollbackToHistory = action((index: number) => {
    if (!ensurePermission("edit_content", "当前角色不能回滚操作")) {
      return;
    }
    const snapshot = operationHistoryStore.jump(index);
    if (!snapshot) {
      return;
    }
    _replace(snapshot);
    const targetLabel = operationHistoryStore.entries[operationHistoryStore.cursor]?.label;
    addOperationLog("undo", targetLabel ? `回滚到：${targetLabel}` : "回滚到指定操作");
  });

  return {
    applyTemplateToWorkspace,
    _replace,
    replaceByCode,
    push,
    pushBlock,
    getPageGroups,
    getPages,
    getActivePage,
    getComponentById,
    getComponentTree,
    getAvailableSlots,
    isCurrentComponent,
    getCurrentComponentConfig,
    setCurrentComponent,
    clearCurrentComponent,
    setSelectedComponents,
    selectAllComponents,
    createEditorPage,
    createEditorPageGroup,
    switchEditorPage,
    updateEditorPageMeta,
    updateEditorPageLayoutBlocks,
    store: storeComponents,
    updateCurrentComponent,
    updateCurrentComponentEvents,
    updateCurrentComponentStyles,
    updateComponentPosition,
    updateComponentSize,
    updateCurrentCompConfigWithArray,
    removeComponentByIdWithArray,
    setItemsExpandIndex,
    undo,
    redo,
    hasUndo: operationHistoryStore.canUndo,
    hasRedo: operationHistoryStore.canRedo,
    operationHistory: operationHistoryStore,
    rollbackToHistory,
    moveComponent,
    moveUpComponent,
    moveDownComponent,
    copyCurrentComponent,
    pasteCopyedComponent,
    clearActivePageCanvas,
    removeCurrentComponent,
    moveExistingNode,
    getCurrentComponentIndex,
    storeInLocalStorage,
    loadPageData: loadPageDataWithHistory,
    initFromServerData: initFromServerDataWithHistory,
    initPageData: initFromServerDataWithHistory,
    serializeSchema: () => serializeStore(storeComponents),
    insertNodeIntoContainer,
    appendSidebarSection,
    getSidebarSections,
    moveSidebarSection,
    removeSidebarSection,
    syncSidebarPanels,
    updateSidebarSectionLabel,
    syncLayoutMode,
  };
}
