import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AdminComponentStat } from "@/modules/admin/types/admin";

interface AdminComponentStatsTableProps {
  data: AdminComponentStat[];
  loading: boolean;
  onSelectType: (type: string) => void;
}

const columns: ColumnsType<AdminComponentStat> = [
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
];

export function AdminComponentStatsTable({
  data,
  loading,
  onSelectType,
}: AdminComponentStatsTableProps) {
  return (
    <Table
      size="small"
      rowKey="type"
      loading={loading}
      dataSource={data}
      pagination={false}
      columns={[
        ...columns,
        {
          title: "快捷操作",
          key: "action",
          width: 120,
          render: (_, record) => (
            <Button type="link" size="small" onClick={() => onSelectType(record.type)}>
              查看实例
            </Button>
          ),
        },
      ]}
    />
  );
}
