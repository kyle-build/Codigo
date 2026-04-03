import { Drawer, List, Tag, Button, Modal, message } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { getPageVersions, getPageVersionDetail } from "../../api/low-code";
import { useStoreComponents, useStorePermission } from "@/shared/hooks";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const VersionHistoryDrawer = observer(({ open, onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const { initPageData } = useStoreComponents();
  const { can, ensurePermission } = useStorePermission();

  const { data: versions, loading } = useRequest(
    async () => {
      if (!pageId) return [];
      const res = await getPageVersions(pageId);
      return res;
    },
    {
      ready: open && !!pageId,
      refreshDeps: [open, pageId],
    },
  );

  const handleApplyVersion = async (versionId: string) => {
    if (!ensurePermission("edit_content", "当前角色没有编辑权限")) return;

    Modal.confirm({
      title: "确认应用此版本？",
      content: "应用后将覆盖当前画布内容，你可以稍后再次保存为一个新版本。",
      onOk: async () => {
        try {
          const detail = await getPageVersionDetail(pageId, versionId);
          if (detail && detail.schema_data && detail.schema_data.components) {
            initPageData(detail.schema_data.components);
            message.success("已成功应用该版本，请记得保存！");
            onClose();
          } else {
            message.error("版本数据异常");
          }
        } catch (err) {
          message.error(`获取版本详情失败: ${err}`);
        }
      },
    });
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <HistoryOutlined />
          <span>版本历史</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={360}
    >
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={versions || []}
        renderItem={(item: any) => (
          <List.Item
            actions={[
              <Button
                type="link"
                size="small"
                onClick={() => handleApplyVersion(item.id)}
                disabled={!can("edit_content")}
              >
                应用
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <div className="flex items-center gap-2">
                  <Tag color="green">v{item.version}</Tag>
                  <span className="text-sm">{item.desc}</span>
                </div>
              }
              description={
                <div className="text-xs text-slate-400 mt-1">
                  {dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
});
