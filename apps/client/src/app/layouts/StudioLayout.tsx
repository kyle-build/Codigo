import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ConfigProvider, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import {
  EditOutlined,
  ApartmentOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import EditorHeader from "@/modules/editor/components/header";

export const StudioLayout = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      key: "/editor",
      label: "页面搭建",
      icon: <EditOutlined />,
    },
    {
      key: "/flow",
      label: "流程设计",
      icon: <ApartmentOutlined />,
    },
    {
      key: "/dataCount",
      label: "后台数据",
      icon: <LineChartOutlined />,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#10b981",
          colorBgContainer: "#ffffff",
          colorBorder: "#e2e8f0",
          colorText: "#0f172a",
          colorTextSecondary: "#64748b",
          borderRadius: 12,
        },
        components: {
          Button: {
            primaryShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
          },
          Layout: {
            bodyBg: "#f8fafc",
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
      <div className="flex flex-col h-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"></div>

        <header className="relative z-20 flex h-14 items-center border-b border-slate-200/80 bg-white/92 px-4 shadow-[0_16px_32px_-32px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <div className="w-full">
            <EditorHeader />
          </div>
        </header>

        <main className="relative z-10 flex flex-1 overflow-hidden">
          <aside className="z-20 flex h-full w-[88px] shrink-0 flex-col items-center border-r border-slate-200/80 bg-white/78 px-3 py-5 shadow-[12px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="flex w-full flex-col gap-3">
              {navItems.map((item) => {
                const active = location.pathname === item.key;

                return (
                  <Tooltip key={item.key} title={item.label} placement="right">
                    <button
                      onClick={() => navigate(item.key)}
                      className={`group relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 transition-all duration-200 ${
                        active
                          ? "bg-emerald-500/10 text-emerald-600 shadow-[0_18px_32px_-24px_rgba(16,185,129,0.65)] before:absolute before:left-0 before:top-1/4 before:h-1/2 before:w-1 before:rounded-r-full before:bg-emerald-500"
                          : "bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-600"
                      }`}
                    >
                      <span className="text-[18px] leading-none">
                        {item.icon}
                      </span>
                      <span className="text-[11px] font-medium">
                        {item.label}
                      </span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </aside>
          <div className="min-w-0 flex-1 relative bg-transparent">
            <Outlet />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
});
