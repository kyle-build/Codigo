import { action } from "mobx";
import { calcValueByString } from "@codigo/materials";
import type {
  ActionConfig,
  ComponentNodeRecord,
  PageGridConfig,
  PageLayoutMode,
  TComponentTypes,
} from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { getDefaultWidthByType } from "@/modules/editor/utils/pageLayout";

interface EditorComponentMutationsContext {
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
  getCurrentComponent: () => ComponentNodeRecord | null;
}

/**
 * 创建 editor 组件内容与样式更新能力。
 */
export function createEditorComponentMutations(
  context: EditorComponentMutationsContext,
) {
  const {
    addOperationLog,
    broadcastNodeChange,
    ensurePermission,
    getCurrentComponent,
    pageStore,
    storeComponents,
  } = context;

  const clampInt = (value: number, min: number, max: number) => {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, Math.floor(value)));
  };

  const resolveGridCellSize = (
    total: number,
    count: number,
    gap: number,
  ) => {
    const safeCount = Math.max(1, Math.floor(count));
    const safeGap = Math.max(0, Math.floor(gap));
    const available = total - safeGap * (safeCount - 1);
    const cell = available / safeCount;
    return { count: safeCount, gap: safeGap, cell };
  };

  const resolveGridStart = (
    offset: number,
    total: number,
    count: number,
    gap: number,
  ) => {
    const { cell } = resolveGridCellSize(total, count, gap);
    const step = cell + Math.max(0, gap);
    if (!Number.isFinite(step) || step <= 0) {
      return 1;
    }
    return clampInt(Math.floor(offset / step) + 1, 1, Math.max(1, count));
  };

  /**
   * 标准化组件事件配置。
   */
  const normalizeActionConfig = (actionConfig: ActionConfig): ActionConfig => {
    if (actionConfig.type !== "setState") {
      return actionConfig;
    }

    return {
      ...actionConfig,
      value: calcValueByString(actionConfig.value as any),
    };
  };

  /**
   * 更新当前组件的 props。
   */
  const updateCurrentComponent = action((compConfig: Record<string, unknown>) => {
    if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) {
      return;
    }

    const currentComponent = getCurrentComponent();
    if (!currentComponent) {
      return;
    }

    const nextProps = currentComponent.props as Record<string, unknown>;
    for (const [key, value] of Object.entries(compConfig)) {
      nextProps[key] = calcValueByString(value as any);
    }

    broadcastNodeChange("update", currentComponent);
    addOperationLog("update_component", currentComponent.type);
  });

  /**
   * 更新当前组件的样式。
   */
  const updateCurrentComponentStyles = action((styles: Record<string, any>) => {
    if (!ensurePermission("edit_content", "当前角色不能修改组件样式")) {
      return;
    }

    const currentComponent = getCurrentComponent();
    if (!currentComponent) {
      return;
    }

    if (!currentComponent.styles) {
      currentComponent.styles = {};
    }
    const nextStyles = currentComponent.styles as Record<string, unknown>;
    for (const [key, value] of Object.entries(styles)) {
      nextStyles[key] = calcValueByString(value);
    }

    broadcastNodeChange("update", currentComponent);
    addOperationLog("update_style", currentComponent.type);
  });

  /**
   * 更新当前组件事件配置。
   */
  const updateCurrentComponentEvents = action(
    (eventName: "onClick", actions: ActionConfig[]) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件事件")) {
        return;
      }

      const currentComponent = getCurrentComponent();
      if (!currentComponent) {
        return;
      }

      if (!currentComponent.events) {
        currentComponent.events = {};
      }

      currentComponent.events[eventName] = actions.map(normalizeActionConfig);
      broadcastNodeChange("update", currentComponent);
      addOperationLog("update_component", `${currentComponent.type}:${eventName}`);
    },
  );

  /**
   * 更新组件的绝对定位。
   */
  const updateComponentPosition = action(
    (
      id: string,
      left: number,
      top: number,
      silent = false,
      bounds?: { width: number; height: number },
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能拖拽组件")) {
        return;
      }

      const currentComponent = storeComponents.compConfigs[id];
      if (!currentComponent) {
        return;
      }

      if (!currentComponent.styles) {
        currentComponent.styles = {};
      }

      const isRootNode = !currentComponent.parentId;
      const parent = currentComponent.parentId
        ? storeComponents.compConfigs[currentComponent.parentId]
        : null;
      const isViewGroupGrid =
        parent?.type === "viewGroup" &&
        Boolean((parent.props as Record<string, unknown> | undefined)?.contentUseGrid);
      const isGridRoot = pageStore.layoutMode === "grid" && isRootNode;
      const isGridNode = isGridRoot || isViewGroupGrid;

      if (isGridNode) {
        const cols = isGridRoot
          ? (pageStore.grid?.cols ?? 12)
          : Number((parent?.props as any)?.contentGridCols ?? 12);
        const rows = isGridRoot
          ? (pageStore.grid?.rows ?? 12)
          : Number((parent?.props as any)?.contentGridRows ?? 12);
        const gap = isGridRoot
          ? (pageStore.grid?.gap ?? 0)
          : Number((parent?.props as any)?.contentGridGap ?? 0);
        const totalWidth = isGridRoot
          ? pageStore.canvasWidth
          : (bounds?.width ?? pageStore.canvasWidth);
        const totalHeight = isGridRoot
          ? pageStore.canvasHeight
          : (bounds?.height ?? pageStore.canvasHeight);

        const nextColumnStart = resolveGridStart(
          Math.max(0, left),
          totalWidth,
          cols,
          gap,
        );
        const nextRowStart = resolveGridStart(
          Math.max(0, top),
          totalHeight,
          rows,
          gap,
        );

        currentComponent.styles.position = "relative";
        currentComponent.styles.gridColumnStart = nextColumnStart;
        currentComponent.styles.gridRowStart = nextRowStart;
        currentComponent.styles.gridColumnSpan =
          currentComponent.styles.gridColumnSpan ?? 1;
        currentComponent.styles.gridRowSpan =
          currentComponent.styles.gridRowSpan ?? 1;
        currentComponent.styles.left = undefined;
        currentComponent.styles.top = undefined;
        currentComponent.styles.width = "100%";
        currentComponent.styles.height = "100%";
      } else {
        currentComponent.styles.position = "absolute";
        currentComponent.styles.left = `${Math.max(0, Math.round(left))}px`;
        currentComponent.styles.top = `${Math.max(0, Math.round(top))}px`;
        currentComponent.styles.width =
          currentComponent.styles.width ??
          getDefaultWidthByType(currentComponent.type as TComponentTypes);
      }

      if (!silent) {
        broadcastNodeChange("update", currentComponent);
        addOperationLog("move_component", currentComponent.type);
      }
    },
  );

  /**
   * 更新组件尺寸。
   */
  const updateComponentSize = action(
    (
      id: string,
      width: number,
      height: number,
      silent = false,
      bounds?: { width: number; height: number },
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能调整组件尺寸")) {
        return;
      }

      const currentComponent = storeComponents.compConfigs[id];
      if (!currentComponent) {
        return;
      }

      if (!currentComponent.styles) {
        currentComponent.styles = {};
      }

      const nextWidth = Math.max(80, Math.round(width));
      const nextHeight = Math.max(40, Math.round(height));

      const isRootNode = !currentComponent.parentId;
      const parent = currentComponent.parentId
        ? storeComponents.compConfigs[currentComponent.parentId]
        : null;
      const isViewGroupGrid =
        parent?.type === "viewGroup" &&
        Boolean((parent.props as Record<string, unknown> | undefined)?.contentUseGrid);
      const isGridRoot = pageStore.layoutMode === "grid" && isRootNode;
      const isGridNode = isGridRoot || isViewGroupGrid;

      if (isGridNode) {
        const cols = isGridRoot
          ? (pageStore.grid?.cols ?? 12)
          : Number((parent?.props as any)?.contentGridCols ?? 12);
        const rows = isGridRoot
          ? (pageStore.grid?.rows ?? 12)
          : Number((parent?.props as any)?.contentGridRows ?? 12);
        const gap = isGridRoot
          ? (pageStore.grid?.gap ?? 0)
          : Number((parent?.props as any)?.contentGridGap ?? 0);
        const totalWidth = isGridRoot
          ? pageStore.canvasWidth
          : (bounds?.width ?? pageStore.canvasWidth);
        const totalHeight = isGridRoot
          ? pageStore.canvasHeight
          : (bounds?.height ?? pageStore.canvasHeight);
        const { cell: cellWidth } = resolveGridCellSize(
          totalWidth,
          cols,
          gap,
        );
        const { cell: cellHeight } = resolveGridCellSize(
          totalHeight,
          rows,
          gap,
        );
        const safeCellWidth = Number.isFinite(cellWidth) && cellWidth > 0 ? cellWidth : 1;
        const safeCellHeight = Number.isFinite(cellHeight) && cellHeight > 0 ? cellHeight : 1;

        const columnStart = clampInt(
          Number(currentComponent.styles.gridColumnStart ?? 1),
          1,
          cols,
        );
        const rowStart = clampInt(
          Number(currentComponent.styles.gridRowStart ?? 1),
          1,
          rows,
        );
        const columnSpan = clampInt(
          Math.round(nextWidth / safeCellWidth),
          1,
          cols - columnStart + 1,
        );
        const rowSpan = clampInt(
          Math.round(nextHeight / safeCellHeight),
          1,
          rows - rowStart + 1,
        );

        currentComponent.styles.position = "relative";
        currentComponent.styles.gridColumnStart = columnStart;
        currentComponent.styles.gridRowStart = rowStart;
        currentComponent.styles.gridColumnSpan = columnSpan;
        currentComponent.styles.gridRowSpan = rowSpan;
        currentComponent.styles.left = undefined;
        currentComponent.styles.top = undefined;
        currentComponent.styles.width = "100%";
        currentComponent.styles.height = "100%";
      } else {
        currentComponent.styles.width = `${nextWidth}px`;
        currentComponent.styles.height = `${nextHeight}px`;
      }

      if (
        currentComponent.props &&
        typeof currentComponent.props === "object" &&
        !Array.isArray(currentComponent.props)
      ) {
        const nextProps = currentComponent.props as Record<string, unknown>;

        if ("height" in nextProps) {
          nextProps.height = nextHeight;
        }

        if ("minHeight" in nextProps) {
          nextProps.minHeight = nextHeight;
        }
      }

      if (!silent) {
        broadcastNodeChange("update", currentComponent);
        addOperationLog("resize_component", currentComponent.type);
      }
    },
  );

  /**
   * 更新数组类型的组件配置项。
   */
  const updateCurrentCompConfigWithArray = action(
    (args: { key: string; index: number; field: string; value: string }) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) {
        return;
      }

      const currentComponent = getCurrentComponent();
      if (!currentComponent) {
        return;
      }

      const nextProps = currentComponent.props as Record<string, unknown>;
      if (!Array.isArray(nextProps[args.key])) {
        nextProps[args.key] = [];
      }
      const targetArray = nextProps[args.key] as Array<Record<string, unknown>>;
      targetArray[args.index][args.field] = calcValueByString(args.value);

      broadcastNodeChange("update", currentComponent);
      addOperationLog("update_component", currentComponent.type);
    },
  );

  /**
   * 移除数组类型的组件配置项。
   */
  const removeComponentByIdWithArray = action(
    (args: { key: string; index: number }) => {
      if (!ensurePermission("edit_content", "当前角色不能修改组件内容")) {
        return;
      }

      const currentComponent = getCurrentComponent();
      if (!currentComponent) {
        return;
      }

      const nextProps = currentComponent.props as Record<string, unknown>;
      if (!Array.isArray(nextProps[args.key])) {
        return;
      }

      const targetArray = nextProps[args.key] as Array<Record<string, unknown>>;
      targetArray.splice(args.index, 1);
      broadcastNodeChange("update", currentComponent);
      addOperationLog("remove_component", currentComponent.type);
    },
  );

  return {
    removeComponentByIdWithArray,
    updateComponentPosition,
    updateComponentSize,
    updateCurrentCompConfigWithArray,
    updateCurrentComponent,
    updateCurrentComponentEvents,
    updateCurrentComponentStyles,
  };
}
