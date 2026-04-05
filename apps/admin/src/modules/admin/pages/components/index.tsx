import { Button, Input, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AdminComponentStatsTable } from "@/modules/admin/components/AdminComponentStatsTable";
import { useAdminComponentsData } from "@/modules/admin/hooks/useAdminComponentsData";
import type { AdminComponentItem } from "@/modules/admin/types/admin";

const { Search } = Input;
const { Text } = Typography;

export default function AdminComponents() {
  const {
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
  } = useAdminComponentsData();

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
          onConfirm={() => void handleDeleteComponent(record.id)}
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="m-0 text-xl font-bold">组件管理</h1>
        <Space>
          <Select
            allowClear
            placeholder="筛选组件类型"
            style={{ width: 220 }}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              void reloadComponents(1, searchText, value);
            }}
            options={stats.map((item) => ({
              value: item.type,
              label: `${item.type} (${item.instance_count})`,
            }))}
          />
          <Search
            placeholder="搜索组件类型、页面名、用户名"
            allowClear
            onSearch={(value) =>
              void Promise.all([
                reloadStats(value),
                reloadComponents(1, value, typeFilter),
              ])
            }
            style={{ width: 320 }}
          />
        </Space>
      </div>
      <AdminComponentStatsTable
        data={stats}
        loading={statsLoading}
        onSelectType={(type) => {
          setTypeFilter(type);
          void reloadComponents(1, searchText, type);
        }}
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
          onChange: (page) => void reloadComponents(page, searchText, typeFilter),
        }}
      />
    </div>
  );
}
