import {
  ContainerComponent as LowCodeContainer,
  TwoColumnComponent as LowCodeTwoColumn,
  AccordionComponent as LowCodeAccordion,
  ButtonComponent as LowCodeButton,
  BreadcrumbBarComponent as LowCodeBreadcrumbBar,
  PageHeaderComponent as LowCodePageHeader,
  QueryFilterComponent as LowCodeQueryFilter,
  StatCardComponent as LowCodeStatCard,
  CardGridComponent as LowCodeCardGrid,
  DataTableComponent as LowCodeDataTable,
  CardComponent as LowCodeCard,
  ImageComponent as LowCodeImage,
  AvatarComponent as LowCodeAvatar,
  ListComponent as LowCodeList,
  StatisticComponent as LowCodeStatistic,
  SwiperComponent as LowCodeSwiper,
  TableComponent as LowCodeTable,
  VideoComponent as LowCodeVideo,
  TextComponent as LowCodeText,
  SplitComponent as LowCodeSplit,
  EmptyComponent as LowCodeEmpty,
  RichTextComponent as LowCodeRichText,
  QrcodeComponent as LowCodeQrcode,
  AlertComponent as LowCodeAlert,
  InputComponent as LowCodeInput,
  TextAreaComponent as LowCodeTextArea,
  RadioComponent as LowCodeRadio,
  CheckboxComponent as LowCodeCheckbox,
  BarChartComponent as LowCodeBarChart,
  LineChartComponent as LowCodeLineChart,
  PieChartComponent as LowCodePieChart,
} from ".";
import type { ComponentType } from "react";
import type { TComponentTypes } from "@codigo/schema";
import {
  registerComponent,
  type IComponentPlugin,
} from "@codigo/plugin-system";
import { initBuiltinEChartsThemes } from "../utils/echartsTheme";

type BuiltinComponentDefinition = IComponentPlugin<
  TComponentTypes,
  Record<string, any>,
  ComponentType<any>
>;

export const builtinComponentDefinitions: BuiltinComponentDefinition[] = [
  {
    type: "container",
    name: "Container",
    defaultConfig: {} as any,
    render: LowCodeContainer,
    isContainer: true,
    slots: [{ name: "default", title: "默认区域", multiple: true }],
  },
  {
    type: "twoColumn",
    name: "TwoColumn",
    defaultConfig: {} as any,
    render: LowCodeTwoColumn,
    isContainer: true,
    slots: [
      { name: "left", title: "左区域", multiple: true },
      { name: "right", title: "右区域", multiple: true },
    ],
  },
  {
    type: "accordion",
    name: "Accordion",
    defaultConfig: {} as any,
    render: LowCodeAccordion,
  },
  {
    type: "button",
    name: "Button",
    defaultConfig: {} as any,
    render: LowCodeButton,
  },
  {
    type: "breadcrumbBar",
    name: "BreadcrumbBar",
    defaultConfig: {} as any,
    render: LowCodeBreadcrumbBar,
  },
  {
    type: "pageHeader",
    name: "PageHeader",
    defaultConfig: {} as any,
    render: LowCodePageHeader,
  },
  {
    type: "queryFilter",
    name: "QueryFilter",
    defaultConfig: {} as any,
    render: LowCodeQueryFilter,
  },
  {
    type: "statCard",
    name: "StatCard",
    defaultConfig: {} as any,
    render: LowCodeStatCard,
  },
  {
    type: "cardGrid",
    name: "CardGrid",
    defaultConfig: {} as any,
    render: LowCodeCardGrid,
  },
  {
    type: "dataTable",
    name: "DataTable",
    defaultConfig: {} as any,
    render: LowCodeDataTable,
  },
  {
    type: "video",
    name: "Video",
    defaultConfig: {} as any,
    render: LowCodeVideo,
  },
  {
    type: "image",
    name: "Image",
    defaultConfig: {} as any,
    render: LowCodeImage,
  },
  {
    type: "avatar",
    name: "Avatar",
    defaultConfig: {} as any,
    render: LowCodeAvatar,
  },
  {
    type: "swiper",
    name: "Swiper",
    defaultConfig: {} as any,
    render: LowCodeSwiper,
  },
  {
    type: "card",
    name: "Card",
    defaultConfig: {} as any,
    render: LowCodeCard,
  },
  {
    type: "list",
    name: "List",
    defaultConfig: {} as any,
    render: LowCodeList,
  },
  {
    type: "statistic",
    name: "Statistic",
    defaultConfig: {} as any,
    render: LowCodeStatistic,
  },
  {
    type: "table",
    name: "Table",
    defaultConfig: {} as any,
    render: LowCodeTable,
  },
  {
    type: "titleText",
    name: "Text",
    defaultConfig: {} as any,
    render: LowCodeText,
  },
  {
    type: "split",
    name: "Split",
    defaultConfig: {} as any,
    render: LowCodeSplit,
  },
  {
    type: "empty",
    name: "Empty",
    defaultConfig: {} as any,
    render: LowCodeEmpty,
  },
  {
    type: "richText",
    name: "RichText",
    defaultConfig: {} as any,
    render: LowCodeRichText,
  },
  {
    type: "qrcode",
    name: "Qrcode",
    defaultConfig: {} as any,
    render: LowCodeQrcode,
  },
  {
    type: "alert",
    name: "Alert",
    defaultConfig: {} as any,
    render: LowCodeAlert,
  },
  {
    type: "input",
    name: "Input",
    defaultConfig: {} as any,
    render: LowCodeInput,
  },
  {
    type: "textArea",
    name: "TextArea",
    defaultConfig: {} as any,
    render: LowCodeTextArea,
  },
  {
    type: "radio",
    name: "Radio",
    defaultConfig: {} as any,
    render: LowCodeRadio,
  },
  {
    type: "checkbox",
    name: "Checkbox",
    defaultConfig: {} as any,
    render: LowCodeCheckbox,
  },
  {
    type: "barChart",
    name: "BarChart",
    defaultConfig: {} as any,
    render: LowCodeBarChart,
  },
  {
    type: "lineChart",
    name: "LineChart",
    defaultConfig: {} as any,
    render: LowCodeLineChart,
  },
  {
    type: "pieChart",
    name: "PieChart",
    defaultConfig: {} as any,
    render: LowCodePieChart,
  },
];

let builtinComponentsInitialized = false;

/**
 * 根据物料类型查找对应的内置组件定义，供注册和运行时渲染复用。
 */
export function getBuiltinComponentDefinitionByType(type?: string | null) {
  if (!type) {
    return null;
  }

  return builtinComponentDefinitions.find((item) => item.type === type) ?? null;
}

/**
 * 初始化内置物料与图表主题，并确保组件注册只执行一次。
 */
export function initBuiltinComponents() {
  initBuiltinEChartsThemes();
  if (builtinComponentsInitialized) {
    return;
  }

  builtinComponentsInitialized = true;
  builtinComponentDefinitions.forEach((item) => registerComponent(item));
}
