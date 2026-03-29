import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import request from "@/shared/utils/request";

const { Search } = Input;
const { Text } = Typography;

interface AdminPageItem {
  id: number;
  account_id: number;
  page_name: string;
  desc: string;
  lockEditing: boolean;
  owner_name: string;
  owner_phone: string;
  component_count: number;
  collaborator_count: number;
  version_count: number;
}

interface AdminPageVersionItem {
  id: string;
  page_id: number;
  version: number;
  desc: string;
  created_at: string;
}

export default function AdminPages() {
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

  const fetchPages = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await request<{
        data?: { list: AdminPageItem[]; total: number };
        list?: AdminPageItem[];
        total?: number;
      }>("/admin/pages", {
        params: { page, limit: 10, search },
      });
      setData(res.data?.list || res.list || []);
      setTotal(res.data?.total || res.total || 0);
      setCurrentPage(page);
    } catch {
      message.error("获取页面列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenVersions = async (record: AdminPageItem) => {
    setVersionDrawerOpen(true);
    setCurrentPageName(record.page_name);
    setVersionLoading(true);
    try {
      const res = await request<{
        data?: AdminPageVersionItem[];
      }>(`/admin/pages/${record.id}/versions`);
      setCurrentVersions(res.data || []);
    } catch {
      message.error("获取版本记录失败");
    } finally {
      setVersionLoading(false);
    }
  };

  const handleDeletePage = async (pageId: number) => {
    try {
      await request(`/admin/pages/${pageId}`, {
        method: "DELETE",
      });
      message.success("页面删除成功");
      fetchPages(currentPage, searchText);
    } catch (error: any) {
      message.error(error?.response?.data?.msg || "页面删除失败");
    }
  };

  const columns: ColumnsType<AdminPageItem> = [
    {
      title: "页面ID",
      dataIndex: "id",
      key: "id",
      width: 90,
    },
    {
      title: "页面名称",
      dataIndex: "page_name",
      key: "page_name",
    },
    {
      title: "所属用户",
      key: "owner",
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.owner_name}</span>
          <Text type="secondary">{record.owner_phone}</Text>
        </div>
      ),
    },
    {
      title: "组件数",
      dataIndex: "component_count",
      key: "component_count",
      width: 90,
    },
    {
      title: "协作者",
      dataIndex: "collaborator_count",
      key: "collaborator_count",
      width: 90,
    },
    {
      title: "版本数",
      dataIndex: "version_count",
      key: "version_count",
      width: 90,
    },
    {
      title: "编辑锁",
      dataIndex: "lockEditing",
      key: "lockEditing",
      width: 100,
      render: (lockEditing: boolean) => (
        <Tag color={lockEditing ? "orange" : "green"}>
          {lockEditing ? "已锁定" : "未锁定"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleOpenVersions(record)}>
            版本记录
          </Button>
          <Popconfirm
            title="确定要删除该页面吗？"
            description="删除后会清理页面、组件、版本与协作数据"
            onConfirm={() => handleDeletePage(record.id)}
          >
            <Button type="link" danger size="small">
              删除页面
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold m-0">页面管理</h1>
        <Search
          placeholder="搜索页面名、用户名或手机号"
          allowClear
          onSearch={(value) => {
            setSearchText(value);
            fetchPages(1, value);
          }}
          style={{ width: 320 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          total,
          pageSize: 10,
          onChange: (page) => fetchPages(page, searchText),
        }}
      />
      <Drawer
        title={`${currentPageName || "页面"}版本记录`}
        width={520}
        open={versionDrawerOpen}
        onClose={() => setVersionDrawerOpen(false)}
      >
        <Table
          rowKey="id"
          loading={versionLoading}
          pagination={false}
          dataSource={currentVersions}
          columns={[
            {
              title: "版本号",
              dataIndex: "version",
              key: "version",
              width: 100,
            },
            {
              title: "描述",
              dataIndex: "desc",
              key: "desc",
            },
            {
              title: "创建时间",
              dataIndex: "created_at",
              key: "created_at",
              width: 180,
              render: (value: string) => new Date(value).toLocaleString(),
            },
          ]}
        />
      </Drawer>
    </div>
  );
}
