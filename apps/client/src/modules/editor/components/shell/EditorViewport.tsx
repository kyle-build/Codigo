import { AppstoreOutlined, FileTextOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { observer } from "mobx-react-lite";
import EditorLeftPanel from "../leftPanel";
import EditorPageManager from "../pageManager";
import EditorRightPanel from "../rightPanel";
import { EditorOutlineTree } from "../rightPanel/ComponentFields";
import EditorCanvas from "../canvas";
import { SandboxCanvas } from "../canvas/SandboxCanvas";
import { useEditorPanelLayout } from "./useEditorPanelLayout";
import { WebIDEFrame } from "./WebIDEFrame";
import {
  LEFT_PANEL_CONTENT_WIDTH,
  LEFT_PANEL_RAIL_WIDTH,
} from "./layout";
import type { TStorePage } from "@/shared/stores";
import type { TEditorComponentsStore } from "@/modules/editor/stores";

interface EditorViewportProps {
  storeComps: TEditorComponentsStore;
  storePage: TStorePage;
  canvasRef: RefObject<any>;
}

type LeftPanelSection = "pages" | "components";

const WORKSPACE_STAGE_PADDING = 64;
const MOBILE_FRAME_SIZE = 24;

function PanelResizeHandle({
  side,
  onPointerDown,
}: {
  side: "left" | "right";
  lineClassName?: string;
  gripClassName?: string;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      role="separator"
      onPointerDown={onPointerDown}
      className="group relative z-30 w-1 shrink-0 cursor-col-resize bg-transparent touch-none transition-colors hover:bg-[var(--ide-accent)]"
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--ide-border)]" />
    </div>
  );
}

function EditorStage({
  storeComps,
  storePage,
  canvasRef,
}: EditorViewportProps) {
  if (storePage.editorMode === "code") {
    return (
      <div className="relative z-0 h-full w-full overflow-hidden border border-[var(--ide-border)] bg-[var(--ide-bg)]">
        <SandboxCanvas />
      </div>
    );
  }

  return (
    <div
      className={`editor-canvas-container relative z-0 overflow-hidden bg-white text-left transition-all duration-300 ease-out shadow-lg ${
        storePage.deviceType === "mobile"
          ? "border-[12px] border-[#000000] rounded-[32px]"
          : "border border-[var(--ide-border)]"
      }`}
      style={{
        width: storePage.canvasWidth,
        height: storePage.canvasHeight,
        maxHeight: "100%",
      }}
    >
      {storePage.deviceType === "mobile" && (
        <div className="sticky top-0 z-50 flex h-7 items-center justify-between bg-black px-6 text-[11px] font-medium tracking-wider text-white select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-sm bg-white/90" />
            <div className="h-3.5 w-3.5 rounded-full bg-white/90" />
            <div className="h-2.5 w-4 rounded-sm bg-white/90" />
          </div>
        </div>
      )}
      <EditorCanvas store={storeComps} onRef={canvasRef} />
    </div>
  );
}

export const EditorViewport = observer(function EditorViewport(
  props: EditorViewportProps,
) {
  const { leftPanelWidth, rightPanelWidth, startResize } =
    useEditorPanelLayout();
  const workspaceViewportRef = useRef<HTMLDivElement>(null);
  const workspaceSurfaceRef = useRef<HTMLDivElement>(null);
  const shouldCenterWorkspaceRef = useRef(true);
  const workspaceOffsetRef = useRef({ x: 0, y: 0 });
  const workspacePanRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [activeLeftSection, setActiveLeftSection] =
    useState<LeftPanelSection>("components");
  const [workspaceViewportSize, setWorkspaceViewportSize] = useState({
    width: 0,
    height: 0,
  });
  const [isWorkspacePanning, setIsWorkspacePanning] = useState(false);
  const outlinePanelWidth = Math.max(
    0,
    leftPanelWidth - LEFT_PANEL_RAIL_WIDTH - LEFT_PANEL_CONTENT_WIDTH,
  );
  const showOutlineTree = props.storePage.showOutlineTree;
  const effectiveLeftPanelWidth = showOutlineTree
    ? leftPanelWidth
    : LEFT_PANEL_RAIL_WIDTH + LEFT_PANEL_CONTENT_WIDTH;
  const leftSectionItems: Array<{
    key: LeftPanelSection;
    icon: ReactNode;
    label: string;
  }> = [
    {
      key: "pages",
      icon: <FileTextOutlined className="text-xl" />,
      label: "页面",
    },
    {
      key: "components",
      icon: <AppstoreOutlined className="text-xl" />,
      label: "组件",
    },
  ];

  // ... rest of logic (no changes to logic, just UI below)
  const stageFrameWidth =
    props.storePage.canvasWidth +
    (props.storePage.deviceType === "mobile" ? MOBILE_FRAME_SIZE : 0);
  const stageFrameHeight =
    props.storePage.canvasHeight +
    (props.storePage.deviceType === "mobile" ? MOBILE_FRAME_SIZE : 0);
  const hasMeasuredWorkspaceViewport =
    workspaceViewportSize.width > 0 && workspaceViewportSize.height > 0;
  const workspaceWidth = Math.max(
    hasMeasuredWorkspaceViewport
      ? workspaceViewportSize.width + WORKSPACE_STAGE_PADDING * 2
      : 0,
    stageFrameWidth + WORKSPACE_STAGE_PADDING * 2,
  );
  const workspaceHeight = Math.max(
    hasMeasuredWorkspaceViewport
      ? workspaceViewportSize.height + WORKSPACE_STAGE_PADDING * 2
      : 0,
    stageFrameHeight + WORKSPACE_STAGE_PADDING * 2,
  );

  useEffect(() => {
    const target = workspaceViewportRef.current;
    if (!target) {
      return;
    }

    const updateViewportSize = () => {
      setWorkspaceViewportSize({
        width: target.clientWidth,
        height: target.clientHeight,
      });
    };

    updateViewportSize();

    const observer = new ResizeObserver(() => {
      updateViewportSize();
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    shouldCenterWorkspaceRef.current = true;
  }, [stageFrameWidth, stageFrameHeight, props.storePage.deviceType]);

  function resolveWorkspaceBounds() {
    const viewportWidth = workspaceViewportSize.width;
    const viewportHeight = workspaceViewportSize.height;
    const centerX = (viewportWidth - workspaceWidth) / 2;
    const centerY = (viewportHeight - workspaceHeight) / 2;

    return {
      minX: workspaceWidth > viewportWidth ? viewportWidth - workspaceWidth : centerX,
      maxX: workspaceWidth > viewportWidth ? 0 : centerX,
      minY:
        workspaceHeight > viewportHeight
          ? viewportHeight - workspaceHeight
          : centerY,
      maxY: workspaceHeight > viewportHeight ? 0 : centerY,
      centerX,
      centerY,
    };
  }

  function applyWorkspaceOffset(x: number, y: number) {
    workspaceOffsetRef.current = { x, y };
    if (workspaceSurfaceRef.current) {
      workspaceSurfaceRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }

  function clampWorkspaceOffset(x: number, y: number) {
    const bounds = resolveWorkspaceBounds();
    return {
      x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
      y: Math.min(bounds.maxY, Math.max(bounds.minY, y)),
    };
  }

  useEffect(() => {
    if (
      !hasMeasuredWorkspaceViewport ||
      !shouldCenterWorkspaceRef.current ||
      isWorkspacePanning
    ) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const bounds = resolveWorkspaceBounds();
      applyWorkspaceOffset(bounds.centerX, bounds.centerY);
      shouldCenterWorkspaceRef.current = false;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    hasMeasuredWorkspaceViewport,
    isWorkspacePanning,
    workspaceHeight,
    workspaceViewportSize.height,
    workspaceViewportSize.width,
    workspaceWidth,
  ]);

  useEffect(() => {
    if (!isWorkspacePanning) {
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      const currentPan = workspacePanRef.current;
      const target = workspaceViewportRef.current;
      if (!currentPan || !target) {
        return;
      }

      const deltaX = event.clientX - currentPan.startX;
      const deltaY = event.clientY - currentPan.startY;
      const nextOffset = clampWorkspaceOffset(
        currentPan.originX + deltaX,
        currentPan.originY + deltaY,
      );

      applyWorkspaceOffset(nextOffset.x, nextOffset.y);
      event.preventDefault();
    };

    const onMouseUp = () => {
      finishWorkspacePan();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isWorkspacePanning, props.canvasRef]);

  function finishWorkspacePan() {
    workspacePanRef.current = null;
    setIsWorkspacePanning(false);
  }

  function canStartWorkspacePan(target: EventTarget | null) {
    if (!(target instanceof Element)) {
      return true;
    }

    return !target.closest(".component-warpper");
  }

  function handleWorkspaceMouseDown(
    event: ReactMouseEvent<HTMLDivElement>,
  ) {
    if (props.storePage.editorMode !== "visual" || event.button !== 0) {
      return;
    }

    if (!canStartWorkspacePan(event.target)) {
      return;
    }

    const target = workspaceViewportRef.current;
    if (!target) {
      return;
    }

    workspacePanRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: workspaceOffsetRef.current.x,
      originY: workspaceOffsetRef.current.y,
    };
    shouldCenterWorkspaceRef.current = false;
    setIsWorkspacePanning(true);
    event.preventDefault();
  }

  if (props.storePage.editorMode === "webide") {
    return (
      <div className="h-full w-full overflow-hidden bg-[var(--ide-bg)]">
        <WebIDEFrame workspaceRoot={props.storePage.workspace?.workspaceRoot} />
      </div>
    );
  }

  return (
    <div className="relative isolate flex h-full w-full flex-col overflow-hidden bg-[var(--ide-bg)] text-[var(--ide-text)]">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Activity Bar (Left Rail) */}
        <div
          className="z-30 flex h-full shrink-0 flex-col items-center bg-[var(--ide-activitybar-bg)] py-2"
          style={{ width: LEFT_PANEL_RAIL_WIDTH }}
        >
          <div className="flex flex-col gap-1 w-full">
            {leftSectionItems.map((item) => {
              const isActive = item.key === activeLeftSection;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveLeftSection(item.key)}
                  title={item.label}
                  className={`relative flex h-12 w-full items-center justify-center transition-colors hover:text-[var(--ide-text)] ${
                    isActive
                      ? "border-l-2 border-[var(--ide-accent)] text-[var(--ide-text)]"
                      : "text-[var(--ide-text-muted)]"
                  }`}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Bar (Panel) */}
        <div
          className="relative z-20 flex shrink-0 overflow-hidden border-r border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] transition-[width] duration-150"
          style={{ width: effectiveLeftPanelWidth - LEFT_PANEL_RAIL_WIDTH }}
        >
          <div
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex h-9 items-center px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
              {activeLeftSection === "pages" ? "资源管理器" : "组件库"}
            </div>
            <div className="flex-1 overflow-auto">
              {activeLeftSection === "pages" ? (
                <EditorPageManager embedded />
              ) : (
                <EditorLeftPanel embedded />
              )}
            </div>
          </div>

          {showOutlineTree && (
            <div
              className="min-h-0 shrink-0 border-l border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)]"
              style={{ width: outlinePanelWidth }}
            >
              <div className="flex h-9 items-center px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
                大纲
              </div>
              <div className="flex-1 overflow-auto">
                <EditorOutlineTree />
              </div>
            </div>
          )}
        </div>

        {showOutlineTree && (
          <PanelResizeHandle
            side="left"
            onPointerDown={startResize("left")}
          />
        )}

        {/* Main Editor Area */}
        <div className="relative z-0 flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--ide-bg)]">
          {/* Editor Grid Background */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--ide-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--ide-grid-line)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="relative z-10 flex-1 overflow-hidden">
            <div
              ref={workspaceViewportRef}
              className={`editor-stage-scroll relative h-full w-full overflow-hidden touch-none ${
                isWorkspacePanning
                  ? "cursor-grabbing select-none"
                  : props.storePage.editorMode === "visual"
                    ? "cursor-grab"
                    : ""
              }`}
              onMouseDown={handleWorkspaceMouseDown}
            >
              <div
                ref={workspaceSurfaceRef}
                className="absolute left-0 top-0 z-0 flex items-start justify-center will-change-transform"
                style={{
                  width: workspaceWidth,
                  height: workspaceHeight,
                  padding: WORKSPACE_STAGE_PADDING,
                }}
              >
                <EditorStage {...props} />
              </div>
            </div>
          </div>
        </div>

        <PanelResizeHandle
          side="right"
          onPointerDown={startResize("right")}
        />

        {/* Right Panel */}
        <div
          className="relative z-20 flex shrink-0 flex-col border-l border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] transition-[width] duration-150"
          style={{ width: rightPanelWidth }}
        >
          <div className="flex h-9 items-center border-b border-[var(--ide-border)] px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
            属性设置
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto">
            <EditorRightPanel />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="z-40 flex h-[var(--status-bar-height)] flex-shrink-0 select-none items-center justify-between bg-[var(--ide-statusbar-bg)] px-3 text-[11px] text-[var(--ide-statusbar-text)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span className="opacity-80 font-mono">WORKSPACE:</span>
            <span>{props.storePage.activePagePath}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span>{props.storePage.deviceType === "mobile" ? "Mobile View" : "Desktop View"}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span>Powered by Codigo</span>
          </div>
        </div>
      </div>
    </div>
  );
});
