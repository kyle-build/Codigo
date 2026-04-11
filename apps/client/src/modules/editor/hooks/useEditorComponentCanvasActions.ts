import { action } from "mobx";
import { arrayMove } from "@dnd-kit/sortable";
import { message } from "antd";
import type {
  ComponentNode,
  ComponentNodeRecord,
  TBasicComponentConfig,
} from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { gatherSubtreeIds } from "@/modules/editor/utils/pageLayout";
import {
  buildTreeNode,
  duplicateTreeNode,
  normalizeFromFlatComponents,
  offsetNodePosition,
  type CodeSyncNode,
} from "@/modules/editor/utils/pageSchema";

interface EditorComponentCanvasActionsContext {
  storeComponents: TEditorComponentsStore;
  pageStore: {
    layoutMode: "absolute";
  };
  ensurePermission: (permission: any, deniedMessage?: string) => boolean;
  addOperationLog: (action: any, detail: string) => void;
  broadcastNodeChange: (actionType: string, payload: any) => void;
  broadcastReplaceAll: () => void;
  setCurrentComponent: (id: string) => void;
  getCurrentComponent: () => ComponentNodeRecord | null;
  getSiblingIds: (id: string) => string[];
  syncSchema: (keepCurrentId?: string | null) => void;
  insertNodeTree: (
    node: ComponentNode,
    args?: {
      parentId?: string | null;
      slot?: string | null;
      index?: number;
    },
  ) => void;
}

/**
 * 创建 editor 画布级操作能力。
 */
export function createEditorComponentCanvasActions(
  context: EditorComponentCanvasActionsContext,
) {
  const {
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
  } = context;

  /**
   * 调整当前组件在同级中的顺序。
   */
  const moveComponent = action((pos: { oldIndex: number; newIndex: number }) => {
    if (!ensurePermission("edit_structure", "当前角色不能调整组件顺序")) {
      return;
    }

    const currentId = storeComponents.currentCompConfig;
    if (!currentId) {
      return;
    }

    const siblingIds = getSiblingIds(currentId);
    const nextIds = arrayMove(siblingIds, pos.oldIndex, pos.newIndex);
    const current = storeComponents.compConfigs[currentId];
    if (current?.parentId) {
      const parent = storeComponents.compConfigs[current.parentId];
      if (parent) {
        parent.childIds = nextIds;
      }
    } else {
      storeComponents.sortableCompConfig = nextIds;
    }
    syncSchema(currentId);
    addOperationLog("move_component", `${pos.oldIndex + 1} -> ${pos.newIndex + 1}`);
  });

  /**
   * 上移当前组件。
   */
  const moveUpComponent = action((currentIndex: number) => {
    if (currentIndex !== 0) {
      moveComponent({
        oldIndex: currentIndex,
        newIndex: currentIndex - 1,
      });
      return;
    }

    message.warning("此组件已经是第一个了");
  });

  /**
   * 下移当前组件。
   */
  const moveDownComponent = action((currentIndex: number) => {
    const currentId = storeComponents.currentCompConfig;
    if (!currentId) {
      return;
    }

    if (currentIndex !== getSiblingIds(currentId).length - 1) {
      moveComponent({
        oldIndex: currentIndex,
        newIndex: currentIndex + 1,
      });
      return;
    }

    message.warning("此组件已经是最后一个了");
  });

  /**
   * 复制当前组件树。
   */
  const copyCurrentComponent = action(() => {
    const currentComponent = getCurrentComponent();
    if (!currentComponent) {
      return;
    }

    const nodeTree = buildTreeNode(storeComponents.compConfigs, currentComponent.id);
    if (!nodeTree) {
      return;
    }

    storeComponents.copyedCompConig = nodeTree;
  });

  /**
   * 粘贴已复制的组件树。
   */
  const pasteCopyedComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能粘贴组件")) {
      return;
    }
    if (!storeComponents.copyedCompConig) {
      return;
    }

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

  /**
   * 删除当前组件树。
   */
  const removeCurrentComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能删除组件")) {
      return;
    }

    const currentComponent = getCurrentComponent();
    if (!currentComponent) {
      return;
    }

    const subtreeIds = gatherSubtreeIds(
      storeComponents.compConfigs,
      currentComponent.id,
    );
    if (currentComponent.parentId) {
      const parent = storeComponents.compConfigs[currentComponent.parentId];
      if (parent) {
        parent.childIds = parent.childIds.filter((id) => id !== currentComponent.id);
      }
    } else {
      storeComponents.sortableCompConfig = storeComponents.sortableCompConfig.filter(
        (id) => id !== currentComponent.id,
      );
    }

    for (const targetId of subtreeIds) {
      delete storeComponents.compConfigs[targetId];
    }

    storeComponents.currentCompConfig = storeComponents.sortableCompConfig[0] ?? null;
    broadcastNodeChange("remove", { id: currentComponent.id, subtreeIds });
    addOperationLog("remove_component", currentComponent.type);
  });

  /**
   * 用代码模式导出的组件结构替换当前画布。
   */
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
      if (!ensurePermission("edit_structure", "当前角色不能覆盖组件结构")) {
        return;
      }

      const currentId = storeComponents.currentCompConfig;
      const normalized = normalizeFromFlatComponents(
        components,
        pageStore.layoutMode,
      );
      storeComponents.compConfigs = normalized.compConfigs;
      storeComponents.sortableCompConfig = normalized.sortableCompConfig;
      storeComponents.currentCompConfig =
        currentId && normalized.compConfigs[currentId]
          ? currentId
          : (normalized.sortableCompConfig[0] ?? null);

      broadcastReplaceAll();
      addOperationLog(
        "ai_replace",
        `共 ${Object.keys(normalized.compConfigs).length} 个组件`,
      );
    },
  );

  return {
    copyCurrentComponent,
    moveComponent,
    moveDownComponent,
    moveUpComponent,
    pasteCopyedComponent,
    removeCurrentComponent,
    replaceByCode,
  };
}
