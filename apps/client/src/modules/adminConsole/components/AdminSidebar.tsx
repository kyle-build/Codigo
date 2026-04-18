import {
  AreaChartOutlined,
  BarChartOutlined,
  CodeOutlined,
  DashboardOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";

type AdminNavItem = {
  key: string;
  label: string;
  to: string;
  icon: React.ReactNode;
};

const items: AdminNavItem[] = [
  { key: "dashboard", label: "概览", to: "/console", icon: <DashboardOutlined /> },
  { key: "settings", label: "基础设置", to: "/console/settings", icon: <SettingOutlined /> },
  {
    key: "permissions",
    label: "权限设置",
    to: "/console/permissions",
    icon: <SafetyCertificateOutlined />,
  },
  { key: "roles", label: "角色管理", to: "/console/roles", icon: <TeamOutlined /> },
  { key: "versions", label: "版本管理", to: "/console/versions", icon: <HistoryOutlined /> },
  { key: "snippets", label: "代码片段管理", to: "/console/snippets", icon: <CodeOutlined /> },
  { key: "big-screen", label: "数据大屏", to: "/console/big-screen", icon: <AreaChartOutlined /> },
  { key: "metrics", label: "指标统计", to: "/console/metrics", icon: <BarChartOutlined /> },
];

/** 页面管理工作台侧边栏：聚合页面搭建者模块入口（暂不提供 npm 包管理）。 */
export default function AdminSidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-2">
        <div className="text-[11px] font-medium tracking-wide text-[var(--ide-text-muted)]">
          工作台
        </div>
      </div>
      <nav className="flex-1 overflow-auto px-2 pb-2">
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === "/console"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-[12px] transition-colors",
                  isActive
                    ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                    : "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
                ].join(" ")
              }
            >
              <span className="text-[13px] text-[var(--ide-text-muted)]">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="border-t border-[var(--ide-border)] p-2">
        <div className="text-[11px] leading-5 text-[var(--ide-text-muted)]">
          建议先从“开发文档”了解流程，再进入“编辑器”搭建页面。
        </div>
      </div>
    </div>
  );
}
