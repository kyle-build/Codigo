import { getComponentContainerMeta } from "@codigo/materials";
import type { ComponentNodeRecord, TComponentTypes } from "@codigo/schema";
import {
  collectSiblingRects,
  getEstimatedRectByType,
  resolveCollisionFreeRect,
} from "./collision";

export interface CanvasDropResult {
  type: TComponentTypes;
  position: {
    left: number;
    top: number;
  };
  containerTarget?: {
    parentId: string;
    slot: string;
  };
}

interface ResolveCanvasDropResultOptions {
  clientX: number;
  clientY: number;
  rawType: string;
  canvasElement: HTMLDivElement | null;
  currentComponentId: string | null;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
  getAvailableSlots: (type: TComponentTypes) => Array<{ name: string }>;
}

/**
 * 解析画布 drop 事件应生成的插入结果。
 */
export function resolveCanvasDropResult({
  clientX,
  clientY,
  rawType,
  canvasElement,
  currentComponentId,
  getComponentById,
  getAvailableSlots,
}: ResolveCanvasDropResultOptions): CanvasDropResult | null {
  if (!rawType) {
    return null;
  }

  const type = rawType as TComponentTypes;
  /**
   * 根据候选位置和容器上下文计算最终不重叠的插入坐标。
   */
  function resolveSafePosition(
    left: number,
    top: number,
    rect: DOMRect,
    parentId: string | null,
    slot: string | null,
  ) {
    const estimatedRect = getEstimatedRectByType(type, left, top);
    const safeRect = resolveCollisionFreeRect(
      estimatedRect,
      collectSiblingRects(parentId, slot, rect),
      {
        width: rect.width,
        height: Math.max(rect.height, estimatedRect.top + estimatedRect.height + 24),
      },
    );
    return {
      left: safeRect.left,
      top: safeRect.top,
    };
  }
  const targetElement = document.elementFromPoint(
    clientX,
    clientY,
  ) as HTMLElement | null;
  const slotZone = targetElement?.closest("[data-slot-name]") as HTMLElement | null;

  if (slotZone) {
    const slotRect = slotZone.getBoundingClientRect();
    const parentId = slotZone.dataset.containerId;
    const slot = slotZone.dataset.slotName;
    if (parentId) {
      const safePosition = resolveSafePosition(
        clientX - slotRect.left,
        clientY - slotRect.top,
        slotRect,
        parentId,
        slot ?? "default",
      );
      return {
        type,
        position: safePosition,
        containerTarget: {
          parentId,
          slot: slot ?? "default",
        },
      };
    }
  }

  const current = currentComponentId ? getComponentById(currentComponentId) : null;
  if (current) {
    const meta = getComponentContainerMeta(current.type);
    if (meta.isContainer) {
      return {
        type,
        position: {
          left: 24,
          top: 24,
        },
        containerTarget: {
          parentId: current.id,
          slot: getAvailableSlots(current.type)[0]?.name ?? "default",
        },
      };
    }
  }

  const rect = canvasElement?.getBoundingClientRect();
  const safePosition = rect
    ? resolveSafePosition(clientX - rect.left, clientY - rect.top, rect, null, null)
    : { left: 32, top: 24 };
  return {
    type,
    position: safePosition,
  };
}
