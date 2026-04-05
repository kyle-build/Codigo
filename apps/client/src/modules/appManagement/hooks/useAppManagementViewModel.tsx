import { useMemo } from "react";
import {
  AppstoreOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type {
  AppManagementMetric,
  AppManagementNavItem,
} from "../types/appManagement";
import { templates } from "../utils/templatePresets";

interface UseAppManagementViewModelArgs {
  isLoggedIn: boolean;
  isUpdatedAfterPublish?: boolean;
  publicLoading: boolean;
  publicPagesCount: number;
  versionsCount: number;
}

export function useAppManagementViewModel({
  isLoggedIn,
  isUpdatedAfterPublish,
  publicLoading,
  publicPagesCount,
  versionsCount,
}: UseAppManagementViewModelArgs) {
  const metrics = useMemo<AppManagementMetric[]>(
    () =>
      isLoggedIn
        ? [
            {
              label: "草稿状态",
              value: isUpdatedAfterPublish ? "待发布更新" : "已同步",
            },
            {
              label: "历史版本",
              value: `${versionsCount} 个`,
            },
            {
              label: "模板数量",
              value: `${templates.length} 套`,
            },
          ]
        : [
            {
              label: "公开页面",
              value: publicLoading ? "加载中" : `${publicPagesCount} 个`,
            },
            {
              label: "模板数量",
              value: `${templates.length} 套`,
            },
            {
              label: "当前身份",
              value: "访客浏览",
            },
          ],
    [
      isLoggedIn,
      isUpdatedAfterPublish,
      publicLoading,
      publicPagesCount,
      versionsCount,
    ],
  );

  const navigationItems = useMemo<AppManagementNavItem[]>(
    () =>
      isLoggedIn
        ? [
            {
              key: "developing",
              label: "开发中",
              title: "开发中应用",
              description: "继续处理草稿、进入编辑器并保持与当前工作区同步。",
              icon: <EditOutlined />,
            },
            {
              key: "published",
              label: "已发布",
              title: "已发布应用",
              description: "查看对外可见的页面内容，快速核对线上展示状态。",
              icon: <EyeOutlined />,
            },
            {
              key: "versions",
              label: "版本历史",
              title: "历史版本",
              description: "回溯已发布记录，按版本查看每次发布的页面结构。",
              icon: <HistoryOutlined />,
            },
            {
              key: "templates",
              label: "模板库",
              title: "模板库",
              description: "浏览内置模板，预览页面结构并快速载入到编辑器。",
              icon: <AppstoreOutlined />,
            },
          ]
        : [
            {
              key: "published",
              label: "已发布",
              title: "已发布页面",
              description: "浏览公开页面内容，了解当前系统已上线的页面结构。",
              icon: <EyeOutlined />,
            },
            {
              key: "templates",
              label: "模板库",
              title: "模板库",
              description: "查看系统模板设计与组件结构，登录后可直接使用模板开发。",
              icon: <AppstoreOutlined />,
            },
          ],
    [isLoggedIn],
  );

  return {
    metrics,
    navigationItems,
  };
}
