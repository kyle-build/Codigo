import type { AdminPermission } from "./admin";

export type GlobalRole = "SUPER_ADMIN" | "ADMIN" | "USER";

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
