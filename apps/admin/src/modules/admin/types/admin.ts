import type { AdminPermission, IUser } from "@codigo/schema";

export interface AdminListPayload<T> {
  list: T[];
  total: number;
}

export interface AdminListResponse<T> {
  data?: AdminListPayload<T>;
  list?: T[];
  total?: number;
}

export interface AdminPageQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminComponentQuery extends AdminPageQuery {
  type?: string;
}

export interface AdminComponentStat {
  type: string;
  instance_count: number;
  page_count: number;
}

export interface AdminComponentItem {
  id: number;
  type: string;
  page_id: number;
  page_name: string;
  owner_name: string;
  owner_phone: string;
}

export interface AdminPageItem {
  id: number;
  account_id: number;
  page_name: string;
  desc: string;
  lockEditing: boolean;
  owner_name: string;
  owner_phone: string;
  component_count: number;
  collaborator_count: number;
  version_count: number;
}

export interface AdminPageVersionItem {
  id: string;
  page_id: number;
  version: number;
  desc: string;
  created_at: string;
}

export type AdminUserStatus = "active" | "frozen";

export interface AdminUsersTableProps {
  currentPage: number;
  data: IUser[];
  hasPermissionAssign: boolean;
  hasUserManage: boolean;
  loading: boolean;
  mode: "permissions" | "users";
  onOpenPermissionModal: (record: IUser) => void;
  onPageChange: (page: number) => void;
  onRoleChange: (userId: number, role: IUser["global_role"]) => Promise<void>;
  onStatusChange: (userId: number, status: AdminUserStatus) => Promise<void>;
  total: number;
}

export interface AdminPermissionModalProps {
  currentUser: IUser | null;
  loading: boolean;
  onCancel: () => void;
  onChange: (permissions: AdminPermission[]) => void;
  onConfirm: () => Promise<void>;
  open: boolean;
  permissions: AdminPermission[];
}
