import { useMemo, type ReactNode } from "react";
import { Typography } from "antd";
import { getDefaultValueByConfig } from "..";
import type { ITwoColumnComponentProps } from ".";
import { twoColumnComponentDefaultConfig } from ".";

interface TwoColumnRuntimeProps extends ITwoColumnComponentProps {
  slots?: Record<string, ReactNode[]>;
  editorNodeId?: string;
}

function SlotBox(props: {
  title: string;
  slotName: string;
  nodeId?: string;
  children?: ReactNode[];
  minHeight: number;
}) {
  const children = props.children ?? [];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <Typography.Text>{props.title}</Typography.Text>
        <Typography.Text type="secondary">{props.slotName}</Typography.Text>
      </div>
      <div
        className="relative min-h-[200px] flex-1 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70"
        style={{ minHeight: props.minHeight }}
        data-slot-name={props.slotName}
        data-container-id={props.nodeId}
      >
        {children.length ? (
          children
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-slate-400">
            拖入组件到 {props.title}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TwoColumnComponent(_props: TwoColumnRuntimeProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(twoColumnComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  return (
    <div
      className="relative w-full rounded-3xl border border-slate-200 p-5"
      style={{ backgroundColor: props.backgroundColor }}
    >
      <div className="mb-4 flex items-center justify-between">
        <Typography.Text strong>{props.title}</Typography.Text>
        <Typography.Text type="secondary">left / right</Typography.Text>
      </div>
      <div className="flex w-full items-stretch" style={{ gap: props.gap }}>
        <div style={{ width: props.leftWidth, minWidth: props.leftWidth }}>
          <SlotBox
            title="左侧区域"
            slotName="left"
            nodeId={props.editorNodeId}
            children={props.slots?.left}
            minHeight={props.minHeight}
          />
        </div>
        <div className="flex-1">
          <SlotBox
            title="右侧区域"
            slotName="right"
            nodeId={props.editorNodeId}
            children={props.slots?.right}
            minHeight={props.minHeight}
          />
        </div>
      </div>
    </div>
  );
}
