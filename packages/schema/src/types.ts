export type ProtocolCode = 0 | -1;

export type ProtocolMessage = string | string[];

export interface ProtocolSuccess<TData = unknown> {
  code: 0;
  data: TData;
  msg?: string;
}

export interface ProtocolFailure {
  code: -1;
  data: null;
  msg: ProtocolMessage;
}

export type ProtocolResponse<TData = unknown> =
  | ProtocolSuccess<TData>
  | ProtocolFailure;

export type ProtocolMaybe<TData = unknown> = ProtocolResponse<TData | null>;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationData<TItem = unknown> {
  list: TItem[];
  pagination: PaginationMeta;
}

export type PaginationResponse<TItem = unknown> = ProtocolResponse<
  PaginationData<TItem>
>;

export interface CaptchaPayload {
  data: string;
  text: string;
}

export interface AuthTokenPayload {
  data: string;
  msg: string;
}

export interface ResourcePayload {
  id: number;
  url: string;
  type: string;
  name: string;
  account_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface LowCodeComponentPayload {
  id: number;
  type: string;
  account_id: number;
  page_id: number;
  options: Record<string, unknown>;
}

export interface LowCodePagePayload {
  id: number;
  account_id: number;
  page_name: string;
  components: string[];
  tdk: string;
  desc: string;
}

export interface ReleaseDataPayload extends Omit<
  LowCodePagePayload,
  "components"
> {
  componentIds: string[];
  components: Array<LowCodeComponentPayload | null>;
}
