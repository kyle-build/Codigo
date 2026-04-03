/**
 * 定义接口协议层统一使用的状态码。
 */
export type ProtocolCode = 0 | -1;

/**
 * 定义接口协议层支持的消息格式。
 */
export type ProtocolMessage = string | string[];

/**
 * 描述接口成功响应的数据结构。
 */
export interface ProtocolSuccess<TData = unknown> {
  code: 0;
  data: TData;
  msg?: string;
}

/**
 * 描述接口失败响应的数据结构。
 */
export interface ProtocolFailure {
  code: -1;
  data: null;
  msg: ProtocolMessage;
}

/**
 * 描述接口统一返回结构。
 */
export type ProtocolResponse<TData = unknown> =
  | ProtocolSuccess<TData>
  | ProtocolFailure;

/**
 * 描述 data 字段允许为空时的接口返回结构。
 */
export type ProtocolMaybe<TData = unknown> = ProtocolResponse<TData | null>;

/**
 * 描述分页请求返回的分页元数据。
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 描述带分页信息的列表数据结构。
 */
export interface PaginationData<TItem = unknown> {
  list: TItem[];
  pagination: PaginationMeta;
}

/**
 * 描述分页列表接口的标准返回结构。
 */
export type PaginationResponse<TItem = unknown> = ProtocolResponse<
  PaginationData<TItem>
>;

/**
 * 描述验证码接口返回的数据内容。
 */
export interface CaptchaPayload {
  data: string;
  text: string;
}

/**
 * 描述认证接口返回的令牌载荷。
 */
export interface AuthTokenPayload {
  data: string;
  msg: string;
}

/**
 * 描述资源接口返回的资源实体数据。
 */
export interface ResourcePayload {
  id: number;
  url: string;
  type: string;
  name: string;
  account_id: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * 描述低代码组件接口返回的组件数据。
 */
export interface LowCodeComponentPayload {
  id: number;
  type: string;
  account_id: number;
  page_id: number;
  options: Record<string, unknown>;
}

/**
 * 描述低代码页面接口返回的页面基础数据。
 */
export interface LowCodePagePayload {
  id: number;
  account_id: number;
  page_name: string;
  components: string[];
  tdk: string;
  desc: string;
}

/**
 * 描述页面发布详情接口返回的数据结构。
 */
export interface ReleaseDataPayload extends Omit<
  LowCodePagePayload,
  "components"
> {
  componentIds: string[];
  components: Array<LowCodeComponentPayload | null>;
}
