import { createRef, useEffect, useRef, useState } from "react";
import { useTitle } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";

import EditorLeftPanel from "./components/leftPanel";
import EditorRightPanel from "./components/rightPanel";
import EditorCanvas from "./components/canvas";
import { SandboxCanvas } from "./components/canvas/SandboxCanvas";

import { useStoreComponents, useStorePage, useStorePermission, useStoreAuth } from "@/shared/hooks";
import { getLowCodePage } from "@/modules/editor/api/low-code";

const Editor = observer(() => {
  useTitle("codigo - 页面编辑");
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));

  const { store: storeComps, loadPageData } = useStoreComponents();
  const { store: storePage } = useStorePage();
  const { initCollaboration, cleanupCollaboration } = useStorePermission();
  const { store: storeAuth } = useStoreAuth();

  //  创建容器用于调用子组件的函数
  const canvasRef = createRef<any>();
  // 创建容器绑定 dom 用于监听滚动事件
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [scrolling, setScrolling] = useState(false);

  // 从本地缓存或者服务端获取上一次配置的页面组件
  useEffect(() => {
    loadPageData(getLowCodePage);
  }, []);

  // 初始化协作
  useEffect(() => {
    if (pageId && storeAuth.details?.id) {
      initCollaboration(pageId, storeAuth.details.id, storeAuth.details.username || "User");
    }
    return () => {
      if (pageId && storeAuth.details?.id) {
        cleanupCollaboration(pageId, storeAuth.details.id);
      }
    };
  }, [pageId, storeAuth.details]);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    // 定义滚动事件处理函数
    const handleScroll = () => {
      // 如果正在滚动中则清除滚动计时
      if (scrolling) clearTimeout(scrollTimeout);

      setScrolling(true);
      // 滚动时隐藏小工具栏
      canvasRef.current?.setShowToolbar(false);

      // 一个特殊的小技巧判断是否有没有滚动完毕
      // 在30ms内没有滚动则认为滚动完毕
      scrollTimeout = setTimeout(() => {
        // 滚动完毕后将状态设置回来
        setScrolling(false);
        // 滚动完毕后将小工具栏显示出来
        canvasRef.current.setShowToolbar(true);
      }, 300);
    };

    // 绑定滚动事件监听器到画布容器元素
    canvasContainerRef.current?.addEventListener("scroll", handleScroll);

    // 组件销毁时，清除滚动事件监听器和滚动超时的函数
    return () => {
      canvasContainerRef.current?.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [scrolling]);

  return (
    <div className="flex h-full w-full overflow-hidden relative bg-[#F8FAFC]">
      {/* 左侧面板：更紧凑、专业的侧边栏 */}
      <div className="w-[280px] shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur-xl flex flex-col shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-20 transition-all duration-300 ease-in-out">
        <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-slate-200/60 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <EditorLeftPanel />
        </div>
      </div>

      {/* 中间画布区域：带有点阵背景的沉浸式工作区 */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
          {/* 优化后的 Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/5 blur-[100px] rounded-full pointer-events-none"></div>

          {storePage.editorMode === "code" ? (
            <div className="w-full h-full rounded-xl border border-slate-200/80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 bg-white/95 backdrop-blur-sm transition-all duration-300">
              <SandboxCanvas />
            </div>
          ) : (
            <div
              ref={canvasContainerRef}
              className={`editor-canvas-container relative z-10 bg-white text-left overflow-y-auto overflow-x-hidden transition-all duration-500 ease-out ring-1 ring-slate-900/5 ${
                storePage.deviceType === "mobile"
                  ? "rounded-[40px] border-[12px] border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]"
                  : "rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]"
              }`}
              style={{
                width: storePage.canvasWidth,
                height: storePage.canvasHeight,
                maxHeight: "100%",
              }}
            >
              {/* Mobile Status Bar Simulation */}
              {storePage.deviceType === "mobile" && (
                <div className="sticky top-0 z-50 h-7 bg-slate-900 text-white text-[11px] flex items-center justify-between px-6 font-medium tracking-wider select-none">
                  <span>9:41</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-3.5 h-3.5 bg-white/90 rounded-sm"></div>
                    <div className="w-3.5 h-3.5 bg-white/90 rounded-full"></div>
                    <div className="w-4 h-2.5 bg-white/90 rounded-sm"></div>
                  </div>
                </div>
              )}
              <EditorCanvas store={storeComps} onRef={canvasRef} />
            </div>
          )}
        </div>
      </div>

      {/* 右侧面板：属性配置区 */}
      <div className="w-[320px] shrink-0 border-l border-slate-200 bg-white/90 backdrop-blur-xl flex flex-col shadow-[-2px_0_8px_-4px_rgba(0,0,0,0.05)] z-20 transition-all duration-300 ease-in-out">
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <EditorRightPanel />
        </div>
      </div>
    </div>
  );
});

export default Editor;
