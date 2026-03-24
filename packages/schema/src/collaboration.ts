export type PermissionRole = "owner" | "editor" | "commenter" | "viewer";

export interface ICollaborator {
  id: string; // 唯一ID，例如生成的 ULID 或数据库主键
  user_id: number; // 关联到系统的 User ID
  page_id: number; // 关联到具体的 Page ID
  name: string; // 用户名称，从用户表查询得来
  role: PermissionRole; // 协作角色
  color?: string; // 用户头像标识颜色，前端生成或后端返回
  isOnline?: boolean; // 在线状态，WebSocket 维护
  lastActiveAt?: number; // 最后活跃时间，WebSocket 维护
}

export interface IOperationLog {
  id: string; // 唯一ID
  page_id: number; // 关联页面
  actor_id: number; // 关联用户
  event: string; // 事件类型：add_component, move_component...
  target: string; // 目标对象描述
  created_at: Date; // 创建时间
}

export interface InviteCollaboratorDTO {
  page_id: number;
  user_name: string; // 用户名称（用于查找用户，或使用 user_id）
  role: PermissionRole;
}

export interface UpdateCollaboratorRoleDTO {
  user_id: number; // 要更新的用户的ID
  role: PermissionRole;
}

// WebSocket Payload 类型
export interface SocketJoinRoomPayload {
  pageId: number;
  userId: number;
  userName: string;
}

export interface SocketLeaveRoomPayload {
  pageId: number;
  userId: number;
}

export interface SocketComponentUpdatePayload {
  pageId: number;
  userId: number;
  componentId?: number | string;
  action: "add" | "update" | "remove" | "move" | "replace_all";
  payload: any; // 根据具体的 action 传递不同结构
}

export interface SocketLockStatusPayload {
  pageId: number;
  userId: number;
  lockEditing: boolean;
}

export interface ServerRoomUsersUpdatePayload {
  users: Array<{
    userId: number;
    userName: string;
    isOnline: boolean;
    lastActiveAt: number;
  }>;
}
