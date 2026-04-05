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
            <Button key={item.id} type="link" onClick={() => onPreview(item)}>
              查看版本内容
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                className="bg-emerald-500/90"
                icon={<HistoryOutlined />}
              />
            }
            description={`${item.desc || "历史发布版本"} · ${dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}`}
            title={`版本 v${item.version}`}
          />
        </List.Item>
      )}
    />
  );
}

export default HistorySection;
