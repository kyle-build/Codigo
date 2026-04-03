/**
 * 定义协作场景下的页面权限角色。
 */
export type PermissionRole = "owner" | "editor" | "commenter" | "viewer";

/**
 * 描述页面协作者的基础信息。
 */
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

/**
 * 描述协作操作日志的记录结构。
 */
export interface IOperationLog {
  id: string; // 唯一ID
  page_id: number; // 关联页面
  actor_id: number; // 关联用户
  event: string; // 事件类型：add_component, move_component...
  target: string; // 目标对象描述
  created_at: Date; // 创建时间
}

/**
 * 描述邀请协作者时提交的数据结构。
 */
export interface InviteCollaboratorDTO {
  page_id: number;
  user_name: string; // 用户名称（用于查找用户，或使用 user_id）
  role: PermissionRole;
}

/**
 * 描述更新协作者角色时提交的数据结构。
 */
export interface UpdateCollaboratorRoleDTO {
  user_id: number; // 要更新的用户的ID
  role: PermissionRole;
}

/**
 * 描述用户加入协作房间时的消息载荷。
 */
export interface SocketJoinRoomPayload {
  pageId: number;
  userId: number;
  userName: string;
}

/**
 * 描述用户离开协作房间时的消息载荷。
 */
export interface SocketLeaveRoomPayload {
  pageId: number;
  userId: number;
}

/**
 * 描述组件变更广播时的消息载荷。
 */
export interface SocketComponentUpdatePayload {
  pageId: number;
  userId: number;
  componentId?: number | string;
  action: "add" | "update" | "remove" | "move" | "replace_all";
  payload: any; // 根据具体的 action 传递不同结构
}

/**
 * 描述页面编辑锁状态同步时的消息载荷。
 */
export interface SocketLockStatusPayload {
  pageId: number;
  userId: number;
  lockEditing: boolean;
}

/**
 * 描述服务端广播在线用户列表时的消息载荷。
 */
export interface ServerRoomUsersUpdatePayload {
  users: Array<{
    userId: number;
    userName: string;
    isOnline: boolean;
    lastActiveAt: number;
  }>;
}
