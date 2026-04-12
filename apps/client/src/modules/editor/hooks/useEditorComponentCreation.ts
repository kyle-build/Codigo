import { ulid } from "ulid";
import { action } from "mobx";
import { getComponentContainerMeta } from "@codigo/materials";
import type { ComponentNode, TComponentTypes } from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import {
  getDefaultPosition,
  getDefaultHeightByType,
  getDefaultWidthByType,
} from "@/modules/editor/utils/pageLayout";

interface EditorComponentCreationContext {
  storeComponents: TEditorComponentsStore;
  ensurePermission: (permission: any, deniedMessage?: string) => boolean;
  addOperationLog: (action: any, detail: string) => void;
  broadcastNodeChange: (actionType: string, payload: any) => void;
  setCurrentComponent: (id: string) => void;
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
 * 创建 editor 组件新增相关能力。
 */
export function createEditorComponentCreation(
  context: EditorComponentCreationContext,
) {
  const {
    addOperationLog,
    broadcastNodeChange,
    ensurePermission,
    insertNodeTree,
    setCurrentComponent,
    storeComponents,
  } = context;

  /**
   * 判断组件首次插入时是否需要显式写入默认高度，避免依赖父容器自适应导致首帧异常。
   */
  function resolveInitialHeight(type: TComponentTypes) {
    switch (type) {
      case "barChart":
      case "lineChart":
      case "pieChart":
        return `${getDefaultHeightByType(type)}px`;
      default:
        return undefined;
    }
  }

  /**
   * 获取组件可插入的 slot 列表。
   */
  const getAvailableSlots = action((type: string) => {
    const { slots } = getComponentContainerMeta(type as TComponentTypes);
    return slots.length
      ? slots
      : [{ name: "default", title: "默认区域", multiple: true }];
  });

  /**
   * 往容器内部插入新组件。
   */
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
      if (!parent) {
        return null;
      }

      const siblings = parent.childIds
        .map((childId) => storeComponents.compConfigs[childId])
        .filter(Boolean)
        .filter(
          (item) => (item.slot ?? "default") === (args.slot ?? "default"),
        );
      const defaultPosition = getDefaultPosition(siblings.length);
      const componentNode: ComponentNode = {
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
          height: resolveInitialHeight(type),
        },
        slot: args.slot ?? "default",
        children: [],
      };

      insertNodeTree(componentNode, {
        parentId: args.parentId,
        slot: componentNode.slot,
      });
      setCurrentComponent(componentNode.id);
      return componentNode.id;
    },
  );

  /**
   * 在画布或容器中新增组件。
   */
  const push = action(
    (
      type: TComponentTypes,
      position?: { left: number; top: number },
      target?: { parentId?: string | null; slot?: string | null },
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能新增组件")) {
        return;
      }

      if (target?.parentId) {
        const insertedId = insertNodeIntoContainer(type, {
          parentId: target.parentId,
          slot: target.slot,
          position,
        });
        if (!insertedId) {
          return;
        }
        broadcastNodeChange("add", storeComponents.compConfigs[insertedId]);
        addOperationLog("add_component", type);
        return;
      }

      const defaultPosition = getDefaultPosition(
        storeComponents.sortableCompConfig.length,
      );
      const componentNode: ComponentNode = {
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
          height: resolveInitialHeight(type),
        },
        children: [],
      };

      insertNodeTree(componentNode);
      setCurrentComponent(componentNode.id);
      broadcastNodeChange("add", storeComponents.compConfigs[componentNode.id]);
      addOperationLog("add_component", type);
    },
  );

  return {
    getAvailableSlots,
    insertNodeIntoContainer,
    push,
  };
}
