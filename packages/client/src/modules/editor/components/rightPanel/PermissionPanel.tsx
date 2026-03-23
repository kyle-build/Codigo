import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, List, Select, Space, Switch, Tag, Typography } from "antd";
import type { PermissionRole } from "@/shared/stores";
import { useStorePermission } from "@/shared/hooks";

const { Text, Title } = Typography;

const roleOptions: Array<{ label: string; value: PermissionRole }> = [
  { label: "所有者", value: "owner" },
  { label: "可编辑", value: "editor" },
  { label: "可评论", value: "commenter" },
  { label: "只读", value: "viewer" },
];

const capabilityLabelMap = {
  view: "查看",
  comment: "评论",
  edit_content: "编辑内容",
  edit_structure: "编辑结构",
  manage_member: "成员管理",
  publish: "发布",
  save_draft: "保存草稿",
} as const;

const capabilities = Object.entries(capabilityLabelMap) as Array<
  [keyof typeof capabilityLabelMap, string]
>;

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60 * 1000) return "刚刚活跃";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000)
    return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`;
  return `${Math.floor(diff / (24 * 60 * 60 * 1000))} 天前`;
}

export default observer(function PermissionPanel() {
  const {
    store,
    can,
    roleLabelMap,
    eventLabelMap,
    getCurrentUser,
    switchCurrentUser,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    toggleLockEditing,
  } = useStorePermission();

  const currentUser = getCurrentUser();
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<PermissionRole>("viewer");

  const currentCapabilities = useMemo(() => {
    return capabilities.filter(([key]) => can(key));
  }, [store.currentUserId, store.lockEditing, store.collaborators.length]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <div className="flex items-center justify-between">
          <Title level={5} style={{ margin: 0 }}>
            协作身份
          </Title>
          <Tag color={currentUser?.color}>{roleLabelMap[currentUser?.role ?? "viewer"]}</Tag>
        </div>
        <Select
          value={store.currentUserId}
          className="w-full"
          options={store.collaborators.map((item) => ({
            value: item.id,
            label: `${item.name} · ${roleLabelMap[item.role]}`,
          }))}
          onChange={switchCurrentUser}
        />
        <Space size={[6, 6]} wrap>
          {currentCapabilities.map(([key, label]) => (
            <Tag key={key} color="green">
              {label}
            </Tag>
          ))}
        </Space>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <div className="flex items-center justify-between">
          <Text strong>编辑锁</Text>
          <Switch checked={store.lockEditing} onChange={toggleLockEditing} />
        </div>
        <Text type="secondary">开启后仅所有者可编辑与发布，其他成员保持只读。</Text>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <Text strong>邀请协作者</Text>
        <Input
          placeholder="输入成员名称"
          value={inviteName}
          onChange={(e) => setInviteName(e.target.value)}
        />
        <Space.Compact className="w-full">
          <Select
            value={inviteRole}
            style={{ width: "40%" }}
            options={roleOptions.filter((item) => item.value !== "owner")}
            onChange={(value) => setInviteRole(value)}
          />
          <Button
            style={{ width: "60%" }}
            type="primary"
            onClick={() => {
              inviteCollaborator(inviteName, inviteRole);
              setInviteName("");
            }}
          >
            添加成员
          </Button>
        </Space.Compact>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <Text strong>成员权限</Text>
        <List
          dataSource={store.collaborators}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Select
                  key={`role-${item.id}`}
                  value={item.role}
                  style={{ width: 104 }}
                  disabled={item.role === "owner"}
                  options={roleOptions.filter((opt) => opt.value !== "owner")}
                  onChange={(value) => updateCollaboratorRole(item.id, value)}
                />,
                <Button
                  key={`remove-${item.id}`}
                  danger
                  type="text"
                  disabled={item.role === "owner"}
                  onClick={() => removeCollaborator(item.id)}
                >
                  移除
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{item.name}</span>
                    <Tag color={item.color}>{roleLabelMap[item.role]}</Tag>
                    <Tag color={item.isOnline ? "success" : "default"}>
                      {item.isOnline ? "在线" : "离线"}
                    </Tag>
                  </Space>
                }
                description={formatRelativeTime(item.lastActiveAt)}
              />
            </List.Item>
          )}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <Text strong>协作动态</Text>
        <List
          size="small"
          dataSource={store.logs.slice(0, 20)}
          locale={{ emptyText: "暂无动态" }}
          renderItem={(item) => {
            const actor = store.collaborators.find((user) => user.id === item.actorId);
            return (
              <List.Item>
                <Text>
                  {actor?.name ?? "未知成员"} · {eventLabelMap[item.event] ?? item.event} ·{" "}
                  {item.target}
                </Text>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
});












