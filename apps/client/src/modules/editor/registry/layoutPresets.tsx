import {
  ApartmentOutlined,
  DashboardOutlined,
  LayoutOutlined,
} from "@ant-design/icons";
import type { PageCategory } from "@codigo/schema";
import type { PageLayoutPresetMeta } from "./types";

export const pageLayoutPresetCatalog: PageLayoutPresetMeta[] = [
  {
    key: "sectionStack",
    name: "分区布局",
    description: "适合详情、配置、审批等后台页面的三段式骨架",
    icon: <LayoutOutlined />,
  },
  {
    key: "sidebarLayout",
    name: "侧栏布局",
    description: "适合菜单切换、主从视图与设置中心的后台骨架",
    icon: <ApartmentOutlined />,
  },
  {
    key: "dashboardLayout",
    name: "工作台布局",
    description: "适合管理系统首页的信息总览、筛选和操作区",
    icon: <DashboardOutlined />,
    categories: ["admin"],
  },
];

export function getPageLayoutPresets(pageCategory: PageCategory) {
  return pageLayoutPresetCatalog.filter((item) => {
    return !item.categories?.length || item.categories.includes(pageCategory);
  });
}
