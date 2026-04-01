import {
  AppstoreOutlined,
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
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  postRelease,
  startPageWorkspaceIDEConfig,
  syncPageWorkspace,
} from "@/modules/editor/api/low-code";
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
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const {
    store,
    resetWorkspaceFiles,
    setCanvasSize,
    setDeviceType,
    setEditorMode,
    setWorkspace,
    setWorkspaceIDEConfig,
    setWorkspaceRuntime,
    setWorkspaceSession,
  } = useStorePage();
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

  const { run: toggleEditorMode, loading: editorSwitching } = useRequest(
    async () => {
      if (store.editorMode === "webide") {
        return { mode: "visual" as const };
      }

      if (!pageId) {
        return null;
      }

      const workspaceResponse = await syncPageWorkspace(pageId);
      const workspace = workspaceResponse.data ?? null;
      const ideConfigResponse = await startPageWorkspaceIDEConfig(pageId);

      return {
        mode: "webide" as const,
        workspace,
        workspaceIDEConfig: ideConfigResponse.data ?? null,
      };
    },
    {
      manual: true,
      onSuccess: (payload) => {
        if (!payload) {
          message.warning("当前页面还未完成初始化");
          return;
        }

        if (payload.mode === "visual") {
          setEditorMode("visual");
          message.success("已切换到画布编辑");
          return;
        }

        setWorkspace(payload.workspace);
        resetWorkspaceFiles();
        setWorkspaceIDEConfig(payload.workspaceIDEConfig);
        setWorkspaceRuntime(null);
        setWorkspaceSession(null);
        setEditorMode("webide");
        message.success("已切换到 IDE 编辑");
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
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/90 px-2.5 py-1.5 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100/90 p-0.5">
          <Button
            type={store.deviceType === "mobile" ? "primary" : "text"}
            icon={<MobileOutlined />}
            size="small"
            onClick={() => {
              if (!ensurePermission("edit_content", "当前角色不能修改画布设置"))
                return;
              setDeviceType("mobile");
            }}
            className={`!h-7 !rounded-lg !px-2.5 !text-xs ${store.deviceType === "mobile" ? "!bg-emerald-500" : "!text-slate-500"}`}
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
            className={`!h-7 !rounded-lg !px-2.5 !text-xs ${store.deviceType === "pc" ? "!bg-emerald-500" : "!text-slate-500"}`}
          >
            桌面端
          </Button>
        </div>

        <div className="hidden h-6 w-px bg-slate-200 xl:block" />

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
                className="w-20"
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
                className="w-20"
                controls={false}
                addonAfter="H"
              />
            </Space>
          )}
        </div>

        <div className="hidden h-6 w-px bg-slate-200 lg:block" />

        <div className="flex items-center gap-1">
          <Button
            type="text"
            className="!h-7 !rounded-lg !px-2.5 !text-xs !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={() => setHistoryOpen(true)}
          >
            <HistoryOutlined /> 版本
          </Button>
          <Button
            type="text"
            className="!h-7 !rounded-lg !px-2.5 !text-xs !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={handleGoPreview}
          >
            <FundViewOutlined /> 预览
          </Button>
          <Button
            type="text"
            className="!h-7 !rounded-lg !px-2.5 !text-xs !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={storeInLocalStorage}
            disabled={!can("save_draft")}
          >
            <PlusOutlined /> 草稿
          </Button>
          <Button
            type="text"
            className="!h-7 !rounded-lg !px-2 !text-xs !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={undo}
            disabled={!hasUndo || !can("edit_content")}
          >
            <UndoOutlined />
          </Button>
          <Button
            type="text"
            className="!h-7 !rounded-lg !px-2 !text-xs !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
            onClick={redo}
            disabled={!hasRedo || !can("edit_content")}
          >
            <RedoOutlined />
          </Button>
        </div>

        <Button
          loading={editorSwitching}
          className={`!ml-0.5 !h-8 !rounded-lg !px-3 !text-xs !font-medium ${
            store.editorMode === "webide"
              ? "!border-emerald-200 !bg-emerald-50 !text-emerald-700 hover:!border-emerald-300 hover:!bg-emerald-100"
              : "!border-slate-200 !bg-white !text-slate-700 hover:!border-emerald-200 hover:!text-emerald-700"
          }`}
          onClick={() => toggleEditorMode()}
          disabled={!pageId}
        >
          {store.editorMode === "webide" ? (
            <>
              <AppstoreOutlined />
              画布编辑
            </>
          ) : (
            <>
              <CodeOutlined />
              IDE 编辑
            </>
          )}
        </Button>

        <Button
          loading={loading}
          className="!h-8 !rounded-lg !border-none !bg-emerald-500 !px-3 !text-xs !font-medium !text-white shadow-[0_14px_26px_-18px_rgba(16,185,129,0.82)] hover:!bg-emerald-400"
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
