import React, { useMemo } from "react";
import { Button } from "antd";
import type { RuntimeStateValue } from "@codigo/schema";
import { getDefaultValueByConfig } from "..";
import {
  type IButtonComponentProps,
  buttonComponentDefaultConfig,
} from "./type";

/**
 * 描述按钮物料的运行时事件配置。
 */
interface ButtonRuntimeAction {
  type: "set-state";
  key: string;
  value: string;
}

/**
 * 描述按钮物料的运行时属性。
 */
interface ButtonRuntimeProps extends IButtonComponentProps {
  onAction?: (action: ButtonRuntimeAction) => void;
  runtimePageState?: Record<string, RuntimeStateValue>;
  runtimeWidth?: string | number;
  runtimeHeight?: string | number;
}

/**
 * 计算按钮在运行时应该呈现的视觉状态。
 */
function getButtonVisualState(props: ButtonRuntimeProps) {
  const stateMatched =
    props.actionType === "set-state" &&
    Boolean(props.stateKey) &&
    props.runtimePageState?.[props.stateKey] === props.stateValue;
  const isActive = props.active || stateMatched;

  return {
    danger: isActive ? false : props.danger,
    type: isActive ? "primary" : props.type,
  };
}

/**
 * 渲染按钮物料，并根据配置执行跳转、锚点滚动或状态派发。
 */
export default function ButtonComponent(_props: ButtonRuntimeProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(buttonComponentDefaultConfig), ..._props };
  }, [_props]);
  const visualState = useMemo(() => getButtonVisualState(props), [props]);
  const runtimeStyle = useMemo(() => {
    const next: React.CSSProperties = {};
    if (props.runtimeWidth !== undefined) {
      next.width = "100%";
    }
    if (props.runtimeHeight !== undefined && props.runtimeHeight !== "auto") {
      next.height = "100%";
    }
    return next;
  }, [props.runtimeHeight, props.runtimeWidth]);

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
      type={visualState.type}
      size={props.size}
      danger={visualState.danger}
      block={props.block}
      onClick={handleClick}
      style={{
        borderRadius: 16,
        boxShadow:
          visualState.type === "primary"
            ? "0 16px 32px rgba(111, 82, 237, 0.24)"
            : undefined,
        fontWeight: 600,
        ...runtimeStyle,
      }}
    >
      {props.text}
    </Button>
  );
}
