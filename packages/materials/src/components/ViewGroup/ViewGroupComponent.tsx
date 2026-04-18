import React, { useMemo, type ReactNode } from "react";
import { getDefaultValueByConfig } from "..";
import type { IViewGroupComponentProps, ViewGroupContainerItem } from ".";
import { viewGroupComponentDefaultConfig } from ".";

interface ViewGroupRuntimeProps extends IViewGroupComponentProps {
  slots?: Record<string, ReactNode[]>;
  editorNodeId?: string;
  runtimePageState?: Record<string, any>;
  onAction?: (action: any) => void | Promise<void>;
  runtimeEnv?: "editor" | "preview" | "release";
}

function normalizeContainerList(
  containers: unknown,
  slots: Record<string, ReactNode[]> | undefined,
): ViewGroupContainerItem[] {
  if (Array.isArray(containers) && containers.length) {
    return containers
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const raw = item as Record<string, unknown>;
        const id = typeof raw.id === "string" ? raw.id : "";
        if (!id) {
          return null;
        }
        return {
          id,
          name: typeof raw.name === "string" && raw.name ? raw.name : id,
        } satisfies ViewGroupContainerItem;
      })
      .filter((item): item is ViewGroupContainerItem => item != null);
  }

  const slotKeys = Object.keys(slots ?? {}).filter(Boolean);
  const derivedKeys =
    slotKeys.filter((key) => key !== "default").length > 0
      ? slotKeys.filter((key) => key !== "default")
      : slotKeys;
  if (!derivedKeys.length) {
    return [{ id: "default", name: "默认视图" }];
  }
  return derivedKeys.map((key, index) => ({
    id: key,
    name: `视图${index + 1}`,
  }));
}

function resolveActiveId(
  args: {
    containers: ViewGroupContainerItem[];
    activeId?: string;
    defaultActiveId?: string;
    editorNodeId?: string;
    runtimePageState?: Record<string, any>;
  },
) {
  const { containers } = args;
  const known = new Set(containers.map((item) => item.id));

  const controlled = typeof args.activeId === "string" ? args.activeId : "";
  if (controlled && known.has(controlled)) {
    return controlled;
  }

  const runtimeValue =
    args.editorNodeId && args.runtimePageState
      ? (args.runtimePageState.__viewGroupActive ?? {})[args.editorNodeId]
      : undefined;
  if (typeof runtimeValue === "string" && runtimeValue && known.has(runtimeValue)) {
    return runtimeValue;
  }

  const fallback =
    typeof args.defaultActiveId === "string" ? args.defaultActiveId : "";
  if (fallback && known.has(fallback)) {
    return fallback;
  }

  return containers[0]?.id ?? "default";
}

export default function ViewGroupComponent(_props: ViewGroupRuntimeProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(viewGroupComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const containers = useMemo(
    () => normalizeContainerList(props.containers, props.slots),
    [props.containers, props.slots],
  );
  const resolvedActiveId = useMemo(() => {
    return resolveActiveId({
      containers,
      activeId: props.activeId,
      defaultActiveId: props.defaultActiveId,
      editorNodeId: props.editorNodeId,
      runtimePageState: props.runtimePageState,
    });
  }, [
    containers,
    props.activeId,
    props.defaultActiveId,
    props.editorNodeId,
    props.runtimePageState,
  ]);

  const activeChildren = props.slots?.[resolvedActiveId] ?? [];
  const showEditorTabs = props.runtimeEnv === "editor";
  const contentUseGrid = Boolean(props.contentUseGrid);
  const gridCols = Math.max(1, Math.floor(Number(props.contentGridCols ?? 12)));
  const gridRows = Math.max(1, Math.floor(Number(props.contentGridRows ?? 12)));
  const gridGap = Math.max(0, Math.floor(Number(props.contentGridGap ?? 0)));

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: props.minHeight,
        padding: props.padding,
        borderRadius: props.borderRadius,
        border:
          props.borderColor && props.borderColor !== "transparent"
            ? `1px solid ${props.borderColor}`
            : undefined,
        backgroundColor: props.backgroundColor,
      }}
    >
      {showEditorTabs ? (
        <div className="mb-2 flex items-center gap-1 overflow-x-auto">
          {containers.map((item) => {
            const isActive = item.id === resolvedActiveId;
            return (
              <button
                key={item.id}
                type="button"
                className={`shrink-0 rounded-sm border px-2 py-0.5 text-[11px] ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  void props.onAction?.({
                    type: "setActiveContainer",
                    viewGroupId: props.editorNodeId,
                    containerId: item.id,
                  });
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      ) : null}
      <div
        className="relative"
        data-slot-name={resolvedActiveId}
        data-container-id={props.editorNodeId}
        style={{
          minHeight: Math.max(160, Number(props.minHeight ?? 240)),
          ...(contentUseGrid
            ? {
                display: "grid",
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
                gap: gridGap,
                alignContent: "start",
              }
            : null),
        }}
      >
        {activeChildren.length ? (
          activeChildren
        ) : showEditorTabs ? (
          <div className="flex min-h-[160px] items-center justify-center text-sm text-slate-400">
            拖入组件到当前视图
          </div>
        ) : null}
      </div>
    </div>
  );
}
