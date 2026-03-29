import { useState, useEffect } from "react";
import {
  Checkbox,
  Modal,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Typography,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import request from "@/shared/utils/request";
import { useAdminAccess } from "@/shared/hooks";
import {
  ADMIN_PERMISSION_DESCRIPTIONS,
  ADMIN_PERMISSION_LABELS,
  resolveAdminPermissions,
  type AdminPermission,
  type IUser,
  type GlobalRole,
} from "@codigo/schema";

const { Search } = Input;
const { Text } = Typography;

export default function AdminUsers() {
  const { hasAdminPermission } = useAdminAccess();
  const [data, setData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>(
    [],
  );
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);

  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await request<{
        data?: { list: IUser[]; total: number };
        list?: IUser[];
        total?: number;
      }>(`/admin/users`, {
        params: { page, limit: 10, search },
      });
      setData(res.data?.list || res.list || []);
      setTotal(res.data?.total || res.total || 0);
      setCurrentPage(page);
    } catch (error) {
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: GlobalRole) => {
    try {
      await request(`/admin/users/${userId}/role`, {
        method: "PUT",
        data: { role: newRole },
      });
      message.success("角色修改成功");
      fetchUsers(currentPage, searchText);
    } catch (error: any) {
      message.error(error?.response?.data?.msg || "角色修改失败");
    }
  };

  const handleStatusChange = async (
    userId: number,
    newStatus: "active" | "frozen",
  ) => {
    try {
      await request(`/admin/users/${userId}/status`, {
        method: "PUT",
        data: { status: newStatus },
      });
      message.success("状态修改成功");
      fetchUsers(currentPage, searchText);
    } catch (error: any) {
      message.error(error?.response?.data?.msg || "状态修改失败");
    }
  };

  const handleOpenPermissionModal = (record: IUser) => {
    setCurrentUser(record);
    setSelectedPermissions(
      resolveAdminPermissions(record.global_role, record.admin_permissions),
    );
    setPermissionModalOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!currentUser) return;
    setPermissionLoading(true);
    try {
      await request(`/admin/users/${currentUser.id}/permissions`, {
        method: "PUT",
        data: {
          permissions: selectedPermissions,
        },
      });
      message.success("权限分配成功");
      setPermissionModalOpen(false);
      fetchUsers(currentPage, searchText);
    } catch (error: any) {
      message.error(error?.response?.data?.msg || "权限分配失败");
    } finally {
      setPermissionLoading(false);
    }
  };

  const handlePermissionChange = (value: AdminPermission[]) => {
    const nextPermissions = Array.from(new Set(value));
    if (
      nextPermissions.includes("PERMISSION_ASSIGN") &&
      !nextPermissions.includes("USER_MANAGE")
    ) {
      nextPermissions.unshift("USER_MANAGE");
    }
    setSelectedPermissions(nextPermissions);
  };

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
      key: "global_role",
      dataIndex: "global_role",
      render: (role: GlobalRole, record) => (
        <Select
          value={role}
          size="small"
          style={{ width: 120 }}
          disabled={
            record.global_role === "SUPER_ADMIN" ||
            !hasAdminPermission("PERMISSION_ASSIGN")
          }
          onChange={(val) => handleRoleChange(record.id, val)}
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
      key: "status",
      dataIndex: "status",
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
        if (record.global_role === "SUPER_ADMIN") return null;

        const isFrozen = record.status === "frozen";
        return (
          <Space size="middle">
            {record.global_role === "ADMIN" && hasAdminPermission("PERMISSION_ASSIGN") ? (
              <Button
                type="link"
                size="small"
                onClick={() => handleOpenPermissionModal(record)}
              >
                分配权限
              </Button>
            ) : null}
            {hasAdminPermission("USER_MANAGE") ? (
              <Popconfirm
                title={`确定要${isFrozen ? "解冻" : "冻结"}该用户吗？`}
                onConfirm={() =>
                  handleStatusChange(record.id, isFrozen ? "active" : "frozen")
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold m-0">用户管理</h1>
        <Search
          placeholder="搜索用户名或手机号"
          allowClear
          onSearch={(val) => {
            setSearchText(val);
            fetchUsers(1, val);
          }}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          total: total,
          pageSize: 10,
          onChange: (page) => fetchUsers(page, searchText),
        }}
      />
      <Modal
        title={`为 ${currentUser?.username || ""} 分配后台权限`}
        open={permissionModalOpen}
        confirmLoading={permissionLoading}
        onOk={handleSavePermissions}
        onCancel={() => setPermissionModalOpen(false)}
      >
        <Checkbox.Group
          className="flex flex-col gap-3"
          value={selectedPermissions}
          onChange={(value) => handlePermissionChange(value as AdminPermission[])}
          options={Object.entries(ADMIN_PERMISSION_LABELS).map(([key, label]) => ({
            value: key,
            label: (
              <div className="flex flex-col">
                <span>{label}</span>
                <Text type="secondary">
                  {ADMIN_PERMISSION_DESCRIPTIONS[key as AdminPermission]}
                </Text>
              </div>
            ),
          }))}
        />
      </Modal>
    </div>
  );
}
