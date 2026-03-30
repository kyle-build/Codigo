import { useMemo, type ReactNode } from "react";
import { Typography } from "antd";
import { getDefaultValueByConfig } from "..";
import type { IContainerComponentProps } from ".";
import { containerComponentDefaultConfig } from ".";

interface ContainerRuntimeProps extends IContainerComponentProps {
  children?: ReactNode;
  slots?: Record<string, ReactNode[]>;
  editorNodeId?: string;
}

export default function ContainerComponent(_props: ContainerRuntimeProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(containerComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const defaultChildren = props.slots?.default ?? [];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: props.minHeight,
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
        className="relative min-h-[160px] rounded-xl border border-dashed border-slate-200 bg-slate-50/70"
        data-slot-name="default"
        data-container-id={props.editorNodeId}
      >
        {defaultChildren.length ? (
          defaultChildren
        ) : (
          <div className="flex h-full min-h-[160px] items-center justify-center text-sm text-slate-400">
            拖入组件到默认插槽
          </div>
        )}
      </div>
    </div>
  );
}
