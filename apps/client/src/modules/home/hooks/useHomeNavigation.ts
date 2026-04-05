import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { createElement, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks/useStoreAuth";

const navigationItems = [
  { label: "应用管理", path: "/app-management?tab=published" },
  { label: "数据看板", path: "/dataCount" },
  { label: "开发文档", path: "/doc" },
] as const;

/** 提供首页导航与账户入口动作。 */
export function useHomeNavigation() {
  const navigate = useNavigate();
  const { isLogin, logout, store } = useStoreAuth();

  const userMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "profile",
        icon: createElement(UserOutlined),
        label: "个人中心",
        onClick: () => navigate("/profile"),
      },
      {
        key: "logout",
        icon: createElement(LogoutOutlined),
        label: "退出登录",
        onClick: () => {
          logout();
          navigate("/login");
        },
      },
    ],
    [logout, navigate],
  );

  return {
    avatarUrl: store.details?.head_img,
    isLoggedIn: isLogin.get(),
    navigationItems,
    userMenuItems,
    username: store.details?.username,
    openAppManagement: () => navigate("/app-management?tab=published"),
    openDashboard: () => navigate("/dataCount"),
    openHome: () => navigate("/"),
    openLogin: () => navigate("/login"),
    openRoute: (path: string) => navigate(path),
  };
}
