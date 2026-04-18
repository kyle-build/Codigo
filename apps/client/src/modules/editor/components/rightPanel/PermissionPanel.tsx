import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Button, Input, List, Select, Switch, Tag, Typography } from "antd";
import { useStoreAuth } from "@/shared/hooks";
import type { PermissionRole } from "@/modules/editor/stores";
import { useEditorPermission } from "@/modules/editor/hooks";

const { Text } = Typography;

const roleOptions: { label: string; value: PermissionRole }[] = [
  { label: "所有者", value: "owner" },
  { label: "编辑者", value: "editor" },
  { label: "评论者", value: "commenter" },
  { label: "查看者", value: "viewer" },
];

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

const PermissionPanel = observer(function PermissionPanel() {
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));

  const {
    store,
    can,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    toggleLockEditing,
    getCurrentUser,
    switchCurrentUser,
  } = useEditorPermission();

  const { store: storeAuth } = useStoreAuth();

  const currentUser = getCurrentUser();
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<PermissionRole>("editor");

  const isOwner = currentUser?.role === "owner";

  // 根据在线状态与最后活跃时间排序
  const sortedCollaborators = useMemo(() => {
    return [...store.collaborators].sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return b.lastActiveAt - a.lastActiveAt;
    });
  }, [store.collaborators]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="p-4 border-b border-slate-200">
        {isOwner && (
          <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-md mb-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <Text strong>编辑锁</Text>
              <Switch
                checked={store.lockEditing}
                onChange={(checked) =>
                  toggleLockEditing(pageId, storeAuth.details?.id || 0, checked)
                }
              />
            </div>
            <Text type="secondary" className="text-xs">
              开启后仅所有者可编辑与发布，其他成员保持只读。
            </Text>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Text strong>邀请成员</Text>
          <div className="flex gap-2">
            <Input
              placeholder="用户名"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              disabled={!can("manage_member")}
            />
            <Select
              value={inviteRole}
              onChange={setInviteRole}
              options={roleOptions.filter((opt) => opt.value !== "owner")}
              style={{ width: 120 }}
              disabled={!can("manage_member")}
            />
          </div>
          <Button
            block
            type="primary"
            onClick={async () => {
              if (!pageId) return;
              await inviteCollaborator(pageId, inviteName, inviteRole);
              setInviteName("");
            }}
            disabled={!can("manage_member") || !inviteName.trim()}
          >
            邀请
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Text strong className="block mb-2">
          成员列表 ({store.collaborators.length})
        </Text>
        <List
          itemLayout="horizontal"
          dataSource={sortedCollaborators}
          renderItem={(item) => (
            <List.Item
              actions={
                isOwner && item.role !== "owner"
                  ? [
                      <Select
                        key="role"
                        size="small"
                        value={item.role}
                        style={{ width: 90 }}
                        options={roleOptions.filter(
                          (opt) => opt.value !== "owner",
                        )}
                        onChange={(value) =>
                          updateCollaboratorRole(pageId, item.id, value)
                        }
                      />,
                      <Button
                        key="remove"
                        size="small"
                        type="text"
                        danger
                        onClick={() => removeCollaborator(pageId, item.id)}
                      >
                        移除
                      </Button>,
                    ]
                  : [
                      <Tag
                        key="role-tag"
                        color={item.role === "owner" ? "orange" : "default"}
                      >
                        {
                          roleOptions.find((opt) => opt.value === item.role)
                            ?.label
                        }
                      </Tag>,
                    ]
              }
              className={`p-2 rounded-md ${
                item.id === store.currentUserId
                  ? "bg-emerald-50 border border-emerald-200"
                  : ""
              }`}
            >
              <List.Item.Meta
                avatar={
                  <div
                    className="relative cursor-pointer"
                    onClick={() => switchCurrentUser(item.id)}
                  >
                    <div
                      className="w-8 h-8 padding-100 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform hover:scale-105"
                      style={{ backgroundColor: item.color }}
                      title={`切换为该用户测试 (当前: ${item.name})`}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        item.isOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  </div>
                }
                description={
                  <Text className="text-xs text-slate-400">
                    {item.isOnline ? "online" : "offline"}
                  </Text>
                }
              />
            </List.Item>
          )}
        />

        <Text strong className="block mt-6 mb-2">
          操作日志
        </Text>
        <div className="max-h-[200px] overflow-y-auto">
          {store.logs.length === 0 ? (
            <Text type="secondary" className="text-xs">
              暂无操作日志
            </Text>
          ) : (
            <div className="flex flex-col gap-2">
              {store.logs.map((log) => {
                const actor = store.collaborators.find(
                  (c) => c.id === log.actorId,
                );
                return (
                  <div
                    key={log.id}
                    className="flex gap-2 items-start text-xs p-2 bg-slate-50 rounded"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{
                        backgroundColor: actor?.color || "#94a3b8",
                        fontSize: "10px",
                      }}
                    >
                      {actor?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex gap-1 items-baseline flex-wrap">
                        <Text strong>{actor?.name || "未知"}</Text>
                        <Text type="secondary">
                          {eventLabelMap[log.event] || log.event}
                        </Text>
                      </div>
                      {log.target && (
                        <Text
                          className="text-slate-500 truncate"
                          title={log.target}
                        >
                          {log.target}
                        </Text>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default PermissionPanel;
