import type { ComponentNodeRecord, TComponentTypes } from "@codigo/schema";
import type { DragEvent, RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import { resolveCanvasDropResult } from "../utils/canvasDrop";
import { resolveSlotZoneFromPoint } from "../utils/resolveSlotZone";

interface UseCanvasDropOptions {
  canEditStructure: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
  currentComponentId: string | null;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
  getAvailableSlots: (type: TComponentTypes) => Array<{ name: string }>;
  push: (
    type: TComponentTypes,
    position: { left: number; top: number },
    bounds?: { width: number; height: number },
    target?: { parentId: string; slot: string },
  ) => void;
  pushBlock: (
    blockId: string,
    position: { left: number; top: number },
    bounds?: { width: number; height: number },
    target?: { parentId: string; slot: string },
  ) => void;
}

/**
 * 管理画布内外部物料拖入的 drop 事件。
 */
export function useCanvasDrop({
  canEditStructure,
  canvasRef,
  currentComponentId,
  getComponentById,
  getAvailableSlots,
  push,
  pushBlock,
}: UseCanvasDropOptions) {
  const lastSlotZoneRef = useRef<HTMLElement | null>(null);

  const clearDropHover = useCallback(() => {
    if (lastSlotZoneRef.current) {
      lastSlotZoneRef.current.classList.remove("editor-drop-slot-hover");
      lastSlotZoneRef.current = null;
    }
  }, []);

  useEffect(() => {
    const clear = () => clearDropHover();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearDropHover();
      }
    };

    if (!canEditStructure) {
      clearDropHover();
      return;
    }

    document.addEventListener("dragend", clear, true);
    document.addEventListener("drop", clear, true);
    window.addEventListener("blur", clear);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", clear);

    return () => {
      document.removeEventListener("dragend", clear, true);
      document.removeEventListener("drop", clear, true);
      window.removeEventListener("blur", clear);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [canEditStructure, clearDropHover]);

  /**
   * 允许浏览器持续派发 drop 事件。
   */
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";

    if (!canEditStructure) {
      clearDropHover();
      return;
    }

    const targetElement = document.elementFromPoint(
      event.clientX,
      event.clientY,
    ) as HTMLElement | null;
    const slotZone =
      resolveSlotZoneFromPoint({ clientX: event.clientX, clientY: event.clientY }) ??
      (targetElement?.closest("[data-slot-name]") as HTMLElement | null);

    if (slotZone === lastSlotZoneRef.current) {
      return;
    }

    clearDropHover();
    if (slotZone) {
      slotZone.classList.add("editor-drop-slot-hover");
      lastSlotZoneRef.current = slotZone;
    }
  }, [canEditStructure, clearDropHover]);

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const related = event.relatedTarget as Node | null;
      if (related && event.currentTarget.contains(related)) {
        return;
      }
      clearDropHover();
    },
    [clearDropHover],
  );

  /**
   * 根据当前落点将物料插入画布或容器插槽。
   */
  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      clearDropHover();
      if (!canEditStructure) {
        return;
      }

      const blockId = event.dataTransfer.getData("blockId");
      if (blockId) {
        const anchorType = event.dataTransfer.getData("blockAnchorType") || "card";
        const placement = resolveCanvasDropResult({
          clientX: event.clientX,
          clientY: event.clientY,
          rawType: anchorType,
          canvasElement: canvasRef.current,
          currentComponentId,
          getComponentById,
          getAvailableSlots,
        });
        if (!placement) {
          return;
        }
        pushBlock(blockId, placement.position, placement.bounds, placement.containerTarget);
        return;
      }

      const result = resolveCanvasDropResult({
        clientX: event.clientX,
        clientY: event.clientY,
        rawType: event.dataTransfer.getData("componentType"),
        canvasElement: canvasRef.current,
        currentComponentId,
        getComponentById,
        getAvailableSlots,
      });

      if (!result) {
        return;
      }

      push(result.type, result.position, result.bounds, result.containerTarget);
    },
    [
      canEditStructure,
      canvasRef,
      clearDropHover,
      currentComponentId,
      getAvailableSlots,
      getComponentById,
      push,
      pushBlock,
    ],
  );

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
