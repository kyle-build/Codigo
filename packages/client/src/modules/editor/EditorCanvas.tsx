import ClassNames from "classnames";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import type { CSSProperties, FC, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  createRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { getComponentByType } from "@codigo/share";
import type {
  TBasicComponentConfig,
  TComponentPropsUnion,
  TComponentTypes,
} from "@codigo/share";
import {
  useComponentKeyPress,
  useStoreComponents,
  useStorePermission,
} from "@/shared/hooks";
import type { TStoreComponents } from "@/shared/stores";
import { components } from "./components/leftPanel/ComponentList";
import { DeleteOutlined } from "@ant-design/icons";

export function generateComponent(conf: TBasicComponentConfig) {
  const Component = getComponentByType(conf.type);

  return (
    <div
      style={{
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
      <Component {...toJS(conf.props)} key={conf.id} />
    </div>
  );
}

interface ComponentWrapperProps {
  id: string;
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
    >
      <div className={classNames} />
      <div className="pointer-events-none">{children}</div>
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
      const rect = currentComponent?.getBoundingClientRect();
      setCurrentComponentRect(rect);
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
          top: `${currentComponentRect && currentComponentRect.bottom - 36}px`,
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
    isCurrentComponent,
    setCurrentComponent,
    updateComponentPosition,
    push,
  } = useStoreComponents();
  const { can } = useStorePermission();
  const canEditStructure = can("edit_structure");

  const [isDragable, setIsDragable] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [movingComponent, setMovingComponent] =
    useState<MovingComponentState | null>(null);
  const toolbarRef = createRef<any>();
  const canvasRef = useRef<HTMLDivElement>(null);

  function handleComponentClick(conf: TComponentPropsUnion) {
    if (isCurrentComponent(conf)) return;
    setCurrentComponent(conf.id);
  }

  function handleDragComponentStart(event: ReactMouseEvent, id: string) {
    if (!canEditStructure || event.button !== 0) return;
    const component = getComponentById(id) as TBasicComponentConfig;
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
      const left = movingComponent.origLeft + event.clientX - movingComponent.startX;
      const top = movingComponent.origTop + event.clientY - movingComponent.startY;
      updateComponentPosition(movingComponent.id, left, top, true);
    };

    const onMouseUp = (event: MouseEvent) => {
      const left = movingComponent.origLeft + event.clientX - movingComponent.startX;
      const top = movingComponent.origTop + event.clientY - movingComponent.startY;
      updateComponentPosition(movingComponent.id, left, top, false);
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
  }, [canEditStructure, movingComponent, updateComponentPosition]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!canEditStructure) return;
    const type = e.dataTransfer.getData("componentType");
    const rect = canvasRef.current?.getBoundingClientRect();
    if (type) {
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
      {store.sortableCompConfig.map((item) => {
        const component = getComponentById(item) as TBasicComponentConfig;
        if (!component) return null;
        return (
          <ComponentWrapper
            key={item}
            isDragable={isDragable}
            canDrag={canEditStructure}
            onMouseDown={(event) => handleDragComponentStart(event, item)}
            onClick={() => handleComponentClick(component as TComponentPropsUnion)}
            isCurrentComponent={isCurrentComponent(component as TComponentPropsUnion)}
            id={item}
            style={{
              left: component.styles?.left as string | number | undefined,
              top: component.styles?.top as string | number | undefined,
              position: "absolute",
            }}
          >
            {generateComponent(component)}
          </ComponentWrapper>
        );
      })}
    </div>
  );
});

export default EditorCanvas;
