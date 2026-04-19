import { action } from "mobx";
import { message } from "antd";
import { ulid } from "ulid";
import { io, Socket } from "socket.io-client";
import request from "@/shared/utils/request";
import {
  createEditorPermissionStore,
  roleColorMap,
  roleLabelMap,
  type PermissionAction,
  type PermissionRole,
} from "@/modules/editor/stores";

const storePermission = createEditorPermissionStore();

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
  commenter: [
    "view",
    "comment",
    "edit_content",
    "edit_structure",
    "save_draft",
  ],
  viewer: ["view", "comment", "edit_content", "edit_structure", "save_draft"],
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
  publish_template: "发布模板",
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

/**
 * 从地址栏解析当前编辑页 ID。
 */
function getCurrentEditorPageId() {
  return Number(
    new URLSearchParams(window.location.hash.split("?")[1] || "").get("id"),
  );
}

/**
 * 将协作者列表映射成编辑器所需的展示结构。
 */
function mapCollaborators(
  collaborators: any[],
  previousOnlineMap?: Map<string, boolean>,
) {
  return collaborators.map((item: any) => ({
    ...item,
    color: roleColorMap[item.role as PermissionRole],
    isOnline: previousOnlineMap?.get(item.id) ?? false,
    lastActiveAt: Date.now(),
  }));
}

/**
 * 应用远端协作带来的组件变更。
 */
async function applyRemoteComponentUpdate(payload: any) {
  const { action: type, payload: data } = payload;
  const { useEditorComponents } = await import("./useEditorComponents");
  const { store } = useEditorComponents();

  if (type === "add" || type === "update") {
    store.compConfigs[data.id] = data;
    if (!data.parentId && !store.sortableCompConfig.includes(data.id)) {
      store.sortableCompConfig.push(data.id);
    }
    if (data.parentId && store.compConfigs[data.parentId]) {
      const parent = store.compConfigs[data.parentId];
      if (!parent.childIds.includes(data.id)) {
        parent.childIds.push(data.id);
      }
    }
    return;
  }

  if (type === "remove") {
    const ids = data.subtreeIds ?? [data.id];
    ids.forEach((targetId: string) => {
      delete store.compConfigs[targetId];
    });
    store.sortableCompConfig = store.sortableCompConfig.filter(
      (id) => !ids.includes(id),
    );
    if (store.currentCompConfig === data.id) {
      store.currentCompConfig = null;
    }
    store.selectedCompIds = (store.selectedCompIds ?? []).filter((id) => !ids.includes(id));
    return;
  }

  if (type === "replace_all") {
    store.compConfigs = data.compConfigs;
    store.sortableCompConfig = data.sortableCompConfig;
    store.pages = data.pages ?? store.pages;
    store.pageGroups = data.pageGroups ?? store.pageGroups;
    store.activePageId = data.activePageId ?? store.activePageId;
    store.currentCompConfig =
      store.currentCompConfig && data.compConfigs?.[store.currentCompConfig]
        ? store.currentCompConfig
        : (data.sortableCompConfig?.[0] ?? null);
    store.selectedCompIds =
      Array.isArray(store.selectedCompIds) && store.selectedCompIds.length
        ? store.selectedCompIds.filter((id) => Boolean(data.compConfigs?.[id]))
        : (store.currentCompConfig ? [store.currentCompConfig] : []);
  }
}

/**
 * 暴露编辑器协作权限能力。
 */
export function useEditorPermission() {
  /**
   * 初始化当前页面的协作态。
   */
  const initCollaboration = async (
    pageId: number,
    currentUserId: number,
    currentUserName: string,
  ) => {
    try {
      const { data } = await request(`/pages/${pageId}/collaborators`, {
        method: "GET",
      });
      action(() => {
        storePermission.lockEditing = data.lockEditing;
        storePermission.collaborators = mapCollaborators(data.collaborators);
        const currentUserCollab = data.collaborators.find(
          (item: any) => item.user_id === currentUserId,
        );
        if (currentUserCollab) {
          storePermission.currentUserId = currentUserCollab.id;
        }
      })();

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
            const onlineUserIds = payload.users.map((item: any) => item.userId);
            storePermission.collaborators.forEach((collab) => {
              if (onlineUserIds.includes(collab.user_id)) {
                collab.isOnline = true;
                const onlineInfo = payload.users.find(
                  (item: any) => item.userId === collab.user_id,
                );
                if (onlineInfo) {
                  collab.lastActiveAt = onlineInfo.lastActiveAt;
                }
              } else {
                collab.isOnline = false;
              }
            });
          }),
        );

        socket.on(
          "sync_component",
          action(async (payload: any) => {
            await applyRemoteComponentUpdate(payload);
          }),
        );

        socket.on(
          "sync_lock_status",
          action((payload: any) => {
            storePermission.lockEditing = payload.lockEditing;
            message.info(`页面编辑锁已被${payload.lockEditing ? "开启" : "关闭"}`);
          }),
        );
      }
    } catch (error) {
      console.error("初始化协作失败", error);
    }
  };

  /**
   * 清理当前页面的协作连接。
   */
  const cleanupCollaboration = (pageId: number, currentUserId: number) => {
    if (!socket) {
      return;
    }

    socket.emit("leave_room", { pageId, userId: currentUserId });
    socket.disconnect();
    socket = null;
  };

  /**
   * 向协作房间广播组件变更。
   */
  const broadcastComponentUpdate = (
    pageId: number,
    currentUserId: number,
    actionType: string,
    payload: any,
  ) => {
    if (!socket || !socket.connected) {
      return;
    }

    socket.emit("component_update", {
      pageId,
      userId: currentUserId,
      action: actionType,
      payload,
    });
  };

  /**
   * 获取当前操作者。
   */
  const getCurrentUser = () => {
    return storePermission.collaborators.find(
      (item) => item.id === storePermission.currentUserId,
    );
  };

  /**
   * 获取当前用户在本页的角色。
   */
  const getCurrentRole = (): PermissionRole => {
    const pageId = getCurrentEditorPageId();
    if (!pageId) {
      return "owner";
    }

    return getCurrentUser()?.role ?? "viewer";
  };

  /**
   * 判断当前角色是否具备指定权限。
   */
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

  /**
   * 校验权限并在失败时提示。
   */
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

  /**
   * 记录当前页面的协作操作日志。
   */
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

  /**
   * 切换当前协作操作者。
   */
  const switchCurrentUser = action((userId: string) => {
    const target = storePermission.collaborators.find((item) => item.id === userId);
    if (!target) {
      return;
    }

    storePermission.currentUserId = userId;
    target.lastActiveAt = Date.now();
    target.isOnline = true;
  });

  /**
   * 邀请新的协作者加入页面。
   */
  const inviteCollaborator = async (
    pageId: number,
    name: string,
    role: PermissionRole,
  ) => {
    if (!ensurePermission("manage_member", "仅所有者可邀请协作者")) {
      return;
    }

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
      const { data } = await request(`/pages/${pageId}/collaborators`, {
        method: "GET",
      });
      const previousOnlineMap = new Map(
        storePermission.collaborators.map((item) => [item.id, item.isOnline]),
      );
      action(() => {
        storePermission.collaborators = mapCollaborators(
          data.collaborators,
          previousOnlineMap,
        );
      })();
      addOperationLog("invite_member", normalizedName);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "邀请失败");
    }
  };

  /**
   * 更新协作者角色。
   */
  const updateCollaboratorRole = async (
    pageId: number,
    userId: string,
    role: PermissionRole,
  ) => {
    if (!ensurePermission("manage_member", "仅所有者可修改成员角色")) {
      return;
    }

    const target = storePermission.collaborators.find((item) => item.id === userId);
    if (!target || target.role === "owner") {
      return;
    }

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
    } catch {
      message.error("修改失败");
    }
  };

  /**
   * 移除协作者。
   */
  const removeCollaborator = async (pageId: number, userId: string) => {
    if (!ensurePermission("manage_member", "仅所有者可移除成员")) {
      return;
    }

    const target = storePermission.collaborators.find((item) => item.id === userId);
    if (!target || target.role === "owner") {
      return;
    }

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
    } catch {
      message.error("移除失败");
    }
  };

  /**
   * 切换页面编辑锁。
   */
  const toggleLockEditing = async (
    pageId: number,
    currentUserId: number,
    checked: boolean,
  ) => {
    if (!ensurePermission("manage_member", "仅所有者可切换编辑锁")) {
      return;
    }

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
