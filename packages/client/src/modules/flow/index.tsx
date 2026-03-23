import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { flowStore } from "./stores/flowStore";
import { Toolbar } from "./components/Toolbar";
import { Canvas } from "./components/Canvas";
import { PropsPanel } from "./components/PropsPanel";

export default observer(() => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        document.activeElement === document.body
      ) {
        flowStore.removeSelected();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-w-0 flex-1 flex-col h-full">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Canvas />
        <PropsPanel />
      </div>
      <div className="flex h-[30px] flex-shrink-0 items-center border-t border-zinc-200 bg-zinc-50 px-4 text-[11px] text-zinc-500">
        拖拽节点移动 · 拖拽节点右侧圆点连线 · Delete 键删除选中
      </div>
    </div>
  );
});
