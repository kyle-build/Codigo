import type {
  IComponent,
  IComponentData,
  ILowCode,
  IPageSchema,
  IPageVersion,
} from "../schema/low-code";
import type { SyncSchemaItem } from "../schema/render";

/**
 * 描述发布页面时提交的请求数据结构。
 */
export type PostReleaseRequest = Omit<
  ILowCode,
  "id" | "account_id" | "components"
> & {
  components?: Omit<IComponent, "account_id" | "page_id">[];
  schema_version?: number;
  schema?: IPageSchema;
};

/**
 * 描述提交组件问卷或业务数据时的请求结构。
 */
export type PostQuestionDataRequest = Pick<IComponentData, "page_id" | "props">;

/**
 * 描述获取已发布页面详情时的返回结构。
 */
export type GetReleaseDataResponse = Omit<ILowCode, "components"> & {
  componentIds: string[];
  components: IComponent[];
  schema_version?: number;
  schema?: IPageSchema;
};

/**
 * 描述按组件 ID 查询数据时的请求参数。
 */
export type getQuestionDataByIdRequest = Pick<IComponent, "id">;

/**
 * 描述页面版本列表接口的返回结构。
 */
export type GetPageVersionsResponse = Omit<IPageVersion, "schema_data">[];

/**
 * 描述页面单个版本详情接口的返回结构。
 */
export type GetPageVersionDetailResponse = IPageVersion;

/**
 * 描述页面源码工作区的基础信息。
 */
export interface PageWorkspaceResponse {
  pageId: number;
  pageName: string;
  workspaceId: string;
  workspaceName: string;
  workspaceRoot: string;
  workspaceRelativePath: string;
  templateRoot: string;
  packageJsonPath: string;
  schemaFilePath: string;
  entryFilePath: string;
  packageManager: "pnpm";
  installCommand: string;
  devCommand: string;
  exists: boolean;
  componentCount: number;
  lastSyncedAt?: string;
  schema?: SyncSchemaItem[];
}

/**
 * 定义源码工作区会话的状态枚举。
 */
export type PageWorkspaceSessionStatus =
  | "workspace_missing"
  | "stopped"
  | "starting"
  | "ready";

/**
 * 描述页面源码工作区 IDE 会话的运行信息。
 */
export interface PageWorkspaceSessionResponse {
  pageId: number;
  workspaceId: string;
  sessionId: string;
  status: PageWorkspaceSessionStatus;
  bridgeMode: "iframe";
  ideUrl?: string;
  previewUrl?: string;
  previewPort?: number;
  terminalCwd: string;
  terminalCommand: string;
  terminalTitle: string;
  heartbeatAt: string;
}

/**
 * 定义页面源码运行时实例的状态枚举。
 */
export type PageWorkspaceRuntimeStatus =
  | "workspace_missing"
  | "stopped"
  | "starting"
  | "running"
  | "error";

/**
 * 描述页面源码运行时实例的状态信息。
 */
export interface PageWorkspaceRuntimeResponse {
  pageId: number;
  workspaceId: string;
  runtimeId: string;
  status: PageWorkspaceRuntimeStatus;
  previewUrl?: string;
  previewPort?: number;
  command: string;
  cwd: string;
  pid?: number;
  startedAt?: string;
  updatedAt: string;
  lastOutput?: string;
  exitCode?: number | null;
}

/**
 * 描述打开源码 IDE 所需的连接配置。
 */
export interface PageWorkspaceIDEConfigResponse {
  pageId: number;
  workspaceId: string;
  sessionId: string;
  runtimeId?: string;
  provider: "opensumi";
  mode: "external-host";
  channelId: string;
  browserUrl: string;
  serverUrl: string;
  wsUrl?: string;
  hostOrigin: string;
  workspaceDir: string;
  workspacePath: string;
  terminalCwd: string;
  previewUrl?: string;
  launchQuery: Record<string, string>;
  capabilities: {
    fileSystem: boolean;
    terminal: boolean;
    preview: boolean;
  };
  heartbeatAt: string;
}

/**
 * 描述工作区文件树中的单个节点。
 */
export interface WorkspaceExplorerNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: WorkspaceExplorerNode[];
}

/**
 * 描述工作区目录树查询接口的返回结构。
 */
export interface PageWorkspaceExplorerResponse {
  pageId: number;
  workspaceId: string;
  rootPath: string;
  tree: WorkspaceExplorerNode[];
}

/**
 * 描述读取工作区文件内容接口的返回结构。
 */
export interface PageWorkspaceFileResponse {
  pageId: number;
  workspaceId: string;
  path: string;
  absolutePath: string;
  language: string;
  content: string;
  updatedAt: string;
}

/**
 * 描述写入工作区文件内容接口的请求结构。
 */
export interface PutPageWorkspaceFileRequest {
  path: string;
  content: string;
}

/**
 * 描述写入工作区文件内容接口的返回结构。
 */
export interface PutPageWorkspaceFileResponse {
  pageId: number;
  workspaceId: string;
  path: string;
  absolutePath: string;
  language: string;
  content: string;
  updatedAt: string;
}
