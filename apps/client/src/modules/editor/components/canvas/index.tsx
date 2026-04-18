import ClassNames from "classnames";
import { observer } from "mobx-react-lite";
import type {
  CSSProperties,
  FC,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ComponentNode, ComponentNodeRecord } from "@codigo/schema";
import { groupChildrenBySlot } from "@codigo/schema";
import {
  useEditorComponentKeyPress,
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "@/modules/editor/hooks";
import { generateComponent } from "@/modules/editor/runtime";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { useCanvasDragMove } from "./hooks/useCanvasDragMove";
import { useCanvasDrop } from "./hooks/useCanvasDrop";
import { useCanvasResize } from "./hooks/useCanvasResize";
import { GridDashedOverlay } from "./GridDashedOverlay";

interface ComponentWrapperProps {
  id: string;
  parentId?: string | null;
  slot?: string | null;
  children: ReactNode;
  layout: "absolute" | "flow" | "grid";
  isDragable: boolean;
  isMoving: boolean;
  canDrag: boolean;
  onClick: (event: ReactMouseEvent) => void;
  onMouseDownCapture: (event: ReactMouseEvent) => void;
  onMouseDown: (event: ReactMouseEvent) => void;
  onResizeMouseDown: (event: ReactMouseEvent) => void;
  isCurrentComponent: boolean;
  style?: CSSProperties;
}

const ComponentWrapper: FC<ComponentWrapperProps> = ({
  id,
  parentId,
  slot,
  children,
  layout,
  isDragable,
  isMoving,
  canDrag,
  isCurrentComponent,
  onClick,
  onMouseDownCapture,
  onMouseDown,
  onResizeMouseDown,
  style,
}) => {
  const classNames = useMemo(() => {
    return ClassNames({
      "pointer-events-none absolute left-0 top-0 w-full h-full z-[999] transition-all duration-200":
        layout !== "flow",
      "pointer-events-none absolute inset-0 z-[999] rounded-[20px] transition-all duration-200":
        layout === "flow",
      "group-hover:border-[2px] group-hover:border-emerald-400 group-hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]":
        !isCurrentComponent && !isDragable,
      "border-[2px] border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]":
        isCurrentComponent,
    });
  }, [isCurrentComponent, isDragable, layout]);

  return (
    <div
      className={`${layout === "absolute" ? "absolute" : "relative"} ${layout === "flow" ? "mb-4" : ""} group component-warpper ${canDrag ? "cursor-move" : "cursor-pointer"} ${isMoving ? "pointer-events-none" : ""}`}
      onClick={onClick}
      onMouseDownCapture={onMouseDownCapture}
      onMouseDown={onMouseDown}
      style={style}
      data-id={id}
      data-parent-id={parentId ?? "root"}
      data-slot={slot ?? "root"}
    >
      <div className={classNames} />
      {isCurrentComponent && canDrag && (
        <button
          type="button"
          className="absolute -bottom-2 -right-2 z-[1001] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-[0_6px_16px_rgba(16,185,129,0.35)] cursor-se-resize"
          onMouseDown={onResizeMouseDown}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </button>
      )}
      <div>{children}</div>
    </div>
  );
};

const EditorCanvas: FC<{
  store: TEditorComponentsStore;
  onRef: any;
}> = observer(({ store, onRef }) => {
  const {
    getComponentById,
    getComponentTree,
    getAvailableSlots,
    isCurrentComponent,
    moveExistingNode,
    setCurrentComponent,
    clearCurrentComponent,
    syncLayoutMode,
    updateComponentPosition,
    updateComponentSize,
    pushBlock,
    push,
  } = useEditorComponents();
  const { can } = useEditorPermission();
  const { store: storePage } = useEditorPage();
  const canEditStructure = can("edit_structure");

  const canvasRef = useRef<HTMLDivElement>(null);
  const [pageState, setPageState] = useState<Record<string, any>>({});

  const runtime = useMemo(
    () => ({
      mode: "editor" as const,
      pageState,
      onAction: (action: any) => {
        if (action.type === "set-state" || action.type === "setState") {
          setPageState((prev) => ({ ...prev, [action.key]: action.value }));
          return;
        }

        if (action.type === "setActiveContainer") {
          if (!action.viewGroupId || !action.containerId) {
            return;
          }
          setPageState((prev) => {
            const nextMap = {
              ...((prev as any).__viewGroupActive ?? {}),
              [action.viewGroupId]: action.containerId,
            };
            return {
              ...prev,
              __viewGroupActive: nextMap,
            };
          });
        }
      },
    }),
    [pageState],
  );

  const {
    isDragging,
    movingComponentId,
    handleDragComponentStart,
  } = useCanvasDragMove({
    canEditStructure,
    canvasRef,
    getComponentById: (id) =>
      getComponentById(id) as ComponentNodeRecord | undefined | null,
    moveExistingNode,
    setCurrentComponent,
    updateComponentPosition,
    onDragFinished: () => {},
  });

  const { handleResizeComponentStart } = useCanvasResize({
    canEditStructure,
    canvasRef,
    setCurrentComponent,
    updateComponentSize,
    onResizeFinished: () => {},
  });

  const { handleDragOver, handleDragLeave, handleDrop } = useCanvasDrop({
    canEditStructure,
    canvasRef,
    currentComponentId: store.currentCompConfig,
    getComponentById: (id) =>
      getComponentById(id) as ComponentNodeRecord | undefined | null,
    getAvailableSlots,
    push,
    pushBlock,
  });

  function isDirectWrapperHit(event: ReactMouseEvent, id: string) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return false;
    }
    const closestWrapper = target.closest(".component-warpper") as HTMLElement | null;
    return closestWrapper?.dataset.id === id;
  }

  function handleComponentMouseDownCapture(event: ReactMouseEvent, conf: { id: string }) {
    if (event.button !== 0) {
      return;
    }
    if (!isDirectWrapperHit(event, conf.id)) {
      return;
    }
    if (getComponentById(conf.id)?.type === "container") {
      return;
    }
    if (isCurrentComponent(conf)) {
      return;
    }
    setCurrentComponent(conf.id);
  }

  function handleComponentClick(event: ReactMouseEvent, conf: { id: string }) {
    if (!isDirectWrapperHit(event, conf.id)) {
      return;
    }
    if (getComponentById(conf.id)?.type === "container") {
      return;
    }
    if (isCurrentComponent(conf)) {
      event.stopPropagation();
      return;
    }
    setCurrentComponent(conf.id);
    event.stopPropagation();
  }

  function handleCanvasClick(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const wrapper = target.closest(".component-warpper") as HTMLElement | null;
    if (!wrapper) {
      clearCurrentComponent();
      return;
    }
    const wrapperId = wrapper.dataset.id;
    if (!wrapperId) {
      return;
    }
    if (getComponentById(wrapperId)?.type === "container") {
      clearCurrentComponent();
    }
  }

  useEditorComponentKeyPress();

  useImperativeHandle(onRef, () => ({}));

  useEffect(() => {
    const tree = getComponentTree.get();
    if (!tree.length) {
      return;
    }

    if (storePage.layoutMode === "absolute") {
      const needsRecover = tree.every((node) => {
        const position = node.styles?.position;
        return (
          position !== "absolute" &&
          node.styles?.left === undefined &&
          node.styles?.top === undefined
        );
      });

      if (needsRecover) {
        syncLayoutMode("absolute");
      }
      return;
    }

    if (storePage.layoutMode === "grid") {
      const needsRecover = tree.every((node) => {
        return (
          node.styles?.gridColumnStart === undefined &&
          node.styles?.gridRowStart === undefined
        );
      });

      if (needsRecover) {
        syncLayoutMode("grid");
      }
    }
  }, [getComponentTree, storePage.layoutMode, syncLayoutMode]);

  return (
    <div
      ref={canvasRef}
      className="relative min-h-[700px] bg-white"
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        height: "100%",
        minHeight: `${Math.max(
          700,
          storePage.canvasHeight,
          getComponentTree.get().length * 220,
        )}px`,
        ...(storePage.layoutMode === "grid"
          ? {
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(1, storePage.grid?.cols ?? 12)}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${Math.max(1, storePage.grid?.rows ?? 12)}, minmax(0, 1fr))`,
              gap: Math.max(0, storePage.grid?.gap ?? 0),
              alignContent: "start",
            }
          : null),
      }}
    >
      {storePage.layoutMode === "grid" && storePage.showGridDashedLines && (
        <GridDashedOverlay
          containerRef={canvasRef}
          cols={Math.max(1, storePage.grid?.cols ?? 12)}
          rows={Math.max(1, storePage.grid?.rows ?? 12)}
          gap={Math.max(0, storePage.grid?.gap ?? 0)}
        />
      )}

      {getComponentTree.get().map(function renderTreeNode(node: ComponentNode) {
        const renderedChildren = (() => {
          if (node.type !== "viewGroup") {
            return node.children?.map((child: ComponentNode) => renderTreeNode(child)) ?? [];
          }

          const props = (node.props ?? {}) as Record<string, unknown>;
          const slotNodes = groupChildrenBySlot(node);
          const slotKeys = Object.keys(slotNodes).filter(Boolean);

          const containers = (() => {
            const configured = props.containers;
            if (Array.isArray(configured) && configured.length) {
              return configured
                .map((item) => {
                  if (!item || typeof item !== "object") {
                    return null;
                  }
                  const raw = item as Record<string, unknown>;
                  const id = typeof raw.id === "string" ? raw.id : "";
                  if (!id) {
                    return null;
                  }
                  return { id };
                })
                .filter((item): item is { id: string } => item != null);
            }

            const derivedKeys =
              slotKeys.filter((key) => key !== "default").length > 0
                ? slotKeys.filter((key) => key !== "default")
                : slotKeys;
            if (!derivedKeys.length) {
              return [{ id: "default" }];
            }
            return derivedKeys.map((key) => ({ id: key }));
          })();

          const known = new Set(containers.map((item) => item.id));
          const controlled = typeof props.activeId === "string" ? props.activeId : "";
          if (controlled && known.has(controlled)) {
            return (slotNodes[controlled] ?? []).map((child) => renderTreeNode(child));
          }

          const runtimeActive = (runtime.pageState.__viewGroupActive ?? {})[node.id];
          if (typeof runtimeActive === "string" && runtimeActive && known.has(runtimeActive)) {
            return (slotNodes[runtimeActive] ?? []).map((child) => renderTreeNode(child));
          }

          const fallback =
            typeof props.defaultActiveId === "string" ? props.defaultActiveId : "";
          if (fallback && known.has(fallback)) {
            return (slotNodes[fallback] ?? []).map((child) => renderTreeNode(child));
          }

          const resolvedActiveId = containers[0]?.id ?? "default";
          return (slotNodes[resolvedActiveId] ?? []).map((child) => renderTreeNode(child));
        })();
        const isAbsoluteNode =
          node.styles?.position === "absolute" ||
          node.styles?.left !== undefined ||
          node.styles?.top !== undefined;
        const record = node.id
          ? (getComponentById(node.id) as ComponentNodeRecord | undefined)
          : undefined;
        const isRootNode = !record?.parentId;
        const parentRecord = record?.parentId
          ? (getComponentById(record.parentId) as ComponentNodeRecord | undefined)
          : undefined;
        const isGridRoot = storePage.layoutMode === "grid" && isRootNode;
        const isViewGroupGridChild =
          parentRecord?.type === "viewGroup" &&
          Boolean(
            (parentRecord.props as Record<string, unknown> | undefined)?.contentUseGrid,
          );
        const layout: ComponentWrapperProps["layout"] =
          isGridRoot || isViewGroupGridChild
            ? "grid"
            : isAbsoluteNode
              ? "absolute"
              : "flow";
        return (
          <ComponentWrapper
            key={node.id}
            layout={layout}
            isDragable={isDragging}
            isMoving={movingComponentId === node.id}
            canDrag={canEditStructure}
            onMouseDownCapture={(event) =>
              handleComponentMouseDownCapture(event, node)
            }
            onMouseDown={(event) => handleDragComponentStart(event, node.id)}
            onResizeMouseDown={(event) =>
              handleResizeComponentStart(event, node.id)
            }
            onClick={(event) => handleComponentClick(event, node)}
            isCurrentComponent={isCurrentComponent(node)}
            id={node.id}
            parentId={record?.parentId ?? null}
            slot={record?.slot ?? null}
            style={{
              ...(layout === "grid"
                ? {
                    gridColumn: `${Math.max(1, Number(node.styles?.gridColumnStart ?? 1))} / span ${Math.max(1, Number(node.styles?.gridColumnSpan ?? 1))}`,
                    gridRow: `${Math.max(1, Number(node.styles?.gridRowStart ?? 1))} / span ${Math.max(1, Number(node.styles?.gridRowSpan ?? 1))}`,
                    position: "relative" as const,
                    width: "100%",
                    height: "100%",
                  }
                : layout === "absolute"
                  ? {
                      left: node.styles?.left as string | number | undefined,
                      top: node.styles?.top as string | number | undefined,
                      position: "absolute" as const,
                      width: node.styles?.width as string | number | undefined,
                      height: node.styles?.height as string | number | undefined,
                    }
                  : {
                      position: "relative" as const,
                      width: node.styles?.width as string | number | undefined,
                      height: node.styles?.height as string | number | undefined,
                    }),
            }}
          >
            <div className="relative">
              <div>
                {generateComponent(
                  node,
                  storePage.chartTheme || undefined,
                  renderedChildren,
                  runtime,
                )}
              </div>
            </div>
          </ComponentWrapper>
        );
      })}
    </div>
  );
});

export default EditorCanvas;
