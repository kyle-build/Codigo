import React, { useMemo } from "react";
import { Button } from "antd";
import { getDefaultValueByConfig } from "..";
import {
  type IButtonComponentProps,
  buttonComponentDefaultConfig,
} from "./type";

interface ButtonRuntimeAction {
  type: "set-state";
  key: string;
  value: string;
}

interface ButtonRuntimeProps extends IButtonComponentProps {
  onAction?: (action: ButtonRuntimeAction) => void;
}

/**
 * 渲染按钮物料，并根据配置执行跳转、锚点滚动或状态派发。
 */
export default function ButtonComponent(_props: ButtonRuntimeProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(buttonComponentDefaultConfig), ..._props };
  }, [_props]);

  /**
   * 统一处理按钮点击行为，按 actionType 路由到对应的交互逻辑。
   */
  function handleClick() {
    if (props.actionType === "open-url" && props.link) {
      if (props.link.startsWith("#")) {
        const element = document.getElementById(props.link.slice(1));
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.open(props.link, "_blank", "noopener,noreferrer");
      return;
    }

    if (props.actionType === "scroll-to-id" && props.targetId) {
      const element = document.getElementById(props.targetId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (props.actionType === "set-state" && props.stateKey) {
      props.onAction?.({
        type: "set-state",
        key: props.stateKey,
        value: props.stateValue,
      });
    }
  }

  return (
    <Button
      type={props.type}
      size={props.size}
      danger={props.danger}
      block={props.block}
      onClick={handleClick}
    >
      {props.text}
    </Button>
  );
}
