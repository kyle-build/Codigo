import type { AdminPermission } from "./admin";

/**
 * 定义系统用户可拥有的全局角色。
 */
export type GlobalRole = "SUPER_ADMIN" | "ADMIN" | "USER";

/**
 * 描述系统用户实体的基础信息。
 */
export interface IUser {
  id: number;
  phone: string;
  open_id: string;
  head_img: string;
  username: string;
  password: string;
  global_role: GlobalRole;
  admin_permissions: AdminPermission[] | null;
  status: "active" | "frozen";
}
