import {
  AppstoreOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { AdminPermission } from "@codigo/schema";
import type { ReactNode } from "react";

export interface AdminNavigationItem {
  icon: ReactNode;
  key: string;
  label: string;
  permission: AdminPermission;
}

export const adminNavigationItems: AdminNavigationItem[] = [
  {
    icon: <UserOutlined />,
    key: "users",
    label: "用户管理",
    permission: "USER_MANAGE",
  },
  {
    icon: <SafetyCertificateOutlined />,
    key: "permissions",
    label: "权限分配",
    permission: "PERMISSION_ASSIGN",
  },
  {
    icon: <AppstoreOutlined />,
    key: "pages",
    label: "页面管理",
    permission: "PAGE_MANAGE",
  },
  {
    icon: <AppstoreOutlined />,
    key: "components",
    label: "组件管理",
    permission: "COMPONENT_MANAGE",
  },
];

export function resolveAdminDefaultRoute(
  hasAdminPermission: (permission: AdminPermission) => boolean,
) {
  const target = adminNavigationItems.find((item) =>
    hasAdminPermission(item.permission),
  );

  return target ? `/${target.key}` : "/login";
}
