import {
  ApartmentOutlined,
  DownOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const workspaceItems = [
  {
    key: "/editor",
    icon: <EditOutlined />,
    label: "页面编辑",
  },
  {
    key: "/flow",
    icon: <ApartmentOutlined />,
    label: "流程编排",
  },
];

/** 根据当前路径返回激活中的工作区配置。 */
function getActiveWorkspace(pathname: string) {
  return workspaceItems.find((item) => pathname.startsWith(item.key)) ?? workspaceItems[0];
}

/** 渲染 Studio 左上角的工作区切换菜单。 */
export function WorkspaceSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeWorkspace = getActiveWorkspace(location.pathname);

  const menuItems: MenuProps["items"] = workspaceItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => navigate(item.key),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems, selectedKeys: [activeWorkspace.key] }}
      placement="bottomLeft"
      trigger={["click"]}
    >
      <button className="flex h-6 items-center gap-2 rounded-sm border border-[#3c3c3c] bg-[#3c3c3c] px-2 text-[12px] font-medium text-[#cccccc] transition-colors hover:bg-[#454545] hover:border-[#555555]">
        <span className="text-xs leading-none text-[#0e639c]">
          {activeWorkspace.icon}
        </span>
        <span>{activeWorkspace.label}</span>
        <DownOutlined className="text-[8px] text-[#858585]" />
      </button>
    </Dropdown>
  );
}
