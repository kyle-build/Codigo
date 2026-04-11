import { createContainerNode } from "./containerNode";

/**
 * 创建单页面侧栏切换布局的右侧内容容器。
 */
export function createSidebarPanelNode(
  title: string,
  stateKey: string,
  stateValue: string,
  styles?: {
    left?: string;
    top?: string;
  },
) {
  return createContainerNode(title, {
    minHeight: 320,
    slot: "right",
    backgroundColor: "#ffffff",
    borderColor: "#d9d9d9",
    visibleStateKey: stateKey,
    visibleStateValue: stateValue,
    styles: {
      marginBottom: 16,
      ...(styles ?? {}),
    },
  });
}
