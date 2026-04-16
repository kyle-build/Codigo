import { CheckOutlined, CodeOutlined } from "@ant-design/icons";
import type { PostReleaseRequest } from "@codigo/materials";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { postRelease } from "@/modules/editor/api/low-code";
import {
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "@/modules/editor/hooks";

export const PublishButton = observer(function PublishButton() {
  const navigate = useNavigate();
  const { serializeSchema } = useEditorComponents();
  const { store } = useEditorPage();
  const { addOperationLog, can, ensurePermission } = useEditorPermission();
  const { run, loading } = useRequest(
    async (values: PostReleaseRequest) => postRelease(values),
    {
      manual: true,
      onSuccess: ({ data, msg }) => {
        navigate(`/release?id=${data}`);
        localStorage.setItem("release_time", String(Date.now()));
        message.success(msg);
      },
    },
  );

  const handlePublish = () => {
    if (!ensurePermission("publish", "当前角色没有发布权限")) {
      return;
    }

    run({
      desc: store.description,
      page_name: store.title,
      schema: serializeSchema(),
      schema_version: 2,
      tdk: store.tdk,
      pageCategory: store.pageCategory,
      layoutMode: store.layoutMode,
      deviceType: store.deviceType,
      canvasWidth: store.canvasWidth,
      canvasHeight: store.canvasHeight,
    });
    addOperationLog("publish", store.title);
  };

  return (
    <Button
      loading={loading}
      className="!h-6 !rounded-sm !border-none !bg-[#0e639c] !px-2 !text-[11px] !font-medium !text-white hover:!bg-[#1177bb]"
      type="primary"
      onClick={handlePublish}
      disabled={!can("publish")}
    >
      <CodeOutlined />
      发布
      <CheckOutlined />
    </Button>
  );
});
