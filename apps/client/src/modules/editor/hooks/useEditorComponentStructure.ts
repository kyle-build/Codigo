import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { createEditorComponentCreation } from "./useEditorComponentCreation";
import { createEditorComponentMove } from "./useEditorComponentMove";
import { createEditorComponentTree } from "./useEditorComponentTree";

interface EditorComponentStructureContext {
  storeComponents: TEditorComponentsStore;
  pageStore: {
    layoutMode: "absolute";
  };
  ensurePermission: (permission: any, deniedMessage?: string) => boolean;
  addOperationLog: (action: any, detail: string) => void;
  broadcastNodeChange: (actionType: string, payload: any) => void;
  broadcastReplaceAll: () => void;
  setCurrentComponent: (id: string) => void;
}

/**
 * 创建 editor 组件树结构相关的读写能力。
 */
export function createEditorComponentStructure(
  context: EditorComponentStructureContext,
) {
  const {
    addOperationLog,
    broadcastNodeChange,
    broadcastReplaceAll,
    ensurePermission,
    pageStore,
    setCurrentComponent,
    storeComponents,
  } = context;

  const {
    getSiblingIds,
    insertChildIdBySlot,
    insertIntoOrderedIds,
    insertNodeTree,
    syncLayoutMode,
    syncSchema,
  } = createEditorComponentTree({
    pageStore,
    storeComponents,
  });

  const { getAvailableSlots, insertNodeIntoContainer, push } =
    createEditorComponentCreation({
      addOperationLog,
      broadcastNodeChange,
      ensurePermission,
      insertNodeTree,
      setCurrentComponent,
      storeComponents,
    });

  const { moveExistingNode } = createEditorComponentMove({
    addOperationLog,
    broadcastReplaceAll,
    insertChildIdBySlot,
    insertIntoOrderedIds,
    storeComponents,
    syncSchema,
  });

  return {
    getAvailableSlots,
    getSiblingIds,
    insertNodeIntoContainer,
    insertNodeTree,
    moveExistingNode,
    push,
    syncLayoutMode,
    syncSchema,
  };
}
