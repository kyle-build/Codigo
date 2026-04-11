import type { PageCategory } from "@codigo/schema";
import {
  createContainerNode,
  createSidebarPanelNode,
  createStateButtonNode,
  createTwoColumnNode,
} from "../nodes";

/**
 * 构建侧栏切换布局预设。
 */
export function createSidebarLayoutPreset(
  _pageCategory: PageCategory,
  canvasWidth: number,
) {
  const stateKey = "activeSidebarPanel";
  const safeMainWidth = Math.max(280, canvasWidth - 64);
  const leftWidth = Math.min(280, Math.max(120, safeMainWidth - 120));
  const header = createContainerNode("页面头部", {
    minHeight: 160,
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    styles: { marginBottom: 16 },
  });
  const main = createTwoColumnNode("主工作区", {
    leftWidth,
    minHeight: 420,
    children: [
      createContainerNode("左侧导航", {
        minHeight: 360,
        slot: "left",
        backgroundColor: "#f8fafc",
        borderColor: "#cbd5e1",
        padding: 16,
        children: [
          createStateButtonNode("概览", stateKey, "overview", {
            slot: "default",
            styles: {
              left: "0px",
              top: "0px",
            },
          }),
          createStateButtonNode("详细内容", stateKey, "details", {
            slot: "default",
            styles: {
              left: "0px",
              top: "60px",
            },
          }),
          createStateButtonNode("补充信息", stateKey, "extra", {
            slot: "default",
            styles: {
              left: "0px",
              top: "120px",
            },
          }),
        ],
      }),
      createSidebarPanelNode("概览内容区", stateKey, "overview", {
        left: "0px",
        top: "0px",
      }),
      createSidebarPanelNode("详细内容区", stateKey, "details", {
        left: "0px",
        top: "0px",
      }),
      createSidebarPanelNode("补充信息区", stateKey, "extra", {
        left: "0px",
        top: "0px",
      }),
    ],
  });
  const footer = createContainerNode("补充操作区", {
    minHeight: 140,
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
  });

  return {
    nodes: [header, main, footer],
    focusId: main.id,
  };
}
