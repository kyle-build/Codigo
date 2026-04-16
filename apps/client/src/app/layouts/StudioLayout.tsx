import { Outlet } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { observer } from "mobx-react-lite";
import EditorHeader from "@/modules/editor/components/header";

export const StudioLayout = observer(() => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#0e639c",
          colorBgContainer: "#1e1e1e",
          colorBgLayout: "#1e1e1e",
          colorBorder: "#3c3c3c",
          colorText: "#cccccc",
          colorTextSecondary: "#858585",
          borderRadius: 2,
          fontSize: 13,
        },
        components: {
          Button: {
            borderRadius: 2,
            controlHeight: 28,
          },
          Layout: {
            bodyBg: "#1e1e1e",
            headerBg: "#2d2d2d",
            siderBg: "#252526",
          },
          Tabs: {
            itemColor: "#858585",
            itemSelectedColor: "#ffffff",
            itemHoverColor: "#cccccc",
            cardBg: "#2d2d2d",
            headerBg: "#252526",
          },
        },
      }}
    >
      <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] overflow-hidden font-sans">
        <header className="relative z-20 flex h-[35px] items-center border-b border-[#3c3c3c] bg-[#2d2d2d] px-2 shadow-sm">
          <div className="w-full">
            <EditorHeader />
          </div>
        </header>

        <main className="relative z-10 flex flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 relative">
            <Outlet />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
});
