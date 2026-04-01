// 基础类型配置
export type TComponentTypes =
  | "container"
  | "twoColumn"
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
  | "alert"
  | "barChart"
  | "lineChart"
  | "pieChart"
  | "radarChart"
  | "funnelChart";

// 组件属性包装器
export interface IComponentPropWarpper<T> {
  value: T;
  defaultValue: T;
  isHidden: boolean;
}

// 组件可配置项
export interface TComponentStyles {
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
}

// 组件元数据属性
export interface ComponentMeta {
  locked?: boolean;
  hidden?: boolean;
  collapsed?: boolean;
}

// 基础属性配置
export interface TBasicComponentConfig<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> {
  type: T;
  id: string;
  props: Partial<P>;
  styles?: TComponentStyles;
}

// 组件节点属性
export interface ComponentNode<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> extends TBasicComponentConfig<T, P> {
  name?: string;
  slot?: string;
  children?: ComponentNode<T, P>[];
  meta?: ComponentMeta;
}

// 组件节点记录属性
export interface ComponentNodeRecord<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> extends Omit<ComponentNode<T, P>, "children"> {
  parentId: string | null;
  childIds: string[];
}

// 剔除类型里面的可选属性
export type TransformedComponentConfig<P extends Record<string, any>> = {
  [key in keyof P]-?: IComponentPropWarpper<P[key]>;
};
