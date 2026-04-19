import {
  ApartmentOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  LeftOutlined,
  RightOutlined,
  SendOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import EditorLeftPanel from "../leftPanel";
import EditorRightPanel from "../rightPanel";
import { EditorOutlineTree } from "../rightPanel/ComponentFields";
import GlobalFields from "../rightPanel/GlobalFields";
import EditorCanvas from "../canvas";
import { SandboxCanvas } from "../canvas/SandboxCanvas";
import { AdminShell } from "@/modules/pageShell/components/AdminShell";
import { useEditorPanelLayout } from "./useEditorPanelLayout";
import { WebIDEFrame } from "./WebIDEFrame";
import { EditorStatusBarActions } from "./EditorStatusBarActions";
import { LEFT_PANEL_RAIL_WIDTH } from "./layout";
import type { TStorePage } from "@/shared/stores";
import type { TEditorComponentsStore } from "@/modules/editor/stores";

interface EditorViewportProps {
  storeComps: TEditorComponentsStore;
  storePage: TStorePage;
  canvasRef: RefObject<any>;
}

type LeftPanelSection =
  | "components"
  | "outline"
  | "global"
  | "requests"
  | "datasources";

const WORKSPACE_STAGE_PADDING = 64;
const MOBILE_FRAME_SIZE = 24;

function PanelResizeHandle({
  side,
  onPointerDown,
  onToggle,
  toggleIcon,
  toggleTitle,
}: {
  side: "left" | "right";
  lineClassName?: string;
  gripClassName?: string;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onToggle: () => void;
  toggleIcon: ReactNode;
  toggleTitle: string;
}) {
  return (
    <div
      role="separator"
      onPointerDown={onPointerDown}
      data-side={side}
      className="group relative z-30 w-1 shrink-0 cursor-col-resize bg-transparent touch-none transition-colors hover:bg-[var(--ide-accent)]"
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--ide-border)]" />
      <button
        type="button"
        title={toggleTitle}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text-muted)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-[var(--ide-text)]"
      >
        {toggleIcon}
      </button>
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
    (() => {
      const pages = storeComps.pages.map((page) => ({
        id: page.id,
        name: page.name,
        path: page.path,
      }));
      const activePagePath =
        storeComps.pages.find((page) => page.id === storeComps.activePageId)?.path ??
        storeComps.pages[0]?.path ??
        null;

      const canvas = (
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

      if (storePage.shellLayout === "none") {
        return canvas;
      }

      const sidebarWidth = 224;
      const topBarHeight = 56;
      const breadcrumbHeight = 44;
      const baseWidth = storePage.canvasWidth;
      const baseHeight = storePage.canvasHeight;
      const frameWidth =
        storePage.shellLayout === "leftRight" ||
        storePage.shellLayout === "leftTop" ||
        storePage.shellLayout === "topLeft"
          ? baseWidth + sidebarWidth
          : baseWidth;
      const frameHeight =
        storePage.shellLayout === "topBottom"
          ? baseHeight + topBarHeight
          : storePage.shellLayout === "breadcrumb"
            ? baseHeight + topBarHeight + breadcrumbHeight
            : storePage.shellLayout === "leftTop" || storePage.shellLayout === "topLeft"
              ? baseHeight + topBarHeight
              : baseHeight;

      return (
        <div
          className="relative z-0 overflow-hidden border border-[var(--ide-border)] bg-white text-left shadow-lg"
          style={{ width: frameWidth, height: frameHeight, maxHeight: "100%" }}
        >
          <AdminShell
            pages={pages}
            activePagePath={activePagePath}
            onSelectPagePath={() => {}}
            title={storePage.title || "管理后台"}
            layout={storePage.shellLayout}
            interactive={false}
          >
            <div className="h-full w-full flex items-center justify-center bg-transparent">
              {canvas}
            </div>
          </AdminShell>
        </div>
      );
    })()
  );
}

export const EditorViewport = observer(function EditorViewport(
  props: EditorViewportProps,
) {
  const navigate = useNavigate();
  const {
    isLeftPanelCollapsed,
    isRightPanelCollapsed,
    setLeftPanelCollapsed,
    setRightPanelCollapsed,
    leftPanelWidth,
    rightPanelWidth,
    startResize,
  } = useEditorPanelLayout();
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
  const activePagePath =
    props.storeComps.pages.find((page) => page.id === props.storeComps.activePageId)
      ?.path ??
    props.storeComps.pages[0]?.path ??
    "-";
  const leftSectionItems: Array<{
    key: LeftPanelSection;
    icon: ReactNode;
    label: string;
  }> = [
    {
      key: "components",
      icon: <AppstoreOutlined className="text-xl" />,
      label: "物料",
    },
    {
      key: "outline",
      icon: <ApartmentOutlined className="text-xl" />,
      label: "大纲",
    },
    {
      key: "global",
      icon: <GlobalOutlined className="text-xl" />,
      label: "全局",
    },
    {
      key: "requests",
      icon: <SendOutlined className="text-xl" />,
      label: "请求",
    },
    {
      key: "datasources",
      icon: <DatabaseOutlined className="text-xl" />,
      label: "数据源",
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

  function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        'input, textarea, select, option, button, a, [contenteditable=""], [contenteditable="true"]',
      ),
    );
  }

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

  function nudgeWorkspaceOffset(deltaX: number, deltaY: number) {
    const current = workspaceOffsetRef.current;
    const nextOffset = clampWorkspaceOffset(current.x + deltaX, current.y + deltaY);
    applyWorkspaceOffset(nextOffset.x, nextOffset.y);
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
    const target = workspaceViewportRef.current;
    if (!target) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (props.storePage.editorMode !== "visual") {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        return;
      }

      shouldCenterWorkspaceRef.current = false;
      nudgeWorkspaceOffset(-event.deltaX, -event.deltaY);

      if (document.activeElement === document.body) {
        target.focus({ preventScroll: true });
      }

      event.preventDefault();
    };

    target.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      target.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [
    props.storePage.editorMode,
    workspaceViewportSize.height,
    workspaceViewportSize.width,
    workspaceHeight,
    workspaceWidth,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (props.storePage.editorMode !== "visual") {
        return;
      }

      const viewport = workspaceViewportRef.current;
      if (!viewport) {
        return;
      }

      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        const isEditing =
          Boolean(
            activeElement.closest(
              'input, textarea, select, option, [contenteditable=""], [contenteditable="true"], [role="textbox"]',
            ),
          ) || activeElement.isContentEditable;
        if (isEditing) {
          return;
        }

        const isInOverlay = Boolean(
          activeElement.closest(
            ".ant-modal, .ant-dropdown, .ant-popover, .ant-select-dropdown",
          ),
        );
        if (isInOverlay) {
          return;
        }
      }

      const canHandle =
        activeElement === document.body ||
        (activeElement instanceof Node && viewport.contains(activeElement));
      if (!canHandle) {
        return;
      }

      if (
        event.key !== "ArrowUp" &&
        event.key !== "ArrowDown" &&
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
      ) {
        return;
      }

      const hasSelection =
        Boolean(props.storeComps.currentCompConfig) ||
        Boolean(props.storeComps.selectedCompIds?.length);
      if (hasSelection) {
        return;
      }

      const step = event.shiftKey ? 96 : 24;
      shouldCenterWorkspaceRef.current = false;

      if (event.key === "ArrowUp") {
        nudgeWorkspaceOffset(0, step);
      } else if (event.key === "ArrowDown") {
        nudgeWorkspaceOffset(0, -step);
      } else if (event.key === "ArrowLeft") {
        nudgeWorkspaceOffset(step, 0);
      } else {
        nudgeWorkspaceOffset(-step, 0);
      }

      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    props.storePage.editorMode,
    workspaceViewportSize.height,
    workspaceViewportSize.width,
    workspaceHeight,
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

    const wrapper = target.closest(".component-warpper") as HTMLElement | null;
    return !wrapper;
  }

  function handleWorkspaceMouseDown(
    event: ReactMouseEvent<HTMLDivElement>,
  ) {
    if (props.storePage.editorMode !== "visual" || event.button !== 0) {
      return;
    }

    if (document.activeElement === document.body && !isEditableTarget(event.target)) {
      workspaceViewportRef.current?.focus({ preventScroll: true });
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
        <WebIDEFrame
          workspaceRoot={props.storePage.workspace?.workspaceRoot}
          pageName={props.storePage.workspace?.pageName}
        />
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
          <div className="flex flex-1 flex-col gap-1 w-full">
            {leftSectionItems.map((item) => {
              const isActive = item.key === activeLeftSection;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (isLeftPanelCollapsed) {
                      setLeftPanelCollapsed(false);
                    }
                    setActiveLeftSection(item.key);
                  }}
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
          <div className="flex flex-col gap-1 w-full pt-2">
            <button
              type="button"
              onClick={() => {
                navigate("/admin");
              }}
              title="后台管理"
              className="relative flex h-12 w-full items-center justify-center text-[var(--ide-text-muted)] transition-colors hover:text-[var(--ide-text)]"
            >
              <SettingOutlined className="text-xl" />
            </button>
          </div>
        </div>

        {/* Side Bar (Panel) */}
        <div
          className="relative z-20 flex shrink-0 overflow-hidden border-r border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] transition-[width] duration-150"
          style={{
            width: isLeftPanelCollapsed ? 0 : leftPanelWidth - LEFT_PANEL_RAIL_WIDTH,
          }}
        >
          {!isLeftPanelCollapsed && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex h-9 items-center px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
                {activeLeftSection === "components"
                  ? "组件库"
                  : activeLeftSection === "outline"
                    ? "大纲"
                    : activeLeftSection === "global"
                      ? "全局"
                      : activeLeftSection === "requests"
                        ? "请求"
                        : "数据源"}
              </div>
              <div className="flex-1 overflow-auto">
                {activeLeftSection === "components" && <EditorLeftPanel embedded />}
                {activeLeftSection === "outline" && <EditorOutlineTree />}
                {activeLeftSection === "global" && (
                  <GlobalFields store={props.storePage} showHeader={false} />
                )}
                {activeLeftSection === "requests" && (
                  <div className="px-4 py-3">
                    <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-3">
                      <div className="text-[12px] font-medium text-[var(--ide-text)]">
                        请求
                      </div>
                      <div className="mt-1 text-[11px] leading-relaxed text-[var(--ide-text-muted)]">
                        功能后续补充
                      </div>
                    </div>
                  </div>
                )}
                {activeLeftSection === "datasources" && (
                  <div className="px-4 py-3">
                    <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-3">
                      <div className="text-[12px] font-medium text-[var(--ide-text)]">
                        数据源
                      </div>
                      <div className="mt-1 text-[11px] leading-relaxed text-[var(--ide-text-muted)]">
                        功能后续补充
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <PanelResizeHandle
          side="left"
          onPointerDown={startResize("left")}
          onToggle={() => setLeftPanelCollapsed(!isLeftPanelCollapsed)}
          toggleIcon={
            isLeftPanelCollapsed ? (
              <RightOutlined className="text-[11px]" />
            ) : (
              <LeftOutlined className="text-[11px]" />
            )
          }
          toggleTitle={isLeftPanelCollapsed ? "展开左侧栏" : "收起左侧栏"}
        />

        {/* Main Editor Area */}
        <div className="relative z-0 flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--ide-bg)]">
          {/* Editor Grid Background */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--ide-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--ide-grid-line)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="relative z-10 flex-1 overflow-hidden">
            <div
              ref={workspaceViewportRef}
              tabIndex={0}
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
          onToggle={() => setRightPanelCollapsed(!isRightPanelCollapsed)}
          toggleIcon={
            isRightPanelCollapsed ? (
              <LeftOutlined className="text-[11px]" />
            ) : (
              <RightOutlined className="text-[11px]" />
            )
          }
          toggleTitle={isRightPanelCollapsed ? "展开右侧栏" : "收起右侧栏"}
        />

        {/* Right Panel */}
        <div
          className={`relative z-20 flex shrink-0 flex-col bg-[var(--ide-sidebar-bg)] transition-[width] duration-150 ${
            isRightPanelCollapsed ? "" : "shadow-[-10px_0_20px_rgba(15,23,42,0.06)]"
          }`}
          style={{ width: isRightPanelCollapsed ? 0 : rightPanelWidth }}
        >
          {!isRightPanelCollapsed && (
            <>
              <div className="flex h-9 items-center px-4 text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
                属性设置
              </div>
              <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto">
                <EditorRightPanel />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="z-40 flex h-[var(--status-bar-height)] flex-shrink-0 select-none items-center justify-between bg-[var(--ide-statusbar-bg)] px-3 text-[11px] text-[var(--ide-statusbar-text)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span className="opacity-80 font-mono">WORKSPACE:</span>
            <span>{activePagePath}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span>{props.storePage.deviceType === "mobile" ? "Mobile View" : "Desktop View"}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span>支持应用模板或者拖拽组件</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <EditorStatusBarActions />
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-default">
            <span>Powered by Codigo</span>
          </div>
        </div>
      </div>
    </div>
  );
});
