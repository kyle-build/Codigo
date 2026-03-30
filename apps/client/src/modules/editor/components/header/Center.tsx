import {
  CheckOutlined,
  CodeOutlined,
  FundViewOutlined,
  PlusOutlined,
  RedoOutlined,
  UndoOutlined,
  MobileOutlined,
  DesktopOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { PostReleaseRequest } from "@codigo/materials";
import { useRequest } from "ahooks";
import { Button, InputNumber, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRelease } from "@/modules/editor/api/low-code";
import {
  useStoreComponents,
  useStorePage,
  useStorePermission,
} from "@/shared/hooks";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { VersionHistoryDrawer } from "./VersionHistoryDrawer";

const Center = observer(() => {
  const nav = useNavigate();
  const { store, setDeviceType, setCanvasSize } = useStorePage();
  const { serializeSchema, storeInLocalStorage, undo, redo, hasUndo, hasRedo } =
    useStoreComponents();
  const { can, ensurePermission, addOperationLog } = useStorePermission();
  const [historyOpen, setHistoryOpen] = useState(false);

  const { run, loading } = useRequest(
    async (values: PostReleaseRequest) => postRelease(values),
    {
      manual: true,
      onSuccess: ({ msg, data }) => {
        nav(`/release?id=${data}`);
        localStorage.setItem("release_time", String(Date.now()));
        message.success(msg);
      },
    },
  );

  function handleGoPreview() {
    if (can("save_draft")) {
      storeInLocalStorage();
    }
    nav("/preview");
  }

  function handleGoRelease() {
    if (!ensurePermission("publish", "当前角色没有发布权限")) return;
    run({
      desc: store.description,
      page_name: store.title,
      schema: serializeSchema(),
      schema_version: 2,
      tdk: store.tdk,
    });
    addOperationLog("publish", store.title);
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.65)] backdrop-blur-xl">
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100/90 p-1">
          <Button
            type={store.deviceType === "mobile" ? "primary" : "text"}
            icon={<MobileOutlined />}
            size="small"
            onClick={() => {
              if (!ensurePermission("edit_content", "当前角色不能修改画布设置"))
                return;
              setDeviceType("mobile");
            }}
            className={`!h-8 !rounded-xl !px-3 ${store.deviceType === "mobile" ? "!bg-emerald-500" : "!text-slate-500"}`}
          >
            移动端
          </Button>
          <Button
            type={store.deviceType === "pc" ? "primary" : "text"}
            icon={<DesktopOutlined />}
            size="small"
            onClick={() => {
              if (!ensurePermission("edit_content", "当前角色不能修改画布设置"))
                return;
              setDeviceType("pc");
            }}
            className={`!h-8 !rounded-xl !px-3 ${store.deviceType === "pc" ? "!bg-emerald-500" : "!text-slate-500"}`}
          >
            桌面端
          </Button>
        </div>

        <div className="hidden h-7 w-px bg-slate-200 xl:block" />

        <div className="hidden items-center gap-2 xl:flex">
          {store.deviceType === "pc" && (
            <Space size="small">
              <InputNumber
                size="small"
                value={store.canvasWidth}
                onChange={(v) => {
                  if (
                    !ensurePermission(
                      "edit_content",
                      "当前角色不能修改画布设置",
                    )
                  )
                    return;
                  setCanvasSize(v || 1024, store.canvasHeight);
                }}
                className="w-24"
                controls={false}
                addonAfter="W"
              />
              <InputNumber
                size="small"
                value={store.canvasHeight}
                onChange={(v) => {
                  if (
                    !ensurePermission(
                      "edit_content",
                      "当前角色不能修改画布设置",
                    )
                  )
                    return;
                  setCanvasSize(store.canvasWidth, v || 768);
                }}
                className="w-24"
                controls={false}
                addonAfter="H"
              />
            </Space>
          )}
        </div>

        <div className="hidden h-7 w-px bg-slate-200 lg:block" />

        <div className="flex items-center gap-1.5">
          <Button
            type="text"
            className="!h-8 !rounded-xl !px-3 !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={() => setHistoryOpen(true)}
          >
            <HistoryOutlined /> 版本
          </Button>
          <Button
            type="text"
            className="!h-8 !rounded-xl !px-3 !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={handleGoPreview}
          >
            <FundViewOutlined /> 预览
          </Button>
          <Button
            type="text"
            className="!h-8 !rounded-xl !px-3 !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={storeInLocalStorage}
            disabled={!can("save_draft")}
          >
            <PlusOutlined /> 草稿
          </Button>
          <Button
            type="text"
            className="!h-8 !rounded-xl !px-3 !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={undo}
            disabled={!hasUndo || !can("edit_content")}
          >
            <UndoOutlined />
          </Button>
          <Button
            type="text"
            className="!h-8 !rounded-xl !px-3 !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={redo}
            disabled={!hasRedo || !can("edit_content")}
          >
            <RedoOutlined />
          </Button>
        </div>

        <Button
          loading={loading}
          className="!ml-1 !h-9 !rounded-xl !border-none !bg-emerald-500 !px-4 !font-medium !text-white shadow-[0_18px_32px_-18px_rgba(16,185,129,0.9)] hover:!bg-emerald-400"
          type="primary"
          onClick={handleGoRelease}
          disabled={!can("publish")}
        >
          <CodeOutlined />
          发布页面
          <CheckOutlined />
        </Button>
      </div>

      <VersionHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
});

export default Center;
