import type { PermissionRole } from "../models/collaboration";

/**
 * 描述邀请协作者接口的请求参数。
 */
export interface InviteCollaboratorRequest {
  userName: string;
  role: PermissionRole;
}

/**
 * 描述更新协作者角色接口的请求参数。
 */
export interface UpdateCollaboratorRoleRequest {
  role: PermissionRole;
}
