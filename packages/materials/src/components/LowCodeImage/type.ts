import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

// 图片组件的属性
export interface IImageComponentProps {
  id: string;
  url: string;
  name: string;
  height: string | number;
  handleClicked: "open-url" | "none";
  fit:
    | "contain"
    | "cover"
    | "fill"
    | "none"
    | "scale-down"
    | "initial"
    | "revert"
    | "unset";
  link?: string;
}

// 转换成通用组件类型
export type TImageComponentConfig = TBasicComponentConfig<
  "image",
  IImageComponentProps
>;

// 剔除可选属性
export type TImageComponentConfigResult =
  TransformedComponentConfig<IImageComponentProps>;

// 图片属性的默认值
export const defaultImageInfo: IImageComponentProps = {
  id: "",
  url: "https://www.keaitupian.cn/cjpic/frombd/2/253/1465323558/580685714.jpg",
  fit: "cover",
  height: 200,
  handleClicked: "open-url",
  name: "图片名称",
  link: "https://test.net",
};

// 图片表单配置属性的值
export const imageComponentDefaultConfig: TImageComponentConfigResult = {
  id: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  fit: {
    value: "cover",
    defaultValue: "cover",
    isHidden: false,
  },
  height: {
    value: 200,
    defaultValue: 200,
    isHidden: false,
  },
  handleClicked: {
    value: "open-url",
    defaultValue: "open-url",
    isHidden: false,
  },
  link: {
    value: "https://test.net",
    defaultValue: "https://test.net",
    isHidden: false,
  },
  name: {
    value: "图片名称",
    defaultValue: "图片名称",
    isHidden: false,
  },
  url: {
    value:
      "https://www.keaitupian.cn/cjpic/frombd/2/253/1465323558/580685714.jpg",
    defaultValue:
      "https://www.keaitupian.cn/cjpic/frombd/2/253/1465323558/580685714.jpg",
    isHidden: false,
  },
};
