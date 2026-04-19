import React, { useMemo, type ReactNode } from "react";
import { Typography } from "antd";
import { getDefaultValueByConfig } from "..";
import type { IContainerComponentProps } from ".";
import { containerComponentDefaultConfig } from ".";

interface ContainerRuntimeProps extends IContainerComponentProps {
  children?: ReactNode;
  slots?: Record<string, ReactNode[]>;
  editorNodeId?: string;
  runtimeHeight?: string | number;
}

/**
 * 渲染带默认插槽的容器物料，支持编辑器拖拽区域与运行时子节点承载。
 */
export default function ContainerComponent(_props: ContainerRuntimeProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(containerComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const defaultChildren = props.slots?.default ?? [];
  const hasRuntimeHeight =
    props.runtimeHeight !== undefined &&
    props.runtimeHeight !== null &&
    props.runtimeHeight !== "auto";
  const isPercentRuntimeHeight =
    typeof props.runtimeHeight === "string" &&
    props.runtimeHeight.trim().endsWith("%");
  const fallbackMinHeight = props.minHeight ?? 160;
  const showChrome =
    props.showChrome === undefined
      ? false
      : props.showChrome === true || props.showChrome === "true";
  const shouldClip =
    showChrome ||
    (typeof props.borderRadius === "number" && props.borderRadius > 0);

  return (
    <div
      className={`relative w-full ${shouldClip ? "overflow-hidden" : ""} ${hasRuntimeHeight ? "flex h-full min-h-0 flex-col" : ""}`}
      style={{
        height: hasRuntimeHeight ? "100%" : undefined,
        minHeight: hasRuntimeHeight
          ? isPercentRuntimeHeight
            ? fallbackMinHeight
            : undefined
          : fallbackMinHeight,
        padding: props.padding,
        borderRadius: props.borderRadius,
        border: showChrome || props.borderColor !== "transparent"
          ? `1px solid ${props.borderColor}`
          : undefined,
        backgroundColor: props.backgroundColor,
        boxShadow:
          props.backgroundColor && props.backgroundColor !== "transparent"
            ? "0 24px 60px rgba(15, 23, 42, 0.06)"
            : undefined,
      }}
    >
      {showChrome ? (
        <div className="mb-4 flex items-center justify-between">
          <Typography.Text strong>{props.title}</Typography.Text>
          <Typography.Text type="secondary">default</Typography.Text>
        </div>
      ) : null}
      <div
        className={`relative ${
          showChrome
            ? "rounded-xl border border-dashed border-slate-200 bg-slate-50/70"
            : ""
        } ${hasRuntimeHeight ? "min-h-0 flex-1" : ""}`}
        style={{
          minHeight: hasRuntimeHeight
            ? isPercentRuntimeHeight
              ? fallbackMinHeight
              : undefined
            : fallbackMinHeight,
        }}
        data-slot-name="default"
        data-container-id={props.editorNodeId}
      >
        {defaultChildren.length ? (
          defaultChildren
        ) : (
          <div
            className={`flex items-center justify-center text-sm text-slate-400 ${hasRuntimeHeight ? "h-full min-h-0" : "h-full"}`}
            style={{
              minHeight: hasRuntimeHeight
                ? isPercentRuntimeHeight
                  ? fallbackMinHeight
                  : undefined
                : fallbackMinHeight,
            }}
          >
            拖入组件到默认插槽
          </div>
        )}
      </div>
    </div>
  );
}
