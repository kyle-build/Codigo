import type {
  ComponentMeta,
  ComponentNode,
  TComponentStyles,
  TComponentTypes,
} from "./components";

/**
 * 描述页面所属的业务分类。
 */
export type PageCategory = "admin";

/**
 * 描述页面在画布中的布局模式。
 */
export type PageLayoutMode = "absolute" | "grid";

/**
 * 描述后台壳在预览/发布时的布局形态（不影响画布组件树）。
 */
export type PageShellLayout =
  | "leftRight"
  | "topBottom"
  | "leftTop"
  | "topLeft"
  | "breadcrumb"
  | "none";

export interface PageGridConfig {
  cols: number;
  rows: number;
  gap?: number;
}

/**
 * 描述发布链接的可见范围。
 */
export type ReleaseVisibility = "public" | "private";

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
  grid?: PageGridConfig;
  shellLayout?: PageShellLayout;
  visibility?: ReleaseVisibility;
  expire_at?: string | Date | null;
}

/**
 * 描述页面 schema 的版本号和组件树数据。
 */
export interface LayoutBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IEditorPageSchema {
  id: string;
  name: string;
  path: string;
  components: ComponentNode[];
  layoutBlocks?: LayoutBlock[];
}

export interface IEditorPageGroupSchema {
  id: string;
  name: string;
  path: string;
}

export interface IPageSchema {
  version: number;
  components: ComponentNode[];
  pages?: IEditorPageSchema[];
  pageGroups?: IEditorPageGroupSchema[];
  activePageId?: string;
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
