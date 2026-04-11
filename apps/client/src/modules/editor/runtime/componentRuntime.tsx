import { toJS } from "mobx";
import type { ReactNode } from "react";
import { getComponentByType } from "@codigo/materials";
import {
  groupChildrenBySlot,
  type ActionConfig,
  type ComponentNode,
  type RuntimeStateValue,
} from "@codigo/schema";

interface LegacyRuntimeAction {
  type: "set-state";
  key: string;
  value: RuntimeStateValue;
}

export type RuntimeAction = ActionConfig | LegacyRuntimeAction;

interface ComponentRuntimeState {
  pageState: Record<string, RuntimeStateValue>;
  onAction?: (action: RuntimeAction) => void;
}

function visitNodes(
  nodes: ComponentNode[],
  visitor: (node: ComponentNode) => void,
) {
  for (const node of nodes) {
    visitor(node);
    if (node.children?.length) {
      visitNodes(node.children, visitor);
    }
  }
}

function getLegacyClickActions(node: ComponentNode): ActionConfig[] {
  const props = (node.props ?? {}) as Record<string, unknown>;

  if (props.actionType === "set-state") {
    const key = props.stateKey;
    const value = props.stateValue;

    if (typeof key === "string" && key && value !== undefined) {
      return [{ type: "setState", key, value: value as RuntimeStateValue }];
    }
  }

  if (props.actionType === "open-url" && typeof props.link === "string") {
    if (props.link.startsWith("#")) {
      return [{ type: "scrollTo", targetId: props.link.slice(1) }];
    }

    if (props.link) {
      return [{ type: "openUrl", url: props.link, target: "_blank" }];
    }
  }

  if (
    props.actionType === "scroll-to-id" &&
    typeof props.targetId === "string" &&
    props.targetId
  ) {
    return [{ type: "scrollTo", targetId: props.targetId }];
  }

  return [];
}

function getComponentClickActions(node: ComponentNode): ActionConfig[] {
  const configuredActions = Array.isArray(node.events?.onClick)
    ? node.events.onClick
    : [];

  return [...configuredActions, ...getLegacyClickActions(node)];
}

function handleComponentClickActions(
  node: ComponentNode,
  runtime?: ComponentRuntimeState,
) {
  const actions = getComponentClickActions(node);
  if (!actions.length) {
    return;
  }

  actions.forEach((action) => {
    runtime?.onAction?.(action);
  });
}

function shouldRenderComponent(
  conf: ComponentNode,
  runtime?: ComponentRuntimeState,
) {
  if (!runtime) {
    return true;
  }

  const props = (conf.props ?? {}) as Record<string, unknown>;
  const visibleStateKey = props.visibleStateKey;
  const visibleStateValue = props.visibleStateValue;

  if (
    typeof visibleStateKey !== "string" ||
    !visibleStateKey ||
    visibleStateValue === undefined ||
    visibleStateValue === ""
  ) {
    return true;
  }

  return runtime.pageState[visibleStateKey] === visibleStateValue;
}

export function resolveInitialPageState(nodes: ComponentNode[]) {
  const initialState: Record<string, RuntimeStateValue> = {};

  visitNodes(nodes, (node) => {
    for (const action of getComponentClickActions(node)) {
      if (
        action.type === "setState" &&
        action.key &&
        initialState[action.key] === undefined
      ) {
        initialState[action.key] = action.value;
      }
    }
  });

  return initialState;
}

export function generateComponent(
  conf: ComponentNode,
  echartsTheme?: string,
  children?: ReactNode[],
  runtime?: ComponentRuntimeState,
) {
  if (!shouldRenderComponent(conf, runtime)) {
    return null;
  }

  const Component = getComponentByType(conf.type);
  if (!Component) {
    return null;
  }

  const slotNodes = groupChildrenBySlot(conf);
  const slotEntries = Object.entries(slotNodes).map(([slotName, items]) => {
    const slotItems = Array.isArray(items) ? (items as ComponentNode[]) : [];
    return [
      slotName,
      slotItems.map((child: ComponentNode) =>
        children?.find((item) => {
          return (
            typeof item === "object" &&
            item !== null &&
            "key" in item &&
            String(item.key) === child.id
          );
        }),
      ),
    ];
  });
  const slots = Object.fromEntries(slotEntries);

  return (
    <div
      data-render-node={conf.id}
      onClick={() => handleComponentClickActions(conf, runtime)}
      style={{
        position: "relative",
        width: conf.styles?.width || "100%",
        height: conf.styles?.height || "auto",
        marginTop: conf.styles?.marginTop,
        marginBottom: conf.styles?.marginBottom,
        marginLeft: conf.styles?.marginLeft,
        marginRight: conf.styles?.marginRight,
        paddingTop: conf.styles?.paddingTop,
        paddingBottom: conf.styles?.paddingBottom,
        paddingLeft: conf.styles?.paddingLeft,
        paddingRight: conf.styles?.paddingRight,
        overflow: "hidden",
      }}
    >
      <Component
        {...toJS(conf.props)}
        echartsTheme={echartsTheme}
        key={conf.id}
        onAction={runtime?.onAction}
        runtimePageState={runtime?.pageState}
        runtimeWidth={conf.styles?.width}
        runtimeHeight={conf.styles?.height}
        slots={slots}
        editorNodeId={conf.id}
      />
    </div>
  );
}
