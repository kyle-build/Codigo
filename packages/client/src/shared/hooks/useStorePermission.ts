import { action } from "mobx";
import { message } from "antd";
import { ulid } from "ulid";
import {
  createStorePermission,
  roleColorMap,
  roleLabelMap,
} from "@/shared/stores/permission";
import type {
  Collaborator,
  PermissionAction,
  PermissionRole,
} from "@/shared/stores/permission";

const storePermission = createStorePermission();

const rolePermissionMap: Record<PermissionRole, PermissionAction[]> = {
  owner: [
    "view",
    "comment",
    "edit_content",
    "edit_structure",
    "manage_member",
    "publish",
    "save_draft",
  ],
  editor: ["view", "comment", "edit_content", "edit_structure", "save_draft"],
  commenter: ["view", "comment"],
  viewer: ["view"],
};

const eventLabelMap: Record<string, string> = {
  add_component: "新增组件",
  move_component: "移动组件",
  remove_component: "删除组件",
  update_component: "修改组件",
  update_style: "修改样式",
  update_page: "更新页面配置",
  undo: "撤销操作",
  redo: "重做操作",
  save_draft: "保存草稿",
  publish: "发布页面",
  ai_replace: "AI替换组件",
  invite_member: "邀请协作者",
  update_role: "修改角色",
  remove_member: "移除成员",
  toggle_lock: "切换编辑锁",
};

export function useStorePermission() {
  const getCurrentUser = () => {
    return storePermission.collaborators.find(
      (item) => item.id === storePermission.currentUserId
    );
  };

  const getCurrentRole = (): PermissionRole => {
    return getCurrentUser()?.role ?? "viewer";
  };

  const can = (permission: PermissionAction) => {
    const role = getCurrentRole();
    if (
      storePermission.lockEditing &&
      role !== "owner" &&
      (permission === "edit_content" ||
        permission === "edit_structure" ||
        permission === "publish")
    ) {
      return false;
    }
    return rolePermissionMap[role].includes(permission);
  };

  const ensurePermission = (
    permission: PermissionAction,
    deniedMessage?: string
  ) => {
    const passed = can(permission);
    if (!passed) {
      message.warning(deniedMessage ?? "当前角色无此操作权限");
    }
    return passed;
  };

  const addOperationLog = action((event: string, target: string) => {
    storePermission.logs.unshift({
      id: ulid(),
      actorId: storePermission.currentUserId,
      event,
      target,
      createdAt: Date.now(),
    });
    if (storePermission.logs.length > 100) {
      storePermission.logs = storePermission.logs.slice(0, 100);
    }
    const actor = getCurrentUser();
    if (actor) {
      actor.lastActiveAt = Date.now();
      actor.isOnline = true;
    }
  });

  const switchCurrentUser = action((userId: string) => {
    const target = storePermission.collaborators.find((item) => item.id === userId);
    if (!target) return;
    storePermission.currentUserId = userId;
    target.lastActiveAt = Date.now();
    target.isOnline = true;
  });

  const inviteCollaborator = action((name: string, role: PermissionRole) => {
    if (!ensurePermission("manage_member", "仅所有者可邀请协作者")) return;
    const normalizedName = name.trim();
    if (!normalizedName) {
      message.warning("请输入协作者名称");
      return;
    }
    const nextCollaborator: Collaborator = {
      id: ulid(),
      name: normalizedName,
      role,
      color: roleColorMap[role],
      isOnline: true,
      lastActiveAt: Date.now(),
    };
    storePermission.collaborators.push(nextCollaborator);
    addOperationLog("invite_member", normalizedName);
  });

  const updateCollaboratorRole = action((userId: string, role: PermissionRole) => {
    if (!ensurePermission("manage_member", "仅所有者可修改成员角色")) return;
    const target = storePermission.collaborators.find((item) => item.id === userId);
    if (!target || target.role === "owner") return;
    target.role = role;
    target.color = roleColorMap[role];
    addOperationLog("update_role", `${target.name} → ${roleLabelMap[role]}`);
  });

  const removeCollaborator = action((userId: string) => {
    if (!ensurePermission("manage_member", "仅所有者可移除成员")) return;
    const target = storePermission.collaborators.find((item) => item.id === userId);
    if (!target || target.role === "owner") return;
    storePermission.collaborators = storePermission.collaborators.filter(
      (item) => item.id !== userId
    );
    if (storePermission.currentUserId === userId) {
      storePermission.currentUserId =
        storePermission.collaborators.find((item) => item.role === "owner")?.id ??
        storePermission.collaborators[0]?.id ??
        "";
    }
    addOperationLog("remove_member", target.name);
  });

  const toggleLockEditing = action((checked: boolean) => {
    if (!ensurePermission("manage_member", "仅所有者可切换编辑锁")) return;
    storePermission.lockEditing = checked;
    addOperationLog("toggle_lock", checked ? "开启" : "关闭");
  });

  return {
    store: storePermission,
    roleLabelMap,
    eventLabelMap,
    can,
    ensurePermission,
    addOperationLog,
    getCurrentUser,
    getCurrentRole,
    switchCurrentUser,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    toggleLockEditing,
  };
}












