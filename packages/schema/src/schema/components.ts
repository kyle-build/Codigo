/**
 * 定义低代码系统当前支持的全部组件类型标识。
 */
export type TComponentTypes =
  | "container"
  | "twoColumn"
  | "accordion"
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
  | "funnelChart"
  | "video"
  | "avatar";

/**
 * 描述组件单个属性在配置面板中的包装结构。
 * @template T - 组件属性的类型。
 * @param value - 当前属性值。
 * @param defaultValue - 默认属性值。
 * @param isHidden - 是否隐藏该属性在配置面板中。
 */
export interface IComponentPropWarpper<T> {
  value: T;
  defaultValue: T;
  isHidden: boolean;
}

/**
 * 描述组件单个属性在配置面板中的包装结构。
 * @param type - 操作类型。
 * @param path - 导航路径。
 * @param key - 状态设置键。
 * @param value - 状态设置值。
 * @param url - 打开 URL。
 * @param target - 打开 URL 目标窗口。
 * @param targetId - 滚动到目标元素。
 */
export type RuntimeStateValue = string | number | boolean;

export type ActionConfig =
  | { type: "navigate"; path: string }
  | { type: "setState"; key: string; value: RuntimeStateValue }
  | { type: "openUrl"; url: string; target?: "_self" | "_blank" }
  | { type: "scrollTo"; targetId: string };


/**
 * 描述组件事件映射结构。
 * @param onClick - 点击事件配置。
 */
export interface ComponentEventMap {
  onClick?: ActionConfig[];
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
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
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
  P extends Record<string, any> = Record<string, any>,
> {
  id: string;
  type: T;
  name?: string;
  props: P;
  styles?: TComponentStyles;
  children?: ComponentNode<T, P>[];
  meta?: ComponentMeta;
  events?: ComponentEventMap;
  slot?: string | null;
  visibleWhen?: {
    key: string;
    equals: string | number | boolean;
  };
}

/**
 * 描述将树形节点扁平化后的记录结构。
 */
export interface ComponentNodeRecord<
  T extends string = TComponentTypes,
  P extends Record<string, any> = Record<string, any>,
> extends Omit<ComponentNode<T, P>, "children"> {
  parentId: string | null;
  childIds: string[];
}

/**
 * 将组件属性配置转换为必选属性的包装结构。
 */
export type TransformedComponentConfig<P extends Record<string, any>> = {
  [key in keyof P]-?: IComponentPropWarpper<P[key]>;
};
