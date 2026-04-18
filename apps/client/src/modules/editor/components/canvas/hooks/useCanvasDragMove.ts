import type { ComponentNodeRecord } from "@codigo/schema";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPositioningRect,
  resolveMoveTarget,
  type MovingComponentState,
} from "../utils/canvasMove";
import { clampRectToBounds } from "../utils/collision";

interface UseCanvasDragMoveOptions {
  canEditStructure: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
  moveExistingNode: (payload: {
    nodeId: string;
    targetParentId: string | null;
    targetSlot: string | null;
    targetIndex: number;
  }) => void;
  setCurrentComponent: (id: string) => void;
  updateComponentPosition: (
    id: string,
    left: number,
    top: number,
    isPreview?: boolean,
    bounds?: { width: number; height: number },
  ) => void;
  onDragFinished: () => void;
}

/**
 * 管理画布内组件拖拽移动的状态与事件。
 */
export function useCanvasDragMove({
  canEditStructure,
  canvasRef,
  getComponentById,
  moveExistingNode,
  setCurrentComponent,
  updateComponentPosition,
  onDragFinished,
}: UseCanvasDragMoveOptions) {
  const [movingComponent, setMovingComponent] =
    useState<MovingComponentState | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragPositionRef = useRef<{ left: number; top: number } | null>(
    null,
  );

  /**
   * 启动组件拖拽。
   */
  const handleDragComponentStart = useCallback(
    (event: ReactMouseEvent, id: string) => {
      if (!canEditStructure || event.button !== 0) {
        return;
      }

      const component = getComponentById(id);
      if (!component) {
        return;
      }

      const element = event.currentTarget as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      const positioningRect = getPositioningRect(element, canvasRef.current);

      setCurrentComponent(id);
      setMovingComponent({
        id,
        startX: event.clientX,
        startY: event.clientY,
        origLeft: positioningRect ? rect.left - positioningRect.left : 0,
        origTop: positioningRect ? rect.top - positioningRect.top : 0,
        pointerOffsetX: event.clientX - rect.left,
        pointerOffsetY: event.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        boundsWidth:
          positioningRect?.width ??
          canvasRef.current?.getBoundingClientRect().width ??
          Number.POSITIVE_INFINITY,
        boundsHeight:
          positioningRect?.height ??
          canvasRef.current?.getBoundingClientRect().height ??
          Number.POSITIVE_INFINITY,
      });
      event.preventDefault();
      event.stopPropagation();
    },
    [canEditStructure, canvasRef, getComponentById, setCurrentComponent],
  );

  useEffect(() => {
    if (!movingComponent || !canEditStructure) {
      return;
    }

    /**
     * 持续同步拖拽中的组件坐标预览。
     */
    const onMouseMove = (event: MouseEvent) => {
      const left =
        movingComponent.origLeft + event.clientX - movingComponent.startX;
      const top =
        movingComponent.origTop + event.clientY - movingComponent.startY;
      const safeRect = clampRectToBounds(
        { left, top, width: movingComponent.width, height: movingComponent.height },
        { width: movingComponent.boundsWidth, height: movingComponent.boundsHeight },
      );
      pendingDragPositionRef.current = { left: safeRect.left, top: safeRect.top };
      if (dragFrameRef.current !== null) {
        return;
      }

      dragFrameRef.current = window.requestAnimationFrame(() => {
        dragFrameRef.current = null;
        const pendingPosition = pendingDragPositionRef.current;
        if (!pendingPosition) {
          return;
        }

        updateComponentPosition(
          movingComponent.id,
          pendingPosition.left,
          pendingPosition.top,
          true,
          { width: movingComponent.boundsWidth, height: movingComponent.boundsHeight },
        );
      });
    };

    /**
     * 结束拖拽并提交最终位置与容器归属。
     */
    const onMouseUp = (event: MouseEvent) => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      pendingDragPositionRef.current = null;

      const target = resolveMoveTarget({
        movingId: movingComponent.id,
        clientX: event.clientX,
        clientY: event.clientY,
        canvasElement: canvasRef.current,
        movingComponent,
        getComponentById,
      });

      if (target) {
        moveExistingNode({
          nodeId: movingComponent.id,
          targetParentId: target.parentId,
          targetSlot: target.slot,
          targetIndex: target.index,
        });
        const targetBoundsRect = target.parentId
          ? (document.querySelector(
              `[data-container-id="${target.parentId}"][data-slot-name="${target.slot ?? "default"}"]`,
            ) as HTMLElement | null)?.getBoundingClientRect() ?? null
          : canvasRef.current?.getBoundingClientRect() ?? null;
        const safeRect = clampRectToBounds(
          {
            left: target.left,
            top: target.top,
            width: movingComponent.width,
            height: movingComponent.height,
          },
          {
            width: targetBoundsRect?.width ?? movingComponent.boundsWidth,
            height: targetBoundsRect?.height ?? movingComponent.boundsHeight,
          },
        );
        updateComponentPosition(
          movingComponent.id,
          safeRect.left,
          safeRect.top,
          false,
          {
            width: targetBoundsRect?.width ?? movingComponent.boundsWidth,
            height: targetBoundsRect?.height ?? movingComponent.boundsHeight,
          },
        );
      } else {
        const left =
          movingComponent.origLeft + event.clientX - movingComponent.startX;
        const top =
          movingComponent.origTop + event.clientY - movingComponent.startY;
        const safeRect = clampRectToBounds(
          { left, top, width: movingComponent.width, height: movingComponent.height },
          { width: movingComponent.boundsWidth, height: movingComponent.boundsHeight },
        );
        updateComponentPosition(movingComponent.id, safeRect.left, safeRect.top, false, {
          width: movingComponent.boundsWidth,
          height: movingComponent.boundsHeight,
        });
      }

      setMovingComponent(null);
      onDragFinished();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      pendingDragPositionRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    canEditStructure,
    canvasRef,
    getComponentById,
    moveExistingNode,
    movingComponent,
    onDragFinished,
    updateComponentPosition,
  ]);

  return {
    isDragging: Boolean(movingComponent),
    movingComponentId: movingComponent?.id ?? null,
    handleDragComponentStart,
  };
}
