import { createRef, useEffect, useRef, useState } from "react";
import { useTitle } from "ahooks";
import { observer } from "mobx-react-lite";

import EditorLeftPanel from "./EditorLeftPanel";
import EditorRightPanel from "./EditorRightPanel";
import EditorCanvas from "./EditorCanvas";

import { useStoreComponents, useStorePage } from "@/shared/hooks";

const Editor = observer(() => {
  useTitle("codigo - 页面编辑");
  const { store: storeComps, localStorageInStore } = useStoreComponents();
  const { store: storePage } = useStorePage();

  //  创建容器用于调用子组件的函数
  const canvasRef = createRef<any>();
  // 创建容器绑定 dom 用于监听滚动事件
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [scrolling, setScrolling] = useState(false);

  // 从本地缓存或者服务端获取上一次配置的页面组件
  useEffect(() => {
    localStorageInStore();
  }, []);

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
    <>
      {/* 左侧编辑组件 */}
      <div
        className={`w-80 border-r border-slate-200 bg-white/60 backdrop-blur-md px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent`}
      >
        <EditorLeftPanel />
      </div>

      {/* 中间编辑组件 */}
      <div className="flex-auto flex items-center justify-center bg-slate-100/50 relative overflow-auto p-8">
        {/* Canvas Glow Effect */}
        <div className="absolute w-[400px] h-[720px] bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div
          ref={canvasContainerRef}
          className={`editor-canvas-container relative z-10 bg-white text-left overflow-y-auto overflow-x-hidden shadow-2xl transition-all duration-300 ${
            storePage.deviceType === "mobile"
              ? "rounded-[30px] border-[8px] border-slate-800"
              : "rounded-lg border border-slate-200"
          }`}
          style={{
            width: storePage.canvasWidth,
            height: storePage.canvasHeight,
          }}
        >
          {/* Mobile Status Bar Simulation */}
          {storePage.deviceType === "mobile" && (
            <div className="sticky top-0 z-50 h-6 bg-black/90 text-white text-[10px] flex items-center justify-between px-4 font-mono">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                <div className="w-3 h-3 bg-white/20 rounded-full"></div>
              </div>
            </div>
          )}
          <EditorCanvas store={storeComps} onRef={canvasRef} />
        </div>
      </div>

      {/* 右侧编辑组件 */}
      <div
        className={`w-80 border-l border-slate-200 bg-white/60 backdrop-blur-md px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent`}
      >
        <EditorRightPanel />
      </div>
    </>
  );
});

export default Editor;












