import {
  createContainerNode,
  createTwoColumnNode,
} from "../nodes";

/**
 * 构建工作台/仪表盘布局预设。
 */
export function createDashboardLayoutPreset(_canvasWidth: number) {
  const summary = createContainerNode("概览区", {
    minHeight: 180,
    backgroundColor: "#f8fafc",
    borderColor: "#bfdbfe",
    styles: { marginBottom: 16 },
  });
  const workspace = createTwoColumnNode("工作台主体", {
    leftWidth: 320,
    minHeight: 420,
    backgroundColor: "#ffffff",
    styles: { marginBottom: 16 },
    children: [
      createContainerNode("左侧导航/筛选", {
        minHeight: 340,
        slot: "left",
        backgroundColor: "#ffffff",
        borderColor: "#d9d9d9",
      }),
      createContainerNode("右侧主内容", {
        minHeight: 340,
        slot: "right",
        backgroundColor: "#ffffff",
        borderColor: "#d9d9d9",
      }),
    ],
  });
  const footer = createContainerNode("底部补充区", {
    minHeight: 160,
    backgroundColor: "#f8fafc",
    borderColor: "#bfdbfe",
  });

  return {
    nodes: [summary, workspace, footer],
    focusId: workspace.id,
  };
}
