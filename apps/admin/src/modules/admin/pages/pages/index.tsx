import { Button, Input, Popconfirm, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AdminPageVersionDrawer } from "@/modules/admin/components/AdminPageVersionDrawer";
import { useAdminPagesData } from "@/modules/admin/hooks/useAdminPagesData";
import type { AdminPageItem } from "@/modules/admin/types/admin";

const { Search } = Input;
const { Text } = Typography;

export default function AdminPages() {
  const {
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
  } = useAdminPagesData();

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
          <Button type="link" size="small" onClick={() => void openVersions(record)}>
            版本记录
          </Button>
          <Popconfirm
            title="确定要删除该页面吗？"
            description="删除后会清理页面、组件、版本与协作数据"
            onConfirm={() => void handleDeletePage(record.id)}
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
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-xl font-bold">页面管理</h1>
        <Search
          placeholder="搜索页面名、用户名或手机号"
          allowClear
          onSearch={(value) => void reload(1, value)}
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
          onChange: (page) => void reload(page, searchText),
        }}
      />
      <AdminPageVersionDrawer
        loading={versionLoading}
        onClose={closeVersions}
        open={versionDrawerOpen}
        pageName={currentPageName}
        versions={currentVersions}
      />
    </div>
  );
}
