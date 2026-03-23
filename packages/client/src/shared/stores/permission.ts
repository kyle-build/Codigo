import { makeAutoObservable } from "mobx";

export type PermissionRole = "owner" | "editor" | "commenter" | "viewer";
export type PermissionAction =
  | "view"
  | "comment"
  | "edit_content"
  | "edit_structure"
  | "manage_member"
  | "publish"
  | "save_draft";

export interface Collaborator {
  id: string;
  name: string;
  role: PermissionRole;
  color: string;
  isOnline: boolean;
  lastActiveAt: number;
}

export interface PermissionLog {
  id: string;
  actorId: string;
  event: string;
  target: string;
  createdAt: number;
}

interface IStorePermission {
  documentId: string;
  currentUserId: string;
  lockEditing: boolean;
  collaborators: Collaborator[];
  logs: PermissionLog[];
}

export const roleLabelMap: Record<PermissionRole, string> = {
  owner: "所有者",
  editor: "可编辑",
  commenter: "可评论",
  viewer: "只读",
};

export const roleColorMap: Record<PermissionRole, string> = {
  owner: "#f97316",
  editor: "#10b981",
  commenter: "#3b82f6",
  viewer: "#64748b",
};

export function createStorePermission() {
  return makeAutoObservable<IStorePermission>({
    documentId: "codigo-editor-doc",
    currentUserId: "u-owner",
    lockEditing: false,
    collaborators: [
      {
        id: "u-owner",
        name: "产品负责人",
        role: "owner",
        color: "#f97316",
        isOnline: true,
        lastActiveAt: Date.now(),
      },
      {
        id: "u-dev",
        name: "前端开发",
        role: "editor",
        color: "#10b981",
        isOnline: true,
        lastActiveAt: Date.now() - 60 * 1000,
      },
      {
        id: "u-pm",
        name: "项目经理",
        role: "commenter",
        color: "#3b82f6",
        isOnline: true,
        lastActiveAt: Date.now() - 5 * 60 * 1000,
      },
      {
        id: "u-qa",
        name: "测试同学",
        role: "viewer",
        color: "#64748b",
        isOnline: false,
        lastActiveAt: Date.now() - 25 * 60 * 1000,
      },
    ],
    logs: [],
  });
}

export type TStorePermission = ReturnType<typeof createStorePermission>;












