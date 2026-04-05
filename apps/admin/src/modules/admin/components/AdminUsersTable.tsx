import { ADMIN_PERMISSION_LABELS, resolveAdminPermissions, type IUser } from "@codigo/schema";
import { Button, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AdminUsersTableProps } from "@/modules/admin/types/admin";

const { Text } = Typography;

export function AdminUsersTable({
  currentPage,
  data,
  hasPermissionAssign,
  hasUserManage,
  loading,
  mode,
  onOpenPermissionModal,
  onPageChange,
  onRoleChange,
  onStatusChange,
  total,
}: AdminUsersTableProps) {
  const columns: ColumnsType<IUser> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "角色",
      dataIndex: "global_role",
      key: "global_role",
      render: (role, record) => (
        <Select
          value={role}
          size="small"
          style={{ width: 120 }}
          disabled={
            mode === "permissions" ||
            record.global_role === "SUPER_ADMIN" ||
            !hasPermissionAssign
          }
          onChange={(value) => void onRoleChange(record.id, value)}
          options={[
            { value: "USER", label: "普通用户" },
            { value: "ADMIN", label: "管理员" },
            { value: "SUPER_ADMIN", label: "超级管理员", disabled: true },
          ]}
        />
      ),
    },
    {
      title: "后台权限",
      key: "admin_permissions",
      render: (_, record) => {
        const permissions = resolveAdminPermissions(
          record.global_role,
          record.admin_permissions,
        );

        if (record.global_role === "SUPER_ADMIN") {
          return <Tag color="gold">全部权限</Tag>;
        }

        if (permissions.length === 0) {
          return <Text type="secondary">暂无</Text>;
        }

        return (
          <Space size={[4, 4]} wrap>
            {permissions.map((permission) => (
              <Tag key={permission} color="blue">
                {ADMIN_PERMISSION_LABELS[permission]}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "正常" : "冻结"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        if (record.global_role === "SUPER_ADMIN") {
          return null;
        }

        const isFrozen = record.status === "frozen";

        return (
          <Space size="middle">
            {record.global_role === "ADMIN" && hasPermissionAssign ? (
              <Button
                type="link"
                size="small"
                onClick={() => onOpenPermissionModal(record)}
              >
                {mode === "permissions" ? "编辑权限" : "分配权限"}
              </Button>
            ) : null}
            {mode === "users" && hasUserManage ? (
              <Popconfirm
                title={`确定要${isFrozen ? "解冻" : "冻结"}该用户吗？`}
                onConfirm={() =>
                  void onStatusChange(record.id, isFrozen ? "active" : "frozen")
                }
              >
                <Button type="link" danger={!isFrozen} size="small">
                  {isFrozen ? "解冻账号" : "冻结账号"}
                </Button>
              </Popconfirm>
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        total,
        pageSize: 10,
        onChange: (page) => onPageChange(page),
      }}
    />
  );
}
