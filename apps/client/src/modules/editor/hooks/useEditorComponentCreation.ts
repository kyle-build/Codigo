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
import {
  findEditorBlock,
  type EditorBlockNodeTemplate,
} from "@/modules/editor/registry/blocks";

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

  const parsePxNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized.endsWith("px")) {
        const parsed = Number(normalized.slice(0, -2));
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
    return null;
  };

  const estimateTemplateHeight = (template: EditorBlockNodeTemplate) => {
    const parsed = parsePxNumber(template.styles?.height);
    if (parsed !== null) {
      return Math.max(48, parsed);
    }
    if (
      template.type === "barChart" ||
      template.type === "lineChart" ||
      template.type === "pieChart"
    ) {
      return Math.max(120, getDefaultHeightByType(template.type));
    }
    return 180;
  };

  const materializeTemplateNode = (
    template: EditorBlockNodeTemplate,
    slotIdMap?: Record<string, string>,
  ): {
    node: ComponentNode;
    ids: string[];
  } => {
    const id = ulid();
    const resolvedSlotMap = (() => {
      if (template.type !== "viewGroup") {
        return slotIdMap;
      }
      const containers = Array.isArray((template.props as any)?.containers)
        ? ((template.props as any).containers as Array<Record<string, unknown>>)
        : [];
      if (!containers.length) {
        return slotIdMap;
      }
      const nextMap = { ...(slotIdMap ?? {}) };
      for (const item of containers) {
        const rawId = typeof item?.id === "string" ? (item.id as string) : "";
        if (rawId && !nextMap[rawId]) {
          nextMap[rawId] = ulid();
        }
      }
      return nextMap;
    })();

    const childrenResult = (template.children ?? []).map((child) =>
      materializeTemplateNode(child, resolvedSlotMap),
    );
    const children = childrenResult.map((item) => item.node);
    const ids = [id, ...childrenResult.flatMap((item) => item.ids)];
    const resolvedSlot =
      template.slot && resolvedSlotMap?.[template.slot]
        ? resolvedSlotMap[template.slot]
        : template.slot;
    const resolvedProps = (() => {
      const base = {
        ...resolveInitialProps(template.type),
        ...((template.props ?? {}) as Record<string, unknown>),
      } as Record<string, unknown>;

      if (template.type !== "viewGroup" || !resolvedSlotMap) {
        return base;
      }

      const containers = Array.isArray((base as any).containers)
        ? ((base as any).containers as Array<Record<string, unknown>>)
        : [];
      if (containers.length) {
        (base as any).containers = containers.map((item) => {
          const raw = item ?? {};
          const rawId = typeof raw.id === "string" ? (raw.id as string) : "";
          const nextId = rawId && resolvedSlotMap[rawId] ? resolvedSlotMap[rawId] : rawId;
          return { ...raw, id: nextId };
        });
      }
      const defaultActiveId =
        typeof (base as any).defaultActiveId === "string" ? ((base as any).defaultActiveId as string) : "";
      if (defaultActiveId && resolvedSlotMap[defaultActiveId]) {
        (base as any).defaultActiveId = resolvedSlotMap[defaultActiveId];
      }
      const activeId = typeof (base as any).activeId === "string" ? ((base as any).activeId as string) : "";
      if (activeId && resolvedSlotMap[activeId]) {
        (base as any).activeId = resolvedSlotMap[activeId];
      }
      return base;
    })();

    return {
      node: {
        id,
        type: template.type,
        props: resolvedProps,
        styles: template.styles,
        events: template.events as any,
        slot: resolvedSlot,
        children,
      },
      ids,
    };
  };

  const resolveInsertionStyles = (
    type: TComponentTypes,
    args: {
      position?: { left: number; top: number };
      bounds?: { width: number; height: number };
      target?: { parentId?: string | null; slot?: string | null };
    },
  ) => {
    if (args.target?.parentId) {
      const parent = storeComponents.compConfigs[args.target.parentId];
      if (!parent) {
        return {};
      }
      const siblings = parent.childIds
        .map((childId) => storeComponents.compConfigs[childId])
        .filter(Boolean)
        .filter(
          (item) =>
            (item.slot ?? "default") === (args.target?.slot ?? "default"),
        );
      const defaultPosition = getDefaultPosition(siblings.length);
      const shouldUseGrid =
        parent.type === "viewGroup" &&
        Boolean((parent.props as Record<string, unknown> | undefined)?.contentUseGrid) &&
        Boolean(args.bounds);
      return shouldUseGrid
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
          };
    }

    const defaultPosition = getDefaultPosition(
      storeComponents.sortableCompConfig.length,
    );
    const shouldUseGrid = pageStore.layoutMode === "grid" && Boolean(args.bounds);
    return shouldUseGrid
      ? (() => {
          const cols = pageStore.grid?.cols ?? 12;
          const rows = pageStore.grid?.rows ?? 12;
          const gap = pageStore.grid?.gap ?? 0;
          const width = Math.max(1, args.bounds?.width ?? pageStore.canvasWidth ?? 1);
          const height = Math.max(1, args.bounds?.height ?? pageStore.canvasHeight ?? 1);
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
        };
  };

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

  /**
   * 在画布或容器中新增区块（组件组合）。
   */
  const pushBlock = action(
    (
      blockId: string,
      position?: { left: number; top: number },
      bounds?: { width: number; height: number },
      target?: { parentId?: string | null; slot?: string | null },
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能新增区块")) {
        return;
      }

      const block = findEditorBlock(blockId);
      if (!block) {
        return;
      }

      const origin = position ?? { left: 32, top: 24 };
      let cursorTop = origin.top;
      const insertedRoots: string[] = [];
      const insertedIds: string[] = [];

      for (const template of block.nodes) {
        const resolvedPosition = { left: origin.left, top: cursorTop };
        const materialized = materializeTemplateNode(template);
        const root = materialized.node;
        const insertionStyles = resolveInsertionStyles(root.type, {
          position: resolvedPosition,
          bounds,
          target,
        });
        root.styles = { ...(insertionStyles as any), ...(root.styles ?? {}) };

        insertNodeTree(root, {
          parentId: target?.parentId,
          slot: target?.slot,
        });
        insertedRoots.push(root.id);
        insertedIds.push(...materialized.ids);

        cursorTop += estimateTemplateHeight(template) + 24;
      }

      for (const id of insertedIds) {
        const record = storeComponents.compConfigs[id];
        if (record) {
          broadcastNodeChange("add", record);
        }
      }

      const focusId = insertedRoots[0];
      if (focusId) {
        setCurrentComponent(focusId);
      }
      addOperationLog("add_block", block.name);
    },
  );

  return {
    getAvailableSlots,
    insertNodeIntoContainer,
    push,
    pushBlock,
  };
}
