import { ulid } from "ulid";
import { action } from "mobx";
import { getComponentContainerMeta } from "@codigo/materials";
import type {
  ComponentNode,
  PageGridConfig,
  PageLayoutMode,
  TComponentTypes,
} from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import {
  getDefaultPosition,
  getDefaultHeightByType,
  getDefaultWidthByType,
} from "@/modules/editor/utils/pageLayout";

interface EditorComponentCreationContext {
  storeComponents: TEditorComponentsStore;
  pageStore: {
    layoutMode: PageLayoutMode;
    grid?: PageGridConfig;
    canvasWidth: number;
    canvasHeight: number;
  };
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
    pageStore,
    setCurrentComponent,
    storeComponents,
  } = context;

  const clampInt = (value: number, min: number, max: number) => {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, Math.floor(value)));
  };

  const resolveGridCellSize = (total: number, count: number, gap: number) => {
    const safeCount = Math.max(1, Math.floor(count));
    const safeGap = Math.max(0, Math.floor(gap));
    const available = total - safeGap * (safeCount - 1);
    const cell = available / safeCount;
    return { count: safeCount, gap: safeGap, cell };
  };

  const resolveGridStart = (offset: number, total: number, count: number, gap: number) => {
    const { cell } = resolveGridCellSize(total, count, gap);
    const step = cell + Math.max(0, gap);
    if (!Number.isFinite(step) || step <= 0) {
      return 1;
    }
    return clampInt(Math.floor(offset / step) + 1, 1, Math.max(1, count));
  };

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

  const resolveInitialProps = (type: TComponentTypes) => {
    if (type !== "viewGroup") {
      return {};
    }
    const firstId = ulid();
    const secondId = ulid();
    return {
      containers: [
        { id: firstId, name: "视图1" },
        { id: secondId, name: "视图2" },
      ],
      defaultActiveId: firstId,
    };
  };

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
        bounds?: { width: number; height: number };
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
      const shouldUseGrid =
        parent.type === "viewGroup" &&
        Boolean((parent.props as Record<string, unknown> | undefined)?.contentUseGrid) &&
        Boolean(args.bounds);
      const componentNode: ComponentNode = {
        id: ulid(),
        type,
        props: resolveInitialProps(type),
        styles: {
          ...(shouldUseGrid
            ? (() => {
                const cols = Number((parent.props as any)?.contentGridCols ?? 12);
                const rows = Number((parent.props as any)?.contentGridRows ?? 12);
                const gap = Number((parent.props as any)?.contentGridGap ?? 0);
                const width = Math.max(1, args.bounds?.width ?? 1);
                const height = Math.max(1, args.bounds?.height ?? 1);
                const left = Math.max(0, args.position?.left ?? 0);
                const top = Math.max(0, args.position?.top ?? 0);
                return {
                  position: "relative" as const,
                  gridColumnStart: resolveGridStart(left, width, cols, gap),
                  gridRowStart: resolveGridStart(top, height, rows, gap),
                  gridColumnSpan: 1,
                  gridRowSpan: 1,
                  left: undefined,
                  top: undefined,
                  width: "100%",
                  height: "100%",
                };
              })()
            : {
                position: "absolute" as const,
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
              }),
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
      bounds?: { width: number; height: number },
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
          bounds,
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
      const shouldUseGrid = pageStore.layoutMode === "grid" && Boolean(bounds);
      const componentNode: ComponentNode = {
        id: ulid(),
        type,
        props: resolveInitialProps(type),
        styles: {
          ...(shouldUseGrid
            ? (() => {
                const cols = pageStore.grid?.cols ?? 12;
                const rows = pageStore.grid?.rows ?? 12;
                const gap = pageStore.grid?.gap ?? 0;
                const width = Math.max(1, bounds?.width ?? pageStore.canvasWidth ?? 1);
                const height = Math.max(1, bounds?.height ?? pageStore.canvasHeight ?? 1);
                const left = Math.max(0, position?.left ?? 0);
                const top = Math.max(0, position?.top ?? 0);
                return {
                  position: "relative" as const,
                  gridColumnStart: resolveGridStart(left, width, cols, gap),
                  gridRowStart: resolveGridStart(top, height, rows, gap),
                  gridColumnSpan: 1,
                  gridRowSpan: 1,
                  left: undefined,
                  top: undefined,
                  width: "100%",
                  height: "100%",
                };
              })()
            : {
                position: "absolute" as const,
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
              }),
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
