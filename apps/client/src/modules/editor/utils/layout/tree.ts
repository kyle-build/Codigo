import type { ComponentNodeRecord } from "@codigo/schema";
import { getDefaultPosition, getDefaultWidthByType } from "./defaults";

/**
 * 根据布局模式归一化组件定位信息。
 */
export function normalizeLayout(
  compConfigs: Record<string, ComponentNodeRecord>,
  ids: string[],
) {
  ids.forEach((id, index) => {
    const comp = compConfigs[id];
    if (!comp) return;
    const nextStyles = { ...(comp.styles ?? {}) };
    const hasPosition =
      nextStyles.left !== undefined && nextStyles.top !== undefined;
    const fallbackPosition = getDefaultPosition(index);

    nextStyles.position = "absolute";
    nextStyles.left = hasPosition ? nextStyles.left : fallbackPosition.left;
    nextStyles.top = hasPosition ? nextStyles.top : fallbackPosition.top;
    nextStyles.width =
      nextStyles.width === "100%" && !hasPosition
        ? getDefaultWidthByType(comp.type)
        : (nextStyles.width ?? getDefaultWidthByType(comp.type));

    comp.styles = nextStyles;
    normalizeLayout(compConfigs, comp.childIds);
  });
}

/**
 * 收集指定节点及其所有子孙节点 ID。
 */
export function gatherSubtreeIds(
  compConfigs: Record<string, ComponentNodeRecord>,
  id: string,
): string[] {
  const current = compConfigs[id];
  if (!current) return [];
  return [
    id,
    ...current.childIds.flatMap((childId) =>
      gatherSubtreeIds(compConfigs, childId),
    ),
  ];
}
