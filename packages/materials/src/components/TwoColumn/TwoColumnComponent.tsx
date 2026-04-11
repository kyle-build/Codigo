import React, { useMemo, type ReactNode } from "react";
import { Typography } from "antd";
import { getDefaultValueByConfig } from "..";
import type { ITwoColumnComponentProps } from ".";
import { twoColumnComponentDefaultConfig } from ".";

interface TwoColumnRuntimeProps extends ITwoColumnComponentProps {
  slots?: Record<string, ReactNode[]>;
  editorNodeId?: string;
  runtimeHeight?: string | number;
}

/**
 * 渲染双栏布局中的单个插槽区域，并提供空态占位与拖拽标识。
 */
function SlotBox(props: {
  title: string;
  slotName: string;
  nodeId?: string;
  children?: ReactNode[];
  minHeight: number;
  fillHeight: boolean;
}) {
  const children = props.children ?? [];
  return (
    <div className="flex min-h-0 h-full flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <Typography.Text>{props.title}</Typography.Text>
        <Typography.Text type="secondary">{props.slotName}</Typography.Text>
      </div>
      <div
        className={`relative flex-1 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 ${
          props.fillHeight ? "min-h-0" : "min-h-[200px]"
        }`}
        style={{ minHeight: props.fillHeight ? undefined : props.minHeight }}
        data-slot-name={props.slotName}
        data-container-id={props.nodeId}
      >
        {children.length ? (
          children
        ) : (
          <div
            className={`flex items-center justify-center text-sm text-slate-400 ${
              props.fillHeight ? "h-full min-h-0" : "h-full min-h-[200px]"
            }`}
          >
            拖入组件到 {props.title}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 渲染左右双栏容器物料，分别暴露 left 与 right 两个插槽区域。
 */
export default function TwoColumnComponent(_props: TwoColumnRuntimeProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(twoColumnComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);
  const hasRuntimeHeight = props.runtimeHeight !== undefined;

  return (
    <div
      className={`relative w-full rounded-3xl border border-slate-200 p-5 ${
        hasRuntimeHeight ? "flex h-full min-h-0 flex-col" : ""
      }`}
      style={{
        height: hasRuntimeHeight ? "100%" : undefined,
        backgroundColor: props.backgroundColor,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <Typography.Text strong>{props.title}</Typography.Text>
        <Typography.Text type="secondary">left / right</Typography.Text>
      </div>
      <div
        className={`flex w-full items-stretch ${hasRuntimeHeight ? "min-h-0 flex-1" : ""}`}
        style={{ gap: props.gap }}
      >
        <div
          className={hasRuntimeHeight ? "flex min-h-0" : ""}
          style={{ width: props.leftWidth, minWidth: props.leftWidth }}
        >
          <SlotBox
            title="左侧区域"
            slotName="left"
            nodeId={props.editorNodeId}
            children={props.slots?.left}
            minHeight={props.minHeight}
            fillHeight={hasRuntimeHeight}
          />
        </div>
        <div className={hasRuntimeHeight ? "flex min-h-0 flex-1" : "flex-1"}>
          <SlotBox
            title="右侧区域"
            slotName="right"
            nodeId={props.editorNodeId}
            children={props.slots?.right}
            minHeight={props.minHeight}
            fillHeight={hasRuntimeHeight}
          />
        </div>
      </div>
    </div>
  );
}
