import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface IButtonComponentProps {
  text: string;
  type: "primary" | "default" | "dashed" | "link" | "text";
  size: "large" | "middle" | "small";
  danger: boolean;
  block: boolean;
  actionType: "none" | "open-url" | "scroll-to-id";
  link: string;
  targetId: string;
}

export type TButtonComponentConfig = TBasicComponentConfig<
  "button",
  IButtonComponentProps
>;

export type TButtonComponentConfigResult =
  TransformedComponentConfig<IButtonComponentProps>;

export const buttonComponentDefaultConfig: TButtonComponentConfigResult = {
  text: {
    value: "主要操作",
    defaultValue: "主要操作",
    isHidden: false,
  },
  type: {
    value: "primary",
    defaultValue: "primary",
    isHidden: false,
  },
  size: {
    value: "middle",
    defaultValue: "middle",
    isHidden: false,
  },
  danger: {
    value: false,
    defaultValue: false,
    isHidden: false,
  },
  block: {
    value: false,
    defaultValue: false,
    isHidden: false,
  },
  actionType: {
    value: "none",
    defaultValue: "none",
    isHidden: false,
  },
  link: {
    value: "https://example.com",
    defaultValue: "https://example.com",
    isHidden: false,
  },
  targetId: {
    value: "section-overview",
    defaultValue: "section-overview",
    isHidden: false,
  },
};
