import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminComponent,
  fetchAdminComponents,
  fetchAdminComponentStats,
} from "@/modules/admin/api/admin";
import type {
  AdminComponentItem,
  AdminComponentStat,
} from "@/modules/admin/types/admin";

export function useAdminComponentsData() {
  const [stats, setStats] = useState<AdminComponentStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [data, setData] = useState<AdminComponentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>();

  const reloadStats = useCallback(async (search = "") => {
    setStatsLoading(true);
    try {
      const nextStats = await fetchAdminComponentStats(search);
      setStats(nextStats);
    } catch {
      message.error("获取组件统计失败");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const reloadComponents = useCallback(
    async (page = 1, search = "", type = typeFilter) => {
      setLoading(true);
      try {
        const result = await fetchAdminComponents({ page, search, type });
        setData(result.list);
        setTotal(result.total);
        setCurrentPage(page);
        setSearchText(search);
        setTypeFilter(type);
      } catch {
        message.error("获取组件列表失败");
      } finally {
        setLoading(false);
      }
    },
    [typeFilter],
  );

  useEffect(() => {
    void Promise.all([reloadStats(), reloadComponents()]);
  }, [reloadComponents, reloadStats]);

  const handleDeleteComponent = useCallback(
    async (componentId: number) => {
      try {
        await deleteAdminComponent(componentId);
        message.success("组件实例删除成功");
        await Promise.all([
          reloadStats(searchText),
          reloadComponents(currentPage, searchText, typeFilter),
        ]);
      } catch (error: unknown) {
        const nextMessage =
          error instanceof Error ? error.message : "组件实例删除失败";
        message.error(nextMessage);
      }
    },
    [currentPage, reloadComponents, reloadStats, searchText, typeFilter],
  );

  return {
    currentPage,
    data,
    handleDeleteComponent,
    loading,
    reloadComponents,
    reloadStats,
    searchText,
    setTypeFilter,
    stats,
    statsLoading,
    total,
    typeFilter,
  };
}
