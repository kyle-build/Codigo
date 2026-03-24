export type TComponentTypes =
  | "button"
  | "statistic"
  | "table"
  | "video"
  | "swiper"
  | "qrcode"
  | "card"
  | "list"
  | "image"
  | "titleText"
  | "split"
  | "richText"
  | "input"
  | "textArea"
  | "radio"
  | "checkbox"
  | "empty"
  | "alert";

export interface IComponentPropWarpper<T> {
  value: T;
  defaultValue: T;
  isHidden: boolean;
}

export interface TBasicComponentConfig<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> {
  type: T;
  id: string;
  props: Partial<P>;
  styles?: {
    position?: "absolute" | "relative";
    left?: number | string;
    top?: number | string;
    width?: number | string;
    height?: number | string;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
}

// 剔除类型里面的可选
export type TransformedComponentConfig<P extends Record<string, any>> = {
  [key in keyof P]-?: IComponentPropWarpper<P[key]>;
};
