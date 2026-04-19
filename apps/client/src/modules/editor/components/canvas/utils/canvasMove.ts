import type { ComponentNodeRecord, LayoutBlock } from "@codigo/schema";
import {
  collectSiblingRects,
  parseCanvasSize,
  resolveCollisionFreeRect,
} from "./collision";
import { resolveSlotZoneFromPoint } from "./resolveSlotZone";
import { findLayoutBlockAt } from "@/modules/editor/utils/layoutBlocks";

export interface MovingComponentState {
  id: string;
  pointerId?: number | null;
  startX: number;
  startY: number;
  origLeft: number;
  origTop: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
  width: number;
  height: number;
  boundsWidth: number;
  boundsHeight: number;
}

export interface CanvasMoveTarget {
  parentId: string | null;
  slot: string | null;
  index: number;
  left: number;
  top: number;
}

interface ResolveMoveTargetOptions {
  movingId: string;
  clientX: number;
  clientY: number;
  canvasElement: HTMLDivElement | null;
  layoutBlocks?: LayoutBlock[];
  movingComponent: MovingComponentState | null;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
}

/**
 * 获取移动中组件当前渲染出来的尺寸。
 */
function getMovingElementSize(current: ComponentNodeRecord, movingId: string) {
  const movingElement = document.querySelector<HTMLElement>(
    `.component-warpper[data-id="${movingId}"]`,
  );
  const movingRect = movingElement?.getBoundingClientRect();
  return {
    width: movingRect?.width ?? parseCanvasSize(current.styles?.width, 320),
    height: movingRect?.height ?? parseCanvasSize(current.styles?.height, 160),
  };
}

/**
 * 获取用于当前容器碰撞计算的边界尺寸。
 */
function getCollisionBounds(targetRect: DOMRect, nextHeight: number) {
  return {
    width: targetRect.width,
    height: Math.max(targetRect.height, nextHeight + 24),
  };
}

/**
 * 获取组件用于定位的参考矩形。
 */
export function getPositioningRect(
  element: HTMLElement,
  fallback: HTMLDivElement | null,
) {
  const offsetParent = element.offsetParent;
  const fallbackRect = fallback?.getBoundingClientRect() ?? null;
  if (offsetParent instanceof HTMLElement) {
    const parentRect = offsetParent.getBoundingClientRect();
    if (fallbackRect && (parentRect.width <= 1 || parentRect.height <= 1)) {
      return fallbackRect;
    }
    return parentRect;
  }
  return fallbackRect;
}

/**
 * 获取指定父节点和插槽下的同级组件包装元素。
 */
function getWrapperElements(parentId: string | null, slot: string | null) {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".component-warpper"),
  ).filter((element) => {
    const nextParentId = element.dataset.parentId ?? "root";
    const nextSlot = element.dataset.slot ?? "root";
    return nextParentId === (parentId ?? "root") && nextSlot === (slot ?? "root");
  });
}

/**
 * 根据当前指针位置计算插入到同级列表中的目标序号。
 */
function resolveInsertIndex(
  parentId: string | null,
  slot: string | null,
  movingId: string,
  clientX: number,
  clientY: number,
) {
  const siblings = getWrapperElements(parentId, slot)
    .filter((element) => element.dataset.id !== movingId)
    .sort((left, right) => {
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      if (Math.abs(leftRect.top - rightRect.top) > 8) {
        return leftRect.top - rightRect.top;
      }
      return leftRect.left - rightRect.left;
    });

  for (const [index, element] of siblings.entries()) {
    const rect = element.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    if (clientY < centerY || (Math.abs(clientY - centerY) < 8 && clientX < centerX)) {
      return index;
    }
  }

  return siblings.length;
}

/**
 * 计算移动结束后的父节点、插槽与坐标目标。
 */
export function resolveMoveTarget({
  movingId,
  clientX,
  clientY,
  canvasElement,
  layoutBlocks,
  movingComponent,
  getComponentById,
}: ResolveMoveTargetOptions): CanvasMoveTarget | null {
  const slotZone = resolveSlotZoneFromPoint({
    clientX,
    clientY,
    excludeContainerId: movingId,
  });
  const current = getComponentById(movingId);
  if (!current) {
    return null;
  }

  if (slotZone?.dataset.containerId) {
    const targetParentId = slotZone.dataset.containerId;
    const targetSlot = slotZone.dataset.slotName ?? "default";
    const targetIndex = resolveInsertIndex(
      targetParentId,
      targetSlot,
      movingId,
      clientX,
      clientY,
    );
    const slotRect = slotZone.getBoundingClientRect();
    const size = getMovingElementSize(current, movingId);
    const safeRect = resolveCollisionFreeRect(
      {
        left: movingComponent
          ? clientX - slotRect.left - movingComponent.pointerOffsetX
          : clientX - slotRect.left,
        top: movingComponent
          ? clientY - slotRect.top - movingComponent.pointerOffsetY
          : clientY - slotRect.top,
        width: size.width,
        height: size.height,
      },
      collectSiblingRects(targetParentId, targetSlot, slotRect, [movingId]),
      getCollisionBounds(
        slotRect,
        (movingComponent
          ? clientY - slotRect.top - movingComponent.pointerOffsetY
          : clientY - slotRect.top) + size.height,
      ),
    );
    return {
      parentId: targetParentId,
      slot: targetSlot,
      index: targetIndex,
      left: safeRect.left,
      top: safeRect.top,
    };
  }

  const canvasRect = canvasElement?.getBoundingClientRect();
  const targetIndex = resolveInsertIndex(null, null, movingId, clientX, clientY);
  const size = getMovingElementSize(current, movingId);
  const layoutBlock =
    canvasRect && layoutBlocks?.length
      ? findLayoutBlockAt(layoutBlocks, clientX - canvasRect.left, clientY - canvasRect.top)
      : null;
  const safeRect =
    canvasRect &&
    resolveCollisionFreeRect(
      {
        left:
          (movingComponent
            ? clientX - canvasRect.left - movingComponent.pointerOffsetX
            : clientX - canvasRect.left) - (layoutBlock?.x ?? 0),
        top:
          (movingComponent
            ? clientY - canvasRect.top - movingComponent.pointerOffsetY
            : clientY - canvasRect.top) - (layoutBlock?.y ?? 0),
        width: size.width,
        height: size.height,
      },
      collectSiblingRects(null, null, canvasRect, [movingId])
        .filter((item) => {
          if (!layoutBlock) return true;
          const x1 = item.left;
          const y1 = item.top;
          const x2 = item.left + item.width;
          const y2 = item.top + item.height;
          return !(
            x2 <= layoutBlock.x ||
            x1 >= layoutBlock.x + layoutBlock.width ||
            y2 <= layoutBlock.y ||
            y1 >= layoutBlock.y + layoutBlock.height
          );
        })
        .map((item) => ({
          ...item,
          left: item.left - (layoutBlock?.x ?? 0),
          top: item.top - (layoutBlock?.y ?? 0),
        })),
      layoutBlock
        ? {
            width: layoutBlock.width,
            height: Math.max(
              layoutBlock.height,
              (movingComponent
                ? clientY - canvasRect.top - movingComponent.pointerOffsetY
                : clientY - canvasRect.top) -
                layoutBlock.y +
                size.height +
                24,
            ),
          }
        : getCollisionBounds(
            canvasRect,
            (movingComponent
              ? clientY - canvasRect.top - movingComponent.pointerOffsetY
              : clientY - canvasRect.top) + size.height,
          ),
    );
  return {
    parentId: null,
    slot: null,
    index: targetIndex,
    left: (safeRect?.left ?? 0) + (layoutBlock?.x ?? 0),
    top: (safeRect?.top ?? 0) + (layoutBlock?.y ?? 0),
  };
}
