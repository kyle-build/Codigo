import { AppstoreOutlined, CodeOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import {
  startPageWorkspaceIDEConfig,
  syncPageWorkspace,
} from "@/modules/editor/api/low-code";
import { useEditorPage } from "@/modules/editor/hooks";

export const EditorModeButton = observer(function EditorModeButton() {
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const {
    resetWorkspaceFiles,
    setEditorMode,
    setWorkspace,
    setWorkspaceIDEConfig,
    setWorkspaceRuntime,
    setWorkspaceSession,
    store,
  } = useEditorPage();
  const { run, loading } = useRequest(
    async () => {
      if (store.editorMode === "webide") {
        return { mode: "visual" as const };
      }

      if (!pageId) {
        return null;
      }

      const workspaceResponse = await syncPageWorkspace(pageId);
      const ideConfigResponse = await startPageWorkspaceIDEConfig(pageId);

      return {
        mode: "webide" as const,
        workspace: workspaceResponse.data ?? null,
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
          message.success("已切换到画布编辑，正在刷新数据…");
          window.setTimeout(() => {
            window.location.reload();
          }, 200);
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

  return (
    <Button
      loading={loading}
      className={`!ml-0 !h-6 !rounded-sm !px-2 !text-[11px] !font-medium ${
        store.editorMode === "webide"
          ? "!border-[var(--ide-accent)] !bg-[var(--ide-accent)] !text-white hover:opacity-90"
          : "!border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
      }`}
      onClick={() => run()}
      disabled={!pageId}
    >
      {store.editorMode === "webide" ? (
        <>
          <AppstoreOutlined />
          画布
        </>
      ) : (
        <>
          <CodeOutlined />
          IDE
        </>
      )}
    </Button>
  );
});
