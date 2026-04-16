import { HistoryOutlined } from "@ant-design/icons";
import { Avatar, Button, Empty, List, Spin } from "antd";
import dayjs from "dayjs";
import type { PageVersionItem } from "../../types/appManagement";

interface HistorySectionProps {
  loading: boolean;
  onPreview: (version: PageVersionItem) => void | Promise<void>;
  versions: PageVersionItem[];
}

function HistorySection({
  loading,
  onPreview,
  versions,
}: HistorySectionProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    );
  }

  if (!versions.length) {
    return (
      <Empty
        description="暂无历史版本记录"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <List
      dataSource={versions}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button key={item.id} size="small" type="link" onClick={() => onPreview(item)}>
              查看
            </Button>,
          ]}
          className="hover:bg-slate-50"
        >
          <List.Item.Meta
            avatar={
              <Avatar
                className="bg-emerald-500/90"
                icon={<HistoryOutlined />}
                size="small"
              />
            }
            description={`${item.desc || "历史版本"} · ${dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}`}
            title={<span className="text-sm">v{item.version}</span>}
          />
        </List.Item>
      )}
    />
  );
}

export default HistorySection;
