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
  getComponentByType,
  getComponentContainerMeta,
} from "@codigo/materials";
import type {
  ComponentNode,
  ComponentNodeRecord,
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
import { components } from "../leftPanel/ComponentList";
import {
  AppstoreOutlined,
  DeleteOutlined,
  DragOutlined,
  HighlightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button } from "antd";

export function generateComponent(
  conf: ComponentNode,
  echartsTheme?: string,
  children?: ReactNode[],
) {
  const Component = getComponentByType(conf.type);
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
        slots={slots}
        editorNodeId={conf.id}
      />
    </div>
  );
}

const quickInsertComponents: Array<{
  type: TComponentTypes;
  label: string;
}> = [
  { type: "titleText", label: "标题组件" },
  { type: "button", label: "按钮组件" },
  { type: "image", label: "图片组件" },
];

interface ComponentWrapperProps {
  id: string;
  parentId?: string | null;
  slot?: string | null;
  children: ReactNode;
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
  isDragable,
  canDrag,
  isCurrentComponent,
  onClick,
  onMouseDown,
  style,
}) => {
  const classNames = useMemo(() => {
    return ClassNames({
      "absolute left-0 top-0 w-full h-full z-[999] transition-all duration-200": true,
      "hover:border-[2px] hover:border-emerald-400 hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]":
        !isCurrentComponent && !isDragable,
      "border-[2px] border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]":
        isCurrentComponent,
    });
  }, [isCurrentComponent, isDragable]);

  return (
    <div
      className={`absolute component-warpper ${canDrag ? "cursor-move" : "cursor-pointer"}`}
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
    return (
      components.find(
        (item) => item.type === getCurrentComponentConfig.get()?.type,
      )?.name ?? "组件名称"
    );
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
        <span className="mr-1">{componentName}</span>
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
            <div className="text-2xl font-semibold tracking-tight text-slate-900">
              从这里开始搭建你的页面
            </div>
            <div className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              把左侧组件拖到画布中，或者使用下方快捷入口快速生成首个模块。完成首屏后，再继续补充内容和布局。
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-left">
              {[
                {
                  key: "drag",
                  icon: <DragOutlined />,
                  title: "拖入组件",
                  desc: "直接从资源库拖放到画布指定区域。",
                },
                {
                  key: "edit",
                  icon: <HighlightOutlined />,
                  title: "实时编辑",
                  desc: "选中组件后在右侧面板调整内容与样式。",
                },
                {
                  key: "preview",
                  icon: <PlusOutlined />,
                  title: "快速起稿",
                  desc: "用快捷组件先搭出结构，再逐步美化。",
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
                  <div className="mt-1 text-xs leading-6 text-slate-400">
                    {item.desc}
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
                ? "支持点击快捷插入，也支持从左侧直接拖拽"
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
              left: node.styles?.left as string | number | undefined,
              top: node.styles?.top as string | number | undefined,
              position: "absolute",
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
