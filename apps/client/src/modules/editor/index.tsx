import { useEffect, useRef } from "react";
import { useTitle } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";
import { message } from "antd";
import {
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "./hooks";
import { EditorViewport } from "./components/shell/editor-viewport";
import { useEditorBootstrap } from "./components/shell/use-editor-bootstrap";
import { fetchTemplateDetail } from "@/modules/template-center/api/templates";
import { writeTemplateToDraft } from "@/modules/template-center/utils/template-draft";
import { getLowCodePage } from "@/modules/editor/api/low-code";

function Editor() {
  useTitle("codigo - 页面编辑");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const templateId = Number(searchParams.get("templateId"));

  const { store: storeComps, loadPageData } = useEditorComponents();
  const { store: storePage, hydrateGridDashedLinesVisible } = useEditorPage();
  const { initCollaboration, cleanupCollaboration } = useEditorPermission();
  const { store: storeAuth } = useStoreAuth();
  const canvasRef = useRef<any>(null);
  const appliedTemplateRef = useRef<number | null>(null);

  useEffect(() => {
    hydrateGridDashedLinesVisible(pageId || null);
  }, [pageId]);

  useEffect(() => {
    if (!Number.isFinite(templateId) || templateId <= 0) {
      return;
    }
    if (appliedTemplateRef.current === templateId) {
      return;
    }

    appliedTemplateRef.current = templateId;

    void (async () => {
      try {
        const detail = await fetchTemplateDetail(templateId);
        writeTemplateToDraft(detail.preset);
        await loadPageData(getLowCodePage);
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete("templateId");
          return next;
        }, { replace: true });
      } catch {
        message.error("模板载入失败，请稍后重试");
      }
    })();
  }, [loadPageData, setSearchParams, templateId]);

  useEditorBootstrap({
    pageId,
    currentPageQueryId: searchParams.get("id"),
    setSearchParams,
    loadPageData,
    initCollaboration,
    cleanupCollaboration,
    authUserId: storeAuth.details?.id,
    authUsername: storeAuth.details?.username,
  });

  return (
    <EditorViewport
      storeComps={storeComps}
      storePage={storePage}
      canvasRef={canvasRef}
    />
  );
}

const EditorComponent = observer(Editor);

export default EditorComponent;
