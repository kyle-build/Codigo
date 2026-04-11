import type { TComponentTypes } from "@codigo/schema";
import {
  getDefaultHeightByType,
  getDefaultWidthByType,
} from "@/modules/editor/utils/pageLayout";

export interface CanvasCollisionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const COLLISION_STEP = 16;
const COLLISION_RING_LIMIT = 48;

/**
 * 解析字符串尺寸并回退到指定默认值。
 */
export function parseCanvasSize(value: string | number | undefined, fallback: number) {
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * 获取新插入组件的默认碰撞包围盒。
 */
export function getEstimatedRectByType(
  type: TComponentTypes,
  left: number,
  top: number,
): CanvasCollisionRect {
  return {
    left,
    top,
    width: parseCanvasSize(getDefaultWidthByType(type), 320),
    height: getDefaultHeightByType(type),
  };
}

/**
 * 判断两个矩形是否发生相交。
 */
export function isRectOverlapping(
  left: CanvasCollisionRect,
  right: CanvasCollisionRect,
) {
  return !(
    left.left + left.width <= right.left ||
    right.left + right.width <= left.left ||
    left.top + left.height <= right.top ||
    right.top + right.height <= left.top
  );
}

/**
 * 收集指定父级与插槽下的兄弟组件矩形。
 */
export function collectSiblingRects(
  parentId: string | null,
  slot: string | null,
  contextRect: DOMRect,
  excludedIds: string[] = [],
) {
  return Array.from(document.querySelectorAll<HTMLElement>(".component-warpper"))
    .filter((element) => {
      const nextParentId = element.dataset.parentId ?? "root";
      const nextSlot = element.dataset.slot ?? "root";
      return (
        nextParentId === (parentId ?? "root") &&
        nextSlot === (slot ?? "root") &&
        !excludedIds.includes(element.dataset.id ?? "")
      );
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - contextRect.left,
        top: rect.top - contextRect.top,
        width: rect.width,
        height: rect.height,
      } satisfies CanvasCollisionRect;
    });
}

/**
 * 将矩形限制在当前容器范围内。
 */
export function clampRectToBounds(
  rect: CanvasCollisionRect,
  bounds: { width: number; height: number },
) {
  return {
    ...rect,
    left: Math.max(0, Math.min(rect.left, Math.max(0, bounds.width - rect.width))),
    top: Math.max(0, Math.min(rect.top, Math.max(0, bounds.height - rect.height))),
  };
}

/**
 * 搜索与同层兄弟不重叠的最近可用位置。
 */
export function resolveCollisionFreeRect(
  rect: CanvasCollisionRect,
  siblingRects: CanvasCollisionRect[],
  bounds: { width: number; height: number },
) {
  const baseRect = clampRectToBounds(rect, bounds);
  if (!siblingRects.some((item) => isRectOverlapping(baseRect, item))) {
    return baseRect;
  }

  for (let ring = 1; ring <= COLLISION_RING_LIMIT; ring += 1) {
    for (let dy = -ring; dy <= ring; dy += 1) {
      for (let dx = -ring; dx <= ring; dx += 1) {
        if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) {
          continue;
        }
        const nextRect = clampRectToBounds(
          {
            ...rect,
            left: baseRect.left + dx * COLLISION_STEP,
            top: baseRect.top + dy * COLLISION_STEP,
          },
          bounds,
        );
        if (!siblingRects.some((item) => isRectOverlapping(nextRect, item))) {
          return nextRect;
        }
      }
    }
  }

  return baseRect;
}

/**
 * 计算固定左上角时可安全扩展到的最大尺寸。
 */
export function resolveCollisionFreeResize(
  rect: CanvasCollisionRect,
  siblingRects: CanvasCollisionRect[],
  minSize = { width: 80, height: 40 },
) {
  let nextWidth = rect.width;
  let nextHeight = rect.height;

  for (const sibling of siblingRects) {
    const overlapsVertically =
      rect.top < sibling.top + sibling.height &&
      rect.top + nextHeight > sibling.top;
    const overlapsHorizontally =
      rect.left < sibling.left + sibling.width &&
      rect.left + nextWidth > sibling.left;

    if (overlapsVertically && sibling.left >= rect.left) {
      nextWidth = Math.min(nextWidth, sibling.left - rect.left);
    }
    if (overlapsHorizontally && sibling.top >= rect.top) {
      nextHeight = Math.min(nextHeight, sibling.top - rect.top);
    }
  }

  return {
    width: Math.max(minSize.width, nextWidth),
    height: Math.max(minSize.height, nextHeight),
  };
}
