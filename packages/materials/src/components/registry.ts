import {
  ContainerComponent as LowCodeContainer,
  TwoColumnComponent as LowCodeTwoColumn,
  ButtonComponent as LowCodeButton,
  CardComponent as LowCodeCard,
  ImageComponent as LowCodeImage,
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
import { registerComponent } from "@codigo/plugin-system";
import { initBuiltinEChartsThemes } from "../utils/echartsTheme";

export function initBuiltinComponents() {
  initBuiltinEChartsThemes();
  registerComponent({
    type: "container",
    name: "Container",
    defaultConfig: {} as any,
    render: LowCodeContainer,
    isContainer: true,
    slots: [{ name: "default", title: "默认区域", multiple: true }],
  });
  registerComponent({
    type: "twoColumn",
    name: "TwoColumn",
    defaultConfig: {} as any,
    render: LowCodeTwoColumn,
    isContainer: true,
    slots: [
      { name: "left", title: "左区域", multiple: true },
      { name: "right", title: "右区域", multiple: true },
    ],
  });
  registerComponent({
    type: "button",
    name: "Button",
    defaultConfig: {} as any,
    render: LowCodeButton,
  });
  registerComponent({
    type: "video",
    name: "Video",
    defaultConfig: {} as any,
    render: LowCodeVideo,
  });
  registerComponent({
    type: "image",
    name: "Image",
    defaultConfig: {} as any,
    render: LowCodeImage,
  });
  registerComponent({
    type: "swiper",
    name: "Swiper",
    defaultConfig: {} as any,
    render: LowCodeSwiper,
  });
  registerComponent({
    type: "card",
    name: "Card",
    defaultConfig: {} as any,
    render: LowCodeCard,
  });
  registerComponent({
    type: "list",
    name: "List",
    defaultConfig: {} as any,
    render: LowCodeList,
  });
  registerComponent({
    type: "statistic",
    name: "Statistic",
    defaultConfig: {} as any,
    render: LowCodeStatistic,
  });
  registerComponent({
    type: "table",
    name: "Table",
    defaultConfig: {} as any,
    render: LowCodeTable,
  });
  registerComponent({
    type: "titleText",
    name: "Text",
    defaultConfig: {} as any,
    render: LowCodeText,
  });
  registerComponent({
    type: "split",
    name: "Split",
    defaultConfig: {} as any,
    render: LowCodeSplit,
  });
  registerComponent({
    type: "empty",
    name: "Empty",
    defaultConfig: {} as any,
    render: LowCodeEmpty,
  });
  registerComponent({
    type: "richText",
    name: "RichText",
    defaultConfig: {} as any,
    render: LowCodeRichText,
  });
  registerComponent({
    type: "qrcode",
    name: "Qrcode",
    defaultConfig: {} as any,
    render: LowCodeQrcode,
  });
  registerComponent({
    type: "alert",
    name: "Alert",
    defaultConfig: {} as any,
    render: LowCodeAlert,
  });
  registerComponent({
    type: "input",
    name: "Input",
    defaultConfig: {} as any,
    render: LowCodeInput,
  });
  registerComponent({
    type: "textArea",
    name: "TextArea",
    defaultConfig: {} as any,
    render: LowCodeTextArea,
  });
  registerComponent({
    type: "radio",
    name: "Radio",
    defaultConfig: {} as any,
    render: LowCodeRadio,
  });
  registerComponent({
    type: "checkbox",
    name: "Checkbox",
    defaultConfig: {} as any,
    render: LowCodeCheckbox,
  });
  registerComponent({
    type: "barChart",
    name: "BarChart",
    defaultConfig: {} as any,
    render: LowCodeBarChart,
  });
  registerComponent({
    type: "lineChart",
    name: "LineChart",
    defaultConfig: {} as any,
    render: LowCodeLineChart,
  });
  registerComponent({
    type: "pieChart",
    name: "PieChart",
    defaultConfig: {} as any,
    render: LowCodePieChart,
  });
}
