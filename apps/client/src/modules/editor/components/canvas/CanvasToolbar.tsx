import ClassNames from "classnames";
import { DeleteOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import type { ReactNode, Ref } from "react";
import { useImperativeHandle, useMemo } from "react";
import {
  useEditorComponents,
  useEditorPermission,
} from "@/modules/editor/hooks";
import { findEditorComponent } from "@/modules/editor/registry/components";
import { useCanvasToolbarState } from "./hooks/useCanvasToolbarState";

interface CanvasToolbarRef {
  setRefresh: (value: boolean) => void;
}

function ToolbarIconButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      className="cursor-pointer rounded p-1 transition-colors hover:bg-white/20"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export const CanvasToolbar = observer(function CanvasToolbar({
  hidden,
  onRef,
}: {
  hidden: boolean;
  onRef: Ref<CanvasToolbarRef>;
}) {
  const { store, removeCurrentComponent, getCurrentComponentConfig } =
    useEditorComponents();
  const { can } = useEditorPermission();
  const canEditStructure = can("edit_structure");
  const currentComponent = getCurrentComponentConfig.get();
  const { currentComponentRect, canvasSize, localHidden, setRefresh } =
    useCanvasToolbarState({
      hidden,
      selectedComponentId: store.currentCompConfig,
    });

  const classNames = useMemo(() => {
    return ClassNames({
      hidden: hidden || localHidden,
      "editor-choice-toolbar absolute z-[1000] flex items-center gap-2 rounded-r-lg border-l-2 border-emerald-400 bg-emerald-600/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 backdrop-blur-md transition-all duration-300":
        true,
    });
  }, [hidden, localHidden]);

  useImperativeHandle(onRef, () => ({ setRefresh }));

  const componentName = useMemo(() => {
    return findEditorComponent(currentComponent?.type)?.name;
  }, [currentComponent?.type]);

  function handleActionClick(fn: () => void) {
    setRefresh(true);
    fn();
  }

  if (!currentComponent) {
    return null;
  }

  const gapPx = 8;
  const shouldFlipX =
    (currentComponentRect?.right ?? 0) + gapPx > canvasSize.width;

  return (
    <div
      className={classNames}
      style={{
        left: `${currentComponentRect?.right}px`,
        top: `${currentComponentRect?.top}px`,
        transform: shouldFlipX
          ? `translateX(calc(-100% - ${gapPx}px))`
          : `translateX(${gapPx}px)`,
      }}
    >
      <span className="mr-1">{componentName ?? "组件名称"}</span>
      <div className="mx-1 h-3 w-px bg-white/30" />
      {canEditStructure ? (
        <ToolbarIconButton
          onClick={() => handleActionClick(removeCurrentComponent)}
        >
          <DeleteOutlined />
        </ToolbarIconButton>
      ) : (
        <span className="text-[11px] text-white/80">只读</span>
      )}
    </div>
  );
});
