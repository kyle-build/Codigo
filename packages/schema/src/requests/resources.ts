import type { IResources } from "../models/resources";

/**
 * 描述上传资源接口的请求参数。
 */
export type ResourcesRequest = Pick<IResources, "type">;

/**
 * 描述删除资源接口的请求参数。
 */
export type DeleteResourcesRequest = Pick<IResources, "id">;
