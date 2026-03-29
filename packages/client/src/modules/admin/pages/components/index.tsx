import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Popconfirm,
  Select,
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

interface AdminComponentStat {
  type: string;
  instance_count: number;
  page_count: number;
}

interface AdminComponentItem {
  id: number;
  type: string;
  page_id: number;
  page_name: string;
  owner_name: string;
  owner_phone: string;
}

export default function AdminComponents() {
  const [stats, setStats] = useState<AdminComponentStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [data, setData] = useState<AdminComponentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>();

  const fetchStats = async (search = "") => {
    setStatsLoading(true);
    try {
      const res = await request<{ data?: AdminComponentStat[] }>(
        "/admin/components/stats",
        {
          params: { search },
        },
      );
      setStats(res.data || []);
    } catch {
      message.error("获取组件统计失败");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchComponents = async (
    page = 1,
    search = "",
    selectedType = typeFilter,
  ) => {
    setLoading(true);
    try {
      const res = await request<{
        data?: { list: AdminComponentItem[]; total: number };
        list?: AdminComponentItem[];
        total?: number;
      }>("/admin/components", {
        params: {
          page,
          limit: 10,
          search,
          type: selectedType,
        },
      });
      setData(res.data?.list || res.list || []);
      setTotal(res.data?.total || res.total || 0);
      setCurrentPage(page);
    } catch {
      message.error("获取组件列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchComponents();
  }, []);

  const handleDeleteComponent = async (componentId: number) => {
    try {
      await request(`/admin/components/${componentId}`, {
        method: "DELETE",
      });
      message.success("组件实例删除成功");
      fetchStats(searchText);
      fetchComponents(currentPage, searchText, typeFilter);
    } catch (error: any) {
      message.error(error?.response?.data?.msg || "组件实例删除失败");
    }
  };

  const columns: ColumnsType<AdminComponentItem> = [
    {
      title: "组件ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "组件类型",
      dataIndex: "type",
      key: "type",
      width: 160,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "所在页面",
      key: "page_name",
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.page_name}</span>
          <Text type="secondary">页面ID：{record.page_id}</Text>
        </div>
      ),
    },
    {
      title: "页面归属",
      key: "owner",
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.owner_name}</span>
          <Text type="secondary">{record.owner_phone}</Text>
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该组件实例吗？"
          description="删除后会同步移出对应页面"
          onConfirm={() => handleDeleteComponent(record.id)}
        >
          <Button type="link" danger size="small">
            删除组件
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-xl font-bold m-0">组件管理</h1>
        <Space>
          <Select
            allowClear
            placeholder="筛选组件类型"
            style={{ width: 220 }}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              fetchComponents(1, searchText, value);
            }}
            options={stats.map((item) => ({
              value: item.type,
              label: `${item.type} (${item.instance_count})`,
            }))}
          />
          <Search
            placeholder="搜索组件类型、页面名、用户名"
            allowClear
            onSearch={(value) => {
              setSearchText(value);
              fetchStats(value);
              fetchComponents(1, value, typeFilter);
            }}
            style={{ width: 320 }}
          />
        </Space>
      </div>

      <Table
        size="small"
        rowKey="type"
        loading={statsLoading}
        dataSource={stats}
        pagination={false}
        columns={[
          {
            title: "组件类型",
            dataIndex: "type",
            key: "type",
            render: (value: string) => <Tag color="purple">{value}</Tag>,
          },
          {
            title: "实例数",
            dataIndex: "instance_count",
            key: "instance_count",
          },
          {
            title: "覆盖页面数",
            dataIndex: "page_count",
            key: "page_count",
          },
          {
            title: "快捷操作",
            key: "action",
            width: 120,
            render: (_, record: AdminComponentStat) => (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setTypeFilter(record.type);
                  fetchComponents(1, searchText, record.type);
                }}
              >
                查看实例
              </Button>
            ),
          },
        ]}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: currentPage,
          total,
          pageSize: 10,
          onChange: (page) => fetchComponents(page, searchText, typeFilter),
        }}
      />
    </div>
  );
}
