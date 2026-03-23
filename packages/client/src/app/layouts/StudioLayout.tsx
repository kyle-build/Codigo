import { Outlet } from "react-router-dom";
import { ConfigProvider } from "antd";
import { observer } from "mobx-react-lite";
import EditorHeader from "@/modules/editor/components/header";

export const StudioLayout = observer(() => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#10b981", // emerald-500
          colorBgContainer: "#ffffff",
          colorBorder: "#e2e8f0", // slate-200
          colorText: "#0f172a", // slate-900
          colorTextSecondary: "#64748b", // slate-500
          borderRadius: 8,
        },
        components: {
          Button: {
            primaryShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
          },
          Layout: {
            bodyBg: "#f8fafc", // slate-50
            headerBg: "rgba(255, 255, 255, 0.8)",
            siderBg: "rgba(255, 255, 255, 0.5)",
          },
          Tabs: {
            itemColor: "#64748b",
            itemSelectedColor: "#10b981",
            itemHoverColor: "#10b981",
          },
        },
      }}
    >
      <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
        {/* Background Grid */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

        {/* 头部组件 */}
        <header className="relative z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 py-3">
          <EditorHeader />
        </header>

        <main className="relative z-10 flex flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </ConfigProvider>
  );
});
