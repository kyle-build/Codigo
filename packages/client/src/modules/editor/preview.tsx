import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { FloatButton } from "antd";
import { useNavigate } from "react-router-dom";
import { CaretLeftOutlined } from "@ant-design/icons";
import { generateComponent } from "./EditorCanvas";
import { useStoreComponents, useStorePage } from "@/shared/hooks";

const PreviewCanvas = observer(() => {
  const { store, getComponentById, localStorageInStore } = useStoreComponents();

  // 从本地或者服务端读取组件信息
  useEffect(() => {
    localStorageInStore();
  }, []);

  return (
    <div
      className="relative"
      style={{
        minHeight: `${Math.max(700, store.sortableCompConfig.length * 220)}px`,
      }}
    >
      {store.sortableCompConfig.map((id) => {
        const conf = getComponentById(id);
        if (!conf) return null;

        return (
          <div
            key={id}
            className="absolute"
            style={{
              left: conf.styles?.left as string | number | undefined,
              top: conf.styles?.top as string | number | undefined,
            }}
          >
            {generateComponent(conf)}
          </div>
        );
      })}
    </div>
  );
});

export default observer(function Preview() {
  // 返回编辑页面
  const nav = useNavigate();
  const { store } = useStorePage();

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      <div
        className={`bg-white text-left overflow-y-auto overflow-x-hidden shadow-2xl transition-all duration-300 ${
          store.deviceType === "mobile"
            ? "rounded-[30px] border-[8px] border-slate-800 scrollbar-hide"
            : "rounded-lg border border-slate-200"
        }`}
        style={{
          width: store.canvasWidth,
          height: store.canvasHeight,
        }}
      >
        {/* Mobile Status Bar Simulation */}
        {store.deviceType === "mobile" && (
          <div className="sticky top-0 z-50 h-6 bg-black/90 text-white text-[10px] flex items-center justify-between px-4 font-mono">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
            </div>
          </div>
        )}
        {/* 预览的组件页面 */}
        <PreviewCanvas />
        {/* 返回按钮 */}
        <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
      </div>
    </div>
  );
});
