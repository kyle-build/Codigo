import { AppstoreOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import type { IUser } from "@codigo/schema";
import { Avatar, Dropdown, Space } from "antd";

interface AdminAccountDropdownProps {
  onBackToWorkbench: () => void;
  onLogout: () => void;
  user: IUser;
}

export function AdminAccountDropdown({
  onBackToWorkbench,
  onLogout,
  user,
}: AdminAccountDropdownProps) {
  return (
    <Dropdown
      placement="bottomRight"
      menu={{
        items: [
          {
            icon: <AppstoreOutlined />,
            key: "back",
            label: "返回工作台",
            onClick: onBackToWorkbench,
          },
          {
            icon: <LogoutOutlined />,
            key: "logout",
            label: "退出登录",
            onClick: onLogout,
          },
        ],
      }}
    >
      <Space className="cursor-pointer">
        <Avatar
          src={user.head_img}
          icon={!user.head_img && <UserOutlined />}
          className={!user.head_img ? "bg-emerald-500" : ""}
        />
        <span className="text-sm">{user.username}</span>
        <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
          {user.global_role === "SUPER_ADMIN" ? "超管" : "管理员"}
        </span>
      </Space>
    </Dropdown>
  );
}
