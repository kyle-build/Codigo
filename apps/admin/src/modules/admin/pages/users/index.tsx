import { Input } from "antd";
import { AdminUserPermissionModal } from "@/modules/admin/components/AdminUserPermissionModal";
import { AdminUsersTable } from "@/modules/admin/components/AdminUsersTable";
import { useAdminAccess } from "@/modules/admin/hooks/useAdminAccess";
import { useAdminPermissionEditor } from "@/modules/admin/hooks/useAdminPermissionEditor";
import { useAdminUsersData } from "@/modules/admin/hooks/useAdminUsersData";

const { Search } = Input;

export default function AdminUsers() {
  const { hasAdminPermission } = useAdminAccess();
  const {
    currentPage,
    data,
    handleRoleChange,
    handleStatusChange,
    loading,
    reload,
    searchText,
    total,
  } = useAdminUsersData();
  const permissionEditor = useAdminPermissionEditor(async () => {
    await reload(currentPage, searchText);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-xl font-bold">用户管理</h1>
        <Search
          placeholder="搜索用户名或手机号"
          allowClear
          onSearch={(value) => void reload(1, value)}
          style={{ width: 300 }}
        />
      </div>
      <AdminUsersTable
        mode="users"
        currentPage={currentPage}
        data={data}
        hasPermissionAssign={hasAdminPermission("PERMISSION_ASSIGN")}
        hasUserManage={hasAdminPermission("USER_MANAGE")}
        loading={loading}
        onOpenPermissionModal={permissionEditor.handleOpen}
        onPageChange={(page) => void reload(page, searchText)}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        total={total}
      />
      <AdminUserPermissionModal
        currentUser={permissionEditor.currentUser}
        loading={permissionEditor.loading}
        onCancel={permissionEditor.handleClose}
        onChange={permissionEditor.handleChange}
        onConfirm={permissionEditor.handleConfirm}
        open={permissionEditor.open}
        permissions={permissionEditor.permissions}
      />
    </div>
  );
}
