import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminPage,
  fetchAdminPages,
  fetchAdminPageVersions,
} from "@/modules/admin/api/admin";
import type {
  AdminPageItem,
  AdminPageVersionItem,
} from "@/modules/admin/types/admin";

export function useAdminPagesData() {
  const [data, setData] = useState<AdminPageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);
  const [currentVersions, setCurrentVersions] = useState<AdminPageVersionItem[]>(
    [],
  );
  const [currentPageName, setCurrentPageName] = useState("");

  const reload = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      const result = await fetchAdminPages({ page, search });
      setData(result.list);
      setTotal(result.total);
      setCurrentPage(page);
      setSearchText(search);
    } catch {
      message.error("获取页面列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const openVersions = useCallback(async (record: AdminPageItem) => {
    setVersionDrawerOpen(true);
    setCurrentPageName(record.page_name);
    setVersionLoading(true);
    try {
      const versions = await fetchAdminPageVersions(record.id);
      setCurrentVersions(versions);
    } catch {
      message.error("获取版本记录失败");
    } finally {
      setVersionLoading(false);
    }
  }, []);

  const closeVersions = useCallback(() => {
    setVersionDrawerOpen(false);
    setCurrentVersions([]);
    setCurrentPageName("");
  }, []);

  const handleDeletePage = useCallback(
    async (pageId: number) => {
      try {
        await deleteAdminPage(pageId);
        message.success("页面删除成功");
        await reload(currentPage, searchText);
      } catch (error: unknown) {
        const nextMessage =
          error instanceof Error ? error.message : "页面删除失败";
        message.error(nextMessage);
      }
    },
    [currentPage, reload, searchText],
  );

  return {
    closeVersions,
    currentPage,
    currentPageName,
    currentVersions,
    data,
    handleDeletePage,
    loading,
    openVersions,
    reload,
    searchText,
    total,
    versionDrawerOpen,
    versionLoading,
  };
}
