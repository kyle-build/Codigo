import { action, computed, toJS } from "mobx";
import { trackUndo } from "mobx-shallow-undo";
import { message } from "antd";
import type { IEditorPageSchema } from "@codigo/schema";
import {
  createEditorComponentsStore,
  type TEditorComponentsStore,
} from "@/modules/editor/stores";
import { serializeComponentTree, serializeStore } from "@/modules/editor/utils/pageSchema";
import { createEditorComponentCanvasActions } from "./useEditorComponentCanvasActions";
import { createEditorComponentMutations } from "./useEditorComponentMutations";
import { createEditorComponentPageActions } from "./useEditorComponentPages";
import { createEditorComponentPersistence } from "./useEditorComponentPersistence";
import { createEditorSidebarLayoutActions } from "./useEditorSidebarLayoutActions";
import { createEditorComponentStructure } from "./useEditorComponentStructure";
import { useEditorPage } from "./useEditorPage";
import { useEditorPermission } from "./useEditorPermission";

const storeComponents = createEditorComponentsStore();

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

  /**
   * 设置当前选中的组件。
   */
  const setCurrentComponent = action((id: string) => {
    storeComponents.currentCompConfig = id;
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
    syncLayoutMode,
    syncSchema,
  } = createEditorComponentStructure({
    addOperationLog,
    broadcastNodeChange,
    broadcastReplaceAll,
    ensurePermission,
    pageStore,
    setCurrentComponent,
    storeComponents,
  });

  const {
    applyLayoutPreset,
    clearActivePageCanvas,
    createEditorPage,
    ensureEditorPages,
    getActivePage,
    getPages,
    switchEditorPage,
    updateEditorPageMeta,
  } = createEditorComponentPageActions({
    addOperationLog,
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
    addOperationLog,
    broadcastNodeChange,
    ensurePermission,
    getCurrentComponent,
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
    storeComponents.itemsExpandIndex = value.itemsExpandIndex;
    storeComponents.pages = value.pages;
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
    if (!storeComponentsUndoer.hasUndo) {
      message.warning("没有可撤销的操作");
      return;
    }
    storeComponentsUndoer.undo();
    addOperationLog("undo", "画布");
  });

  /**
   * 暴露重做能力。
   */
  const redo = action(() => {
    if (!ensurePermission("edit_content", "当前角色不能重做操作")) {
      return;
    }
    if (!storeComponentsUndoer.hasRedo) {
      message.warning("没有可重做的操作");
      return;
    }
    storeComponentsUndoer.redo();
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
    addOperationLog,
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
    addOperationLog,
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
    addOperationLog,
    broadcastReplaceAll,
    ensurePermission,
    insertNodeTree,
    setCurrentComponent,
    storeComponents,
    syncSchema,
  });

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
    updateComponentSize,
    updateCurrentCompConfigWithArray,
    removeComponentByIdWithArray,
    setItemsExpandIndex,
    undo,
    redo,
    hasUndo: storeComponentsUndoer.hasUndo,
    hasRedo: storeComponentsUndoer.hasRedo,
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
    loadPageData,
    initFromServerData,
    initPageData: initFromServerData,
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

const storeComponentsUndoer = trackUndo(
  () => toJS(storeComponents),
  (value) => {
    const { _replace } = useEditorComponents();
    _replace(value);
  },
);
