import { AppstoreOutlined, FileTextOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import EditorLeftPanel from "../leftPanel";
import EditorPageManager from "../pageManager";
import EditorRightPanel from "../rightPanel";
import { EditorOutlineTree } from "../rightPanel/ComponentFields";
import EditorCanvas from "../canvas";
import { SandboxCanvas } from "../canvas/SandboxCanvas";
import { WebIDECanvas } from "../canvas/WebIDECanvas";
import { useEditorPanelLayout } from "./useEditorPanelLayout";
import {
  LEFT_PANEL_CONTENT_WIDTH,
  LEFT_PANEL_RAIL_WIDTH,
} from "./layout";
import type { TStoreComponents, TStorePage } from "@/shared/stores";

interface EditorViewportProps {
  storeComps: TStoreComponents;
  storePage: TStorePage;
  canvasRef: RefObject<any>;
}

type LeftPanelSection = "pages" | "components";

function PanelResizeHandle({
  side,
  lineClassName,
  gripClassName,
  onPointerDown,
}: {
  side: "left" | "right";
  lineClassName: string;
  gripClassName: string;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`调整${side === "left" ? "左侧" : "右侧"}边栏宽度`}
      onPointerDown={onPointerDown}
      className="group relative z-20 w-2.5 shrink-0 cursor-col-resize bg-transparent touch-none"
    >
      <div
        className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-200 transition-colors ${lineClassName}`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-12 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300/70 transition-all group-hover:h-16 ${gripClassName}`}
      />
    </div>
  );
}

function EditorStage({
  storeComps,
  storePage,
  canvasRef,
}: EditorViewportProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = canvasContainerRef.current;
    if (!target) {
      return;
    }

    let scrollTimeout: number | null = null;

    const handleScroll = () => {
      if (scrollTimeout !== null) {
        window.clearTimeout(scrollTimeout);
      }

      canvasRef.current?.setShowToolbar(false);
      scrollTimeout = window.setTimeout(() => {
        canvasRef.current?.setShowToolbar(true);
      }, 300);
    };

    target.addEventListener("scroll", handleScroll);

    return () => {
      target.removeEventListener("scroll", handleScroll);
      if (scrollTimeout !== null) {
        window.clearTimeout(scrollTimeout);
      }
    };
  }, [canvasRef]);

  if (storePage.editorMode === "code") {
    return (
      <div className="relative z-10 h-full w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)]">
        <SandboxCanvas />
      </div>
    );
  }

  if (storePage.editorMode === "webide") {
    return (
      <div className="relative z-10 h-full w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)]">
        <WebIDECanvas />
      </div>
    );
  }

  return (
    <div
      ref={canvasContainerRef}
      className={`editor-canvas-container relative z-10 overflow-y-auto overflow-x-hidden bg-white text-left ring-1 ring-slate-900/5 transition-all duration-500 ease-out ${
        storePage.deviceType === "mobile"
          ? "rounded-[42px] border-[12px] border-slate-900 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.45)]"
          : "rounded-[24px] shadow-[0_28px_70px_-42px_rgba(15,23,42,0.45)] hover:shadow-[0_30px_80px_-42px_rgba(15,23,42,0.52)]"
      }`}
      style={{
        width: storePage.canvasWidth,
        height: storePage.canvasHeight,
        maxHeight: "100%",
      }}
    >
      {storePage.deviceType === "mobile" && (
        <div className="sticky top-0 z-50 flex h-7 items-center justify-between bg-slate-900 px-6 text-[11px] font-medium tracking-wider text-white select-none">
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

export function EditorViewport(props: EditorViewportProps) {
  const { leftPanelWidth, rightPanelWidth, startResize } =
    useEditorPanelLayout();
  const [activeLeftSection, setActiveLeftSection] =
    useState<LeftPanelSection>("components");
  const outlinePanelWidth =
    leftPanelWidth - LEFT_PANEL_RAIL_WIDTH - LEFT_PANEL_CONTENT_WIDTH;
  const leftSectionItems: Array<{
    key: LeftPanelSection;
    label: string;
    icon: ReactNode;
  }> = [
    {
      key: "pages",
      label: "页面",
      icon: <FileTextOutlined className="text-base" />,
    },
    {
      key: "components",
      label: "组件",
      icon: <AppstoreOutlined className="text-base" />,
    },
  ];

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#F8FAFC]">
      <div
        className="flex shrink-0 overflow-hidden border-r border-slate-200/80 bg-white/88 text-[13px] shadow-[14px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-[width] duration-150"
        style={{ width: leftPanelWidth }}
      >
        <div
          className="flex h-full shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/75 px-2.5 py-3"
          style={{ width: LEFT_PANEL_RAIL_WIDTH }}
        >
          <div className="mb-3 px-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            菜单
          </div>
          <div className="flex flex-col gap-2">
            {leftSectionItems.map((item) => {
              const isActive = item.key === activeLeftSection;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveLeftSection(item.key)}
                  className={`flex flex-col items-center gap-1.5 rounded-[18px] px-2 py-3 transition ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-[0_20px_36px_-26px_rgba(16,185,129,0.9)]"
                      : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                      isActive ? "bg-white/15" : "bg-white text-emerald-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="min-h-0 shrink-0 px-3 py-3"
          style={{ width: LEFT_PANEL_CONTENT_WIDTH }}
        >
          {activeLeftSection === "pages" ? (
            <EditorPageManager embedded />
          ) : (
            <EditorLeftPanel embedded />
          )}
        </div>

        <div
          className="min-h-0 shrink-0 border-l border-slate-200/80 px-3 py-3"
          style={{ width: outlinePanelWidth }}
        >
          <EditorOutlineTree />
        </div>
      </div>

      <PanelResizeHandle
        side="left"
        lineClassName="group-hover:bg-emerald-400 group-active:bg-emerald-500"
        gripClassName="group-hover:bg-emerald-400/80 group-active:bg-emerald-500"
        onPointerDown={startResize("left")}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:20px_20px] opacity-32 pointer-events-none" />
        <div className="absolute left-8 top-12 h-36 w-36 rounded-full bg-emerald-400/10 blur-[96px] pointer-events-none" />
        <div className="absolute bottom-8 right-12 h-44 w-44 rounded-full bg-sky-400/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex-1 px-5 pb-5 pt-3">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/70 bg-white/40 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.65)] backdrop-blur-xl">
            <div className="relative min-h-0 flex-1 overflow-auto p-5">
              <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/8 blur-[108px] pointer-events-none" />
              <div className="relative z-10 flex min-h-full min-w-full items-start justify-center">
                <EditorStage {...props} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PanelResizeHandle
        side="right"
        lineClassName="group-hover:bg-sky-400 group-active:bg-sky-500"
        gripClassName="group-hover:bg-sky-400/80 group-active:bg-sky-500"
        onPointerDown={startResize("right")}
      />

      <div
        className="flex shrink-0 flex-col border-l border-slate-200/80 bg-white/88 text-[13px] shadow-[-14px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-[width] duration-150"
        style={{ width: rightPanelWidth }}
      >
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <EditorRightPanel />
        </div>
      </div>
    </div>
  );
}
