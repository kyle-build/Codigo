/**
 * 定义低代码系统当前支持的全部组件类型标识。
 */
export type TComponentTypes =
  | "container"
  | "twoColumn"
  | "button"
  | "breadcrumbBar"
  | "pageHeader"
  | "queryFilter"
  | "statCard"
  | "cardGrid"
  | "dataTable"
  | "statistic"
  | "table"
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

/**
 * 描述组件单个属性在配置面板中的包装结构。
 */
export interface IComponentPropWarpper<T> {
  value: T;
  defaultValue: T;
  isHidden: boolean;
}

/**
 * 描述组件在画布中的通用样式配置。
 */
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

/**
 * 描述组件节点在编辑器中的元信息状态。
 */
export interface ComponentMeta {
  locked?: boolean;
  hidden?: boolean;
  collapsed?: boolean;
}

/**
 * 描述组件节点最基础的配置结构。
 */
export interface TBasicComponentConfig<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> {
  type: T;
  id: string;
  props: Partial<P>;
  styles?: TComponentStyles;
}

/**
 * 描述页面 schema 中的组件树节点结构。
 */
export interface ComponentNode<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> extends TBasicComponentConfig<T, P> {
  name?: string;
  slot?: string;
  children?: ComponentNode<T, P>[];
  meta?: ComponentMeta;
}

/**
 * 描述将树形节点扁平化后的记录结构。
 */
export interface ComponentNodeRecord<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> extends Omit<ComponentNode<T, P>, "children"> {
  parentId: string | null;
  childIds: string[];
}

/**
 * 将组件属性配置转换为全部必填的包装结构。
 */
export type TransformedComponentConfig<P extends Record<string, any>> = {
  [key in keyof P]-?: IComponentPropWarpper<P[key]>;
};
