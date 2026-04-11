import ClassNames from "classnames";
import { observer } from "mobx-react-lite";
import type {
  CSSProperties,
  FC,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ComponentNode, ComponentNodeRecord } from "@codigo/schema";
import {
  useEditorComponentKeyPress,
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "@/modules/editor/hooks";
import { generateComponent } from "@/modules/editor/runtime";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { CanvasEmptyState } from "./CanvasEmptyState";
import { CanvasToolbar } from "./CanvasToolbar";
import { useCanvasDragMove } from "./hooks/useCanvasDragMove";
import { useCanvasDrop } from "./hooks/useCanvasDrop";
import { useCanvasResize } from "./hooks/useCanvasResize";

interface ComponentWrapperProps {
  id: string;
  parentId?: string | null;
  slot?: string | null;
  children: ReactNode;
  isFlowLayout: boolean;
  isDragable: boolean;
  isMoving: boolean;
  canDrag: boolean;
  onClick: () => void;
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
  isFlowLayout,
  isDragable,
  isMoving,
  canDrag,
  isCurrentComponent,
  onClick,
  onMouseDown,
  onResizeMouseDown,
  style,
}) => {
  const classNames = useMemo(() => {
    return ClassNames({
      "absolute left-0 top-0 w-full h-full z-[999] transition-all duration-200":
        !isFlowLayout,
      "absolute inset-0 z-[999] rounded-[20px] transition-all duration-200":
        isFlowLayout,
      "hover:border-[2px] hover:border-emerald-400 hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]":
        !isCurrentComponent && !isDragable,
      "border-[2px] border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]":
        isCurrentComponent,
    });
  }, [isCurrentComponent, isDragable, isFlowLayout]);

  return (
    <div
      className={`${isFlowLayout ? "relative mb-4" : "absolute"} component-warpper ${canDrag ? "cursor-move" : "cursor-pointer"} ${isMoving ? "pointer-events-none" : ""}`}
      onClick={onClick}
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
    syncLayoutMode,
    updateComponentPosition,
    updateComponentSize,
    push,
  } = useEditorComponents();
  const { can } = useEditorPermission();
  const { store: storePage } = useEditorPage();
  const canEditStructure = can("edit_structure");

  const [showToolbar, setShowToolbar] = useState(true);
  const toolbarRef = useRef<{ setRefresh: (value: boolean) => void } | null>(
    null,
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  /**
   * 在拖拽或缩放结束后刷新工具条位置。
   */
  const handleCanvasInteractionFinished = useCallback(() => {
    toolbarRef.current?.setRefresh(true);
  }, []);

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
    onDragFinished: handleCanvasInteractionFinished,
  });

  const { handleResizeComponentStart, resizingComponentId } = useCanvasResize({
    canEditStructure,
    canvasRef,
    setCurrentComponent,
    updateComponentSize,
    onResizeFinished: handleCanvasInteractionFinished,
  });

  const { handleDragOver, handleDrop } = useCanvasDrop({
    canEditStructure,
    canvasRef,
    currentComponentId: store.currentCompConfig,
    getComponentById: (id) =>
      getComponentById(id) as ComponentNodeRecord | undefined | null,
    getAvailableSlots,
    push,
  });

  function handleComponentClick(conf: { id: string }) {
    if (isCurrentComponent(conf)) return;
    setCurrentComponent(conf.id);
  }

  useEditorComponentKeyPress();

  useImperativeHandle(onRef, () => ({
    setShowToolbar,
  }));

  useEffect(() => {
    if (storePage.layoutMode !== "absolute") {
      return;
    }

    const tree = getComponentTree.get();
    if (!tree.length) {
      return;
    }

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
  }, [getComponentTree, storePage.layoutMode, syncLayoutMode]);

  return (
    <div
      ref={canvasRef}
      className="relative min-h-[700px] bg-white"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        minHeight: `${Math.max(
          700,
          storePage.canvasHeight,
          store.sortableCompConfig.length * 220,
        )}px`,
      }}
    >
      <CanvasToolbar
        onRef={toolbarRef}
        hidden={!showToolbar || isDragging || Boolean(resizingComponentId)}
      />
      {!store.sortableCompConfig.length && (
        <CanvasEmptyState
          canEditStructure={canEditStructure}
          onQuickInsert={(type) => push(type)}
        />
      )}
      {getComponentTree.get().map(function renderTreeNode(node: ComponentNode) {
        const renderedChildren =
          node.children?.map((child: ComponentNode) => renderTreeNode(child)) ??
          [];
        return (
          <ComponentWrapper
            key={node.id}
            isFlowLayout={false}
            isDragable={isDragging}
            isMoving={movingComponentId === node.id}
            canDrag={canEditStructure}
            onMouseDown={(event) => handleDragComponentStart(event, node.id)}
            onResizeMouseDown={(event) =>
              handleResizeComponentStart(event, node.id)
            }
            onClick={() => handleComponentClick(node)}
            isCurrentComponent={isCurrentComponent(node)}
            id={node.id}
            parentId={
              node.id
                ? ((
                    getComponentById(node.id) as ComponentNodeRecord | undefined
                  )?.parentId ?? null)
                : null
            }
            slot={
              (getComponentById(node.id) as ComponentNodeRecord | undefined)
                ?.slot ?? null
            }
            style={{
              left: node.styles?.left as string | number | undefined,
              top: node.styles?.top as string | number | undefined,
              position: "absolute",
              width: node.styles?.width as string | number | undefined,
            }}
          >
            <div className="relative">
              <div>
                {generateComponent(
                  node,
                  storePage.chartTheme || undefined,
                  renderedChildren,
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
