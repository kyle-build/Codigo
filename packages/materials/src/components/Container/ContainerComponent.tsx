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
  const hasRuntimeHeight = props.runtimeHeight !== undefined;

  return (
    <div
      className={`relative w-full overflow-hidden ${hasRuntimeHeight ? "flex h-full min-h-0 flex-col" : ""}`}
      style={{
        height: hasRuntimeHeight ? "100%" : undefined,
        minHeight: hasRuntimeHeight ? undefined : props.minHeight,
        padding: props.padding,
        borderRadius: props.borderRadius,
        border: `1px solid ${props.borderColor}`,
        backgroundColor: props.backgroundColor,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <Typography.Text strong>{props.title}</Typography.Text>
        <Typography.Text type="secondary">default</Typography.Text>
      </div>
      <div
        className={`relative rounded-xl border border-dashed border-slate-200 bg-slate-50/70 ${
          hasRuntimeHeight ? "min-h-0 flex-1" : "min-h-[160px]"
        }`}
        data-slot-name="default"
        data-container-id={props.editorNodeId}
      >
        {defaultChildren.length ? (
          defaultChildren
        ) : (
          <div
            className={`flex items-center justify-center text-sm text-slate-400 ${
              hasRuntimeHeight ? "h-full min-h-0" : "h-full min-h-[160px]"
            }`}
          >
            拖入组件到默认插槽
          </div>
        )}
      </div>
    </div>
  );
}
