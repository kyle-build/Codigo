import type { GlobalRole, IUser } from "@codigo/schema";
import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/modules/admin/api/admin";
import type { AdminUserStatus } from "@/modules/admin/types/admin";

export function useAdminUsersData() {
  const [data, setData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const reload = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      const result = await fetchAdminUsers({ page, search });
      setData(result.list);
      setTotal(result.total);
      setCurrentPage(page);
      setSearchText(search);
    } catch {
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleRoleChange = useCallback(
    async (userId: number, role: GlobalRole) => {
      try {
        await updateAdminUserRole(userId, role);
        message.success("角色修改成功");
        await reload(currentPage, searchText);
      } catch (error: unknown) {
        const nextMessage =
          error instanceof Error ? error.message : "角色修改失败";
        message.error(nextMessage);
      }
    },
    [currentPage, reload, searchText],
  );

  const handleStatusChange = useCallback(
    async (userId: number, status: AdminUserStatus) => {
      try {
        await updateAdminUserStatus(userId, status);
        message.success("状态修改成功");
        await reload(currentPage, searchText);
      } catch (error: unknown) {
        const nextMessage =
          error instanceof Error ? error.message : "状态修改失败";
        message.error(nextMessage);
      }
    },
    [currentPage, reload, searchText],
  );

  return {
    currentPage,
    data,
    handleRoleChange,
    handleStatusChange,
    loading,
    reload,
    searchText,
    total,
  };
}
