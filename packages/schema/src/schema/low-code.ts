import type {
  ComponentMeta,
  ComponentNode,
  TComponentStyles,
  TComponentTypes,
} from "./components";

/**
 * 描述页面所属的业务分类。
 */
export type PageCategory = "marketing" | "admin";

/**
 * 描述页面在画布中的布局模式。
 */
export type PageLayoutMode = "absolute" | "flow";

/**
 * 描述低代码页面实体的基础信息。
 */
export interface ILowCode {
  id: number;
  account_id: number;
  page_name: string;
  components: string[];
  schema_version?: number;
  tdk: string;
  desc: string;
  deviceType?: "mobile" | "pc";
  canvasWidth?: number;
  canvasHeight?: number;
  lockEditing?: boolean; // 编辑锁状态
  pageCategory?: PageCategory;
  layoutMode?: PageLayoutMode;
}

/**
 * 描述页面 schema 的版本号和组件树数据。
 */
export interface IPageSchema {
  version: number;
  components: ComponentNode[];
}

/**
 * 描述组件实例在存储层中的结构。
 */
export interface IComponent {
  id: number;
  account_id: number;
  page_id: number;
  node_id: string;
  parent_node_id?: string | null;
  type: TComponentTypes;
  options: Record<string, any>;
  styles?: TComponentStyles;
  slot?: string | null;
  name?: string;
  meta?: ComponentMeta;
}

/**
 * 描述组件业务数据的存储结构。
 */
export interface IComponentData {
  id: number;
  user: string;
  page_id: number;
  props: Record<string, any>[];
}

/**
 * 描述页面版本快照的存储结构。
 */
export interface IPageVersion {
  id: string; // uuid
  page_id: number;
  account_id: number;
  version: number;
  desc: string;
  schema_data: Record<string, any>; // 快照数据
  created_at: Date;
}
