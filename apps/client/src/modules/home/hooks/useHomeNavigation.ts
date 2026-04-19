import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { createElement, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks/useStoreAuth";

const navigationItems = [
  { label: "首页", path: "/" },
  { label: "模板广场", path: "/?view=templates" },
  { label: "物料广场", path: "/?view=materials" },
  { label: "开发文档", path: "/?view=doc" },
  { label: "应用管理", path: "/app-management?tab=published" },
  { label: "后台管理", path: "/console" },
] as const;

/** 提供首页导航与账户入口动作。 */
export function useHomeNavigation(options?: {
  onOpenProfile?: () => void;
  onOpenLogin?: () => void;
}) {
  const navigate = useNavigate();
  const { isLogin, logout, store } = useStoreAuth();
  const onOpenProfile = options?.onOpenProfile;
  const onOpenLogin = options?.onOpenLogin;

  const userMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "profile",
        icon: createElement(UserOutlined),
        label: "个人中心",
        onClick: () => {
          if (onOpenProfile) {
            onOpenProfile();
            return;
          }
          navigate("/?modal=profile");
        },
      },
      {
        key: "logout",
        icon: createElement(LogoutOutlined),
        label: "退出登录",
        onClick: () => {
          logout();
          navigate("/?modal=login");
        },
      },
    ],
    [logout, navigate, onOpenProfile],
  );

  return {
    avatarUrl: store.details?.head_img,
    isLoggedIn: isLogin.get(),
    navigationItems,
    userMenuItems,
    username: store.details?.username,
    openAppManagement: () => navigate("/app-management?tab=published"),
    openDashboard: () => navigate("/console"),
    openHome: () => navigate("/"),
    openLogin: () => {
      if (onOpenLogin) {
        onOpenLogin();
        return;
      }
      navigate("/?modal=login");
    },
    openRoute: (path: string) => navigate(path),
  };
}
