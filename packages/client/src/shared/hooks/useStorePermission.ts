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
import { io, Socket } from "socket.io-client";
import { useEffect } from "react";
import request from "@/shared/utils/request";

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
  sandbox_sync: "沙箱同步画布",
  sandbox_bundle: "沙箱编译更新",
  sandbox_runtime_error: "沙箱运行异常",
  invite_member: "邀请协作者",
  update_role: "修改角色",
  remove_member: "移除成员",
  toggle_lock: "切换编辑锁",
};

let socket: Socket | null = null;

export function useStorePermission() {
  const initCollaboration = async (
    pageId: number,
    currentUserId: number,
    currentUserName: string,
  ) => {
    try {
      // 1. 获取真实协作数据
      const { data } = await request(`/pages/${pageId}/collaborators`, {
        method: "GET",
      });
      action(() => {
        storePermission.lockEditing = data.lockEditing;
        storePermission.collaborators = data.collaborators.map((c: any) => ({
          ...c,
          color: roleColorMap[c.role as PermissionRole],
          isOnline: false,
          lastActiveAt: Date.now(),
        }));
        // 设置当前用户ID（必须是字符串类型匹配store定义）
        const currentUserCollab = data.collaborators.find(
          (c: any) => c.user_id === currentUserId,
        );
        if (currentUserCollab) {
          storePermission.currentUserId = currentUserCollab.id;
        }
      })();

      // 2. 初始化 WebSocket
      if (!socket) {
        socket = io("http://localhost:3000/collaboration");
        socket.on("connect", () => {
          socket?.emit("join_room", {
            pageId,
            userId: currentUserId,
            userName: currentUserName,
          });
        });

        socket.on(
          "room_users_update",
          action((payload: any) => {
            const onlineUserIds = payload.users.map((u: any) => u.userId);
            storePermission.collaborators.forEach((collab) => {
              if (onlineUserIds.includes(collab.user_id)) {
                collab.isOnline = true;
                const onlineInfo = payload.users.find(
                  (u: any) => u.userId === collab.user_id,
                );
                if (onlineInfo) collab.lastActiveAt = onlineInfo.lastActiveAt;
              } else {
                collab.isOnline = false;
              }
            });
          }),
        );

        socket.on(
          "sync_component",
          action(async (payload: any) => {
            const { action: type, payload: data } = payload;
            const { useStoreComponents } = await import("./useStoreComponents");
            const { store } = useStoreComponents();

            if (type === "add" || type === "update") {
              store.compConfigs[data.id] = data;
              if (!store.sortableCompConfig.includes(data.id)) {
                store.sortableCompConfig.push(data.id);
              }
            } else if (type === "remove") {
              delete store.compConfigs[data.id];
              store.sortableCompConfig = store.sortableCompConfig.filter(
                (id) => id !== data.id,
              );
              if (store.currentCompConfig === data.id) {
                store.currentCompConfig = null;
              }
            } else if (type === "replace_all") {
              store.compConfigs = data.compConfigs;
              store.sortableCompConfig = data.sortableCompConfig;
            }
          }),
        );

        socket.on(
          "sync_lock_status",
          action((payload: any) => {
            storePermission.lockEditing = payload.lockEditing;
            message.info(
              `页面编辑锁已被${payload.lockEditing ? "开启" : "关闭"}`,
            );
          }),
        );
      }
    } catch (e) {
      console.error("初始化协作失败", e);
    }
  };

  const cleanupCollaboration = (pageId: number, currentUserId: number) => {
    if (socket) {
      socket.emit("leave_room", { pageId, userId: currentUserId });
      socket.disconnect();
      socket = null;
    }
  };

  const broadcastComponentUpdate = (
    pageId: number,
    currentUserId: number,
    actionType: string,
    payload: any,
  ) => {
    if (socket && socket.connected) {
      socket.emit("component_update", {
        pageId,
        userId: currentUserId,
        action: actionType,
        payload,
      });
    }
  };

  const getCurrentUser = () => {
    return storePermission.collaborators.find(
      (item) => item.id === storePermission.currentUserId,
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
    return rolePermissionMap[role]?.includes(permission) ?? false;
  };

  const ensurePermission = (
    permission: PermissionAction,
    deniedMessage?: string,
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
    const target = storePermission.collaborators.find(
      (item) => item.id === userId,
    );
    if (!target) return;
    storePermission.currentUserId = userId;
    target.lastActiveAt = Date.now();
    target.isOnline = true;
  });

  const inviteCollaborator = async (
    pageId: number,
    name: string,
    role: PermissionRole,
  ) => {
    if (!ensurePermission("manage_member", "仅所有者可邀请协作者")) return;
    const normalizedName = name.trim();
    if (!normalizedName) {
      message.warning("请输入协作者名称");
      return;
    }
    try {
      await request(`/pages/${pageId}/collaborators`, {
        method: "POST",
        data: { userName: normalizedName, role },
      });
      message.success("邀请成功");
      // 刷新列表
      const { data } = await request(`/pages/${pageId}/collaborators`, {
        method: "GET",
      });
      action(() => {
        storePermission.collaborators = data.collaborators.map((c: any) => ({
          ...c,
          color: roleColorMap[c.role as PermissionRole],
          isOnline:
            storePermission.collaborators.find((old) => old.id === c.id)
              ?.isOnline ?? false,
          lastActiveAt: Date.now(),
        }));
      })();
      addOperationLog("invite_member", normalizedName);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "邀请失败");
    }
  };

  const updateCollaboratorRole = async (
    pageId: number,
    userId: string,
    role: PermissionRole,
  ) => {
    if (!ensurePermission("manage_member", "仅所有者可修改成员角色")) return;
    const target = storePermission.collaborators.find(
      (item) => item.id === userId,
    );
    if (!target || target.role === "owner") return;

    try {
      await request(`/pages/${pageId}/collaborators/${target.user_id}`, {
        method: "PUT",
        data: { role },
      });
      action(() => {
        target.role = role;
        target.color = roleColorMap[role];
      })();
      addOperationLog("update_role", `${target.name} → ${roleLabelMap[role]}`);
      message.success("修改角色成功");
    } catch (e: any) {
      message.error("修改失败");
    }
  };

  const removeCollaborator = async (pageId: number, userId: string) => {
    if (!ensurePermission("manage_member", "仅所有者可移除成员")) return;
    const target = storePermission.collaborators.find(
      (item) => item.id === userId,
    );
    if (!target || target.role === "owner") return;

    try {
      await request(`/pages/${pageId}/collaborators/${target.user_id}`, {
        method: "DELETE",
      });
      action(() => {
        storePermission.collaborators = storePermission.collaborators.filter(
          (item) => item.id !== userId,
        );
        if (storePermission.currentUserId === userId) {
          storePermission.currentUserId =
            storePermission.collaborators.find((item) => item.role === "owner")
              ?.id ??
            storePermission.collaborators[0]?.id ??
            "";
        }
      })();
      addOperationLog("remove_member", target.name);
      message.success("移除成员成功");
    } catch (e) {
      message.error("移除失败");
    }
  };

  const toggleLockEditing = async (
    pageId: number,
    currentUserId: number,
    checked: boolean,
  ) => {
    if (!ensurePermission("manage_member", "仅所有者可切换编辑锁")) return;
    // ToDo: 调用后端更新 Page 实体
    action(() => {
      storePermission.lockEditing = checked;
    })();
    if (socket && socket.connected) {
      socket.emit("toggle_lock", {
        pageId,
        userId: currentUserId,
        lockEditing: checked,
      });
    }
    addOperationLog("toggle_lock", checked ? "开启" : "关闭");
  };

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
    initCollaboration,
    cleanupCollaboration,
    broadcastComponentUpdate,
    socketInstance: socket,
  };
}
