import ClassNames from "classnames";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import type {
  CSSProperties,
  FC,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import {
  createRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getComponentContainerMeta,
} from "@codigo/materials";
import type {
  ActionConfig,
  ComponentNode,
  ComponentNodeRecord,
  RuntimeStateValue,
  TComponentTypes,
} from "@codigo/schema";
import { groupChildrenBySlot } from "@codigo/schema";
import {
  useComponentKeyPress,
  useStoreComponents,
  useStorePage,
  useStorePermission,
} from "@/shared/hooks";
import type { TStoreComponents } from "@/shared/stores";
import {
  AppstoreOutlined,
  DeleteOutlined,
  DragOutlined,
  HighlightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import {
  findEditorComponent,
  getComponentRenderByType,
  quickInsertComponents,
} from "@/modules/editor/registry/components";

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
  if (!actions.length) return;

  actions.forEach((action) => {
    runtime?.onAction?.(action);
  });
}

function shouldRenderComponent(
  conf: ComponentNode,
  runtime?: ComponentRuntimeState,
) {
  if (!runtime) return true;

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

export function generateComponent(
  conf: ComponentNode,
  echartsTheme?: string,
  children?: ReactNode[],
  runtime?: ComponentRuntimeState,
) {
  if (!shouldRenderComponent(conf, runtime)) {
    return null;
  }

  const Component = getComponentRenderByType(conf.type);
  if (!Component) {
    return null;
  }
  const slotNodes = groupChildrenBySlot(conf);
  const slotEntries = Object.entries(slotNodes).map(([slotName, items]) => [
    slotName,
    items.map((child) =>
      children?.find((item) => {
        return (
          typeof item === "object" &&
          item !== null &&
          "key" in item &&
          String(item.key) === child.id
        );
      }),
    ),
  ]);
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
        slots={slots}
        editorNodeId={conf.id}
      />
    </div>
  );
}

interface ComponentWrapperProps {
  id: string;
  parentId?: string | null;
  slot?: string | null;
  children: ReactNode;
  isFlowLayout: boolean;
  isDragable: boolean;
  canDrag: boolean;
  onClick: () => void;
  onMouseDown: (event: ReactMouseEvent) => void;
  isCurrentComponent: boolean;
  style?: CSSProperties;
}

const ComponentWrapper: FC<ComponentWrapperProps> = ({
  id,
  parentId,
  slot,
  children,
  isFlowLayout,
  isDragable,
  canDrag,
  isCurrentComponent,
  onClick,
  onMouseDown,
  style,
}) => {
  const classNames = useMemo(() => {
    return ClassNames({
      "absolute left-0 top-0 w-full h-full z-[999] transition-all duration-200":
        !isFlowLayout,
      "absolute inset-0 z-[999] rounded-[20px] transition-all duration-200":
        isFlowLayout,
      "hover:border-[2px] hover:border-emerald-400 hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]":
        !isCurrentComponent && !isDragable,
      "border-[2px] border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]":
        isCurrentComponent,
    });
  }, [isCurrentComponent, isDragable, isFlowLayout]);

  return (
    <div
      className={`${isFlowLayout ? "relative mb-4" : "absolute"} component-warpper ${canDrag ? "cursor-move" : "cursor-pointer"}`}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={style}
      data-id={id}
      data-parent-id={parentId ?? "root"}
      data-slot={slot ?? "root"}
    >
      <div className={classNames} />
      <div>{children}</div>
    </div>
  );
};

const EditorChooiseToolbarIconContainer: FC<{
  children: ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <div
      className="cursor-pointer hover:bg-white/20 p-1 rounded transition-colors flex items-center justify-center"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const EditorChooiseToolbar: FC<{
  hidden: boolean;
  onRef: any;
}> = observer(({ hidden, onRef }) => {
  const { store, removeCurrentComponent, getCurrentComponentConfig } =
    useStoreComponents();
  const { can } = useStorePermission();
  const canEditStructure = can("edit_structure");
  const [currentComponentRect, setCurrentComponentRect] =
    useState<ClientRect>();

  const [isFirst, setIsFirst] = useState(false);
  const [refrash, setRefrash] = useState(false);
  const [localHidden, setLocalHidden] = useState(false);

  const classNames = useMemo(() => {
    return ClassNames({
      hidden: hidden || localHidden,
      "absolute bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 flex items-center text-xs font-medium text-white gap-2 rounded-r-lg shadow-lg shadow-emerald-500/20 border-l-2 border-emerald-400 z-[1000] transition-all duration-300": true,
    });
  }, [hidden, localHidden]);

  useImperativeHandle(onRef, () => ({ setRefrash }));

  const componentName = useMemo(() => {
    return findEditorComponent(getCurrentComponentConfig.get()?.type)?.name;
  }, [getCurrentComponentConfig.get()]);

  function getCurrentCompConfig() {
    const componentWarppers = document.querySelectorAll(".component-warpper");
    let currentCompConfig = null;

    componentWarppers?.forEach((el) => {
      if (el.getAttribute("data-id") === store.currentCompConfig)
        currentCompConfig = el;
    });

    return currentCompConfig as HTMLDivElement | null;
  }

  function resizeComponent() {
    const currentComponent = getCurrentCompConfig();
    if (currentComponent) {
      setCurrentComponentRect({
        top: currentComponent.offsetTop,
        left: currentComponent.offsetLeft,
        right: currentComponent.offsetLeft + currentComponent.offsetWidth,
        bottom: currentComponent.offsetTop + currentComponent.offsetHeight,
        width: currentComponent.offsetWidth,
        height: currentComponent.offsetHeight,
      } as ClientRect);
    }
  }

  useEffect(() => {
    const oCanvasContainer = document.querySelector(".editor-canvas-container");
    const currentComponent = getCurrentCompConfig();

    const _observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== currentComponent) return;

          entry.isIntersecting ? setLocalHidden(false) : setLocalHidden(true);
        });
      },
      {
        threshold: 0.9,
        root: oCanvasContainer,
      },
    );

    if (currentComponent && oCanvasContainer)
      _observer.observe(currentComponent);

    return () => {
      _observer.disconnect();
    };
  }, [getCurrentComponentConfig.get(), hidden]);

  useEffect(() => {
    if (!isFirst) {
      setIsFirst(true);
      setTimeout(() => {
        resizeComponent();
      }, 500);
      return;
    }

    if (refrash) {
      setRefrash(false);
      return;
    }

    resizeComponent();
  }, [hidden, localHidden, isFirst, refrash, getCurrentComponentConfig.get()]);

  function handleOnClick(fn: () => void) {
    setRefrash(true);
    fn();
  }

  return (
    getCurrentComponentConfig.get() && (
      <div
        className={classNames}
        style={{
          left: `${currentComponentRect?.right}px`,
          top: `${currentComponentRect?.top}px`,
        }}
      >
        <span className="mr-1">{componentName ?? "组件名称"}</span>
        <div className="w-px h-3 bg-white/30 mx-1"></div>

        {canEditStructure ? (
          <>
            <EditorChooiseToolbarIconContainer
              onClick={() => handleOnClick(removeCurrentComponent)}
            >
              <DeleteOutlined />
            </EditorChooiseToolbarIconContainer>
          </>
        ) : (
          <span className="text-[11px] text-white/80">只读</span>
        )}
      </div>
    )
  );
});

interface MovingComponentState {
  id: string;
  startX: number;
  startY: number;
  origLeft: number;
  origTop: number;
}

function toNumber(value: string | number | undefined, fallback: number = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

const EditorCanvas: FC<{
  store: TStoreComponents;
  onRef: any;
}> = observer(({ store, onRef }) => {
  const {
    getComponentById,
    getComponentTree,
    getAvailableSlots,
    isCurrentComponent,
    moveExistingNode,
    setCurrentComponent,
    updateComponentPosition,
    push,
  } = useStoreComponents();
  const { can } = useStorePermission();
  const { store: storePage } = useStorePage();
  const canEditStructure = can("edit_structure");

  const [isDragable, setIsDragable] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [movingComponent, setMovingComponent] =
    useState<MovingComponentState | null>(null);
  const toolbarRef = createRef<any>();
  const canvasRef = useRef<HTMLDivElement>(null);

  function getWrapperElements(parentId: string | null, slot: string | null) {
    return Array.from(
      document.querySelectorAll<HTMLElement>(".component-warpper"),
    ).filter((element) => {
      const nextParentId = element.dataset.parentId ?? "root";
      const nextSlot = element.dataset.slot ?? "root";
      return (
        nextParentId === (parentId ?? "root") && nextSlot === (slot ?? "root")
      );
    });
  }

  function resolveInsertIndex(
    parentId: string | null,
    slot: string | null,
    movingId: string,
    clientX: number,
    clientY: number,
  ) {
    const siblings = getWrapperElements(parentId, slot)
      .filter((element) => element.dataset.id !== movingId)
      .sort((left, right) => {
        const leftRect = left.getBoundingClientRect();
        const rightRect = right.getBoundingClientRect();
        if (Math.abs(leftRect.top - rightRect.top) > 8) {
          return leftRect.top - rightRect.top;
        }
        return leftRect.left - rightRect.left;
      });

    for (const [index, element] of siblings.entries()) {
      const rect = element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const centerX = rect.left + rect.width / 2;
      if (
        clientY < centerY ||
        (Math.abs(clientY - centerY) < 8 && clientX < centerX)
      ) {
        return index;
      }
    }

    return siblings.length;
  }

  function resolveMoveTarget(
    movingId: string,
    clientX: number,
    clientY: number,
  ) {
    const targetElement = document.elementFromPoint(
      clientX,
      clientY,
    ) as HTMLElement | null;
    const slotZone = targetElement?.closest(
      "[data-slot-name]",
    ) as HTMLElement | null;
    const current = getComponentById(movingId) as
      | ComponentNodeRecord
      | undefined;
    if (!current) return null;

    if (slotZone?.dataset.containerId) {
      const targetParentId = slotZone.dataset.containerId;
      const targetSlot = slotZone.dataset.slotName ?? "default";
      const targetIndex = resolveInsertIndex(
        targetParentId,
        targetSlot,
        movingId,
        clientX,
        clientY,
      );
      const slotRect = slotZone.getBoundingClientRect();
      return {
        parentId: targetParentId,
        slot: targetSlot,
        index: targetIndex,
        left: clientX - slotRect.left,
        top: clientY - slotRect.top,
      };
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const targetIndex = resolveInsertIndex(
      null,
      null,
      movingId,
      clientX,
      clientY,
    );
    return {
      parentId: null,
      slot: null,
      index: targetIndex,
      left: canvasRect ? clientX - canvasRect.left : 0,
      top: canvasRect ? clientY - canvasRect.top : 0,
    };
  }

  function handleComponentClick(conf: { id: string }) {
    if (isCurrentComponent(conf)) return;
    setCurrentComponent(conf.id);
  }

  function handleDragComponentStart(event: ReactMouseEvent, id: string) {
    if (!canEditStructure || event.button !== 0) return;
    const component = getComponentById(id) as ComponentNodeRecord;
    if (!component) return;

    setCurrentComponent(id);
    setMovingComponent({
      id,
      startX: event.clientX,
      startY: event.clientY,
      origLeft: toNumber(component.styles?.left, 0),
      origTop: toNumber(component.styles?.top, 0),
    });
    setIsDragable(true);
    event.preventDefault();
    event.stopPropagation();
  }

  useEffect(() => {
    if (!movingComponent || !canEditStructure) return;

    const onMouseMove = (event: MouseEvent) => {
      const left =
        movingComponent.origLeft + event.clientX - movingComponent.startX;
      const top =
        movingComponent.origTop + event.clientY - movingComponent.startY;
      updateComponentPosition(movingComponent.id, left, top, true);
    };

    const onMouseUp = (event: MouseEvent) => {
      const target = resolveMoveTarget(
        movingComponent.id,
        event.clientX,
        event.clientY,
      );
      if (target) {
        moveExistingNode({
          nodeId: movingComponent.id,
          targetParentId: target.parentId,
          targetSlot: target.slot,
          targetIndex: target.index,
        });
        updateComponentPosition(
          movingComponent.id,
          target.left,
          target.top,
          false,
        );
      } else {
        const left =
          movingComponent.origLeft + event.clientX - movingComponent.startX;
        const top =
          movingComponent.origTop + event.clientY - movingComponent.startY;
        updateComponentPosition(movingComponent.id, left, top, false);
      }
      setMovingComponent(null);
      setIsDragable(false);
      toolbarRef.current?.setRefrash(true);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    canEditStructure,
    moveExistingNode,
    movingComponent,
    updateComponentPosition,
  ]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!canEditStructure) return;
    const type = e.dataTransfer.getData("componentType");
    const rect = canvasRef.current?.getBoundingClientRect();
    const targetElement = e.target as HTMLElement | null;
    const slotZone = targetElement?.closest(
      "[data-slot-name]",
    ) as HTMLElement | null;
    if (type) {
      if (slotZone) {
        const slotRect = slotZone.getBoundingClientRect();
        const parentId = slotZone.dataset.containerId;
        const slot = slotZone.dataset.slotName;
        if (parentId) {
          push(
            type as TComponentTypes,
            {
              left: e.clientX - slotRect.left,
              top: e.clientY - slotRect.top,
            },
            {
              parentId,
              slot: slot ?? "default",
            },
          );
          return;
        }
      }

      const currentId = store.currentCompConfig;
      const current = currentId ? getComponentById(currentId) : null;
      if (current) {
        const meta = getComponentContainerMeta(current.type);
        if (meta.isContainer) {
          const slotName =
            getAvailableSlots(current.type)[0]?.name ?? "default";
          push(
            type as TComponentTypes,
            {
              left: 24,
              top: 24,
            },
            {
              parentId: current.id,
              slot: slotName,
            },
          );
          return;
        }
      }

      push(type as TComponentTypes, {
        left: rect ? e.clientX - rect.left : 32,
        top: rect ? e.clientY - rect.top : 24,
      });
    }
  }

  useComponentKeyPress();

  useImperativeHandle(onRef, () => ({
    setShowToolbar,
  }));

  return (
    <div
      ref={canvasRef}
      className="relative min-h-[700px] bg-white"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        minHeight: `${Math.max(700, store.sortableCompConfig.length * 220)}px`,
      }}
    >
      <EditorChooiseToolbar
        onRef={toolbarRef}
        hidden={!showToolbar || isDragable}
      />
      {!store.sortableCompConfig.length && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10">
          <div className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-dashed border-emerald-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,253,250,0.96))] p-8 text-center shadow-[0_30px_70px_-40px_rgba(16,185,129,0.45)] backdrop-blur-xl">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-500/10 text-3xl text-emerald-600">
              <AppstoreOutlined />
            </div>
            <div className="text-base font-semibold text-slate-900">
              先在页面属性配置整体布局，再开始搭建
            </div>
            <div className="mt-2 text-sm text-slate-500">
              右侧页面信息里可以先配置整体布局，再把组件拖入对应容器区域。
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-left">
              {[
                {
                  key: "setting",
                  icon: <DragOutlined />,
                  title: "配置布局",
                },
                {
                  key: "edit",
                  icon: <HighlightOutlined />,
                  title: "拖入组件",
                },
                {
                  key: "preview",
                  icon: <PlusOutlined />,
                  title: "快速起稿",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="rounded-2xl border border-white bg-white/90 px-4 py-4 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.55)]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-600">
                    {item.icon}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {quickInsertComponents.map((item) => (
                <Button
                  key={item.type}
                  type="default"
                  icon={<PlusOutlined />}
                  disabled={!canEditStructure}
                  className="!h-10 !rounded-2xl !border-slate-200 !bg-white !px-4 hover:!border-emerald-300 hover:!text-emerald-600"
                  onClick={() => push(item.type)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="mt-5 text-xs text-slate-400">
              {canEditStructure
                ? "先到右侧页面信息配置整体布局，再从左侧资源库拖拽组件"
                : "当前角色没有新增组件权限"}
            </div>
          </div>
        </div>
      )}
      {getComponentTree.get().map(function renderTreeNode(node: ComponentNode) {
        const renderedChildren =
          node.children?.map((child) => renderTreeNode(child)) ?? [];
        return (
          <ComponentWrapper
            key={node.id}
            isFlowLayout={storePage.layoutMode === "flow"}
            isDragable={isDragable}
            canDrag={canEditStructure}
            onMouseDown={(event) => handleDragComponentStart(event, node.id)}
            onClick={() => handleComponentClick(node)}
            isCurrentComponent={isCurrentComponent(node)}
            id={node.id}
            parentId={
              node.id
                ? ((
                    getComponentById(node.id) as ComponentNodeRecord | undefined
                  )?.parentId ?? null)
                : null
            }
            slot={
              (getComponentById(node.id) as ComponentNodeRecord | undefined)
                ?.slot ?? null
            }
            style={{
              left:
                storePage.layoutMode === "flow"
                  ? undefined
                  : (node.styles?.left as string | number | undefined),
              top:
                storePage.layoutMode === "flow"
                  ? undefined
                  : (node.styles?.top as string | number | undefined),
              position:
                storePage.layoutMode === "flow" ? "relative" : "absolute",
              width: node.styles?.width as string | number | undefined,
            }}
          >
            <div className="relative">
              <div>
                {generateComponent(
                  node,
                  storePage.chartTheme || undefined,
                  renderedChildren,
                )}
              </div>
            </div>
          </ComponentWrapper>
        );
      })}
    </div>
  );
});

export default EditorCanvas;
