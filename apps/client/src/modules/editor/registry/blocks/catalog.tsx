import {
  BarsOutlined,
  DashboardOutlined,
  LayoutOutlined,
  TableOutlined,
} from "@ant-design/icons";
import type { EditorBlockMeta } from "./types";

export const editorBlockCatalog: EditorBlockMeta[] = [
  {
    id: "page_table",
    name: "列表页骨架",
    description: "页面头 + 搜索区 + 表格",
    icon: <TableOutlined />,
    sectionKey: "data",
    anchorType: "dataTable",
    nodes: [
      {
        type: "pageHeader",
        styles: { width: "100%", height: "72px" },
      },
      {
        type: "queryFilter",
        styles: { width: "100%", height: "140px" },
      },
      {
        type: "dataTable",
        styles: { width: "100%", height: "420px" },
      },
    ],
  },
  {
    id: "stats_row",
    name: "统计区块",
    description: "一行统计卡片",
    icon: <DashboardOutlined />,
    sectionKey: "stats",
    anchorType: "statCard",
    nodes: [
      {
        type: "statCard",
        styles: { width: "100%", height: "120px" },
      },
    ],
  },
  {
    id: "two_column_list_detail",
    name: "双栏：列表 + 详情",
    description: "左侧列表、右侧卡片详情",
    icon: <LayoutOutlined />,
    sectionKey: "layout",
    anchorType: "twoColumn",
    nodes: [
      {
        type: "twoColumn",
        props: { showChrome: false, gap: 16, leftWidth: "38%" },
        styles: { width: "100%", height: "520px" },
        children: [
          {
            type: "list",
            slot: "left",
            styles: { width: "100%", height: "100%" },
          },
          {
            type: "card",
            slot: "right",
            styles: { width: "100%", height: "100%" },
            children: [
              {
                type: "titleText",
                styles: { width: "100%" },
              },
              {
                type: "richText",
                styles: { width: "100%" },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tabs_skeleton",
    name: "Tab 内容骨架",
    description: "视图组（Tab）+ 当前视图占位",
    icon: <BarsOutlined />,
    sectionKey: "layout",
    anchorType: "viewGroup",
    nodes: [
      {
        type: "viewGroup",
        props: {
          containers: [
            { id: "__view_1__", name: "Tab 1" },
            { id: "__view_2__", name: "Tab 2" },
          ],
          defaultActiveId: "__view_1__",
          contentUseGrid: false,
          minHeight: 360,
        },
        styles: { width: "100%", height: "420px" },
        children: [
          {
            type: "empty",
            slot: "__view_1__",
            styles: { width: "100%", height: "100%" },
          },
        ],
      },
    ],
  },
];
