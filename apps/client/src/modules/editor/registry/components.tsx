import {
  ApartmentOutlined,
  BarChartOutlined,
  BarsOutlined,
  BorderOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EditOutlined,
  ExpandOutlined,
  FilterOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  FormOutlined,
  FundViewOutlined,
  LayoutOutlined,
  LineChartOutlined,
  MinusOutlined,
  PieChartOutlined,
  PlaySquareOutlined,
  SplitCellsOutlined,
  TableOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { PageCategory, TComponentTypes } from "@codigo/schema";
import type { ReactNode } from "react";

export type EditorComponentSectionKey = "admin" | "basic" | "form" | "report";

export interface EditorComponentMeta {
  type: TComponentTypes;
  name: string;
  icon: ReactNode;
  sectionKey: EditorComponentSectionKey;
  quickInsert?: boolean;
  hiddenFromPalette?: boolean;
  codeSync?: boolean;
}

export interface EditorComponentSection {
  key: EditorComponentSectionKey;
  label: string;
  items: EditorComponentMeta[];
}

const sectionLabelMap: Record<EditorComponentSectionKey, string> = {
  admin: "后台",
  basic: "基础",
  form: "表单",
  report: "报表",
};

export const editorComponentCatalog: EditorComponentMeta[] = [
  {
    type: "breadcrumbBar",
    name: "面包屑",
    icon: <ApartmentOutlined />,
    sectionKey: "admin",
  },
  {
    type: "pageHeader",
    name: "页面头",
    icon: <BarsOutlined />,
    sectionKey: "admin",
  },
  {
    type: "queryFilter",
    name: "搜索区",
    icon: <FilterOutlined />,
    sectionKey: "admin",
  },
  {
    type: "statCard",
    name: "统计卡片",
    icon: <DashboardOutlined />,
    sectionKey: "admin",
  },
  {
    type: "cardGrid",
    name: "卡片网格",
    icon: <CreditCardOutlined />,
    sectionKey: "admin",
  },
  {
    type: "dataTable",
    name: "数据表格",
    icon: <TableOutlined />,
    sectionKey: "admin",
  },
  {
    type: "container",
    name: "容器",
    icon: <LayoutOutlined />,
    sectionKey: "basic",
  },
  {
    type: "twoColumn",
    name: "双栏布局",
    icon: <LayoutOutlined />,
    sectionKey: "basic",
  },
  {
    type: "button",
    name: "按钮",
    icon: <BorderOutlined />,
    sectionKey: "basic",
    quickInsert: true,
  },
  {
    type: "video",
    name: "视频",
    icon: <PlaySquareOutlined />,
    sectionKey: "basic",
  },
  {
    type: "swiper",
    name: "轮播",
    icon: <SplitCellsOutlined />,
    sectionKey: "basic",
  },
  {
    type: "card",
    name: "卡片",
    icon: <CreditCardOutlined />,
    sectionKey: "basic",
  },
  {
    type: "list",
    name: "列表",
    icon: <UnorderedListOutlined />,
    sectionKey: "basic",
  },
  {
    type: "image",
    name: "图片",
    icon: <FundViewOutlined />,
    sectionKey: "basic",
    quickInsert: true,
  },
  {
    type: "titleText",
    name: "文本",
    icon: <FontSizeOutlined />,
    sectionKey: "basic",
    quickInsert: true,
  },
  {
    type: "split",
    name: "分割",
    icon: <MinusOutlined />,
    sectionKey: "basic",
  },
  {
    type: "richText",
    name: "富文本",
    icon: <FontColorsOutlined />,
    sectionKey: "basic",
  },
  {
    type: "empty",
    name: "空状态",
    icon: <ExpandOutlined />,
    sectionKey: "basic",
  },
  {
    type: "alert",
    name: "警告",
    icon: <WarningOutlined />,
    sectionKey: "basic",
  },
  {
    type: "input",
    name: "输入框",
    icon: <EditOutlined />,
    sectionKey: "form",
  },
  {
    type: "textArea",
    name: "文本域",
    icon: <FormOutlined />,
    sectionKey: "form",
  },
  {
    type: "radio",
    name: "单选框",
    icon: <CheckCircleOutlined />,
    sectionKey: "form",
  },
  {
    type: "checkbox",
    name: "多选框",
    icon: <CheckSquareOutlined />,
    sectionKey: "form",
  },
  {
    type: "statistic",
    name: "统计指标",
    icon: <DashboardOutlined />,
    sectionKey: "report",
  },
  {
    type: "table",
    name: "表格",
    icon: <TableOutlined />,
    sectionKey: "report",
  },
  {
    type: "barChart",
    name: "柱状图",
    icon: <BarChartOutlined />,
    sectionKey: "report",
  },
  {
    type: "lineChart",
    name: "折线图",
    icon: <LineChartOutlined />,
    sectionKey: "report",
  },
  {
    type: "pieChart",
    name: "饼图",
    icon: <PieChartOutlined />,
    sectionKey: "report",
  },
];

export const editorComponentMap = Object.fromEntries(
  editorComponentCatalog.map((item) => [item.type, item]),
) as Record<TComponentTypes, EditorComponentMeta>;

const sectionOrder: EditorComponentSectionKey[] = [
  "admin",
  "basic",
  "form",
  "report",
];

export function getEditorComponentSections(pageCategory: PageCategory) {
  const orderedSectionKeys: EditorComponentSectionKey[] =
    pageCategory === "admin"
      ? sectionOrder
      : [...sectionOrder.filter((key) => key !== "admin"), "admin"];

  return orderedSectionKeys.map((key) => ({
    key,
    label: sectionLabelMap[key],
    items: editorComponentCatalog.filter(
      (item) => item.sectionKey === key && !item.hiddenFromPalette,
    ),
  })) as EditorComponentSection[];
}

export function findEditorComponent(type?: string | null) {
  if (!type) {
    return null;
  }

  return editorComponentMap[type as TComponentTypes] ?? null;
}

export const quickInsertComponents = editorComponentCatalog
  .filter((item) => item.quickInsert)
  .map((item) => ({
    type: item.type,
    label: item.name,
  }));

export const codeSyncComponentTypes = editorComponentCatalog
  .filter((item) => item.codeSync ?? true)
  .map((item) => item.type);
