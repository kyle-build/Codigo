import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { collectSiblingRects } from "../utils/collision";
import { getPositioningRect } from "../utils/canvasMove";
import { resolveMinSizeByType } from "@/modules/editor/utils/componentSizing";

interface ResizeComponentState {
  id: string;
  handle: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
  allowPositionChange: boolean;
  minWidth: number;
  minHeight: number;
  pointerId: number | null;
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
  getComponentTypeById?: (id: string) => string | undefined | null;
  setCurrentComponent: (id: string) => void;
  updateComponentPosition: (
    id: string,
    left: number,
    top: number,
    silent?: boolean,
    bounds?: { width: number; height: number },
  ) => void;
  updateComponentSize: (
    id: string,
    width: number,
    height: number,
    isPreview?: boolean,
    bounds?: { width: number; height: number },
  ) => void;
  onResizeFinished: () => void;
}

/**
 * 管理画布内组件缩放的状态与事件。
 */
export function useCanvasResize({
  canEditStructure,
  canvasRef,
  getComponentTypeById,
  setCurrentComponent,
  updateComponentPosition,
  updateComponentSize,
  onResizeFinished,
}: UseCanvasResizeOptions) {
  const [resizingComponent, setResizingComponent] =
    useState<ResizeComponentState | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const pendingResizeRectRef = useRef<
    { left: number; top: number; width: number; height: number } | null
  >(null);

  /**
   * 启动组件缩放。
   */
  const handleResizeComponentStart = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      id: string,
      handle: ResizeComponentState["handle"],
      layout: "absolute" | "flow" | "grid",
    ) => {
      if (
        !canEditStructure ||
        (event.pointerType === "mouse" && event.button !== 0)
      ) {
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
      const minSize = resolveMinSizeByType(getComponentTypeById?.(id));
      setCurrentComponent(id);
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
      setResizingComponent({
        id,
        handle,
        allowPositionChange: layout !== "flow",
        minWidth: minSize.minWidth,
        minHeight: minSize.minHeight,
        pointerId: event.pointerId,
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
    [canEditStructure, getComponentTypeById, setCurrentComponent],
  );

  const resolveNextRect = useCallback(
    (
      event: MouseEvent,
      component: ResizeComponentState,
      positioningRect: DOMRect | null,
      siblingRects: Array<{ left: number; top: number; width: number; height: number }>,
    ) => {
      const minWidth = component.minWidth;
      const minHeight = component.minHeight;
      const dx = event.clientX - component.startX;
      const dy = event.clientY - component.startY;
      const origRight = component.origLeft + component.origWidth;
      const origBottom = component.origTop + component.origHeight;

      const includesWest = component.handle.includes("w");
      const includesEast = component.handle.includes("e");
      const includesNorth = component.handle.includes("n");
      const includesSouth = component.handle.includes("s");

      let left = component.origLeft;
      let top = component.origTop;
      let right = origRight;
      let bottom = origBottom;

      if (component.allowPositionChange) {
        if (includesWest) {
          left = component.origLeft + dx;
        }
        if (includesNorth) {
          top = component.origTop + dy;
        }
        if (includesEast) {
          right = origRight + dx;
        }
        if (includesSouth) {
          bottom = origBottom + dy;
        }
      } else {
        if (includesWest) {
          right = origRight - dx;
        }
        if (includesNorth) {
          bottom = origBottom - dy;
        }
        if (includesEast) {
          right = origRight + dx;
        }
        if (includesSouth) {
          bottom = origBottom + dy;
        }
      }

      if (right - left < minWidth) {
        if (component.allowPositionChange && includesWest && !includesEast) {
          left = right - minWidth;
        } else {
          right = left + minWidth;
        }
      }
      if (bottom - top < minHeight) {
        if (component.allowPositionChange && includesNorth && !includesSouth) {
          top = bottom - minHeight;
        } else {
          bottom = top + minHeight;
        }
      }

      if (positioningRect) {
        const boundsWidth = positioningRect.width;
        const boundsHeight = positioningRect.height;

        if (component.allowPositionChange && includesWest && !includesEast) {
          left = Math.max(0, Math.min(left, origRight - minWidth));
          right = origRight;
        } else if (includesEast) {
          right = Math.min(right, boundsWidth);
        } else {
          left = Math.max(0, Math.min(left, Math.max(0, boundsWidth - (right - left))));
          right = left + (right - left);
        }

        if (component.allowPositionChange && includesNorth && !includesSouth) {
          top = Math.max(0, Math.min(top, origBottom - minHeight));
          bottom = origBottom;
        } else if (includesSouth) {
          bottom = Math.min(bottom, boundsHeight);
        } else {
          top = Math.max(0, Math.min(top, Math.max(0, boundsHeight - (bottom - top))));
          bottom = top + (bottom - top);
        }
      }

      const initialRight = right;
      const initialBottom = bottom;
      const initialLeft = left;
      const initialTop = top;

      for (const sibling of siblingRects) {
        const siblingRight = sibling.left + sibling.width;
        const siblingBottom = sibling.top + sibling.height;
        const overlapsVertically = top < siblingBottom && bottom > sibling.top;
        const overlapsHorizontally = left < siblingRight && right > sibling.left;

        if (overlapsVertically) {
          if (includesEast && sibling.left >= left) {
            right = Math.min(right, sibling.left);
          }
          if (component.allowPositionChange && includesWest && siblingRight <= initialRight) {
            left = Math.max(left, siblingRight);
          }
        }

        if (overlapsHorizontally) {
          if (includesSouth && sibling.top >= top) {
            bottom = Math.min(bottom, sibling.top);
          }
          if (component.allowPositionChange && includesNorth && siblingBottom <= initialBottom) {
            top = Math.max(top, siblingBottom);
          }
        }
      }

      if (right - left < minWidth) {
        if (component.allowPositionChange && includesWest && !includesEast) {
          left = initialRight - minWidth;
          right = initialRight;
        } else {
          right = left + minWidth;
        }
      }
      if (bottom - top < minHeight) {
        if (component.allowPositionChange && includesNorth && !includesSouth) {
          top = initialBottom - minHeight;
          bottom = initialBottom;
        } else {
          bottom = top + minHeight;
        }
      }

      if (positioningRect) {
        const boundsWidth = positioningRect.width;
        const boundsHeight = positioningRect.height;

        if (component.allowPositionChange && includesWest && !includesEast) {
          left = Math.max(0, Math.min(left, origRight - minWidth));
          right = origRight;
        } else {
          left = Math.max(0, Math.min(left, Math.max(0, boundsWidth - (right - left))));
          right = Math.min(boundsWidth, Math.max(left + minWidth, right));
        }

        if (component.allowPositionChange && includesNorth && !includesSouth) {
          top = Math.max(0, Math.min(top, origBottom - minHeight));
          bottom = origBottom;
        } else {
          top = Math.max(0, Math.min(top, Math.max(0, boundsHeight - (bottom - top))));
          bottom = Math.min(boundsHeight, Math.max(top + minHeight, bottom));
        }
      }

      const width = right - left;
      const height = bottom - top;
      const nextLeft = component.allowPositionChange ? left : initialLeft;
      const nextTop = component.allowPositionChange ? top : initialTop;

      return {
        left: nextLeft,
        top: nextTop,
        width,
        height,
      };
    },
    [],
  );

  useEffect(() => {
    if (!resizingComponent || !canEditStructure) {
      return;
    }

    /**
     * 持续同步缩放中的尺寸预览。
     */
    const onPointerMove = (event: PointerEvent) => {
      if (
        resizingComponent.pointerId != null &&
        event.pointerId !== resizingComponent.pointerId
      ) {
        return;
      }
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
      const nextRect = resolveNextRect(event, resizingComponent, positioningRect, siblingRects);
      pendingResizeRectRef.current = nextRect;
      if (resizeFrameRef.current !== null) {
        return;
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        const pendingRect = pendingResizeRectRef.current;
        if (!pendingRect) {
          return;
        }

        if (resizingComponent.allowPositionChange) {
          updateComponentPosition(
            resizingComponent.id,
            pendingRect.left,
            pendingRect.top,
            true,
            positioningRect
              ? { width: positioningRect.width, height: positioningRect.height }
              : undefined,
          );
        }
        updateComponentSize(
          resizingComponent.id,
          pendingRect.width,
          pendingRect.height,
          true,
          positioningRect
            ? { width: positioningRect.width, height: positioningRect.height }
            : undefined,
        );
      });
    };

    /**
     * 结束缩放并提交最终尺寸。
     */
    const onPointerUp = (event: PointerEvent) => {
      if (
        resizingComponent.pointerId != null &&
        event.pointerId !== resizingComponent.pointerId
      ) {
        return;
      }
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      pendingResizeRectRef.current = null;

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
      const nextRect = resolveNextRect(event, resizingComponent, positioningRect, siblingRects);
      const boundedSize = { width: nextRect.width, height: nextRect.height };
      if (resizingComponent.allowPositionChange) {
        updateComponentPosition(
          resizingComponent.id,
          nextRect.left,
          nextRect.top,
          true,
          positioningRect
            ? { width: positioningRect.width, height: positioningRect.height }
            : undefined,
        );
      }
      updateComponentSize(
        resizingComponent.id,
        boundedSize.width,
        boundedSize.height,
        false,
        positioningRect ? { width: positioningRect.width, height: positioningRect.height } : undefined,
      );

      setResizingComponent(null);
      onResizeFinished();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      pendingResizeRectRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [
    canvasRef,
    canEditStructure,
    onResizeFinished,
    resizingComponent,
    updateComponentSize,
    updateComponentPosition,
    resolveNextRect,
  ]);

  return {
    handleResizeComponentStart,
    resizingComponentId: resizingComponent?.id ?? null,
  };
}
