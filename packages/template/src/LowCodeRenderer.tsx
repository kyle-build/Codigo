import type { CSSProperties } from "react";
import { Empty } from "antd";
import { getComponentByType } from "@codigo/materials";
import {
  groupChildrenBySlot,
  type SyncSchemaItem,
  type TComponentTypes,
} from "@codigo/schema";

interface LowCodeRendererProps {
  component: SyncSchemaItem;
}

export function LowCodeRenderer({ component }: LowCodeRendererProps) {
  const Component = getComponentByType(component.type as TComponentTypes);
  const wrapperStyle = (component.styles ?? {}) as CSSProperties;
  const renderedChildren =
    component.children?.map((child) => (
      <LowCodeRenderer
        key={child.id ?? `${child.type}-${child.slot ?? "default"}`}
        component={child}
      />
    )) ?? [];
  const groupedSlots = groupChildrenBySlot(component);
  const slots = Object.fromEntries(
    Object.entries(groupedSlots).map(([slotName, nodes]) => [
      slotName,
      nodes.map((child) =>
        renderedChildren.find((item) => String(item.key) === (child.id ?? "")),
      ),
    ]),
  );

  if (!Component) {
    return (
      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`未注册组件：${component.type}`}
        />
      </div>
    );
  }

  return (
    <div style={wrapperStyle} className="relative">
      <Component
        {...component.props}
        slots={slots}
        editorNodeId={component.id}
      />
    </div>
  );
}
