import type { PageCategory } from "@codigo/schema";
import type { PageLayoutPresetKey } from "@/modules/editor/registry/components";
import type { LayoutPresetNode } from "./types";
import { createDashboardLayoutPreset } from "./presets/dashboardLayout";
import { createSectionStackLayoutPreset } from "./presets/sectionStackLayout";
import { createSidebarLayoutPreset } from "./presets/sidebarLayout";

const PRESET_HORIZONTAL_GAP = 32;
const PRESET_VERTICAL_GAP = 16;
const PRESET_START_TOP = 24;

/**
 * 将布局骨架转换为绝对布局下可直接放入画布的节点位置。
 */
function applyAbsolutePresetLayout(
  nodes: LayoutPresetNode[],
  canvasWidth: number,
) {
  const resolvedWidth = Math.max(280, canvasWidth - PRESET_HORIZONTAL_GAP * 2);
  let currentTop = PRESET_START_TOP;

  return nodes.map((node) => {
    const nextNode: LayoutPresetNode = {
      ...node,
      styles: {
        ...(node.styles ?? {}),
        position: "absolute",
        left: `${PRESET_HORIZONTAL_GAP}px`,
        top: `${currentTop}px`,
        width: `${resolvedWidth}px`,
      },
    };
    const heightHint = Number.parseInt(
      String((nextNode.props as Record<string, unknown>)?.minHeight ?? 240),
      10,
    );
    currentTop +=
      (Number.isNaN(heightHint) ? 240 : heightHint) + PRESET_VERTICAL_GAP * 2;
    return nextNode;
  });
}

/**
 * 按页面分类生成布局预设骨架。
 */
export function createPageLayoutPreset(
  preset: PageLayoutPresetKey,
  pageCategory: PageCategory,
  canvasWidth: number,
) {
  const presetResult =
    preset === "sidebarLayout"
      ? createSidebarLayoutPreset(pageCategory, canvasWidth)
      : preset === "dashboardLayout"
        ? createDashboardLayoutPreset(canvasWidth)
        : createSectionStackLayoutPreset(pageCategory);

  return {
    ...presetResult,
    nodes: applyAbsolutePresetLayout(presetResult.nodes, canvasWidth),
  };
}
