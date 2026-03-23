import { Tabs } from "antd";
import { AppstoreOutlined, EditOutlined, ApartmentOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import ComponentList from "./components/leftPanel/ComponentList";

export default function EdiotLeftPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      key: "/editor",
      label: "Editor",
      icon: <EditOutlined />,
    },
    {
      key: "/flow",
      label: "Flow",
      icon: <ApartmentOutlined />,
    },
  ];

  const items = [
    {
      key: "component-list",
      label: (
        <>
          <AppstoreOutlined /> <span>组件列表</span>
        </>
      ),
      /**
       * 不同组件列表
       */
      children: <ComponentList />,
    },
  ];

  return (
    <div className="flex h-full">
      <div className="mr-3 flex w-16 flex-shrink-0 flex-col gap-2 border-r border-slate-200 pr-3">
        {navItems.map((item) => {
          const active = location.pathname === item.key;

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`group flex h-14 flex-col items-center justify-center rounded-lg border text-[10px] font-medium transition-all ${
                active
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="mt-1 leading-none">{item.label}</span>
              <span className="mt-0.5 leading-none text-[9px] opacity-80">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>
      <div className="min-w-0 flex-1">
        <Tabs defaultActiveKey="component-list" items={items} />
      </div>
    </div>
  );
}












