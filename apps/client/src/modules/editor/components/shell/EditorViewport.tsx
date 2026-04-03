import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import EditorLeftPanel from "../leftPanel";
import EditorRightPanel from "../rightPanel";
import EditorCanvas from "../canvas";
import { SandboxCanvas } from "../canvas/SandboxCanvas";
import { WebIDECanvas } from "../canvas/WebIDECanvas";
import { useEditorPanelLayout } from "./useEditorPanelLayout";
import type { TStoreComponents, TStorePage } from "@/shared/stores";

interface EditorViewportProps {
  storeComps: TStoreComponents;
  storePage: TStorePage;
  canvasRef: RefObject<any>;
}

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

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#F8FAFC]">
      <div
        className="flex shrink-0 flex-col border-r border-slate-200/80 bg-white/88 px-3 py-3 text-[13px] shadow-[14px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-[width] duration-150"
        style={{ width: leftPanelWidth }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200/60 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <EditorLeftPanel />
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
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-5">
              <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/8 blur-[108px] pointer-events-none" />
              <EditorStage {...props} />
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
