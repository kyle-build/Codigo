import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  collectSiblingRects,
  resolveCollisionFreeResize,
} from "../utils/collision";
import { getPositioningRect } from "../utils/canvasMove";

interface ResizeComponentState {
  id: string;
  startX: number;
  startY: number;
  origLeft: number;
  origTop: number;
  origWidth: number;
  origHeight: number;
  parentId: string | null;
  slot: string | null;
}

interface UseCanvasResizeOptions {
  canEditStructure: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
  setCurrentComponent: (id: string) => void;
  updateComponentSize: (
    id: string,
    width: number,
    height: number,
    isPreview?: boolean,
  ) => void;
  onResizeFinished: () => void;
}

/**
 * 管理画布内组件缩放的状态与事件。
 */
export function useCanvasResize({
  canEditStructure,
  canvasRef,
  setCurrentComponent,
  updateComponentSize,
  onResizeFinished,
}: UseCanvasResizeOptions) {
  const [resizingComponent, setResizingComponent] =
    useState<ResizeComponentState | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const pendingResizeSizeRef = useRef<{ width: number; height: number } | null>(
    null,
  );

  /**
   * 启动组件缩放。
   */
  const handleResizeComponentStart = useCallback(
    (event: ReactMouseEvent, id: string) => {
      if (!canEditStructure || event.button !== 0) {
        return;
      }

      const wrapperElement = (event.currentTarget as HTMLElement).closest(
        ".component-warpper",
      ) as HTMLDivElement | null;
      if (!wrapperElement) {
        return;
      }

      const rect = wrapperElement.getBoundingClientRect();
      const positioningRect = getPositioningRect(wrapperElement, canvasRef.current);
      setCurrentComponent(id);
      setResizingComponent({
        id,
        startX: event.clientX,
        startY: event.clientY,
        origLeft: positioningRect ? rect.left - positioningRect.left : 0,
        origTop: positioningRect ? rect.top - positioningRect.top : 0,
        origWidth: rect.width,
        origHeight: rect.height,
        parentId:
          wrapperElement.dataset.parentId &&
          wrapperElement.dataset.parentId !== "root"
            ? wrapperElement.dataset.parentId
            : null,
        slot:
          wrapperElement.dataset.slot && wrapperElement.dataset.slot !== "root"
            ? wrapperElement.dataset.slot
            : null,
      });
      event.preventDefault();
      event.stopPropagation();
    },
    [canEditStructure, setCurrentComponent],
  );

  useEffect(() => {
    if (!resizingComponent || !canEditStructure) {
      return;
    }

    /**
     * 持续同步缩放中的尺寸预览。
     */
    const onMouseMove = (event: MouseEvent) => {
      const nextWidth =
        resizingComponent.origWidth + event.clientX - resizingComponent.startX;
      const nextHeight =
        resizingComponent.origHeight + event.clientY - resizingComponent.startY;
      const wrapperElement = document.querySelector<HTMLElement>(
        `.component-warpper[data-id="${resizingComponent.id}"]`,
      );
      const positioningRect = wrapperElement
        ? getPositioningRect(wrapperElement, canvasRef.current)
        : canvasRef.current?.getBoundingClientRect() ?? null;
      const siblingRects = positioningRect
        ? collectSiblingRects(
            resizingComponent.parentId,
            resizingComponent.slot,
            positioningRect,
            [resizingComponent.id],
          )
        : [];
      const safeSize = resolveCollisionFreeResize(
        {
          left: resizingComponent.origLeft,
          top: resizingComponent.origTop,
          width: nextWidth,
          height: nextHeight,
        },
        siblingRects,
      );
      pendingResizeSizeRef.current = safeSize;
      if (resizeFrameRef.current !== null) {
        return;
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        const pendingSize = pendingResizeSizeRef.current;
        if (!pendingSize) {
          return;
        }

        updateComponentSize(
          resizingComponent.id,
          pendingSize.width,
          pendingSize.height,
          true,
        );
      });
    };

    /**
     * 结束缩放并提交最终尺寸。
     */
    const onMouseUp = (event: MouseEvent) => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      pendingResizeSizeRef.current = null;

      const nextWidth =
        resizingComponent.origWidth + event.clientX - resizingComponent.startX;
      const nextHeight =
        resizingComponent.origHeight + event.clientY - resizingComponent.startY;
      const wrapperElement = document.querySelector<HTMLElement>(
        `.component-warpper[data-id="${resizingComponent.id}"]`,
      );
      const positioningRect = wrapperElement
        ? getPositioningRect(wrapperElement, canvasRef.current)
        : canvasRef.current?.getBoundingClientRect() ?? null;
      const siblingRects = positioningRect
        ? collectSiblingRects(
            resizingComponent.parentId,
            resizingComponent.slot,
            positioningRect,
            [resizingComponent.id],
          )
        : [];
      const safeSize = resolveCollisionFreeResize(
        {
          left: resizingComponent.origLeft,
          top: resizingComponent.origTop,
          width: nextWidth,
          height: nextHeight,
        },
        siblingRects,
      );
      updateComponentSize(
        resizingComponent.id,
        safeSize.width,
        safeSize.height,
        false,
      );

      setResizingComponent(null);
      onResizeFinished();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      pendingResizeSizeRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    canvasRef,
    canEditStructure,
    onResizeFinished,
    resizingComponent,
    updateComponentSize,
  ]);

  return {
    handleResizeComponentStart,
    resizingComponentId: resizingComponent?.id ?? null,
  };
}
