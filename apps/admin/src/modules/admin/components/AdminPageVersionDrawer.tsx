import { Drawer, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AdminPageVersionItem } from "@/modules/admin/types/admin";

interface AdminPageVersionDrawerProps {
  loading: boolean;
  onClose: () => void;
  open: boolean;
  pageName: string;
  versions: AdminPageVersionItem[];
}

const columns: ColumnsType<AdminPageVersionItem> = [
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
];

export function AdminPageVersionDrawer({
  loading,
  onClose,
  open,
  pageName,
  versions,
}: AdminPageVersionDrawerProps) {
  return (
    <Drawer
      title={`${pageName || "页面"}版本记录`}
      width={520}
      open={open}
      onClose={onClose}
    >
      <Table
        rowKey="id"
        loading={loading}
        pagination={false}
        dataSource={versions}
        columns={columns}
      />
    </Drawer>
  );
}
