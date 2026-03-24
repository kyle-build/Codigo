import { ButtonComponent as LowCodeButton } from "./Button";
import { VideoComponent as LowCodeVideo } from "./LowCodeVideo";
import { ImageComponent as LowCodeImage } from "./LowCodeImage";
import { SwiperComponent as LowCodeSwiper } from "./LowCodeSwiper";
import { CardComponent as LowCodeCard } from "./LowCodeCard";
import { ListComponent as LowCodeList } from "./LowCodeList";
import { StatisticComponent as LowCodeStatistic } from "./LowCodeStatistic";
import { TableComponent as LowCodeTable } from "./LowCodeTable";
import { TextComponent as LowCodeText } from "./LowCodeText";
import { SplitComponent as LowCodeSplit } from "./LowCodeSplit";
import { EmptyComponent as LowCodeEmpty } from "./LowCodeEmpty";
import { RichTextComponent as LowCodeRichText } from "./LowCodeRichText";
import { QrcodeComponent as LowCodeQrcode } from "./LowCodeQrcode";
import { AlertComponent as LowCodeAlert } from "./LowCodeAlert";
import { InputComponent as LowCodeInput } from "./LowCodeInput";
import { TextAreaComponent as LowCodeTextArea } from "./LowCodeTextArea";
import { RadioComponent as LowCodeRadio } from "./LowCodeRadio";
import { CheckboxComponent as LowCodeCheckbox } from "./LowCodeCheckbox";
import { registerComponent } from "@codigo/plugin-system";

export function initBuiltinComponents() {
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
}
