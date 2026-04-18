import { Drawer, List, Button, Modal, message } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  useEditorComponents,
  useEditorPermission,
} from "@/modules/editor/hooks";
import { getPageVersions, getPageVersionDetail } from "../../api/low-code";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const VersionHistoryDrawer = observer(({ open, onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const { initPageData } = useEditorComponents();
  const { can, ensurePermission } = useEditorPermission();

  const { data: versions, loading } = useRequest(
    async () => {
      if (!pageId) return [];
      const res = await getPageVersions(pageId);
      return Array.isArray(res?.data) ? res.data : [];
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
          const res = await getPageVersionDetail(pageId, versionId);
          const detail = res?.data;
          if (detail?.schema_data?.components) {
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
                  <span className="inline-flex items-center rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--ide-accent)]">
                    v{item.version}
                  </span>
                  <span className="text-sm text-[var(--ide-text)]">{item.desc}</span>
                </div>
              }
              description={
                <div className="mt-1 text-xs text-[var(--ide-text-muted)]">
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
