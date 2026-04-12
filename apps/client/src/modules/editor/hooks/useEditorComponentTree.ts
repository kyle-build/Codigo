import { action } from "mobx";
import type { ComponentNode } from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { normalizeLayout } from "@/modules/editor/utils/pageLayout";
import { createRecordFromNode } from "@/modules/editor/utils/pageSchema";

interface EditorComponentTreeContext {
  storeComponents: TEditorComponentsStore;
  pageStore: {
    layoutMode: "absolute";
  };
}

/**
 * 创建 editor 组件树基础结构能力。
 */
export function createEditorComponentTree(
  context: EditorComponentTreeContext,
) {
  const { pageStore, storeComponents } = context;

  /**
   * 获取当前节点的同级节点列表。
   */
  const getSiblingIds = (id: string) => {
    const current = storeComponents.compConfigs[id];
    if (!current) {
      return storeComponents.sortableCompConfig;
    }

    const siblings = current.parentId
      ? (storeComponents.compConfigs[current.parentId]?.childIds ?? [])
      : storeComponents.sortableCompConfig;
    return siblings.filter((siblingId) => {
      const sibling = storeComponents.compConfigs[siblingId];
      if (!sibling) {
        return false;
      }
      return (sibling.slot ?? "default") === (current.slot ?? "default");
    });
  };

  /**
   * 把节点插入到指定顺序列表中。
   */
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

  /**
   * 按 slot 把子节点插入父节点。
   */
  const insertChildIdBySlot = action(
    (parentId: string, nodeId: string, slot: string, targetIndex?: number) => {
      const parent = storeComponents.compConfigs[parentId];
      if (!parent) {
        return;
      }

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

      const firstIndex = childIds.findIndex((item) => item === slotSiblingIds[0]);
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

  /**
   * 根据当前页面布局模式同步节点布局。
   */
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

  /**
   * 在布局模式切换时同步现有节点布局。
   */
  const syncLayoutMode = action((_layoutMode: "absolute") => {
    normalizeLayout(
      storeComponents.compConfigs,
      storeComponents.sortableCompConfig,
    );
  });

  /**
   * 把整棵节点树写入当前 store。
   */
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
      const rootNode =
        args?.slot && args.slot !== "default"
          ? ({ ...node, slot: args.slot } as ComponentNode)
          : node;
      const stack: Array<{ node: ComponentNode; parentId: string | null }> = [
        { node: rootNode, parentId },
      ];

      while (stack.length) {
        const current = stack.pop();
        if (!current) {
          continue;
        }

        const { node: currentNode, parentId: nextParentId } = current;
        storeComponents.compConfigs[currentNode.id] = createRecordFromNode(
          currentNode,
          nextParentId,
        );

        const children = currentNode.children ?? [];
        for (let i = children.length - 1; i >= 0; i -= 1) {
          stack.push({ node: children[i], parentId: currentNode.id });
        }
      }

      if (parentId) {
        insertChildIdBySlot(
          parentId,
          rootNode.id,
          args?.slot ?? "default",
          targetIndex,
        );
      } else {
        storeComponents.sortableCompConfig = insertIntoOrderedIds(
          storeComponents.sortableCompConfig,
          rootNode.id,
          targetIndex,
        );
      }

      const current = storeComponents.compConfigs[rootNode.id];
      if (current) {
        current.parentId = parentId;
        current.slot = args?.slot ?? current.slot ?? undefined;
      }

      syncSchema();
    },
  );

  return {
    getSiblingIds,
    insertChildIdBySlot,
    insertIntoOrderedIds,
    insertNodeTree,
    syncLayoutMode,
    syncSchema,
  };
}
